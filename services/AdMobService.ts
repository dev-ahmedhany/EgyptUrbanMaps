import { Platform, AppState, AppStateStatus, NativeModules } from 'react-native';
import { 
  AppOpenAd, 
  AdEventType, 
  TestIds, 
  RequestOptions,
  RequestConfiguration,
  MaxAdContentRating,
  MobileAds
} from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// Check if the Google Mobile Ads module is available
const isAdMobAvailable = !!NativeModules.RNGoogleMobileAdsModule;

// Your App Open ad unit ID
const APP_OPEN_AD_UNIT_ID = 'ca-app-pub-2982967112085282/1833733485';

class AdMobService {
  private appOpenAd: AppOpenAd | null = null;
  private isLoadingAd: boolean = false;
  private isShowingAd: boolean = false;
  private appStateSubscription: any = null;
  private loadTime: number = 0;
  private isModuleAvailable: boolean = isAdMobAvailable;

  constructor() {
    // Only set up app state event listener if module is available
    if (this.isModuleAvailable) {
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    } else {
      console.warn('Google Mobile Ads module not available - AdMob functionality will be disabled');
    }
  }

  /**
   * Initialize the AdMob SDK and request tracking permission
   */
  async initialize() {
    if (!this.isModuleAvailable) {
      console.warn('Skipping AdMob initialization as module is not available');
      return;
    }
    
    try {
      // Configure request options
      const requestConfig: RequestConfiguration = {
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      };

      // Initialize the MobileAds SDK
      await MobileAds().initialize();
      
      // Request tracking permissions for iOS
      if (Platform.OS === 'ios') {
        const { status } = await requestTrackingPermissionsAsync();
        console.log(`Tracking permission status: ${status}`);
      }
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  /**
   * Load an app open ad and store the reference
   */
  async loadAppOpenAd() {
    if (!this.isModuleAvailable || this.isLoadingAd || this.isAdAvailable()) {
      return;
    }

    this.isLoadingAd = true;

    try {
      // Create a new app open ad instance
      this.appOpenAd = AppOpenAd.createForAdRequest(APP_OPEN_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
        // Add any additional request options here
      });

      // Set up event listeners
      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoadingAd = false;
        this.loadTime = Date.now();
        console.log('App Open Ad loaded successfully');
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isLoadingAd = false;
        console.error('App Open Ad failed to load:', error);
        this.appOpenAd = null;
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.isShowingAd = false;
        console.log('App Open Ad closed');
        // Preload the next ad after the current one is closed
        this.appOpenAd = null;
        this.loadAppOpenAd();
      });

      // Load the ad
      await this.appOpenAd.load();
    } catch (error) {
      this.isLoadingAd = false;
      console.error('Error loading App Open Ad:', error);
    }
  }

  /**
   * Show the app open ad if it's available
   */
  async showAdIfAvailable() {
    if (!this.isModuleAvailable || !this.isAdAvailable() || this.isShowingAd) {
      console.log('App Open Ad is not ready or already showing');
      this.loadAppOpenAd();
      return;
    }

    try {
      this.isShowingAd = true;
      await this.appOpenAd?.show();
    } catch (error) {
      this.isShowingAd = false;
      console.error('Error showing App Open Ad:', error);
      this.appOpenAd = null;
      this.loadAppOpenAd();
    }
  }

  /**
   * Check if an ad is available to show
   */
  isAdAvailable(): boolean {
    if (!this.isModuleAvailable || !this.appOpenAd) return false;

    // If ad was loaded more than 4 hours ago, consider it expired
    const now = Date.now();
    const adExpireTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    return now - this.loadTime < adExpireTime;
  }

  /**
   * Handle app state changes to show ads when app comes to foreground
   */
  handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (!this.isModuleAvailable) return;
    
    if (nextAppState === 'active') {
      // App has come to the foreground
      await this.showAdIfAvailable();
    } else if (nextAppState === 'background') {
      // App has gone to the background
      // Load a new ad while app is in background to be ready on next foreground
      if (!this.isAdAvailable()) {
        this.loadAppOpenAd();
      }
    }
  };

  /**
   * Clean up event listeners
   */
  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Create and export a singleton instance
export const adMobService = new AdMobService();
export default adMobService;