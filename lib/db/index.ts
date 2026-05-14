import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Note: You must provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// Database Abstraction Layer (Data Access)
// ==========================================
// This layer allows switching between Supabase, raw PostgreSQL, or Mock Data.

export type DbProvider = 'supabase' | 'postgres' | 'mock';
const currentProvider: DbProvider = 'mock'; // Default for the prototype preview

export const dbOptions = {
  // Products
  getProducts: async () => {
    if (currentProvider === 'mock') {
       return [
         { id: '1', name: 'Organic Apples', stock: 50, originalPrice: 100000, newPrice: 50000, expiry: '2h', store: 'WinMart+' },
         { id: '2', name: 'Fresh Milk 1L', stock: 12, originalPrice: 45000, newPrice: 20000, expiry: '4h', store: 'Circle K' },
       ];
    }
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  },

  // Artificial AI Interaction logger
  logAIChat: async (userId: string, message: string, sentiment: string) => {
    if (currentProvider === 'mock') {
        console.log(`Mock DB Log: [${sentiment}] ${message}`);
        return { success: true };
    }
    const { error } = await supabase.from('ai_chat_logs').insert([{ user_id: userId, message, sentiment }]);
    if (error) throw error;
    return { success: true };
  }
};
