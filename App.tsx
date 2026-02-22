
import React, { useState, useEffect, createContext } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ResultCard } from './components/ResultCard';
import { ContentDetailModal } from './components/ContentDetailModal';
import { ContentManager } from './components/Admin/ContentManager';
import { QuestionManager } from './components/Admin/QuestionManager';
import { CategoryManager } from './components/Admin/CategoryManager';
import { Dashboard } from './components/Admin/Dashboard';
import { LoginModal } from './components/Admin/LoginModal';
import { NotificationToast } from './components/NotificationToast';
import { Button } from './components/Button';
import { 
  searchContent, 
  submitUserQuestion, 
  getSession, 
  signOut, 
  getPendingQuestionsCount,
  subscribeToQuestions 
} from './services/supabase';
import { ContentItem, ThemeKey } from './types';
import { THEMES } from './constants';

// Contexto para el Tema
export const ThemeContext = createContext<{
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}>({
  theme: 'atlass',
  setTheme: () => {},
});

function App() {
  const [theme, setTheme] = useState<ThemeKey>('atlass');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<'search' | 'admin'>('search');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'content' | 'categories' | 'questions'>('dashboard');
  
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastQuery, setLastQuery] = useState('');
  
  const [userQuestion, setUserQuestion] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    getSession().then(({ data }) => {
      if (data.session) setIsAdmin(true);
    });

    getPendingQuestionsCount().then(({ count }) => {
      setPendingCount(count || 0);
    });

    const subscription = subscribeToQuestions((payload) => {
      setPendingCount(prev => prev + 1);
      setActiveToast(payload.new.question);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = async (query: string, categoryId: string) => {
    setIsSearching(true);
    setHasSearched(true);
    setQuestionSubmitted(false);
    setSelectedCategory(categoryId);
    setLastQuery(query);
    
    const results = await searchContent(query, categoryId);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    await submitUserQuestion(userQuestion);
    setQuestionSubmitted(true);
    setUserQuestion('');
  };

  const openDetail = (item: ContentItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const renderAdmin = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Panel de Administración</h1>
        <div className="flex flex-wrap bg-[var(--color-card)] rounded-lg p-1 border border-[var(--color-border)] shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'content', label: 'Contenido' },
            { id: 'categories', label: 'Categorías' },
            { id: 'questions', label: 'Preguntas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                adminTab === tab.id 
                  ? 'bg-[var(--color-primary)] text-white shadow-md' 
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
              }`}
            >
              {tab.label}
              {tab.id === 'questions' && pendingCount > 0 && adminTab !== 'questions' && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {adminTab === 'dashboard' && <Dashboard />}
      {adminTab === 'content' && <ContentManager />}
      {adminTab === 'categories' && <CategoryManager />}
      {adminTab === 'questions' && <QuestionManager />}
    </div>
  );

  const activeTheme = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* Inject Dynamic CSS Variables */}
      <style>{`
        :root {
          --color-primary: ${activeTheme.colors.primary};
          --color-bg: ${activeTheme.colors.background};
          --color-card: ${activeTheme.colors.card};
          --color-text-main: ${activeTheme.colors.textMain};
          --color-text-secondary: ${activeTheme.colors.textSecondary};
          --color-border: ${activeTheme.colors.border};
          --color-input-bg: ${activeTheme.colors.inputBg};
          --color-hover: ${activeTheme.colors.hover};
        }
        body {
          background-color: var(--color-bg);
          color: var(--color-text-main);
        }
      `}</style>

      <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300 pb-20">
        <Header 
          onAdminClick={() => isAdmin ? setCurrentView('admin') : setShowLogin(true)} 
          isAdmin={isAdmin}
          onLogout={async () => { await signOut(); setIsAdmin(false); setCurrentView('search'); }}
          onLogoClick={() => setCurrentView('search')}
          notificationCount={pendingCount}
        />

        {isAdmin && currentView === 'admin' ? renderAdmin() : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-[var(--color-text-main)] mb-4">Buscador Inteligente Atlass</h1>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                Base de conocimientos centralizada y soporte técnico.
              </p>
            </div>

            <div className="mb-16">
              <SearchBar onSearch={handleSearch} selectedCategory={selectedCategory} />
            </div>

            {hasSearched && (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {isSearching ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
                      <h2 className="text-xl font-bold text-[var(--color-text-main)]">Resultados ({searchResults.length})</h2>
                      {selectedCategory !== 'all' && (
                        <span className="text-sm bg-[var(--color-card)] text-[var(--color-primary)] px-3 py-1 rounded-full font-semibold border border-[var(--color-border)]">
                          Filtrado por: {selectedCategory}
                        </span>
                      )}
                    </div>
                    
                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map(item => (
                          <ResultCard key={item.id} item={item} onClick={() => openDetail(item)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
                        <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2">Sin resultados</h3>
                        <p className="text-[var(--color-text-secondary)] mb-6">¿Quieres escalar esta duda?</p>
                        {!questionSubmitted ? (
                          <form onSubmit={handleSubmitQuestion} className="max-w-md mx-auto flex gap-2 px-4">
                            <input
                              type="text" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)}
                              placeholder="Describe tu duda..." className="flex-1 p-3 border rounded-lg outline-none focus:border-[var(--color-primary)] bg-[var(--color-input-bg)] text-[var(--color-text-main)]"
                            />
                            <Button type="submit">Enviar</Button>
                          </form>
                        ) : (
                          <div className="text-green-600 font-bold">¡Duda enviada con éxito!</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={() => { setIsAdmin(true); setCurrentView('admin'); }} />
        <ContentDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} item={selectedItem} />
        {activeToast && <NotificationToast message={activeToast} onClose={() => setActiveToast(null)} />}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
