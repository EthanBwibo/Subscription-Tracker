import '../../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, useColorScheme, View } from 'react-native';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';

const queryClient = new QueryClient();

// darkMode is 'class', so on web toggle the `dark` class to follow the OS. Native follows the OS already.
function useWebSystemColorScheme() {
  const system = useColorScheme();
  useEffect(() => {
    if (Platform.OS === 'web') colorScheme.set(system === 'dark' ? 'dark' : 'light');
  }, [system]);
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="subscriptions/index" />
        <Stack.Screen name="subscriptions/new" />
        <Stack.Screen name="subscriptions/[id]/index" />
        <Stack.Screen name="subscriptions/[id]/edit" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  useWebSystemColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
