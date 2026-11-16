// App-wide settings that aren't game balance.
export const VERSION = '0.5';
// Anonymous play data (see kit/js/telemetry.js). Nothing is sent while `url` is empty.
// Put the HTTPS address of the collecting service here when one exists.
export const TELEMETRY = { url:'', app:'carrot_patch' };
// Rewarded video ads in the phone apps (AdMob). These are Google's public TEST ids: they show real
// ads marked "Test Ad" and earn nothing. To go live, replace all four with the ids from your own
// AdMob account and set `testing` to false. Never tap your own live ads.
export const ADS = {
  testing: true,
  appId:    { android:'ca-app-pub-3940256099942544~3347511713', ios:'ca-app-pub-3940256099942544~1458002511' },
  rewarded: { android:'ca-app-pub-3940256099942544/5224354917', ios:'ca-app-pub-3940256099942544/1712485313' },
};
