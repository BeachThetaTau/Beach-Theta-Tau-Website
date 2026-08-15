const booleanFromEnv = (value: string | undefined) => value?.toLowerCase() === "true";

const meta = (import.meta as { env?: Record<string, string | undefined> }).env || {};

const getEnv = (key: string, ...fallbackKeys: string[]): string | undefined => {
  if (meta[key]) return meta[key];
  for (const alt of fallbackKeys) {
    if (meta[alt]) return meta[alt];
  }
  return undefined;
};

const apiKey =
  getEnv("VITE_FIREBASE_API_KEY", "FIREBASE_API", "FIREBASE_API_KEY") || "demo-api-key";

if (import.meta.env.PROD && (apiKey === "demo-api-key" || !apiKey)) {
  console.error(
    "[Firebase Config] Missing production Firebase API key! Please set VITE_FIREBASE_API_KEY (or FIREBASE_API) in your production deployment environment variables.",
  );
}

export const env = {
  firebase: {
    apiKey,
    authDomain:
      getEnv("VITE_FIREBASE_AUTH_DOMAIN", "FIREBASE_AUTH_DOMAIN") || "demo-project.firebaseapp.com",
    projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "FIREBASE_PROJECT_ID") || "demo-project",
    storageBucket:
      getEnv("VITE_FIREBASE_STORAGE_BUCKET", "FIREBASE_STORAGE_BUCKET") ||
      "demo-project.appspot.com",
    messagingSenderId:
      getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "FIREBASE_MESSAGING_SENDER_ID") || "000000000000",
    appId: getEnv("VITE_FIREBASE_APP_ID", "FIREBASE_APP_ID") || "1:000000000000:web:demo",
    measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "FIREBASE_MEASUREMENT_ID") || undefined,
  },
  recaptchaSiteKey: getEnv("VITE_RECAPTCHA_SITE_KEY", "RECAPTCHA_SITE_KEY"),
  useFirebaseEmulators: booleanFromEnv(
    getEnv("VITE_USE_FIREBASE_EMULATORS", "USE_FIREBASE_EMULATORS"),
  ),
} as const;
