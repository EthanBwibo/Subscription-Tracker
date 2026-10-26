import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { useSaveSubscription, useSubscription } from '@/hooks/useSubscriptions';
import { useToday } from '@/hooks/useToday';
import { routes } from '@/lib/routes';

export default function EditSubscription() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { data: sub, isLoading, error } = useSubscription(id);
  const save = useSaveSubscription(id);

  function done() {
    if (router.canGoBack()) router.back();
    else router.replace(routes.detail(id));
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-md self-center px-6">
          <ScreenHeader title={sub ? `Edit ${sub.name}` : 'Edit'} />
          {isLoading ? (
            <ActivityIndicator className="mt-10" />
          ) : error || !sub ? (
            <Text className="mt-10 text-center text-red-600">{error ? `Couldn't load it: ${error.message}` : 'Not found.'}</Text>
          ) : (
            <SubscriptionForm
              today={today}
              initial={sub}
              submitLabel="Save changes"
              submitting={save.isPending}
              submitError={save.error?.message}
              onSubmit={(input) => save.mutate(input, { onSuccess: done })}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
