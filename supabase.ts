src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Replace these with your project values from the Supabase Dashboard
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cvwjimscbxclndelrnvv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dYyBfj7EgXeNObjAApR5zA_8Lk80Rbz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Vibration helper for physical vibration on devices that support Navigator.vibrate
export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Gracefully ignore browsers blocking vibrate without user interaction
    }
  }
};