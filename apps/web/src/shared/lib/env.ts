const booleanFromEnv = (value: string | undefined) => value?.toLowerCase() === "true";

export const env = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:demo",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  },
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  useFirebaseEmulators: booleanFromEnv(import.meta.env.VITE_USE_FIREBASE_EMULATORS),
} as const;
