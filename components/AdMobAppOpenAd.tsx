import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// AdMob App Open Ad Unit ID from props
interface AdMobAppOpenAdProps {
  adUnitId: string;
  timeout?: number; // Time to display the ad in milliseconds
  onClose?: () => void; // Callback when ad is closed
  onError?: (error: any) => void; // Callback when there's an error
}

const AdMobAppOpenAd: React.FC<AdMobAppOpenAdProps> = ({
  adUnitId,
  timeout = 5000, // Default 5 seconds
  onClose,
  onError,
}) => {
  // Start with visible true since the component is only rendered when needed
  const [adLoaded, setAdLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5 second countdown

  // Ad HTML content - simplified version using AdMob tags
  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background-color: #f0f0f0; height: 100vh; }
          .ad-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
          .ad-message { text-align: center; margin: 20px; font-family: Arial, sans-serif; }
          .ad-unit { width: 100%; height: 70%; background-color: #fff; display: flex; align-items: center; justify-content: center; }
        </style>
      </head>
      <body>
        <div class="ad-container">
          <div class="ad-message">
            <h2>Advertisement</h2>
            <p>This ad supports Egypt Urban Maps</p>
          </div>
          <div class="ad-unit">
            <!-- AdMob Ad Tag would go here in a real implementation -->
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-2982967112085282"
                data-ad-slot="${adUnitId}"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>
        </div>
      </body>
    </html>
  `;

  useEffect(() => {
    // Show the ad after a short delay
    const showAdTimeout = setTimeout(() => {
      setAdLoaded(true);
    }, 1000);

    return () => {
      clearTimeout(showAdTimeout);
    };
  }, []);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    // Start the countdown immediately
    countdownInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, close the ad
          if (onClose) {
            onClose();
          }
          clearInterval(countdownInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleAdError = (error: any) => {
    console.error('Ad failed to load:', error);
    if (onError) {
      onError(error);
    }
    handleClose();
  };

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.closeButtonContainer}>
          <Text style={styles.timerText}>Ad closes in {timeLeft}s</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>
        
        <View style={styles.webViewContainer}>
          <WebView
            style={styles.webview}
            source={{ html: adHtml }}
            onError={handleAdError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: Platform.OS === 'ios' ? 40 : 10, // Account for status bar on iOS
    backgroundColor: '#000',
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
  },
  webViewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default AdMobAppOpenAd;