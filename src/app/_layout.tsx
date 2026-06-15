import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { CronoProvider } from '@/components/crono/crono-app';
import { View } from '@/tw';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CronoProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-slate-50">
            <AnimatedSplashOverlay />
            <View className="min-h-0 flex-1">
              <Slot />
            </View>
          </View>
        </GestureHandlerRootView>
      </CronoProvider>
    </ThemeProvider>
  );
}
