import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { env } from "../env";

export const firebaseApp = getApps().length ? getApp() : initializeApp(env.firebase);

// Initialize App Check with reCAPTCHA v3 if a site key is provided and we're not using emulators
if (env.recaptchaSiteKey && !env.useFirebaseEmulators) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(env.recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
