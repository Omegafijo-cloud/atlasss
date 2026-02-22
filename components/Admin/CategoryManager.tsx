
import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../../services/supabase';
import { Category } from '../../types';
import { Button } from '../Button';
import { COLORS } from '../../constants';

const CAT_CACHE_KEY = 'atlass_categories_cache';
const CAT_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORS.primary);
  const [loading, setLoading] = useState(false);

  const fetchCats = async (forceRefresh = false) => {
    // Check Cache logic
    if (!forceRefresh) {
      const cached = localStorage.getItem(CAT_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CAT_CACHE_EXPIRY) {
            setCategories(parsed.data);
            return;
          }
        } catch (e) {
          console.warn('Error parsing category cache', e);
        }
      }
    }

    const { data } = await getCategories();
    setCategories(data);
    
    // Set Cache
    localStorage.setItem(CAT_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  };

  useEffect(() => { fetchCats(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    setLoading(true);
    const { data, error } = await createCategory(newCatName.trim(), newCatColor);
    
    if (error) {
      console.error("Error creating category:", error);
      alert(`No se pudo crear la categoría: ${error.message || 'Error desconocido'}`);
    } else {
      setNewCatName('');
      setNewCatColor(COLORS.primary);
      // Invalidate cache and refresh
      localStorage.removeItem(CAT_CACHE_KEY);
      await fetchCats(true);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta categoría? Esto no borrará los artículos, pero quedarán sin categoría.')) {
      const { error } = await deleteCategory(id);
      if (error) {
        alert(`Error al eliminar: ${error.message}`);
      } else {
        localStorage.removeItem(CAT_CACHE_KEY);
        fetchCats(true);
      }
    }
  };

  const handleManualReload = () => {
    localStorage.removeItem(CAT_CACHE_KEY);
    fetchCats(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-[#DFE4EA] shadow-sm">
        <h2 className="text-xl font-bold text-[#2F3542] mb-4">✨ Crear Nueva Categoría</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ej: Fallas Críticas, Nuevos Productos..."
              className="flex-1 p-3 border border-[#DFE4EA] rounded-lg focus:border-[#FF4757] outline-none"
            />
            <div className="flex items-center gap-2 px-3 border border-[#DFE4EA] rounded-lg bg-gray-50">
              <label htmlFor="catColor" className="text-xs font-bold text-gray-500 uppercase">Color</label>
              <input
                id="catColor"
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                title="Elegir color de categoría"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="whitespace-nowrap">
            {loading ? 'Agregando...' : 'Agregar Categoría'}
          </Button>
        </form>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleManualReload}
          className="text-xs text-[var(--color-primary)] font-bold hover:underline flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Recargar Lista desde Servidor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            className="bg-white p-4 rounded-xl border border-[#DFE4EA] flex justify-between items-center group transition-all hover:shadow-md"
            style={{ borderLeft: `4px solid ${cat.color || COLORS.primary}` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: cat.color || COLORS.primary }}
              />
              <span className="font-bold text-[#2F3542]">{cat.name}</span>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded hover:bg-red-50"
              title="Eliminar categoría"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {categories.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
            No hay categorías creadas todavía.
          </div>
        )}
      </div>
    </div>
  );
};
