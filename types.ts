
export interface Category {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string; 
  code: string; // Campo para códigos automáticos (ej: "100", "101")
  image_urls: string[];
  image_hint: string | null;
  is_important?: boolean; // Nuevo campo para marcar relevancia
  created_at?: string;
}

export interface UserQuestion {
  id: string;
  question: string;
  submitted_at: string;
}

export interface SearchLog {
  id: number;
  created_at: string;
  query: string;
  results_count: number;
}

export interface DashboardStats {
  totalSearches: number;
  failedSearches: number;
  pendingQuestions: number;
  totalContent: number;
  topSearches: { query: string; count: number }[];
  missingContentOpportunities: { query: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  searchLogs: SearchLog[];
}

export type ThemeKey = 'atlass' | 'dark' | 'ocean' | 'forest';

export interface Theme {
  key: ThemeKey;
  name: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    textMain: string;
    textSecondary: string;
    border: string;
    inputBg: string;
    hover: string;
  };
}
