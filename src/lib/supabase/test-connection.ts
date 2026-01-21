import { supabase } from './client';

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('projects').select('count');
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase' };
  } catch (error) {
    return { success: false, error };
  }
}
