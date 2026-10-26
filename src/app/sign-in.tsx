import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendMagicLink, signInWithGoogle } from '@/lib/auth';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; email: string } | { kind: 'error'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const busy = status.kind === 'sending';

  async function onMagicLink() {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      await sendMagicLink(trimmed);
      setStatus({ kind: 'sent', email: trimmed });
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message });
    }
  }

  async function onGoogle() {
    setStatus({ kind: 'sending' });
    try {
      await signInWithGoogle();
      setStatus({ kind: 'idle' });
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="w-full max-w-md flex-1 justify-center gap-4 self-center px-6">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-white">Subscription Tracker</Text>
        <Text className="text-base text-neutral-500">Every recurring charge, in KES, in one place.</Text>

        <TextInput
          className="mt-6 rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-white"
          placeholder="you@example.com"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={onMagicLink}
          editable={!busy}
        />

        <Pressable
          className="items-center rounded-xl bg-emerald-600 py-3 active:opacity-80 disabled:opacity-50"
          onPress={onMagicLink}
          disabled={busy}
        >
          {busy ? <ActivityIndicator color="white" /> : <Text className="text-base font-semibold text-white">Email me a sign-in link</Text>}
        </Pressable>

        <Pressable
          className="items-center rounded-xl border border-neutral-300 py-3 active:opacity-80 disabled:opacity-50 dark:border-neutral-700"
          onPress={onGoogle}
          disabled={busy}
        >
          <Text className="text-base font-semibold text-neutral-900 dark:text-white">Continue with Google</Text>
        </Pressable>

        {status.kind === 'sent' && (
          <Text className="text-center text-emerald-700 dark:text-emerald-400">
            Check {status.email} for a sign-in link. Open it on this device.
          </Text>
        )}
        {status.kind === 'error' && <Text className="text-center text-red-600">{status.message}</Text>}
      </View>
    </SafeAreaView>
  );
}
