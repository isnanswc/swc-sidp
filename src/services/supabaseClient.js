import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iecpuxhlpgxbhtipzqmc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY3B1eGhscGd4Ymh0aXB6cW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NzYyMzgsImV4cCI6MjEwNDE1MjIzOH0.xUkwHbLODTs-ldiVf4_IfFE07R4ylWbShhzPfOL0m08';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
