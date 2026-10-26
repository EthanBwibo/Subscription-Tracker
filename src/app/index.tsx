import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile } from '@/hooks/useProfile';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';

// Placeholder home until M3 builds the summary.
export default function Home() {
  const { session } = useAuth();
  const { data: profile, error } = useProfile();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="w-full max-w-md flex-1 justify-center gap-3 self-center px-6">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">You&apos;re signed in</Text>
        <Text className="text-base text-neutral-500">{session?.user.email}</Text>
        {profile && (
          <Text className="text-sm text-neutral-500">
            Base currency {profile.base_currency} · reminders {profile.default_reminder_days} days before · {profile.timezone}
          </Text>
        )}
        {error && <Text className="text-sm text-red-600">Couldn&apos;t load profile: {error.message}</Text>}

        <Link href="/subscriptions" asChild>
          <Pressable className="mt-6 items-center rounded-xl bg-emerald-600 py-3 active:opacity-80">
            <Text className="text-base font-semibold text-white">Your subscriptions</Text>
          </Pressable>
        </Link>

        <Pressable className="items-center rounded-xl border border-neutral-300 py-3 active:opacity-80 dark:border-neutral-700" onPress={() => signOut()}>
          <Text className="text-base font-semibold text-neutral-900 dark:text-white">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
