import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[InFocus] Fehlende Supabase-Umgebungsvariablen. ' +
      'Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in der .env-Datei setzen.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
