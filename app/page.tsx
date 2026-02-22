
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { ResultCard } from '../components/ResultCard';
import { ContentDetailModal } from '../components/ContentDetailModal';
import { Button } from '../components/Button';
import { LoginModal } from '../components/Admin/LoginModal';
import { 
  searchContent, 
  submitUserQuestion, 
  getSession, 
  signOut,
  getPendingQuestionsCount
} from '../services/supabase';
import { ContentItem } from '../types';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  
  const [userQuestion, setUserQuestion] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    getSession().then(({ data }) => {
      if (data.session) setIsAdmin(true);
    });

    getPendingQuestionsCount().then(({ count }) => {
      setPendingCount(count || 0);
    });
  }, []);

  const handleSearch = async (query: string, categories: string[]) => {
    setIsSearching(true);
    setHasSearched(true);
    setQuestionSubmitted(false);
    setSelectedCategories(categories);
    
    const results = await searchContent(query, categories);
    setSearchResults(results);
    setSearchResultCount(results.length);
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

  const handleAdminClick = () => {
    if (isAdmin) router.push('/admin');
    else setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    router.push('/admin');
  };

  const handleLogout = async () => {
    await signOut();
    setIsAdmin(false);
  };

  return (
    <>
      <Header 
        onAdminClick={handleAdminClick} 
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onLogoClick={() => window.location.reload()}
        notificationCount={pendingCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--color-text-main)] mb-4">Buscador Inteligente Atlass</h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            Base de conocimientos centralizada y soporte técnico.
          </p>
        </div>

        <div className="mb-16">
          <SearchBar 
            onSearch={handleSearch} 
            selectedCategories={selectedCategories} 
            resultCount={searchResultCount}
            isSearching={isSearching}
          />
        </div>

        {hasSearched && !isSearching && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(item => (
                    <ResultCard key={item.id} item={item} onClick={() => openDetail(item)} />
                  ))}
                </div>
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
      </main>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLoginSuccess} />
      <ContentDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} item={selectedItem} />
    </>
  );
}
