import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// App Open Ad Unit ID
const APP_OPEN_AD_UNIT_ID = 'ca-app-pub-2982967112085282/1833733485';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef(AppState.currentState);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showAppOpenAd, setShowAppOpenAd] = useState(false);
  const lastAdShownTime = useRef(0);

  // Show App Open Ad based on time constraints
  const showAdIfEligible = () => {
    const now = Date.now();
    const adCooldown = 5 * 60 * 1000; // 5 minutes cooldown
    
    if (now - lastAdShownTime.current > adCooldown) {
      setShowAppOpenAd(true);
      lastAdShownTime.current = now;
    }
  };

  // Handle app state changes to show App Open Ad when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        // Show app open ad when the app comes to the foreground
        showAdIfEligible();
      }

      appState.current = nextAppState;
    });

    // Show ad on first app launch
    const timer = setTimeout(() => {
      if (loaded) {
        showAdIfEligible();
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
