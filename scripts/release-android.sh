#!/usr/bin/env bash
#
# Android release build: prebuild a clean android/, then let gradle produce a signed artifact.
#
#   bash scripts/release-android.sh apk   # installable apk
#   bash scripts/release-android.sh aab   # aab for Google Play
#
# Env knobs (fastlane sets these, see fastlane/Fastfile):
#   ANDROID_VERSION_CODE          use this versionCode as-is instead of last + 1
#   ANDROID_VERSION_CODE_PERSIST  1 = still write it back to .env.release
#   RELEASE_ARTIFACT_PATH_FILE    write the artifact's absolute path into this file
#
set -euo pipefail

cd "$(dirname "$0")/.."

FORMAT="${1:-apk}"
case "$FORMAT" in
  apk)
    GRADLE_TASK="assembleRelease"
    GRADLE_ARTIFACT="android/app/build/outputs/apk/release/app-release.apk"
    ;;
  aab)
    GRADLE_TASK="bundleRelease"
    GRADLE_ARTIFACT="android/app/build/outputs/bundle/release/app-release.aab"
    ;;
  *)
    echo "usage: $0 [apk|aab]" >&2
    exit 1
    ;;
esac

# Same files plugins/withAndroidReleaseSigning.js reads at gradle time
KEYSTORE="release.keystore"
KEYSTORE_PROPS="keystore.properties"
STATE_FILE=".env.release"

# .env.release also holds the last used versionCode; remember whether the env gave one before sourcing
PRESET_VERSION_CODE="${ANDROID_VERSION_CODE:-}"

if [ -f "$STATE_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "./$STATE_FILE"
  set +a
fi

read_prop() {
  [ -f "$KEYSTORE_PROPS" ] || return 0
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" "$KEYSTORE_PROPS" | head -n1
}

# Without these the gradle plugin quietly signs the release build with the debug keystore:
# it builds and even installs, and only Play rejects it. Stop before wasting a build.
KEY_ALIAS="${NOCTA_KEY_ALIAS:-$(read_prop keyAlias)}"
STORE_PASSWORD="${NOCTA_KEYSTORE_PASSWORD:-$(read_prop storePassword)}"
KEY_PASSWORD="${NOCTA_KEY_PASSWORD:-$(read_prop keyPassword)}"

if [ ! -f "$KEYSTORE" ]; then
  echo "Missing $KEYSTORE at the repo root — run: pnpm keystore:android (or restore your backup)" >&2
  exit 1
fi

if [ -z "$KEY_ALIAS" ] || [ -z "$STORE_PASSWORD" ] || [ -z "$KEY_PASSWORD" ]; then
  cat >&2 <<EOF
Release signing is incomplete — the build would silently fall back to the debug keystore.

Fill in keyAlias / storePassword / keyPassword in $KEYSTORE_PROPS
(cp keystore.properties.example keystore.properties), or export
NOCTA_KEY_ALIAS / NOCTA_KEYSTORE_PASSWORD / NOCTA_KEY_PASSWORD.
EOF
  exit 1
fi

# The value in app.json is the floor: anything at or below it may already be on Play.
APP_JSON_VERSION_CODE="$(sed -nE 's/^[[:space:]]*"versionCode":[[:space:]]*([0-9]+).*/\1/p' app.json | head -n1)"
APP_JSON_VERSION_CODE="${APP_JSON_VERSION_CODE:-0}"

if [ -n "$PRESET_VERSION_CODE" ]; then
  ANDROID_VERSION_CODE="$PRESET_VERSION_CODE"
  PERSIST_VERSION_CODE="${ANDROID_VERSION_CODE_PERSIST:-0}"
else
  LAST_VERSION_CODE="${ANDROID_VERSION_CODE:-0}"
  case "$LAST_VERSION_CODE" in
    '') LAST_VERSION_CODE=0 ;;
    *[!0-9]*)
      echo "ANDROID_VERSION_CODE=$LAST_VERSION_CODE in $STATE_FILE is not a number — set it to the last released code." >&2
      exit 1
      ;;
  esac
  if [ "$LAST_VERSION_CODE" -lt "$APP_JSON_VERSION_CODE" ]; then
    LAST_VERSION_CODE="$APP_JSON_VERSION_CODE"
  fi
  ANDROID_VERSION_CODE=$((LAST_VERSION_CODE + 1))
  PERSIST_VERSION_CODE=1
