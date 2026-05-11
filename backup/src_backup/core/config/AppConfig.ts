export class AppConfig {
  /**
   * Generates the redirect URL for authentication flows.
   * Priority: VITE_APP_URL > window.location.origin
   */
  public static getRedirectUrl(): string {
    const appUrl = import.meta.env.VITE_APP_URL;
    
    if (appUrl && appUrl.trim() !== '') {
      return appUrl;
    }

    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return 'https://infocus-cinelog.vercel.app'; // Final fallback
  }
}
