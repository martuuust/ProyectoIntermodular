import { supabase } from '../supabaseClient.js';

export async function getAllCamps() {
  const { data, error } = await supabase
    .from('camps')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}



