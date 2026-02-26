import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'content', 'articles.json');
const repoPath = 'public/content/articles.json';

function readLocalArticles() {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readArticles() {
  const ghRepo = process.env.GITHUB_REPO;
  const ghToken = process.env.GITHUB_TOKEN;

  if (ghRepo && ghToken) {
    const url = `https://api.github.com/repos/${ghRepo}/contents/${repoPath}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${ghToken}`, 'User-Agent': 'openclaw-admin' } });
    if (resp.ok) {
      const json = await resp.json();
      const decoded = Buffer.from(json.content || '', 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded || '[]');
      return { articles: Array.isArray(parsed) ? parsed : [], sha: json.sha };
    }
  }

  return { articles: readLocalArticles(), sha: null };
}

async function saveArticles(next, sha = null) {
  const ghRepo = process.env.GITHUB_REPO;
  const ghToken = process.env.GITHUB_TOKEN;

  if (ghRepo && ghToken) {
    const url = `https://api.github.com/repos/${ghRepo}/contents/${repoPath}`;
    const content = Buffer.from(JSON.stringify(next, null, 2), 'utf-8').toString('base64');
    const body = {
      message: 'chore: update articles from admin panel',
      content,
      branch: process.env.GITHUB_BRANCH || 'main',
      sha: sha || undefined,
    };

    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ghToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'openclaw-admin',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`GitHub save failed: ${txt}`);
    }
    return;
  }

  // local/dev fallback
  try {
    fs.writeFileSync(filePath, JSON.stringify(next, null, 2), 'utf-8');
  } catch {
    throw new Error('Storage is not configured. Set GITHUB_REPO and GITHUB_TOKEN in Vercel env.');
  }
}

function unauthorized(res) {
  return res.status(401).json({ ok: false, error: 'unauthorized' });
}

function checkToken(req) {
  const expected = process.env.ADMIN_PANEL_TOKEN;
  if (!expected) return false;
  return req.headers['x-admin-token'] === expected;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { articles } = await readArticles();
      return res.status(200).json(articles);
    }

    if (!checkToken(req)) {
      return unauthorized(res);
    }

    const { articles, sha } = await readArticles();

    if (req.method === 'POST') {
      const { title, image, category, date, readTime, url } = req.body || {};
      if (!title || !image || !category) {
        return res.status(400).json({ ok: false, error: 'title/image/category required' });
      }

      const next = [
        {
          id: Math.max(0, ...articles.map((a) => Number(a.id) || 0)) + 1,
          title: String(title),
          image: String(image),
          category: String(category),
          date: date || new Date().toLocaleDateString('ru-RU'),
          readTime: readTime || '5 мин',
          url: url || '#',
        },
        ...articles,
      ];
      await saveArticles(next, sha);
      return res.status(200).json(next);
    }

    if (req.method === 'PUT') {
      const id = Number(req.query.id);
      if (!id) return res.status(400).json({ ok: false, error: 'id required' });

      const { title, image, category, date, readTime, url } = req.body || {};
      const next = articles.map((a) =>
        a.id === id ? { ...a, title, image, category, date: date || a.date, readTime: readTime || a.readTime, url: url || a.url } : a,
      );
      await saveArticles(next, sha);
      return res.status(200).json(next);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!id) return res.status(400).json({ ok: false, error: 'id required' });

      const next = articles.filter((a) => a.id !== id);
      await saveArticles(next, sha);
      return res.status(200).json(next);
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Internal error' });
  }
}
