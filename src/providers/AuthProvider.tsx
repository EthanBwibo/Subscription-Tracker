import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { createSessionFromUrl } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type AuthState = { session: Session | null; isLoading: boolean };

const AuthContext = createContext<AuthState>({ session: null, isLoading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ session: null, isLoading: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session, isLoading: false }));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isLoading: false });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Magic links open the app via deep link on native, both cold and warm starts.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const handle = (url: string | null) => {
      if (url) createSessionFromUrl(url).catch((e) => console.warn('Auth link failed:', e.message));
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
