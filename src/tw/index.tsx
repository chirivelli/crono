import { Link as RouterLink } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
  type ImageStyle,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useCssElement } from 'react-native-css';
import Animated from 'react-native-reanimated';

export { useNativeVariable as useCSSVariable } from 'react-native-css';

export type ClassNameProps = {
  className?: string;
  dataSet?: Record<string, string>;
};

const cssElement = useCssElement as unknown as (
  component: React.ComponentType<any>,
  props: any,
  mapping: Record<string, string>
) => React.ReactElement;

export function View(props: ViewProps & ClassNameProps) {
  return cssElement(RNView, props, { className: 'style' });
}
View.displayName = 'CSS(View)';

export function Text(props: TextProps & ClassNameProps) {
  return cssElement(RNText, props, { className: 'style' });
}
Text.displayName = 'CSS(Text)';

export function Pressable(props: PressableProps & ClassNameProps) {
  return cssElement(RNPressable, props, { className: 'style' });
}
Pressable.displayName = 'CSS(Pressable)';

export function ScrollView(
  props: ScrollViewProps &
    ClassNameProps & {
      contentContainerClassName?: string;
    }
) {
  return cssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
}
ScrollView.displayName = 'CSS(ScrollView)';

export function TextInput(props: TextInputProps & ClassNameProps) {
  return cssElement(RNTextInput, props, { className: 'style' });
}
TextInput.displayName = 'CSS(TextInput)';

export function SafeAreaView(props: React.ComponentProps<typeof RNSafeAreaView> & ClassNameProps) {
  return cssElement(RNSafeAreaView, props, { className: 'style' });
}
SafeAreaView.displayName = 'CSS(SafeAreaView)';

export function Link(props: React.ComponentProps<typeof RouterLink> & ClassNameProps) {
  return cssElement(RouterLink, props, { className: 'style' });
}
Link.displayName = 'CSS(Link)';
Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

function CSSImage(
  props: Omit<React.ComponentProps<typeof ExpoImage>, 'style'> & {
    style?: StyleProp<ImageStyle & { objectFit?: ImageStyle['objectFit'] }>;
  }
) {
  return <ExpoImage {...props} />;
}

export function Image(props: React.ComponentProps<typeof CSSImage> & ClassNameProps) {
  return cssElement(CSSImage, props, { className: 'style' });
}
Image.displayName = 'CSS(Image)';

export const AnimatedView = Animated.createAnimatedComponent(View);
export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
