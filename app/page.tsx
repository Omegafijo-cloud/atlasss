
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-[var(--color-text-main)] mb-4 tracking-tight">Buscador Inteligente Atlass</h1>
          <p className="text-[var(--color-text-secondary)] text-xl max-w-3xl mx-auto">
            Tu base de conocimientos centralizada y soporte técnico inteligente.
          </p>
        </div>

        <div className="mb-20">
          <SearchBar 
            onSearch={handleSearch} 
            selectedCategories={selectedCategories} 
            resultCount={searchResultCount}
            isSearching={isSearching}
          />
        </div>

        {hasSearched && !isSearching && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {searchResults.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {searchResults.map(item => (
                    <ResultCard key={item.id} item={item} onClick={() => openDetail(item)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm">
                <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-3">Sin resultados</h3>
                <p className="text-[var(--color-text-secondary)] mb-8">¿No encontraste lo que buscabas? Permítenos ayudarte.</p>
                {!questionSubmitted ? (
                  <form onSubmit={handleSubmitQuestion} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 px-4">
                    <input
                      type="text" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Describe tu duda detalladamente..." className="flex-1 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-input-bg)] text-[var(--color-text-main)] transition-shadow"
                    />
                    <Button type="submit">Enviar consulta</Button>
                  </form>
                ) : (
                  <div className="text-green-500 font-semibold text-lg">¡Duda enviada con éxito! Nuestro equipo te contactará pronto.</div>
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
