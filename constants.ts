
import { Theme } from './types';

// En Next.js, las variables expuestas al cliente deben empezar con NEXT_PUBLIC_
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ydjneebopxjhrbizitlt.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkam5lZWJvcHhqaHJiaXppdGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDI1NDcsImV4cCI6MjA4NjA3ODU0N30.CEeBFsJ8knUZzj-AVsgA0_bye0fWo3bDrApNbtRIAJo';
// Service Role debe mantenerse SECRETO y solo usarse en API Routes o Server Components, 
// pero para mantener compatibilidad con la lógica actual de admin client-side (no recomendado en prod pero funcional para migración):
export const SUPABASE_SERVICE_ROLE = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkam5lZWJvcHhqaHJiaXppdGx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUwMjU0NywiZXhwIjoyMDg2MDc4NTQ3fQ.UUo15WFWLPow1TcNJXxmsMfVu1GxnQc71YW-uCwQo08';

export const COLORS = {
  primary: '#FF4757', 
  title: '#2F3542',   
  background: '#F1F2F6', 
  textSecondary: '#747D8C', 
  border: '#DFE4EA',   
};

export const THEMES: Record<string, Theme> = {
  atlass: {
    key: 'atlass',
    name: 'Atlass Original',
    colors: {
      primary: '#FF4757', // Rojo Coral
      background: '#F1F2F6', // Gris Claro
      card: '#FFFFFF',
      textMain: '#2F3542', // Gris Oscuro
      textSecondary: '#747D8C',
      border: '#DFE4EA',
      inputBg: '#FFFFFF',
      hover: '#f9fafb'
    }
  },
  dark: {
    key: 'dark',
    name: 'Modo Noche',
    colors: {
      primary: '#FF6B81', 
      background: '#1E272E', 
      card: '#2F3640', 
      textMain: '#F5F6FA', 
      textSecondary: '#A4B0BE',
      border: '#485460',
      inputBg: '#353B48',
      hover: '#353B48'
    }
  },
  ocean: {
    key: 'ocean',
    name: 'Océano Pacífico',
    colors: {
      primary: '#1E90FF', 
      background: '#EBF8FF', 
      card: '#FFFFFF',
      textMain: '#2C3E50', 
      textSecondary: '#7F8FA6',
      border: '#BDC3C7',
      inputBg: '#FFFFFF',
      hover: '#F0F4F8'
    }
  },
  forest: {
    key: 'forest',
    name: 'Bosque Nativo',
    colors: {
      primary: '#2ED573', 
      background: '#F1F8E9', 
      card: '#FFFFFF',
      textMain: '#1E272E',
      textSecondary: '#6ab04c',
      border: '#C8E6C9',
      inputBg: '#FFFFFF',
      hover: '#F1F8E9'
    }
  }
};
