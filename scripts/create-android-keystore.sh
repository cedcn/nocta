#!/usr/bin/env bash
#
# Create the Android upload keystore. Run once per app.
#
# The keystore and keystore.properties are git-ignored — back both up elsewhere. Losing them
# means Play updates need an upload key reset through Play Console support.
#
set -euo pipefail

cd "$(dirname "$0")/.."

KEYSTORE="release.keystore"
KEYSTORE_PROPS="keystore.properties"

if [ -f "$KEYSTORE" ]; then
  echo "$KEYSTORE already exists — refusing to overwrite an existing signing key." >&2
  exit 1
fi

read_prop() {
  [ -f "$KEYSTORE_PROPS" ] || return 0
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" "$KEYSTORE_PROPS" | head -n1
}

KEY_ALIAS="${NOCTA_KEY_ALIAS:-$(read_prop keyAlias)}"
STORE_PASSWORD="${NOCTA_KEYSTORE_PASSWORD:-$(read_prop storePassword)}"
KEY_PASSWORD="${NOCTA_KEY_PASSWORD:-$(read_prop keyPassword)}"

if [ -z "$KEY_ALIAS" ] || [ -z "$STORE_PASSWORD" ] || [ -z "$KEY_PASSWORD" ]; then
  echo "Fill in $KEYSTORE_PROPS first (cp keystore.properties.example keystore.properties)." >&2
  exit 1
fi

keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$STORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "${RELEASE_KEY_DNAME:-CN=Nocta, O=Nocta, C=CN}"

echo
echo "Created $KEYSTORE"
keytool -list -v -keystore "$KEYSTORE" -alias "$KEY_ALIAS" -storepass "$STORE_PASSWORD" |
  grep -E 'SHA1|SHA-1|SHA256|SHA-256'
