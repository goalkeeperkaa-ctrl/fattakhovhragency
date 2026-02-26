import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calculator, TrendingDown, Users, Zap, BarChart3, ChevronRight, X, Globe, Search, Play, Share2, Copy, Mail, Twitter, Linkedin, Loader2, Pencil, Trash2, Calendar, Clock } from 'lucide-react';

type Article = {
  id: number;
  title: string;
  image: string;
  category: string;
  date?: string;
  readTime?: string;
  url?: string;
};

const ARTICLES_STORAGE_KEY = 'fattakhov_articles_v1';

// --- Components ---

const ShareModal = ({ isOpen, onClose, article }: { isOpen: boolean, onClose: () => void, article: any }) => {
  if (!isOpen || !article) return null;

  const shareUrl = `${window.location.origin}/insights/${article.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Ссылка скопирована!');
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin' | 'email') => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareUrl)}`;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel bg-[#1a1a1a] rounded-3xl w-full max-w-sm p-6 relative border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-display font-bold text-white mb-6">Поделиться</h3>
        <p className="text-white/60 text-sm mb-6 line-clamp-2">{article.title}</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
            <button onClick={() => shareToSocial('twitter')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Twitter className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Twitter</span>
            </button>
            <button onClick={() => shareToSocial('linkedin')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <Linkedin className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">LinkedIn</span>
            </button>
             <button onClick={() => shareToSocial('email')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Email</span>
            </button>
             <button onClick={handleCopy} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Copy className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Copy</span>
            </button>
        </div>

        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-white/40 truncate mr-4">{shareUrl}</span>
            <button onClick={handleCopy} className="text-xs font-bold text-white hover:text-white/80">
                COPY
            </button>
        </div>
      </motion.div>
    </div>
  );
};

const CommentModal = ({ isOpen, onClose, article }: { isOpen: boolean, onClose: () => void, article: any }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{id: number, text: string, author: string, date: string}[]>([
    { id: 1, text: "Отличная статья! Очень актуально для нашего времени.", author: "Алексей", date: "20.02.2024" },
    { id: 2, text: "Согласен с автором, AI действительно меняет правила игры.", author: "Мария", date: "19.02.2024" }
  ]);

  if (!isOpen || !article) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      text: comment,
      author: "Гость",
      date: new Date().toLocaleDateString('ru-RU')
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel bg-[#1a1a1a] rounded-3xl w-full max-w-lg p-8 relative border border-white/10 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-display font-bold text-white mb-2">Комментарии</h3>
        <p className="text-white/60 text-sm mb-6 line-clamp-1">{article.title}</p>

        <div className="flex-grow overflow-y-auto mb-6 pr-2 space-y-4 custom-scrollbar">
          {comments.map((c) => (
            <div key={c.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-white">{c.author}</span>
                <span className="text-xs text-white/40">{c.date}</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Написать комментарий..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-white/40 transition-colors text-sm" 
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const GlassButton = ({ children, className = '', onClick, icon: Icon }: { children: React.ReactNode, className?: string, onClick?: () => void, icon?: React.ElementType }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${className}`}
  >
    {children}
    {Icon && <Icon className="w-4 h-4" />}
  </motion.button>
);

const CalculatorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [employees, setEmployees] = useState(10);
  const [salary, setSalary] = useState(80000);
  const [turnover, setTurnover] = useState(20);

  const replacementCost = Math.round((employees * (turnover / 100)) * (salary * 4));
  const efficiencyLoss = Math.round((employees * salary) * 0.2 * 12);
  const totalLoss = replacementCost + efficiencyLoss;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel bg-[#1a1a1a] rounded-3xl w-full max-w-2xl p-8 relative border border-white/10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-3xl font-display font-bold text-white mb-8">Калькулятор Потерь</h3>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-4 uppercase tracking-wider">Сотрудников: <span className="text-white ml-2">{employees}</span></label>
              <input 
                type="range" min="1" max="100" value={employees} 
                onChange={(e) => setEmployees(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-4 uppercase tracking-wider">Средняя ЗП: <span className="text-white ml-2">{salary.toLocaleString()} ₽</span></label>
              <input 
                type="range" min="30000" max="300000" step="5000" value={salary} 
                onChange={(e) => setSalary(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-4 uppercase tracking-wider">Текучка: <span className="text-white ml-2">{turnover}%</span></label>
              <input 
                type="range" min="0" max="100" value={turnover} 
                onChange={(e) => setTurnover(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-center">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Ежегодные потери</div>
            <div className="text-4xl font-display font-bold text-white mb-6">
              {totalLoss.toLocaleString()} ₽
            </div>
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex justify-between">
                <span>Найм и адаптация:</span>
                <span className="text-white">{replacementCost.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Неэффективность:</span>
                <span className="text-white">{efficiencyLoss.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ServicesSection = () => (
  <section id="services" className="py-24 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="text-xs font-mono text-white/40 mb-2">02.0 УСЛУГИ</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold">Продукты Роста</h2>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Архитектура", desc: "Аудит процессов и карта оптимизации", icon: BarChart3 },
          { title: "Подбор", desc: "Поиск ключевых руководителей", icon: Users },
          { title: "AI Автоматизация", desc: "Внедрение AI-агентов", icon: Zap }
        ].map((item, i) => (
          <div key={i} className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-white/60 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CasesSection = () => (
  <section id="cases" className="py-24 px-4 relative">
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <div className="text-xs font-mono text-white/40 mb-2">03.0 КЕЙСЫ</div>
        <h2 className="text-4xl md:text-5xl font-display font-bold">Результаты</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "IT-компания (120+ сотрудников)", res: "4.2M ₽/год", desc: "Сократили потери на онбординге и адаптации после внедрения AI-воркфлоу за 6 недель" },
          { title: "Ритейл-сеть (28 точек)", res: "-70% к сроку найма", desc: "Пересобрали рекрутинг-процесс и автоматизировали воронку кандидатов за 30 дней" }
        ].map((item, i) => (
          <div key={i} className="glass-panel p-8 rounded-3xl flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown className="w-32 h-32" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="text-white/60 max-w-xs">{item.desc}</p>
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Результат</div>
              <div className="text-5xl font-display font-bold text-green-400">{item.res}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const MediaSection = ({ articles, setArticles }: { articles: Article[], setArticles: React.Dispatch<React.SetStateAction<Article[]>> }) => {
  const [loading, setLoading] = useState(false);
  const [sharingArticle, setSharingArticle] = useState<Article | null>(null);

  const moreArticlesPool = [
    { title: "Новые метрики эффективности команд в 2026", category: "АНАЛИТИКА", readTime: "6 мин", date: "26 фев 2026" },
    { title: "Как сократить рутину отдела продаж без найма", category: "ПРАКТИКА", readTime: "4 мин", date: "25 фев 2026" },
    { title: "Автоматизация рекрутинга: структура внедрения за 30 дней", category: "CASE STUDY", readTime: "7 мин", date: "24 фев 2026" },
    { title: "Когда AI помогает, а когда мешает: честный разбор", category: "МНЕНИЕ", readTime: "5 мин", date: "23 фев 2026" },
    { title: "Как повысить конверсию лидов за счет скорости ответа", category: "GROWTH", readTime: "5 мин", date: "22 фев 2026" },
    { title: "7 ошибок внедрения автоматизации в SMB", category: "ГАЙД", readTime: "8 мин", date: "21 фев 2026" }
  ];

  const loadMore = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const currentCount = articles.length;
      const newArticles = Array.from({ length: 3 }).map((_, i) => {
        const template = moreArticlesPool[(currentCount + i) % moreArticlesPool.length];
        return {
          id: currentCount + i + 1,
          title: template.title,
          image: `https://picsum.photos/seed/insight${currentCount + i + 1}/800/600`,
          category: template.category,
          readTime: template.readTime,
          date: template.date,
          url: '#'
        };
      });
      
      setArticles(prev => [...prev, ...newArticles]);
      setLoading(false);
    }, 1000);
  };

  return (
    <section id="media" className="py-24 px-4 pb-48">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono text-white/40 mb-2">04.0 МЕДИА</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold">Инсайты</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <motion.div 
              key={article.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass-panel rounded-3xl overflow-hidden group cursor-pointer flex flex-col h-full"
            >
              <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img 
                  src={article.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                  alt={article.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSharingArticle(article); }}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white hover:text-black transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs text-white/40 mb-2 tracking-wider font-medium">{article.category}</div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-white/90 transition-colors line-clamp-2 flex-grow">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-white/60 mb-3">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date || '26 фев 2026'}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime || '5 мин'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/70 group-hover:text-white transition-colors mt-auto">
                  Читать материал <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="px-8 py-3 rounded-full border border-white/20 text-sm font-medium hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              'Загрузить еще'
            )}
          </button>
        </div>
      </div>
      
      <ShareModal isOpen={!!sharingArticle} onClose={() => setSharingArticle(null)} article={sharingArticle} />
    </section>
  );
};

const AdminPanel = ({ 
  isOpen, 
  onClose, 
  articles, 
  onAddArticle, 
  onEditArticle, 
  onDeleteArticle,
  adminToken,
  setAdminToken
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  articles: Article[], 
  onAddArticle: (article: { title: string, image: string, category: string, date?: string, readTime?: string, url?: string }) => Promise<void>,
  onEditArticle: (id: number, article: { title: string, image: string, category: string, date?: string, readTime?: string, url?: string }) => Promise<void>,
  onDeleteArticle: (id: number) => Promise<void>,
  adminToken: string,
  setAdminToken: (v: string) => void
}) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [readTime, setReadTime] = useState('5 мин');
  const [url, setUrl] = useState('#');
  const [editingId, setEditingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image || !category) return;
    if (url && url !== '#' && !/^https?:\/\//i.test(url)) {
      alert('URL статьи должен начинаться с http:// или https://');
      return;
    }
    try {
      if (editingId) {
        await onEditArticle(editingId, { title, image, category, date, readTime, url });
        alert('Статья обновлена!');
      } else {
        await onAddArticle({ title, image, category, date, readTime, url });
        alert('Статья добавлена!');
      }
      resetForm();
    } catch (err: any) {
      alert(err?.message || 'Не удалось сохранить статью');
    }
  };

  const handleEditClick = (article: Article) => {
    setTitle(article.title);
    setImage(article.image);
    setCategory(article.category);
    setDate(article.date || '');
    setReadTime(article.readTime || '5 мин');
    setUrl(article.url || '#');
    setEditingId(article.id);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) return;
    try {
      await onDeleteArticle(id);
    } catch (err: any) {
      alert(err?.message || 'Не удалось удалить статью');
    }
  };

  const resetForm = () => {
    setTitle('');
    setImage('');
    setCategory('');
    setDate('');
    setReadTime('5 мин');
    setUrl('#');
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel bg-[#1a1a1a] rounded-3xl w-full max-w-4xl p-8 relative border border-white/10 max-h-[90vh] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-display font-bold text-white mb-2">
          {editingId ? 'Редактировать статью' : 'Админ Панель'}
        </h3>
        <p className="text-xs text-white/60 mb-4">Настоящая админка работает через API. Для записи нужен admin token.</p>
        <input
          type="password"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          placeholder="Admin token"
          className="w-full mb-6 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors"
        />

        <div className="grid md:grid-cols-2 gap-8 overflow-hidden h-full">
          {/* Form Section */}
          <div className="overflow-y-auto custom-scrollbar pr-2">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Заголовок</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors" 
                  placeholder="Название статьи" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">URL Изображения</label>
                <input 
                  type="text" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors" 
                  placeholder="https://..." 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Категория</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors" 
                  placeholder="AI, МЕНЕДЖМЕНТ..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Дата</label>
                  <input type="text" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors" placeholder="26 фев 2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Время чтения</label>
                  <input type="text" value={readTime} onChange={(e)=>setReadTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors" placeholder="5 мин" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">URL статьи</label>
                <input type="text" value={url} onChange={(e)=>setUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors" placeholder="https://... или #" />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-white text-black font-bold py-4 rounded-xl mt-4 hover:bg-gray-200 transition-colors">
                  {editingId ? 'СОХРАНИТЬ' : 'ДОБАВИТЬ'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-6 py-4 rounded-xl mt-4 border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    ОТМЕНА
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className="border-l border-white/10 pl-8 overflow-y-auto custom-scrollbar">
            <h4 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Список статей ({articles.length})</h4>
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 group hover:bg-white/10 transition-colors">
                  <img src={article.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-bold truncate">{article.title}</div>
                    <div className="text-[10px] text-white/40">{article.category}</div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(article)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-blue-400"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(article.id)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const NavPill = ({ onOpenAdmin, adminEnabled }: { onOpenAdmin: () => void, adminEnabled: boolean }) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl glass-pill rounded-full px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-black/20"
    >
      <div className="flex items-center gap-8">
        <div className="font-display font-bold text-xl tracking-wider text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          FATTAKHOV HR Agency
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70 uppercase tracking-widest">
          <button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">Услуги</button>
          <button onClick={() => scrollTo('cases')} className="hover:text-white transition-colors">Кейсы</button>
          <button onClick={() => scrollTo('media')} className="hover:text-white transition-colors">Медиа</button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {adminEnabled && (
          <>
            <button onClick={onOpenAdmin} className="text-xs font-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest">
              Admin
            </button>
            <div className="w-px h-4 bg-white/20"></div>
          </>
        )}
        <Globe className="w-5 h-5 text-white/70 hover:text-white cursor-pointer" />
        <div className="w-px h-4 bg-white/20"></div>
        <div className="text-xs font-medium text-white/70">ОСН. 2024</div>
      </div>
    </motion.div>
  );
};

const BottomPill = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <motion.div 
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl glass-pill rounded-full px-2 py-2 flex items-center justify-between pl-6"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
         <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
      </div>
      <div>
        <div className="text-xs text-white/50 uppercase tracking-widest">Доступен новый аудит</div>
        <div className="text-sm font-display font-bold text-white">ПОЛНАЯ ДИАГНОСТИКА 2.0</div>
      </div>
    </div>
    
    <div className="flex items-center gap-8">
      <div className="hidden md:block text-[10px] text-white/40 max-w-[150px] leading-tight text-right">
        AI-АНАЛИЗ<br/>ОТ FATTAKHOV HR
      </div>
      <button 
        onClick={onOpenModal}
        className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all group"
      >
        <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
      </button>
    </div>
  </motion.div>
);

const MainDashboard = ({ onOpenModal, onOpenCalculator }: { onOpenModal: () => void, onOpenCalculator: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl glass-panel rounded-[40px] p-8 md:p-12 relative overflow-hidden"
      >
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="flex items-start gap-6">
            <div className="font-display text-6xl md:text-8xl font-light leading-none text-white/90">01</div>
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">FATTAKHOV HR Agency</div>
              <div className="text-sm font-medium text-white/90 max-w-[280px] leading-relaxed">
                Снижаем рутину команды на 30%+ за 14 дней без замены вашей CRM/1С.
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] text-white/40 uppercase tracking-widest text-right">
              Статус системы: <span className="text-green-400">Онлайн</span><br/>
              AI Агенты: <span className="text-white">Активны</span>
            </div>
            <GlassButton className="bg-white text-black hover:bg-white/90" onClick={onOpenModal}>
              Получить аудит за 15 минут
            </GlassButton>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-12 gap-6 h-full">
          
          {/* Left Column - Diagnostic Card */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 flex-grow relative overflow-hidden group hover:bg-white/5 transition-colors">
              <div className="absolute top-4 left-4 text-xs font-mono text-white/40">01.1 ДИАГНОСТИКА</div>
              <div className="mt-8 mb-4">
                <div className="text-3xl font-display font-bold mb-2">Калькулятор<br/>Потерь</div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Рассчитайте ежегодные потери бюджета из-за текучки и неэффективности.
                </p>
              </div>
              
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mt-auto">
                 <img 
                   src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                   className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" 
                   alt="Data"
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <button 
                   onClick={onOpenCalculator}
                   className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                 >
                   <Search className="w-4 h-4" />
                 </button>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Zap className="w-3 h-3" />
                  <span>На базе AI</span>
                </div>
                <button 
                  onClick={onOpenCalculator}
                  className="px-3 py-1 rounded-full border border-white/20 text-[10px] uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                >
                  Начать
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Main Visual */}
          <div className="md:col-span-8 relative">
            <div className="glass-panel rounded-3xl p-8 pb-24 md:pb-8 h-full min-h-[400px] relative overflow-hidden flex items-center justify-center group">
              {/* Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -z-10" />
              
              <div className="relative z-10 text-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full glass-panel border border-white/10 flex items-center justify-center mx-auto mb-8 relative">
                   <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                   <div className="absolute inset-4 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                   <img 
                     src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" 
                     className="w-[90%] h-[90%] object-cover rounded-full opacity-90"
                     alt="AI Sphere"
                     referrerPolicy="no-referrer"
                   />
                   
                   {/* Floating Label */}
                   <div className="absolute top-1/2 -right-12 -translate-y-1/2 glass-pill px-4 py-2 rounded-full flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                     <span className="text-xs font-bold">ЭКОНОМИЯ: 4.2M ₽</span>
                   </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">АВТОМАТИЗАЦИЯ ОПЕРАЦИОНКИ И ПРОДАЖ</h2>
                <p className="text-white/80 max-w-xl mx-auto text-sm leading-relaxed">
                  Внедряем AI-воркфлоу для команд: меньше ручной работы, быстрее обработка заявок, прозрачные цифры по эффективности.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-wider text-white/80">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Спринт 14 дней</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Без замены CRM/1С</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Метрики до/после</span>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-8 right-8 flex gap-4">
                 <button 
                   onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                   className="px-6 py-3 rounded-full bg-black text-white font-medium text-sm hover:bg-gray-900 transition-colors flex items-center gap-2"
                 >
                   Разобрать потери команды <ChevronRight className="w-4 h-4" />
                 </button>
                 <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                   <Play className="w-4 h-4 fill-current" />
                 </button>
              </div>
              
              <div className="absolute top-8 left-8">
                <div className="text-6xl font-display font-bold text-white/5">02</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Modal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const turnstileEnabled = Boolean(turnstileSiteKey);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');
  const [openedAt] = useState(() => Date.now());
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const isValidContact = (value: string) => {
    const v = value.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const telegram = /^@?[a-zA-Z0-9_]{5,32}$/;
    const phone = /^\+?[0-9\s\-()]{10,18}$/;
    return email.test(v) || telegram.test(v) || phone.test(v);
  };

  useEffect(() => {
    if (!isOpen || !turnstileEnabled || !turnstileContainerRef.current) return;

    const renderWidget = () => {
      const t = (window as any).turnstile;
      if (!t || !turnstileContainerRef.current || turnstileWidgetIdRef.current) return;

      turnstileWidgetIdRef.current = t.render(turnstileContainerRef.current, {
        sitekey: turnstileSiteKey,
        theme: 'dark',
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
    };

    const existing = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    if (existing) {
      renderWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.body.appendChild(script);

    return () => {
      const t = (window as any).turnstile;
      if (turnstileWidgetIdRef.current && t) {
        t.remove(turnstileWidgetIdRef.current);
      }
      turnstileWidgetIdRef.current = null;
      setTurnstileToken('');
    };
  }, [isOpen, turnstileEnabled, turnstileSiteKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();

    if (!trimmedName || !trimmedContact) {
      setStatus('error');
      setErrorText('Заполни имя и контакты.');
      return;
    }

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setStatus('error');
      setErrorText('Имя должно быть от 2 до 80 символов.');
      return;
    }

    if (trimmedContact.length < 5 || trimmedContact.length > 120 || !isValidContact(trimmedContact)) {
      setStatus('error');
      setErrorText('Укажи корректный email / Telegram / телефон.');
      return;
    }

    if (company.trim()) {
      setStatus('error');
      setErrorText('Spam check failed.');
      return;
    }

    if (Date.now() - openedAt < 2500) {
      setStatus('error');
      setErrorText('Слишком быстро. Попробуй ещё раз через пару секунд.');
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setStatus('error');
      setErrorText('Подтверди, что ты не робот.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          contact: trimmedContact,
          source: 'audit_modal',
          company,
          formOpenedAt: openedAt,
          submittedAt: Date.now(),
          turnstileToken,
        }),
      });

      if (!response.ok) throw new Error('Lead request failed');

      setStatus('success');
      setName('');
      setContact('');
      setCompany('');
      setTurnstileToken('');

      const t = (window as any).turnstile;
      if (turnstileWidgetIdRef.current && t) {
        t.reset(turnstileWidgetIdRef.current);
      }

      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setStatus('error');
      setErrorText('Не удалось отправить заявку. Попробуй ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel bg-[#1a1a1a] rounded-3xl w-full max-w-md p-8 relative border border-white/10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <div className="mb-8">
          <div className="text-xs font-mono text-white/40 mb-2">03.0 КОНТАКТЫ</div>
          <h3 className="text-3xl font-display font-bold text-white">Запрос аудита</h3>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="Введите ваше имя"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Контакты</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="Email / @telegram / телефон"
            />
          </div>

          <div className="hidden" aria-hidden="true">
            <label>Company</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          {turnstileEnabled && (
            <div>
              <div ref={turnstileContainerRef} className="min-h-[65px]" />
            </div>
          )}

          {status === 'success' && <p className="text-green-400 text-sm">Заявка отправлена. Мы скоро свяжемся.</p>}
          {status === 'error' && <p className="text-red-400 text-sm">{errorText || 'Не удалось отправить заявку. Попробуйте ещё раз.'}</p>}

          <button
            disabled={submitting}
            className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            {submitting ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ ЗАПРОС'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const adminEnabled = import.meta.env.VITE_ADMIN_ENABLED === 'true';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState('');

  const fallbackArticles: Article[] = [
    {
      id: 1,
      title: "Как AI меняет структуру современных HR-департаментов",
      image: "https://picsum.photos/seed/insight1/800/600",
      category: "AI & TECH",
      date: "26 фев 2026",
      readTime: "6 мин",
      url: '#'
    },
    {
      id: 2,
      title: "5 признаков того, что ваша команда теряет эффективность",
      image: "https://picsum.photos/seed/insight2/800/600",
      category: "МЕНЕДЖМЕНТ",
      date: "25 фев 2026",
      readTime: "5 мин",
      url: '#'
    },
    {
      id: 3,
      title: "Будущее найма: почему резюме больше не работают",
      image: "https://picsum.photos/seed/insight3/800/600",
      category: "ТРЕНДЫ",
      date: "24 фев 2026",
      readTime: "7 мин",
      url: '#'
    }
  ];

  const [articles, setArticles] = useState<Article[]>(fallbackArticles);

  useEffect(() => {
    let alive = true;

    fetch('/api/articles')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('articles api failed'))))
      .then((data: Article[]) => {
        if (!alive || !Array.isArray(data) || data.length === 0) return;
        setArticles(data);
      })
      .catch(() => {
        const localRaw = localStorage.getItem(ARTICLES_STORAGE_KEY);
        if (localRaw) {
          try {
            const localData = JSON.parse(localRaw) as Article[];
            if (Array.isArray(localData) && localData.length > 0) {
              setArticles(localData);
              return;
            }
          } catch {
            // ignore broken local cache
          }
        }

        fetch('/content/articles.json')
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error('articles fetch failed'))))
          .then((data: Article[]) => {
            if (!alive || !Array.isArray(data) || data.length === 0) return;
            setArticles(data);
          })
          .catch(() => {
            // keep fallback silently
          });
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleAddArticle = async (newArticle: { title: string, image: string, category: string, date?: string, readTime?: string, url?: string }) => {
    const body = {
      ...newArticle,
      date: newArticle.date || new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: newArticle.readTime || '5 мин',
      url: newArticle.url || '#',
    };
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Неверный токен или ошибка API');
    const data = (await res.json()) as Article[];
    setArticles(data);
  };

  const handleEditArticle = async (id: number, updatedArticle: { title: string, image: string, category: string, date?: string, readTime?: string, url?: string }) => {
    const res = await fetch(`/api/articles?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify(updatedArticle),
    });
    if (!res.ok) throw new Error('Неверный токен или ошибка API');
    const data = (await res.json()) as Article[];
    setArticles(data);
  };

  const handleDeleteArticle = async (id: number) => {
    const res = await fetch(`/api/articles?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken },
    });
    if (!res.ok) throw new Error('Неверный токен или ошибка API');
    const data = (await res.json()) as Article[];
    setArticles(data);
  };

  useEffect(() => {
    try {
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch {
      // ignore storage failures
    }
  }, [articles]);

  return (
    <div className="min-h-screen bg-desert relative text-white selection:bg-white/30">
      <div className="fixed inset-0 bg-black/55 -z-10" /> {/* Stronger overlay for readability */}
      <div className="fixed inset-0 -z-10 backdrop-blur-[2px]" />
      
      <NavPill onOpenAdmin={() => setIsAdminOpen(true)} adminEnabled={adminEnabled} />
      
      <MainDashboard 
        onOpenModal={() => setIsModalOpen(true)} 
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />
      
      <ServicesSection />
      <CasesSection />
      <MediaSection articles={articles} setArticles={setArticles} />
      
      <BottomPill onOpenModal={() => setIsModalOpen(true)} />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      {adminEnabled && (
        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          articles={articles}
          onAddArticle={handleAddArticle} 
          onEditArticle={handleEditArticle}
          onDeleteArticle={handleDeleteArticle}
          adminToken={adminToken}
          setAdminToken={setAdminToken}
        />
      )}
    </div>
  );
}
