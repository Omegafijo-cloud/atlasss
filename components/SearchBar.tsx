
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
const CAT_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

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
        } catch (e) { console.warn('Cache parsing failed'); }
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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Input y botón de búsqueda */}
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Busca por nombre o código numérico..."
          className="w-full pl-6 pr-4 py-4 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-card)] ..."
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <Button type="submit" disabled={isSearching}>Buscar</Button>
        </div>
      </form>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-1.5 ... ${selectedCategories.includes('all') ? '...' : '...'}`}>
          Todo
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => handleCategoryClick(cat.name)}
            className={`px-4 py-1.5 ... ${selectedCategories.includes(cat.name) ? '...' : '...'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Contador de resultados e indicador de búsqueda */}
      <div className="text-center h-6">
        {isSearching ? (
          <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">Buscando...</p>
        ) : resultCount !== null && (
          <p className={`text-sm transition-opacity duration-300 ${resultCount > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {resultCount > 0 ? `${resultCount} resultado${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''}.` : "No se encontraron resultados."}
          </p>
        )}
      </div>
    </div>
  );
};
