
import React, { useState, useEffect, useMemo } from 'react';
import { getContentItems, updateContentItem, createContentItem, getCategories, uploadImage } from '../../services/supabase';
import { ContentItem, Category } from '../../types';
import { Button } from '../Button';

export const ContentManager: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  
  const [uploadSuccessUrl, setUploadSuccessUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    id: '',
    title: '',
    content: '',
    category: '',
    code: '',
    image_urls: [],
    is_important: false,
  });
  
  const [newImageUrl, setNewImageUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([getContentItems(), getCategories()]);
    if (itemsRes.data) setItems(itemsRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadSuccessUrl(null);
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG y WebP');
      return;
    }

    setUploading(true);
    try {
      const { publicUrl, error } = await uploadImage(file);
      
      if (error) {
        alert('Error al subir imagen: ' + error.message);
      } else if (publicUrl) {
        setFormData(prev => ({
          ...prev,
          image_urls: [...(prev.image_urls || []), publicUrl]
        }));
        setUploadSuccessUrl(publicUrl);
      }
    } catch (err: any) {
       alert('Error inesperado al subir: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formData.title?.trim() || '';

    if (!cleanTitle || !formData.content || !formData.category) {
      alert("Faltan campos obligatorios. Asegúrate de completar título, contenido y categoría.");
      return;
    }

    const duplicateTitle = items.find(item => 
      item.title.toLowerCase() === cleanTitle.toLowerCase() && item.id !== formData.id
    );

    if (duplicateTitle) {
      const confirmDuplicate = window.confirm(`📝 AVISO: Ya existe un artículo con el título "${duplicateTitle.title}" (Código #${duplicateTitle.code}). ¿Deseas guardarlo de todas formas?`);
      if (!confirmDuplicate) return;
    }

    setSaving(true);
    
    let result;
    if (isEditing && formData.id) {
      const payload = {
        title: cleanTitle,
        content: formData.content,
        category: formData.category,
        image_urls: formData.image_urls || [],
        is_important: formData.is_important || false,
      } as Partial<ContentItem>;
      result = await updateContentItem(formData.id, payload);
    } else {
      const newUuid = crypto.randomUUID();
      const payload = {
        id: newUuid,
        title: cleanTitle,
        content: formData.content,
        category: formData.category,
        image_urls: formData.image_urls || [],
        is_important: formData.is_important || false,
      } as ContentItem;
      result = await createContentItem(payload);
    }

    setSaving(false);
    if (!result.error) {
      setIsEditing(false);
      setFormData({ title: '', content: '', category: '', code: '', image_urls: [], id: '', is_important: false });
      setUploadSuccessUrl(null);
      fetchData();
    } else {
      alert('Error: ' + result.error.message);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setFormData({ ...item, image_urls: item.image_urls || [] });
    setIsEditing(true);
    setUploadSuccessUrl(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    // This function will be handled by a different tool
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls?.filter((_, idx) => idx !== indexToRemove) || []
    }));
  };

  const filteredItems = useMemo(() => {
    let result = items;

    if (showImportantOnly) {
      result = result.filter(item => item.is_important);
    }

    if (selectedColorFilter) {
      const categoryNamesWithThisColor = categories
        .filter(cat => cat.color === selectedColorFilter)
        .map(cat => cat.name);
      result = result.filter(item => categoryNamesWithThisColor.includes(item.category));
    }
    
    return result;
  }, [items, categories, selectedColorFilter, showImportantOnly]);

  if (loading) return <div className="text-center py-12 text-[var(--color-text-main)]">Actualizando base...</div>;

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-xl border-2 transition-all bg-[var(--color-card)] ${isEditing ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
        <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-2">
          {isEditing ? `✏️ Editando Artículo #${formData.code}` : '➕ Nuevo Artículo'}
        </h2>

        <form onSubmit={handlePublish} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {/* Indicador visual del código */}
             <div className="md:col-span-1">
                <label className="block text-sm font-bold mb-1 text-[var(--color-text-secondary)]">
                  {isEditing ? "Código Asignado" : "Código (Automático)"}
                </label>
                <div className={`w-full p-3 border rounded-lg font-mono text-lg flex items-center justify-center ${
                  isEditing 
                    ? 'bg-[var(--color-hover)] text-[var(--color-text-main)] border-[var(--color-border)] font-bold' 
                    : 'bg-[var(--color-bg)] border-[var(--color-primary)] text-[var(--color-primary)] border-dashed'
                }`}>
                  {isEditing ? `#${formData.code}` : "Será generado"}
                </div>
              </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-bold mb-1 text-[var(--color-text-main)]">Título del Procedimiento</label>
              <input
                type="text" required value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border rounded-lg focus:border-[var(--color-primary)] outline-none bg-[var(--color-input-bg)] text-[var(--color-text-main)] border-[var(--color-border)]"
                placeholder="Ej: Reset de fábrica para serie 4000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-[var(--color-text-main)]">Categoría</label>
              <select
                required value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border rounded-lg outline-none focus:border-[var(--color-primary)] bg-[var(--color-input-bg)] text-[var(--color-text-main)] border-[var(--color-border)]"
              >
                <option value="">Elegir categoría...</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-bold mb-1 text-[var(--color-text-main)]">Imágenes</label>
               <div className="flex gap-2">
                 <input
                  type="text" 
                  value={newImageUrl} 
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="flex-1 p-3 border rounded-lg outline-none focus:border-[var(--color-primary)] bg-[var(--color-input-bg)] text-[var(--color-text-main)] border-[var(--color-border)]"
                  placeholder="https://... o sube archivo"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newImageUrl) {
                        setFormData({...formData, image_urls: [...(formData.image_urls || []), newImageUrl]});
                        setNewImageUrl('');
                      }
                    }
                  }}
                />
                <label className={`cursor-pointer bg-[var(--color-input-bg)] hover:bg-[var(--color-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg px-4 flex items-center justify-center transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <title>Subir desde archivo</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                </label>
               </div>
               
               {uploadSuccessUrl && (
                 <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between animate-fade-in-down">
                   <div className="flex items-center gap-2 overflow-hidden">
                     <div className="bg-green-100 p-1.5 rounded-full">
                       <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-green-700">¡Imagen subida!</span>
                        <a href={uploadSuccessUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 underline truncate hover:text-green-800">
                          {uploadSuccessUrl}
                        </a>
                     </div>
                   </div>
                   <button 
                    type="button" 
                    onClick={() => setUploadSuccessUrl(null)}
                    className="text-green-500 hover:text-green-700 p-1"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </div>
               )}

               {formData.image_urls && formData.image_urls.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-2">
                   {formData.image_urls.map((url, idx) => (
                     <div key={idx} className="relative group w-16 h-16 border rounded overflow-hidden bg-[var(--color-bg)]">
                       <img src={url} alt="preview" className="w-full h-full object-cover" />
                       <button 
                         type="button"
                         onClick={() => removeImage(idx)}
                         className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                         title="Eliminar imagen"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-[var(--color-text-main)]">Pasos Técnicos</label>
            <textarea
              required rows={5} value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-3 border rounded-lg focus:border-[var(--color-primary)] outline-none text-sm leading-relaxed bg-[var(--color-input-bg)] text-[var(--color-text-main)] border-[var(--color-border)]"
              placeholder="1. Presionar botón... 2. Esperar luz roja..."
            />
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center gap-2 p-3 bg-[var(--color-hover)] rounded-lg border border-[var(--color-border)]">
             <input 
                type="checkbox" 
                id="isImportant"
                checked={formData.is_important || false}
                onChange={e => setFormData({...formData, is_important: e.target.checked})}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
             />
             <label htmlFor="isImportant" className="font-bold text-[var(--color-text-main)] cursor-pointer select-none">
               Marcar como Importante (Destacar en resultados)
             </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            {isEditing && <Button type="button" variant="secondary" onClick={() => {
              setIsEditing(false);
              setFormData({ title: '', content: '', category: '', code: '', image_urls: [], id: '', is_important: false });
              setUploadSuccessUrl(null);
            }}>Cancelar</Button>}
            <Button type="submit" disabled={saving} className="min-w-[150px]">
              {saving ? 'Guardando...' : isEditing ? 'Actualizar Artículo' : 'Publicar Artículo'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
        <div className="p-4 bg-[var(--color-hover)] border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="font-bold text-[var(--color-text-main)]">Artículos Existentes</div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Show Important Filter */}
            <div className="flex items-center gap-2 bg-[var(--color-bg)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              <input
                type="checkbox"
                id="filterImportant"
                checked={showImportantOnly}
                onChange={(e) => setShowImportantOnly(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
              <label htmlFor="filterImportant" className="text-xs font-bold text-[var(--color-text-main)] cursor-pointer select-none">
                Solo Importantes (★)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mr-2">Filtrar por Color:</span>
              <button 
                onClick={() => setSelectedColorFilter(null)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${!selectedColorFilter ? 'border-[var(--color-primary)] scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                title="Todos"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-200 to-gray-50 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-gray-600">ALL</span>
                </div>
              </button>
              {Array.from(new Set(categories.map(c => c.color).filter(Boolean))).map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColorFilter(color === selectedColorFilter ? null : color!)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColorFilter === color ? 'border-gray-800 scale-110 shadow-md' : 'border-white hover:scale-105'}`}
                  style={{ backgroundColor: color! }}
                  title={`Filtrar por este color`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-[var(--color-border)] max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredItems.map(item => {
            const itemCategory = categories.find(c => c.name === item.category);
            return (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[var(--color-hover)] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-800 text-white font-mono px-3 py-1 rounded text-sm shadow-sm" title="Código para el asesor">
                    #{item.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">{item.title}</h4>
                      {item.is_important && (
                        <span className="text-[10px] bg-yellow-400 text-black font-bold px-1.5 rounded">★</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: itemCategory?.color || '#DFE4EA' }} />
                      <span className="text-xs uppercase text-[var(--color-text-secondary)] font-semibold">{item.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="text-[var(--color-primary)] text-sm font-bold hover:underline px-2 py-1">
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id, item.title)} 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Borrar Artículo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-[var(--color-text-secondary)] italic">
              No se encontraron artículos con este criterio de filtrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
