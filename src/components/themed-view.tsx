import type { ViewProps } from 'react-native';

import { View } from '@/tw';
import { cn } from '@/utils/cn';

import { ThemeColor } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  className?: string;
};

const backgroundClasses: Record<ThemeColor, string> = {
  text: 'text-app-text',
  background: 'bg-app-background',
  backgroundElement: 'bg-app-background-element',
  backgroundSelected: 'bg-app-background-selected',
  textSecondary: 'text-app-text-secondary',
};

export function ThemedView({
  className,
  lightColor,
  darkColor,
  type = 'background',
  ...otherProps
}: ThemedViewProps) {
  return <View className={cn(backgroundClasses[type ?? 'background'], className)} {...otherProps} />;
}
