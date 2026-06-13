import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { CronoProvider } from '@/components/crono/crono-app';
import { MobileNavigationBar } from '@/components/crono/mobile-navigation-bar';
import { View } from '@/tw';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const showMobileNavigation = width < 760;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CronoProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-slate-50">
            <AnimatedSplashOverlay />
            <View className={showMobileNavigation ? 'min-h-0 flex-1 pb-24' : 'min-h-0 flex-1'}>
              <Slot />
            </View>
            {showMobileNavigation && <MobileNavigationBar />}
          </View>
        </GestureHandlerRootView>
      </CronoProvider>
    </ThemeProvider>
  );
}
