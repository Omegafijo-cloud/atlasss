
import { createClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE } from '../constants';
import { DashboardStats, SearchLog, ContentItem, UserQuestion, Category } from '../types';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// --- IMÁGENES ---

export const uploadImage = async (file: File) => {
  const BUCKET_NAME = 'content-images';
  const fileExtension = file.name.split('.').pop();
  const newFileName = `${crypto.randomUUID()}.${fileExtension}`;

  const { data, error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(newFileName, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    return { error: uploadError, publicUrl: null };
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return { error: null, publicUrl };
};


// --- REGISTRO DE AUDITORÍA ---

const logAdminAction = async (action: string, details: object = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("Intento de registro de auditoría sin usuario autenticado.");
      return;
    }

    await supabaseAdmin.from('admin_audit_log').insert({
      action,
      details,
      admin_id: user.id,
      admin_email: user.email
    });
  } catch (error) {
    console.error("Error al registrar la acción de auditoría:", error);
  }
};


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

  const { data: existing } = await supabaseAdmin.from('categories').select('name').ilike('name', trimmedName);

  if (existing && existing.length > 0) {
    return { data: null, error: { message: `La categoría "${trimmedName}" ya existe.` } };
  }

  const { data, error } = await supabaseAdmin.from('categories').insert({ name: trimmedName, color }).select();
  
  if (!error && data) {
    await logAdminAction('create_category', { category_id: data[0].id, name: trimmedName, color });
  }
  
  return { data, error };
};

export const updateCategory = async (id: string, name: string) => {
  const result = await supabaseAdmin.from('categories').update({ name: name.trim() }).eq('id', id);
  if (!result.error) {
    await logAdminAction('update_category', { category_id: id, new_name: name.trim() });
  }
  return result;
};

export const deleteCategory = async (id: string) => {
  const { data: category } = await supabaseAdmin.from('categories').select('name').eq('id', id).single();
  const result = await supabaseAdmin.from('categories').delete().eq('id', id);
  if (!result.error && category) {
    await logAdminAction('delete_category', { category_id: id, name: category.name });
  }
  return result;
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

export const searchContent = async (query: string, categoryNames?: string[]) => {
  let dbQuery = supabase.from('content_items').select('*');
  
  if (query && query.trim() !== '') {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,code.ilike.%${query}%`);
  }
  
  if (categoryNames && categoryNames.length > 0 && !categoryNames.includes('all')) {
    dbQuery = dbQuery.in('category', categoryNames);
  }

  const { data, error } = await dbQuery.order('created_at', { ascending: false });

  if (error) {
    console.error('Error en búsqueda Atlass:', error);
    return [];
  }

  if (query && query.trim() !== '') {
    supabase.from('search_logs').insert({
      query: query.toLowerCase().trim(),
      results_count: data?.length || 0
    }).then(({ error }) => { if (error) console.error("Error logging search:", error); });
  }

  return (data || []).map(normalizeContentItem);
};

export const createContentItem = async (item: Omit<ContentItem, 'code'>) => {
    const { data: existingItems } = await supabaseAdmin.from('content_items').select('code');
    const existingCodes = new Set<number>((existingItems || []).map(i => parseInt(i.code)).filter(n => !isNaN(n)));

    let nextCode = 100;
    while (existingCodes.has(nextCode)) nextCode++;

    const finalId = item.id || crypto.randomUUID();
    const dbPayload = { ...item, id: finalId, code: nextCode.toString(), image_url: item.image_urls[0] || null };
    
    const { data, error } = await supabaseAdmin.from('content_items').insert(dbPayload).select();
      
    if (!error && data) {
      await logAdminAction('create_content_item', { item_id: data[0].id, title: item.title });
    }

    return { data, error };
}

export const updateContentItem = async (id: string, updates: Partial<ContentItem>) => {
  const { code, ...safeUpdates } = updates;
  const result = await supabaseAdmin.from('content_items').update({ ...safeUpdates, image_url: safeUpdates.image_urls?.[0] }).eq('id', id);
  if (!result.error) {
    await logAdminAction('update_content_item', { item_id: id, updated_fields: Object.keys(safeUpdates) });
  }
  return { error: result.error };
};

export const deleteContentItem = async (id: string) => {
  const BUCKET_NAME = 'content-images';
  const { data: item } = await supabaseAdmin.from('content_items').select('image_urls, title').eq('id', id).single();

  if (item?.image_urls?.length) {
    const filesToRemove = item.image_urls.map((url: string) => url.split(`/${BUCKET_NAME}/`)[1]).filter(Boolean);
    if (filesToRemove.length > 0) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove(filesToRemove);
    }
  }

  const result = await supabaseAdmin.from('content_items').delete().eq('id', id).select();
  
  if (!result.error && item) {
    await logAdminAction('delete_content_item', { item_id: id, title: item.title });
  }
  
  return result;
};

export const getContentItems = async () => {
    const { data, error } = await supabaseAdmin.from('content_items').select('*').order('created_at', { ascending: false });
    return { data: (data || []).map(normalizeContentItem), error };
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
  return await supabase.from('user_questions').insert({ id: crypto.randomUUID(), question });
};

export const getPendingQuestionsCount = async () => {
  const { count } = await supabaseAdmin.from('user_questions').select('*', { count: 'exact', head: true });
  return { count: count || 0 };
};

export const subscribeToQuestions = (onInsert: (payload: any) => void) => {
  return supabase
    .channel('questions-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_questions' }, onInsert)
    .subscribe();
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [{ data: contentData }, { count: pendingQuestions }, { data: logs }] = await Promise.all([
    supabaseAdmin.from('content_items').select('category'),
    supabaseAdmin.from('user_questions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('search_logs').select('*').order('created_at', { ascending: false }).limit(1000)
  ]);

  const searchLogs: SearchLog[] = logs || [];
  const categoryDistribution = (contentData || []).reduce((acc: any, { category }) => {
      const cat = category || 'Sin Categoría';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
  }, {});

  const topSearches = searchLogs.reduce((acc, { query }) => ({ ...acc, [query]: (acc[query] || 0) + 1 }), {} as any);
  const missingContentOpportunities = searchLogs.filter(l => l.results_count === 0).reduce((acc, { query }) => ({ ...acc, [query]: (acc[query] || 0) + 1 }), {} as any);

  return {
    totalSearches: searchLogs.length,
    failedSearches: searchLogs.filter(l => l.results_count === 0).length,
    pendingQuestions: pendingQuestions || 0,
    totalContent: contentData?.length || 0,
    topSearches: Object.entries(topSearches).sort(([,a],[,b])=>(b as number)-(a as number)).slice(0,5).map(([q,c])=>({query:q, count:c as number})),
    missingContentOpportunities: Object.entries(missingContentOpportunities).sort(([,a],[,b])=>(b as number)-(a as number)).slice(0,5).map(([q,c])=>({query:q, count:c as number})),
    categoryDistribution: Object.entries(categoryDistribution).map(([cat, c]) => ({ category: cat, count: c as number })),
    searchLogs,
  };
};
