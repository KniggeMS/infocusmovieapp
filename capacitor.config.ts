import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.infocus.app',
  appName: 'InFocus CineLog',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false, // Wichtig: Wir verstecken es manuell in App.tsx für nahtlosen Übergang!
      backgroundColor: "#111827", // Passend zu deinem Dark Mode (bg-gray-900)
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#60A5FA", // Blau passend zum Theme
    },
  },
};

export default config;