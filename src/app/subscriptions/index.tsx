import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/ChipGroup';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceLogo } from '@/components/ServiceLogo';
import { useSubscriptions, type SubscriptionWithService } from '@/hooks/useSubscriptions';
import { useToday } from '@/hooks/useToday';
import { nextChargeDate } from '@/lib/billing';
import { daysBetween, formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { CATEGORIES, cycleLabel, labelFor, PAYMENT_METHODS, STATUSES, type Option } from '@/lib/options';
import type { Enums } from '@/types/database';

type Filter = 'all' | 'category' | 'payment' | 'trial';

const FILTERS: Option<Filter>[] = [
  { value: 'all', label: 'All' },
  { value: 'category', label: 'Category' },
  { value: 'payment', label: 'Payment method' },
  { value: 'trial', label: 'Trials' },
];

function dueLabel(date: string, today: string) {
  const days = daysBetween(today, date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  return formatDate(date);
}

export default function SubscriptionsList() {
  const today = useToday();
  const { data, isLoading, error, refetch, isRefetching } = useSubscriptions();
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('streaming');
  const [payment, setPayment] = useState<Enums<'payment_method'>>('mpesa');

  // Sorted by next charge, with stale dates rolled forward.
  const rows = useMemo(() => {
    const withNext = (data ?? []).map((sub) => ({ sub, next: nextChargeDate(sub, today) }));
    const filtered = withNext.filter(({ sub }) => {
      if (filter === 'category') return sub.category === category;
      if (filter === 'payment') return sub.payment_method === payment;
      if (filter === 'trial') return sub.is_trial;
      return true;
    });
    // Cancelled ones sink to the bottom.
    return filtered.sort(
      (a, b) => Number(a.sub.status === 'cancelled') - Number(b.sub.status === 'cancelled') || a.next.localeCompare(b.next),
    );
  }, [data, today, filter, category, payment]);

  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => data?.some((s) => s.category === c.value)),
    [data],
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="w-full max-w-md flex-1 self-center px-6">
        <ScreenHeader
          title="Subscriptions"
          right={
            <Link href="/subscriptions/new" asChild>
              <Pressable className="rounded-full bg-emerald-600 px-4 py-2 active:opacity-80">
                <Text className="font-semibold text-white">+ Add</Text>
              </Pressable>
            </Link>
          }
        />

        <View className="gap-2 pb-3">
          <ChipGroup options={FILTERS} value={filter} onChange={setFilter} />
          {filter === 'category' && <ChipGroup options={usedCategories.length ? usedCategories : CATEGORIES} value={category} onChange={setCategory} />}
          {filter === 'payment' && <ChipGroup options={PAYMENT_METHODS} value={payment} onChange={setPayment} />}
        </View>

        {isLoading ? (
          <ActivityIndicator className="mt-10" />
        ) : error ? (
          <Text className="mt-10 text-center text-red-600">Couldn&apos;t load subscriptions: {error.message}</Text>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={({ sub }) => sub.id}
            onRefresh={refetch}
            refreshing={isRefetching}
            contentContainerClassName="pb-10"
            ItemSeparatorComponent={() => <View className="h-px bg-neutral-200 dark:bg-neutral-800" />}
            ListEmptyComponent={
              <Text className="mt-10 text-center text-neutral-500">
                {data?.length ? 'Nothing matches this filter.' : 'No subscriptions yet. Tap + Add to track your first one.'}
              </Text>
            }
            renderItem={({ item }) => <Row sub={item.sub} next={item.next} today={today} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function Row({ sub, next, today }: { sub: SubscriptionWithService; next: string; today: string }) {
  const inactive = sub.status !== 'active';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/subscriptions/[id]', params: { id: sub.id } })}
      className={`flex-row items-center gap-3 py-3 active:opacity-60 ${inactive ? 'opacity-50' : ''}`}
    >
      <ServiceLogo name={sub.name} logoUrl={sub.service?.logo_url} />
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-900 dark:text-white" numberOfLines={1}>
          {sub.name}
        </Text>
        <Text className="text-sm text-neutral-500" numberOfLines={1}>
          {inactive
            ? labelFor(STATUSES, sub.status)
            : sub.is_trial
              ? `Trial ends ${formatDate(sub.trial_ends_at ?? next)}`
              : `${dueLabel(next, today)} · ${cycleLabel(sub.cycle_unit, sub.cycle_count)}`}
        </Text>
      </View>
      <Text className="text-base font-semibold text-neutral-900 dark:text-white">{formatMoney(sub.amount, sub.currency)}</Text>
    </Pressable>
  );
}
