import { useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';

import { ChipGroup } from '@/components/ChipGroup';
import { DateField } from '@/components/DateField';
import { Field, Input } from '@/components/Field';
import type { Service } from '@/hooks/useServices';
import type { SubscriptionInput } from '@/hooks/useSubscriptions';
import type { Subscription } from '@/lib/billing';
import { addMonths, isIsoDate } from '@/lib/dates';
import { parseAmount } from '@/lib/money';
import {
  CATEGORIES,
  CURRENCIES,
  customDaysFromCycle,
  cycleFromPreset,
  CYCLE_PRESETS,
  PAYMENT_METHODS,
  presetFromCycle,
  REMINDERS,
  STATUSES,
  type CyclePreset,
} from '@/lib/options';
import type { Enums } from '@/types/database';

type Props = {
  today: string;
  // Editing an existing row, or creating from a preset (null = custom).
  initial?: Subscription;
  service?: Service | null;
  defaultName?: string;
  submitLabel: string;
  submitting: boolean;
  submitError?: string;
  onSubmit: (input: SubscriptionInput) => void;
};

type Errors = Partial<Record<'name' | 'amount' | 'customDays' | 'nextBillingDate' | 'startDate' | 'trialEndsAt', string>>;

const DATE_HINT = 'Pick a date.';

export function SubscriptionForm({ today, initial, service, defaultName, submitLabel, submitting, submitError, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? service?.name ?? defaultName ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.trial_price ?? initial.amount) : '');
  const [currency, setCurrency] = useState(initial?.currency ?? service?.default_currency ?? 'KES');
  const [cyclePreset, setCyclePreset] = useState<CyclePreset>(
    initial ? presetFromCycle(initial.cycle_unit, initial.cycle_count) : 'monthly',
  );
  const [customDays, setCustomDays] = useState(initial ? String(customDaysFromCycle(initial.cycle_unit, initial.cycle_count)) : '30');
  const [nextBillingDate, setNextBillingDate] = useState(initial?.next_billing_date ?? addMonths(today, 1));
  const [startDate, setStartDate] = useState(initial?.start_date ?? today);
  const [paymentMethod, setPaymentMethod] = useState<Enums<'payment_method'> | null>(initial?.payment_method ?? 'mpesa');
  const [category, setCategory] = useState(initial?.category ?? service?.category ?? 'other');
  const [isTrial, setIsTrial] = useState(initial?.is_trial ?? false);
  const [trialEndsAt, setTrialEndsAt] = useState(initial?.trial_ends_at ?? '');
  const [reminderDays, setReminderDays] = useState<number | null>(initial?.reminder_days ?? null);
  const [status, setStatus] = useState<Enums<'subscription_status'>>(initial?.status ?? 'active');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [errors, setErrors] = useState<Errors>({});

  function submit() {
    const next: Errors = {};
    const parsedAmount = parseAmount(amount);
    const days = Number(customDays);

    if (!name.trim()) next.name = 'Give it a name.';
    if (parsedAmount === null) next.amount = 'Enter an amount, e.g. 1100 or 9.99.';
    if (cyclePreset === 'custom' && !(Number.isInteger(days) && days >= 1 && days <= 3650)) {
      next.customDays = 'Enter a whole number of days (1 to 3650).';
    }
    if (!isIsoDate(startDate)) next.startDate = DATE_HINT;
    if (isTrial) {
      if (!isIsoDate(trialEndsAt)) next.trialEndsAt = DATE_HINT;
      else if (isIsoDate(startDate) && trialEndsAt < startDate) next.trialEndsAt = "Can't be before the start date.";
    } else if (!isIsoDate(nextBillingDate)) {
      next.nextBillingDate = DATE_HINT;
    } else if (isIsoDate(startDate) && nextBillingDate < startDate) {
      next.nextBillingDate = "Can't be before the start date.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0 || parsedAmount === null) return;

    onSubmit({
      service_id: initial ? initial.service_id : (service?.id ?? null),
      name: name.trim(),
      amount: parsedAmount,
      currency,
      ...cycleFromPreset(cyclePreset, days),
      start_date: startDate,
      // A trial's first charge is the day it converts, at the price it converts to.
      next_billing_date: isTrial ? trialEndsAt : nextBillingDate,
      payment_method: paymentMethod,
      category,
      is_trial: isTrial,
      trial_ends_at: isTrial ? trialEndsAt : null,
      trial_price: isTrial ? parsedAmount : null,
      reminder_days: reminderDays,
      status,
      notes: notes.trim() || null,
    });
  }

  return (
    <View className="gap-5 pb-10">
      <Field label="Name" error={errors.name}>
        <Input value={name} onChangeText={setName} placeholder="e.g. Netflix" autoCapitalize="words" />
      </Field>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-medium text-neutral-900 dark:text-white">Free trial</Text>
          <Text className="text-sm text-neutral-500">Track when it converts to paid.</Text>
        </View>
        <Switch value={isTrial} onValueChange={setIsTrial} />
      </View>

      <Field label={isTrial ? 'Price after trial' : 'Amount'} error={errors.amount}>
        <Input value={amount} onChangeText={setAmount} placeholder="0" keyboardType="decimal-pad" inputMode="decimal" />
      </Field>

      <Field label="Currency">
        <ChipGroup options={CURRENCIES} value={currency} onChange={setCurrency} />
      </Field>

      <Field label="Billing cycle" error={errors.customDays}>
        <ChipGroup options={CYCLE_PRESETS} value={cyclePreset} onChange={setCyclePreset} />
        {cyclePreset === 'custom' && (
          <View className="flex-row items-center gap-3">
            <Text className="text-base text-neutral-700 dark:text-neutral-300">Every</Text>
            <View className="w-24">
              <Input value={customDays} onChangeText={setCustomDays} keyboardType="number-pad" inputMode="numeric" />
            </View>
            <Text className="text-base text-neutral-700 dark:text-neutral-300">days</Text>
          </View>
        )}
      </Field>

      {isTrial ? (
        <Field label="Trial ends on" error={errors.trialEndsAt}>
          <DateField value={trialEndsAt} onChange={setTrialEndsAt} defaultDate={today} />
        </Field>
      ) : (
        <Field label="Next billing date" error={errors.nextBillingDate}>
          <DateField value={nextBillingDate} onChange={setNextBillingDate} defaultDate={today} />
        </Field>
      )}

      <Field label="Started on" error={errors.startDate}>
        <DateField value={startDate} onChange={setStartDate} defaultDate={today} />
      </Field>

      <Field label="Payment method">
        <ChipGroup options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
      </Field>

      <Field label="Category">
        <ChipGroup options={CATEGORIES} value={category} onChange={setCategory} />
      </Field>

      <Field label="Remind me">
        <ChipGroup options={REMINDERS} value={reminderDays} onChange={setReminderDays} />
      </Field>

      {initial && (
        <Field label="Status">
          <ChipGroup options={STATUSES} value={status} onChange={setStatus} />
        </Field>
      )}

      <Field label="Notes">
        <Input value={notes} onChangeText={setNotes} placeholder="Optional" multiline className="min-h-20 rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-white" />
      </Field>

      {submitError && <Text className="text-sm text-red-600">{submitError}</Text>}

      <Pressable
        className="items-center rounded-xl bg-emerald-600 py-3 active:opacity-80 disabled:opacity-50"
        onPress={submit}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="white" /> : <Text className="text-base font-semibold text-white">{submitLabel}</Text>}
      </Pressable>
    </View>
  );
}
