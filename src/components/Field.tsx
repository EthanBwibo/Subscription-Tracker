import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type FieldProps = { label: string; error?: string; children: ReactNode };

export function Field({ label, error, children }: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</Text>
      {children}
      {error && <Text className="text-sm text-red-600">{error}</Text>}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      className="rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-white"
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}