fi
export ANDROID_VERSION_CODE

# Only after gradle succeeds: a failed build should not burn a number.
persist_version_code() {
  local tmp

  if [ -f "$STATE_FILE" ] && grep -qE '^[[:space:]]*ANDROID_VERSION_CODE[[:space:]]*=' "$STATE_FILE"; then
    # BSD and GNU sed -i disagree; cat back instead of mv to keep the file's permissions
    tmp="$(mktemp)"
    awk -v code="$ANDROID_VERSION_CODE" '
      /^[[:space:]]*ANDROID_VERSION_CODE[[:space:]]*=/ { print "ANDROID_VERSION_CODE=" code; next }
      { print }
    ' "$STATE_FILE" >"$tmp"
    cat "$tmp" >"$STATE_FILE"
    rm -f "$tmp"
    return
  fi

  if [ ! -f "$STATE_FILE" ]; then
    printf '# Local Android release state, git-ignored (see .env.release.example).\n\n' >"$STATE_FILE"
  fi
  printf 'ANDROID_VERSION_CODE=%s\n' "$ANDROID_VERSION_CODE" >>"$STATE_FILE"
}

echo "versionCode $ANDROID_VERSION_CODE"

npx expo prebuild --clean --platform android
(cd android && ./gradlew "$GRADLE_TASK")

# gradle always writes app-release.*, overwriting the previous build; name it after what it is.
# versionName is read from the generated build.gradle because that is what actually went in.
VERSION_NAME="$(sed -nE 's/^[[:space:]]*versionName[[:space:]]+"([^"]+)".*/\1/p' android/app/build.gradle | head -n1)"
VERSION_NAME="${VERSION_NAME:-unknown}"

ARTIFACT="$(dirname "$GRADLE_ARTIFACT")/nocta-$VERSION_NAME-$ANDROID_VERSION_CODE-$(date +%Y%m%d%H%M).$FORMAT"
mv "$GRADLE_ARTIFACT" "$ARTIFACT"

# Second gate after the credential check: the plugin can still fall back to debug signing if the
# RN template changed under it. An aab is jar-signed, so keytool can read its certificate.
assert_release_signed() {
  local expected actual

  [ "$FORMAT" = aab ] || return 0

  expected="$(keytool -list -v -keystore "$KEYSTORE" -alias "$KEY_ALIAS" -storepass "$STORE_PASSWORD" 2>/dev/null |
    sed -nE 's/^[[:space:]]*SHA256:[[:space:]]*//p' | head -n1)"
  actual="$(keytool -printcert -jarfile "$ARTIFACT" 2>/dev/null |
    sed -nE 's/^[[:space:]]*SHA256:[[:space:]]*//p' | head -n1)"

  if [ -z "$expected" ] || [ -z "$actual" ]; then
    echo "warning: could not read signing certificates — skipping the signature check" >&2
    return 0
  fi

  if [ "$expected" != "$actual" ]; then
    cat >&2 <<EOF

$ARTIFACT is not signed with $KEYSTORE — do not upload it.
  expected SHA256 $expected
  got      SHA256 $actual

Check plugins/withAndroidReleaseSigning.js against the generated android/app/build.gradle.
EOF
    exit 1
  fi
}

assert_release_signed

if [ -n "${RELEASE_ARTIFACT_PATH_FILE:-}" ]; then
  printf '%s\n' "$PWD/$ARTIFACT" >"$RELEASE_ARTIFACT_PATH_FILE"
fi

if [ "$PERSIST_VERSION_CODE" = 1 ]; then
  persist_version_code
fi

echo
echo "✔ $ARTIFACT (versionCode $ANDROID_VERSION_CODE)"
