
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE } from '../constants';
import { DashboardStats, SearchLog, ContentItem, UserQuestion, Category } from '../types';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// FIXED: Disable auth persistence for the admin client.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// --- CATEGORÍAS ---

export const getCategories = async (): Promise<{ data: Category[], error: any }> => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  return { data: data || [], error };
};

export const createCategory = async (name: string, color: string = '#FF4757') => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { data: null, error: { message: "El nombre de la categoría no puede estar vacío." } };
  }

  // Check for case-insensitive duplicates
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('name')
    .ilike('name', trimmedName);

  if (existing && existing.length > 0) {
    return { data: null, error: { message: `La categoría "${trimmedName}" ya existe.` } };
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ 
      name: trimmedName, 
      color 
    })
    .select();
  return { data, error };
};

export const updateCategory = async (id: string, name: string) => {
  return await supabaseAdmin
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', id);
};

export const deleteCategory = async (id: string) => {
  return await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);
};

// --- CONTENIDO ---

const normalizeContentItem = (item: any): ContentItem => {
  return {
    ...item,
    id: String(item.id),
    image_urls: item.image_urls || (item.image_url ? [item.image_url] : []),
    code: item.code || 'N/A',
    is_important: item.is_important || false
  };
};

export const searchContent = async (query: string, categoryName?: string) => {
  let dbQuery = supabase.from('content_items').select('*');
  
  if (query && query.trim() !== '') {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,code.ilike.%${query}%`);
  }
  
  if (categoryName && categoryName !== 'all') {
    dbQuery = dbQuery.eq('category', categoryName);
  }

  // Ordenar: Primero los importantes, luego por fecha
  const { data, error } = await dbQuery
    .order('is_important', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error en búsqueda Atlass:', error);
    return [];
  }

  // Registrar log de búsqueda
  if (query && query.trim() !== '') {
    supabase.from('search_logs').insert({
      query: query.toLowerCase().trim(),
      results_count: data?.length || 0
    }).then(({ error }) => { if (error) console.error("Error logging search:", error); });
  }

  return (data || []).map(normalizeContentItem);
};

export const getRecentContent = async (limit: number = 5) => {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) return [];
  return (data || []).map(normalizeContentItem);
};

export const uploadImage = async (file: File) => {
  const BUCKET_NAME = 'content-images'; 

  try {
    const { error: bucketError } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
    if (bucketError) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
      });
    }
  } catch (e) {
    console.warn("Excepción verificando bucket:", e);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error("Error uploading image:", error);
    return { error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return { publicUrl, error: null };
};

export const createContentItem = async (item: Omit<ContentItem, 'code'>) => {
    // Robust check for unique code
    const { data: existingItems } = await supabaseAdmin
      .from('content_items')
      .select('code');

    const existingCodes = new Set<number>();
    if (existingItems) {
      existingItems.forEach(i => {
        const parsed = parseInt(i.code);
        if (!isNaN(parsed)) existingCodes.add(parsed);
      });
    }

    let nextCode = 100;
    while (existingCodes.has(nextCode)) {
      nextCode++;
    }

    const { id, title, content, category, image_urls, image_hint, is_important } = item;
    const finalId = id || crypto.randomUUID(); 
    
    const dbPayload = { 
      id: finalId, 
      title, 
      content, 
      category, 
      code: nextCode.toString(), 
      image_urls,
      image_hint: image_hint || null,
      image_url: image_urls.length > 0 ? image_urls[0] : null,
      is_important: is_important || false
    };
    
    const { data, error } = await supabaseAdmin
      .from('content_items')
      .insert(dbPayload)
      .select();
      
    if (error) console.error("Error creating content item:", error);

    return { data, error };
}

export const updateContentItem = async (id: string, updates: Partial<ContentItem>) => {
  // Prevent modification of 'code'
  const { code, ...safeUpdates } = updates;

  const { error } = await supabaseAdmin
    .from('content_items')
    .update({
      ...safeUpdates,
      image_url: safeUpdates.image_urls && safeUpdates.image_urls.length > 0 ? safeUpdates.image_urls[0] : undefined
    })
    .eq('id', id);
  return { error };
};

export const deleteContentItem = async (id: string) => {
  const BUCKET_NAME = 'content-images';

  // 1. Obtener el item para ver sus imágenes antes de borrarlo
  const { data: item } = await supabaseAdmin
    .from('content_items')
    .select('image_urls')
    .eq('id', id)
    .single();

  if (item && item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
    // 2. Extraer nombres de archivo de las URLs
    // URL típica: https://[...]/storage/v1/object/public/content-images/[archivo.jpg]
    const filesToRemove = item.image_urls
      .map((url: string) => {
        // Separa la URL por el nombre del bucket para obtener la ruta relativa del archivo
        const parts = url.split(`/${BUCKET_NAME}/`);
        return parts.length > 1 ? parts[1] : null;
      })
      .filter((file: string | null) => file !== null) as string[];

    // 3. Borrar imágenes del storage si existen archivos válidos
    if (filesToRemove.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove(filesToRemove);
      
      if (storageError) {
        console.warn("Error limpiando imágenes del bucket:", storageError);
      }
    }
  }

  // 4. Borrar registro de la base de datos
  return await supabaseAdmin
    .from('content_items')
    .delete()
    .eq('id', id)
    .select();
};

export const getContentItems = async () => {
    const { data, error } = await supabaseAdmin
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) return { data: [], error };
    return { data: data.map(normalizeContentItem), error };
}

// --- AUTENTICACIÓN Y USUARIOS ---

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};

// --- PREGUNTAS Y ESTADÍSTICAS ---

export const submitUserQuestion = async (question: string) => {
  const { error } = await supabase.from('user_questions').insert({
    id: crypto.randomUUID(), 
    question,
  });
  return { error };
};

export const getPendingQuestionsCount = async () => {
  const { count, error } = await supabaseAdmin
    .from('user_questions')
    .select('*', { count: 'exact', head: true });
  return { count: count || 0, error };
};

export const subscribeToQuestions = (onInsert: (payload: any) => void) => {
  return supabase
    .channel('questions-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_questions' }, (payload) => onInsert(payload))
    .subscribe();
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data: contentData } = await supabaseAdmin.from('content_items').select('category');
  const categoryDistributionMap = (contentData || []).reduce((acc: any, item: any) => {
    const cat = item.category || 'Sin Categoría';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const categoryDistribution = Object.entries(categoryDistributionMap).map(([category, count]) => ({ 
    category, 
    count: count as number 
  }));

  const { count: pendingQuestions } = await supabaseAdmin.from('user_questions').select('*', { count: 'exact', head: true });
  
  const { data: logs } = await supabaseAdmin
    .from('search_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
    
  const searchLogs = (logs as SearchLog[]) || [];
  
  const topQueries = searchLogs.reduce((acc: any, curr) => {
    acc[curr.query] = (acc[curr.query] || 0) + 1;
    return acc;
  }, {});

  const topSearches = Object.entries(topQueries)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([query, count]) => ({ query, count: count as number }));

  const missingQueries = searchLogs
    .filter(l => l.results_count === 0)
    .reduce((acc: any, curr) => {
      acc[curr.query] = (acc[curr.query] || 0) + 1;
      return acc;
    }, {});

  const missingContentOpportunities = Object.entries(missingQueries)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([query, count]) => ({ query, count: count as number }));

  return {
    totalSearches: searchLogs.length,
    failedSearches: searchLogs.filter(l => l.results_count === 0).length,
    pendingQuestions: pendingQuestions || 0,
    totalContent: contentData?.length || 0,
    topSearches,
    missingContentOpportunities,
    categoryDistribution,
    searchLogs,
  };
};
