/** Deep links understood by the Flutter app. Keep in sync with the static pages. */

export const APP_DEEP_LINK = "flux://app";
export const VERIFIED_DEEP_LINK = "flux://app?verified=true";

export function openDeepLink(url: string): void {
  if (typeof window === "undefined") return;
  window.location.assign(url);
}
