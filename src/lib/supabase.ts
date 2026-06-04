import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// SecureStore on native, localStorage on web browser, no-op during SSR
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') return Promise.resolve(isBrowser ? localStorage.getItem(key) : null);
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') { if (isBrowser) localStorage.setItem(key, value); return Promise.resolve(); }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') { if (isBrowser) localStorage.removeItem(key); return Promise.resolve(); }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
