import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';
import { cn } from '@/utils/cn';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <ThemedView>
      <Pressable
        className="flex-row items-center gap-2 active:opacity-70"
        onPress={() => setIsOpen((value) => !value)}>
        <ThemedView
          type="backgroundElement"
          className={cn(
            'h-6 w-6 items-center justify-center rounded-xl',
            isOpen ? '-rotate-90' : 'rotate-90'
          )}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={theme.text}
          />
        </ThemedView>

        <ThemedText type="small">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView type="backgroundElement" className="ml-6 mt-4 rounded-2xl p-6">
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}
