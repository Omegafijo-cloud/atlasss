
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Category } from '../types';
import { getCategories } from '../services/supabase';

interface SearchBarProps {
  onSearch: (query: string, categoryId: string) => void;
  selectedCategory: string;
}

const CAT_CACHE_KEY = 'atlass_categories_cache';
const CAT_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, selectedCategory }) => {
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      // Try cache first
      const cached = localStorage.getItem(CAT_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CAT_CACHE_EXPIRY) {
            setCategories(parsed.data);
            return;
          }
        } catch (e) {
          console.warn('Cache parsing failed');
        }
      }

      // Fallback to fetch
      const { data } = await getCategories();
      setCategories(data);
      localStorage.setItem(CAT_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    };

    fetchCats();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input, selectedCategory);
  };

  const handleCategoryClick = (id: string) => {
    onSearch(input, id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-6 h-6 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Busca por nombre o código numérico (ej: 4050)..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-main)] placeholder-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-0 outline-none shadow-sm text-lg transition-all"
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            selectedCategory === 'all' 
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md' 
            : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
          }`}
        >
          Todo
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedCategory === cat.name 
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md' 
              : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="text-center">
        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest">
          Sugerencia: Ingresa el código numérico para acceso directo
        </p>
      </div>
    </div>
  );
};
