import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/Field';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceLogo } from '@/components/ServiceLogo';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { useServices, type Service } from '@/hooks/useServices';
import { useSaveSubscription } from '@/hooks/useSubscriptions';
import { useToday } from '@/hooks/useToday';
import { CATEGORIES, labelFor } from '@/lib/options';
import { routes } from '@/lib/routes';

// Step 1 picks a preset (or custom), step 2 is the entry form.
export default function NewSubscription() {
  const today = useToday();
  // undefined = still picking, null = custom.
  const [service, setService] = useState<Service | null | undefined>(undefined);
  const [customName, setCustomName] = useState('');
  const save = useSaveSubscription();

  if (service === undefined) {
    return (
      <PresetPicker
        onPick={(picked, name) => {
          setService(picked);
          setCustomName(name);
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-md self-center px-6">
          <ScreenHeader title={service ? service.name : 'Custom subscription'} back={false} right={
            <Pressable onPress={() => setService(undefined)} hitSlop={12} className="active:opacity-60">
              <Text className="text-base text-emerald-600 dark:text-emerald-400">Change</Text>
            </Pressable>
          } />
          <SubscriptionForm
            today={today}
            service={service}
            defaultName={customName}
            submitLabel="Add subscription"
            submitting={save.isPending}
            submitError={save.error?.message}
            onSubmit={(input) =>
              save.mutate(input, {
                onSuccess: (id) => router.replace(routes.detail(id)),
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PresetPicker({ onPick }: { onPick: (service: Service | null, customName: string) => void }) {
  const { data, isLoading, error } = useServices();
  const [query, setQuery] = useState('');

  const services = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="w-full max-w-md flex-1 self-center px-6">
        <ScreenHeader title="Add subscription" />
        <Input value={query} onChangeText={setQuery} placeholder="Search services" autoCorrect={false} />

        <Pressable onPress={() => onPick(null, query.trim())} className="mt-3 flex-row items-center gap-3 py-3 active:opacity-60">
          <ServiceLogo name="+" />
          <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white">
            {query.trim() ? `Custom: “${query.trim()}”` : 'Something else (custom)'}
          </Text>
        </Pressable>

        {isLoading ? (
          <ActivityIndicator className="mt-10" />
        ) : error ? (
          <Text className="mt-10 text-center text-red-600">Couldn&apos;t load presets: {error.message}</Text>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(s) => s.id}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="pb-10"
            ItemSeparatorComponent={() => <View className="h-px bg-neutral-200 dark:bg-neutral-800" />}
            renderItem={({ item }) => (
              <Pressable onPress={() => onPick(item, '')} className="flex-row items-center gap-3 py-3 active:opacity-60">
                <ServiceLogo name={item.name} logoUrl={item.logo_url} />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-neutral-900 dark:text-white">{item.name}</Text>
                  <Text className="text-sm text-neutral-500">{labelFor(CATEGORIES, item.category) ?? item.category}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
