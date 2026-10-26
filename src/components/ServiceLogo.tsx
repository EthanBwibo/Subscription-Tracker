import { useState } from 'react';
import { Image, Text, View } from 'react-native';

type Props = { name: string; logoUrl?: string | null; size?: number };

// Preset logo, or the first letter of the name for custom subscriptions and failed loads.
export function ServiceLogo({ name, logoUrl, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, borderRadius: size / 4 };

  if (logoUrl && !failed) {
    return <Image source={{ uri: logoUrl }} style={style} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />;
  }

  return (
    <View style={style} className="items-center justify-center bg-emerald-100 dark:bg-emerald-900">
      <Text className="font-bold text-emerald-700 dark:text-emerald-300" style={{ fontSize: size / 2.2 }}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
}
