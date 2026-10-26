import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = { title: string; right?: ReactNode; back?: boolean };

// Headers are drawn in-screen (the stack hides its own) so they match on native and web.
export function ScreenHeader({ title, right, back = true }: Props) {
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <View className="flex-row items-center gap-3 py-3">
      {back && (
        <Pressable onPress={goBack} hitSlop={12} className="active:opacity-60">
          <Text className="text-base text-emerald-600 dark:text-emerald-400">‹ Back</Text>
        </Pressable>
      )}
      <Text className="flex-1 text-xl font-bold text-neutral-900 dark:text-white" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
