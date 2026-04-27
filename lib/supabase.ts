import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hursrugiqkuczawzffgx.supabase.co';
const supabaseKey = 'sb_publishable_sr-vGOVWfhXOZPhl68pwhQ_I-GE4w5A';

export const supabase = createClient(supabaseUrl, supabaseKey);