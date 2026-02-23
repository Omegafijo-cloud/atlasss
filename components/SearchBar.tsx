
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Category } from '../types';
import { getCategories } from '../services/supabase';

interface SearchBarProps {
  onSearch: (query: string, categories: string[]) => void;
  selectedCategories: string[];
  resultCount: number | null;
  isSearching: boolean;
}

const CAT_CACHE_KEY = 'atlass_categories_cache';
const CAT_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, selectedCategories, resultCount, isSearching }) => {
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      const cached = localStorage.getItem(CAT_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CAT_CACHE_EXPIRY) {
            setCategories(parsed.data);
            return;
          }
        } catch (e) { console.warn('Fallo al parsear la caché de categorías'); }
      }
      const { data } = await getCategories();
      setCategories(data);
      localStorage.setItem(CAT_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
    };
    fetchCats();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input, selectedCategories);
  };

  const handleCategoryClick = (name: string) => {
    let newSelection = selectedCategories.filter(c => c !== 'all');
    if (name === 'all') {
      newSelection = ['all'];
    } else if (newSelection.includes(name)) {
      newSelection = newSelection.filter(c => c !== name);
    } else {
      newSelection.push(name);
    }
    if (newSelection.length === 0) newSelection = ['all'];
    onSearch(input, newSelection);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Busca por nombre, descripción o código numérico..."
          className="w-full pl-6 pr-32 py-5 text-lg rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-main)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300 shadow-sm group-hover:border-[var(--color-primary-light)]"
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          <Button type="submit" disabled={isSearching} className="shadow-md hover:shadow-lg">
            Buscar
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
            selectedCategories.includes('all') 
              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
              : 'bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:border-[var(--color-primary-light)]'
          }`}>
          Todo
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => handleCategoryClick(cat.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              selectedCategories.includes(cat.name) 
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
                : 'bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:border-[var(--color-primary-light)]'
            }`}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="text-center h-8 flex items-center justify-center">
        {isSearching ? (
          <p className="text-md font-medium text-[var(--color-text-secondary)] animate-pulse">Buscando resultados...</p>
        ) : resultCount !== null && (
          <p className={`text-md font-medium transition-opacity duration-300 ${
              resultCount > 0 ? 'text-green-600' : 'text-red-500'
            }`}>
            {resultCount > 0 ? `${resultCount} resultado${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''}.` : "No se han encontrado resultados para tu búsqueda."}
          </p>
        )}
      </div>
    </div>
  );
};
