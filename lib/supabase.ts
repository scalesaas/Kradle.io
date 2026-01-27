import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://miajmerfkgayimdhfnpy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWptZXJma2dheWltZGhmbnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjA2MzksImV4cCI6MjA2OTAzNjYzOX0.UsuCemjQTf6phxO_ourqMuTbLRX9wsFUw7AykZG8Sew";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});