import type React from 'react';

import { Text } from '@/tw';
import { cn } from '@/utils/cn';

import { ThemeColor } from '@/constants/theme';

export type ThemedTextProps = React.ComponentProps<typeof Text> & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
  className?: string;
};

const textColorClasses: Record<ThemeColor, string> = {
  text: 'text-app-text',
  background: 'text-app-background',
  backgroundElement: 'text-app-background-element',
  backgroundSelected: 'text-app-background-selected',
  textSecondary: 'text-app-text-secondary',
};

const typeClasses: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base font-medium leading-6',
  title: 'text-5xl font-semibold leading-[52px]',
  small: 'text-sm font-medium leading-5',
  smallBold: 'text-sm font-bold leading-5',
  subtitle: 'text-[32px] font-semibold leading-[44px]',
  link: 'text-sm leading-[30px]',
  linkPrimary: 'text-sm leading-[30px] text-app-link',
  code: 'font-mono text-xs font-medium android:font-bold',
};

export function ThemedText({ className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  return (
    <Text
      className={cn(textColorClasses[themeColor ?? 'text'], typeClasses[type], className)}
      {...rest}
    />
  );
}
