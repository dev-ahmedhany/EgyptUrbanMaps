import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, NativeModules } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import adMobService from '@/services/AdMobService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

// Check if the Google Mobile Ads module is available
const isAdMobAvailable = !!NativeModules.RNGoogleMobileAdsModule;

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const appState = useRef(AppState.currentState);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize AdMob and App Open Ads
  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // Only initialize if the module is available
        if (isAdMobAvailable) {
          console.log('Initializing AdMob service');
          await adMobService.initialize();
          await adMobService.loadAppOpenAd();
        } else {
          console.log('AdMob module not available, skipping initialization');
        }
      } catch (error) {
        console.error('Error initializing AdMob:', error);
      }
    };

    if (loaded) {
      initializeAdMob();
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Return null while the fonts are loading
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

// This is the root layout component that Expo Router expects
export default function RootLayout() {
  return <RootLayoutNav />;
}
