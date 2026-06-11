import type { ReactNode } from 'react';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { View } from '@/tw';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View className="flex-row justify-between gap-3">
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" className="rounded-lg px-2 py-0.5">
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}
