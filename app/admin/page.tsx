
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { ContentManager } from '../../components/Admin/ContentManager';
import { QuestionManager } from '../../components/Admin/QuestionManager';
import { CategoryManager } from '../../components/Admin/CategoryManager';
import { Dashboard } from '../../components/Admin/Dashboard';
import { getSession, signOut, getPendingQuestionsCount, subscribeToQuestions } from '../../services/supabase';
import { NotificationToast } from '../../components/NotificationToast';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'content' | 'categories' | 'questions'>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Proteger ruta
  useEffect(() => {
    getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/');
      } else {
        setLoading(false);
      }
    });

    getPendingQuestionsCount().then(({ count }) => setPendingCount(count || 0));

    const subscription = subscribeToQuestions((payload) => {
      setPendingCount(prev => prev + 1);
      setActiveToast(payload.new.question);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <>
      <Header 
        onAdminClick={() => {}} 
        isAdmin={true}
        onLogout={async () => { await signOut(); router.push('/'); }}
        onLogoClick={() => router.push('/')}
        notificationCount={pendingCount}
      />
      
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

      {activeToast && <NotificationToast message={activeToast} onClose={() => setActiveToast(null)} />}
    </>
  );
}
