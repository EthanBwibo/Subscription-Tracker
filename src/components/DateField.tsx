import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { formatDate, isIsoDate, isoToLocalDate, localDateToIso } from '@/lib/dates';

export type DateFieldProps = {
  // 'YYYY-MM-DD', or '' when nothing is picked yet.
  value: string;
  onChange: (value: string) => void;
  // Opens on this date when value is empty.
  defaultDate: string;
};

// Native date field: system dialog on Android, inline calendar on iOS. Web lives in DateField.web.tsx.
export function DateField({ value, onChange, defaultDate }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const current = isoToLocalDate(isIsoDate(value) ? value : defaultDate);

  function onPress() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: current, mode: 'date', onValueChange: (_e, date) => onChange(localDateToIso(date)) });
    } else {
      setOpen((o) => !o);
    }
  }

  return (
    <View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="rounded-xl border border-neutral-300 px-4 py-3 active:opacity-70 dark:border-neutral-700"
      >
        <Text className={`text-base ${value ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
          {isIsoDate(value) ? formatDate(value) : 'Pick a date'}
        </Text>
      </Pressable>
      {open && Platform.OS === 'ios' && (
        <DateTimePicker value={current} mode="date" display="inline" onValueChange={(_e, date) => onChange(localDateToIso(date))} />
      )}
    </View>
  );
}
