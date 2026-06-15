import { createClient } from '@supabase/supabase-js';
import type { Design } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchDesigns() {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return Array.isArray(data) ? (data as Design[]) : [];
}

export async function saveDesign(design: Omit<Design, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('designs')
    .insert(design)
    .select()
    .single();

  if (error) throw error;
  return data as Design;
}

export async function deleteDesign(id: string) {
  const { error } = await supabase.from('designs').delete().eq('id', id);
  if (error) throw error;
}
