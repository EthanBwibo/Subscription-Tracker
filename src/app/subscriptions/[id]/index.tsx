import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceLogo } from '@/components/ServiceLogo';
import { useProfile } from '@/hooks/useProfile';
import { useDeleteSubscription, useSubscription } from '@/hooks/useSubscriptions';
import { useToday } from '@/hooks/useToday';
import { monthlyCost, nextChargeDate, pastCharges, yearlyCost } from '@/lib/billing';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { CATEGORIES, cycleLabel, labelFor, PAYMENT_METHODS, REMINDERS, STATUSES } from '@/lib/options';
import { routes } from '@/lib/routes';

export default function SubscriptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { data: profile } = useProfile();
  const { data: sub, isLoading, error } = useSubscription(id);
  const remove = useDeleteSubscription();
  // Two taps to delete: Alert.alert is a no-op on web.
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !sub) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
        <View className="w-full max-w-md self-center px-6">
          <ScreenHeader title="Subscription" />
          <Text className="mt-10 text-center text-red-600">{error ? `Couldn't load it: ${error.message}` : 'Not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const next = nextChargeDate(sub, today);
  const history = pastCharges(sub, today);
  const reminder = sub.reminder_days ?? profile?.default_reminder_days;
  const cancelUrl = sub.service?.cancel_url;

  function onDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    remove.mutate(sub!.id, { onSuccess: () => router.replace(routes.list) });
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView>
        <View className="w-full max-w-md gap-6 self-center px-6 pb-10">
          <ScreenHeader
            title=""
            right={
              <Link href={routes.edit(sub.id)} asChild>
                <Pressable hitSlop={12} className="active:opacity-60">
                  <Text className="text-base font-semibold text-emerald-600 dark:text-emerald-400">Edit</Text>
                </Pressable>
              </Link>
            }
          />

          <View className="flex-row items-center gap-4">
            <ServiceLogo name={sub.name} logoUrl={sub.service?.logo_url} size={56} />
            <View className="flex-1">
              <Text className="text-2xl font-bold text-neutral-900 dark:text-white">{sub.name}</Text>
              <Text className="text-base text-neutral-500">
                {formatMoney(sub.amount, sub.currency)} · {cycleLabel(sub.cycle_unit, sub.cycle_count)}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Stat label="Per month" value={formatMoney(monthlyCost(sub), sub.currency)} />
            <Stat label="Per year" value={formatMoney(yearlyCost(sub), sub.currency)} />
          </View>

          <Section title="Details">
            <Row label="Status" value={labelFor(STATUSES, sub.status)} />
            {sub.is_trial && <Row label="Trial ends" value={sub.trial_ends_at ? formatDate(sub.trial_ends_at) : undefined} />}
            <Row label={sub.is_trial ? 'First charge' : 'Next charge'} value={sub.status === 'active' ? formatDate(next) : '—'} />
            <Row label="Started" value={formatDate(sub.start_date)} />
            <Row label="Payment method" value={sub.payment_method ? labelFor(PAYMENT_METHODS, sub.payment_method) : undefined} />
            <Row label="Category" value={sub.category ? (labelFor(CATEGORIES, sub.category) ?? sub.category) : undefined} />
            <Row
              label="Reminder"
              value={
                (labelFor(REMINDERS, reminder ?? null) ?? `${reminder} days before`) + (sub.reminder_days === null ? ' (default)' : '')
              }
            />
          </Section>

          {sub.notes && (
            <Section title="Notes">
              <Text className="py-2 text-base text-neutral-700 dark:text-neutral-300">{sub.notes}</Text>
            </Section>
          )}

          <Section title="Past charges">
            {history.length === 0 ? (
              <Text className="py-2 text-sm text-neutral-500">None yet since {formatDate(sub.start_date)}.</Text>
            ) : (
              history.map((date) => <Row key={date} label={formatDate(date)} value={formatMoney(sub.amount, sub.currency)} />)
            )}
          </Section>

          {cancelUrl && (
            <Pressable
              onPress={() => Linking.openURL(cancelUrl)}
              className="items-center rounded-xl border border-neutral-300 py-3 active:opacity-80 dark:border-neutral-700"
            >
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">Open cancel page ↗</Text>
            </Pressable>
          )}

          <Pressable
            onPress={onDelete}
            disabled={remove.isPending}
            className={`items-center rounded-xl py-3 active:opacity-80 disabled:opacity-50 ${confirming ? 'bg-red-600' : 'border border-red-300 dark:border-red-900'}`}
          >
            {remove.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`text-base font-semibold ${confirming ? 'text-white' : 'text-red-600'}`}>
                {confirming ? 'Tap again to delete for good' : 'Delete subscription'}
              </Text>
            )}
          </Pressable>
          {confirming && !remove.isPending && (
            <Pressable onPress={() => setConfirming(false)} className="items-center active:opacity-60">
              <Text className="text-sm text-neutral-500">Keep it</Text>
            </Pressable>
          )}
          {remove.error && <Text className="text-center text-sm text-red-600">{remove.error.message}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-900">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row justify-between gap-4 border-b border-neutral-200 py-2 dark:border-neutral-800">
      <Text className="text-base text-neutral-500">{label}</Text>
      <Text className="flex-shrink text-right text-base text-neutral-900 dark:text-white">{value ?? '—'}</Text>
    </View>
  );
}
