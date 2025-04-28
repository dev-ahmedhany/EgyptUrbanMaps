// AdMob App Open Ad implementation
import { Platform } from 'react-native';

// For testing purposes, use the test ad unit ID
// Replace with your actual ad unit ID for production
const APP_OPEN_AD_UNIT_ID_ANDROID = 'ca-app-pub-2982967112085282/1833733485';
const APP_OPEN_AD_UNIT_ID_IOS = 'ca-app-pub-2982967112085282/1833733485'; // Using same ID for iOS too

// Flag to prevent showing the ad more than once per app session
let isShowingAppOpenAd = false;
let appOpenAdLoadTime = 0;

/**
 * Class to manage App Open Ads
 */
export class AppOpenAdManager {
  private static instance: AppOpenAdManager;
  private appOpenAd: any = null;

  constructor() {
    // Initialize any necessary state
  }

  static getInstance(): AppOpenAdManager {
    if (!AppOpenAdManager.instance) {
      AppOpenAdManager.instance = new AppOpenAdManager();
    }
    return AppOpenAdManager.instance;
  }

  /**
   * Load an App Open Ad
   */
  public async loadAd(): Promise<boolean> {
    // We will implement the native module integration for this
    // This is a placeholder to show the approach
    try {
      // This would be implemented in native code or through a bridge
      console.log('Loading app open ad...');
      
      // Simulate ad loading - in real implementation, this would be a call to the native AdMob SDK
      // For example: await GoogleMobileAdsModule.loadAppOpenAd(adUnitId);
      
      appOpenAdLoadTime = Date.now();
      return true;
    } catch (error) {
      console.error('Failed to load app open ad:', error);
      return false;
    }
  }

  /**
   * Show the app open ad if it's ready and not shown recently
   */
  public async showAdIfAvailable(): Promise<void> {
    // Don't show the ad if it's already showing
    if (isShowingAppOpenAd) {
      console.log('App open ad is already showing');
      return;
    }

    // Check if we have a loaded ad
    if (!this.wasAdLoadTimeLessThanNHoursAgo(4)) {
      console.log('App open ad expired, loading a new one');
      await this.loadAd();
    }

    // If we have a loaded ad, show it
    if (appOpenAdLoadTime > 0) {
      try {
        isShowingAppOpenAd = true;
        
        console.log('Showing app open ad...');
        // In a real implementation: await GoogleMobileAdsModule.showAppOpenAd();
        // This would be called through a native module bridge
        
        // Simulate ad display finishing
        setTimeout(() => {
          isShowingAppOpenAd = false;
        }, 3000);
      } catch (error) {
        console.error('Error showing app open ad:', error);
        isShowingAppOpenAd = false;
      }
    } else {
      console.log('App open ad not loaded yet');
      await this.loadAd();
    }
  }

  /**
   * Check if the ad was loaded less than n hours ago
   */
  private wasAdLoadTimeLessThanNHoursAgo(numHours: number): boolean {
    if (appOpenAdLoadTime === 0) {
      return false;
    }
    
    const currentTime = Date.now();
    const nHoursAgo = currentTime - (numHours * 60 * 60 * 1000);
    return appOpenAdLoadTime > nHoursAgo;
  }

  /**
   * Get the appropriate ad unit ID based on platform
   */
  public static getAdUnitId(): string {
    return Platform.OS === 'ios' ? APP_OPEN_AD_UNIT_ID_IOS : APP_OPEN_AD_UNIT_ID_ANDROID;
  }
}

// Export a singleton instance
export default AppOpenAdManager.getInstance();