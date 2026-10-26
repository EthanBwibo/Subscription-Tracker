import { Pressable, Text, View } from 'react-native';

import type { Option } from '@/lib/options';

type Props<T> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Single-select row of chips; stands in for a picker on native and web alike.
export function ChipGroup<T>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
              selected ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 dark:border-neutral-700'
            }`}
          >
            <Text className={`text-sm ${selected ? 'font-semibold text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
