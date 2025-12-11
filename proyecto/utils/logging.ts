import { supabase } from '../supabaseClient';

export type LogCategory = 'login' | 'signup' | 'logout' | 'enrollments' | 'updates';

interface LogData {
  timestamp: string;
  category: LogCategory;
  [key: string]: any;
}

/**
 * Registra un nuevo evento en una categoría de logs usando Supabase.
 */
export const logEvent = async (category: LogCategory, data: Record<string, any>) => {
  const newLogEntry: LogData = {
    timestamp: new Date().toISOString(),
    category,
    ...data,
  };

  try {
    const { error } = await supabase
      .from('logs')
      .insert([newLogEntry]);

    if (error) {
      console.error(`❌ Error al guardar log en Supabase (${category}):`, error);
    } else {
      console.log(`✅ Log añadido a la categoría "${category}" en Supabase:`, newLogEntry);
    }
  } catch (error) {
    console.error(`❌ Error inesperado al guardar log en Supabase (${category}):`, error);
  }
};

/**
 * Recupera todos los logs desde Supabase.
 */
export const showLogs = async (): Promise<LogData[]> => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error al leer los logs desde Supabase:', error);
      return [];
    }

    console.log('📜 Logs almacenados en Supabase:', data);
    return data as LogData[];
  } catch (error) {
    console.error('❌ Error inesperado al leer los logs desde Supabase:', error);
    return [];
  }
};

