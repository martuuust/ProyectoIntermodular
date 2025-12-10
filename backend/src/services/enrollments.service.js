import { supabase } from '../supabaseClient.js';

export async function getEnrollmentsByUser(userId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, camp_id, start_date, end_date, form_data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createEnrollment(payload) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteEnrollment(id) {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}



