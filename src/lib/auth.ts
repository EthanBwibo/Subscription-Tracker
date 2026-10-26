import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// subtracker:// in builds, exp://<host> in Expo Go, the page origin on web.
// Each must be allowed under Supabase > Auth > URL Configuration > Redirect URLs.
export const redirectTo = makeRedirectUri();

// Reads `key=value&...` pairs from the URL hash or query string.
function parseAuthParams(url: string): Record<string, string> {
  const raw = url.split('#')[1] ?? url.split('?')[1] ?? '';
  return Object.fromEntries(
    raw
      .split('&')
      .filter(Boolean)
      .map((pair) => {
        const [k, v = ''] = pair.split('=');
        return [decodeURIComponent(k), decodeURIComponent(v.replace(/\+/g, ' '))];
      }),
  );
}

// Turns tokens from a magic-link or OAuth redirect into a session (native only; web does this itself).
export async function createSessionFromUrl(url: string) {
  const params = parseAuthParams(url);
  const error = params.error_description ?? params.error_code ?? params.error;
  if (error) throw new Error(error);

  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) return null;

  const { data, error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) throw sessionError;
  return data.session;
}

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  if (Platform.OS === 'web') {
    // Full-page redirect; the client picks up the session on return.
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success') await createSessionFromUrl(result.url);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
