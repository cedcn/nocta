import type { ConfigContext, ExpoConfig } from "expo/config";

// Play rejects any upload whose versionCode is not strictly greater than the last one, so release
// builds get the number from scripts/release-android.sh (exported before prebuild). Day-to-day
// builds fall back to the value in app.json.
export default ({ config }: ConfigContext): ExpoConfig => {
  const versionCode =
    Number(process.env.ANDROID_VERSION_CODE) || config.android?.versionCode;

  return {
    ...config,
    name: config.name ?? "Nocta",
    slug: config.slug ?? "nocta",
    android: { ...config.android, versionCode },
  };
};
