const { withAppBuildGradle, createRunOncePlugin } = require("expo/config-plugins");

const PROJECT_ROOT_LINE =
  "def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()";

const SIGNING_BLOCK = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const SIGNING_BLOCK_RELEASE = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (noctaReleaseSigningReady) {
                storeFile noctaReleaseKeystore
                storePassword noctaStorePassword
                keyAlias noctaKeyAlias
                keyPassword noctaKeyPassword
            }
        }
    }`;

const RELEASE_DEBUG_SIGNING = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

const RELEASE_CONDITIONAL_SIGNING = `        release {
            // Release signing: root release.keystore + keystore.properties or NOCTA_* env vars.
            signingConfig noctaReleaseSigningReady ? signingConfigs.release : signingConfigs.debug`;

// Expo's `projectRoot` is the `android/` folder (parent of :app's rootDir), not the JS repo root.
// Keystore files live next to package.json: parent of `android/`.
const KEYSTORE_PROPS = `
// @generated begin nocta-release-keystore - expo prebuild (DO NOT MODIFY)
def noctaRepoRoot = rootProject.projectDir.getParentFile().getAbsolutePath()
def noctaReleaseKeystore = file("$noctaRepoRoot/release.keystore")
def noctaKeystoreProps = new Properties()
def noctaKeystorePropsFile = file("$noctaRepoRoot/keystore.properties")
if (noctaKeystorePropsFile.exists()) {
    noctaKeystoreProps.load(new FileInputStream(noctaKeystorePropsFile))
}
def noctaKeyAlias = System.getenv("NOCTA_KEY_ALIAS") ?: noctaKeystoreProps.getProperty("keyAlias")
def noctaStorePassword = System.getenv("NOCTA_KEYSTORE_PASSWORD") ?: noctaKeystoreProps.getProperty("storePassword")
def noctaKeyPassword = System.getenv("NOCTA_KEY_PASSWORD") ?: noctaKeystoreProps.getProperty("keyPassword")
def noctaReleaseSigningReady = noctaReleaseKeystore.exists() && noctaKeyAlias && noctaStorePassword && noctaKeyPassword
// @generated end nocta-release-keystore
`;

const LEGACY_KEYSTORE_BLOCK =
  /\n\/\/ @generated begin nocta-release-keystore[\s\S]*?\/\/ @generated end nocta-release-keystore\n?/;

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      return cfg;
    }

    let contents = cfg.modResults.contents;

    const hasFixedBlock = contents.includes(
      "def noctaRepoRoot = rootProject.projectDir",
    );
    if (hasFixedBlock) {
      return cfg;
    }

    // Older plugin versions pointed at android/release.keystore (wrong); strip and re-apply below.
    if (contents.includes("@generated begin nocta-release-keystore")) {
      contents = contents.replace(LEGACY_KEYSTORE_BLOCK, "\n");
    }

    // Fail prebuild instead of warning: a warning scrolls by and leaves a release build signed
    // with the debug keystore, which installs fine and only gets rejected by Play.
    if (!contents.includes(PROJECT_ROOT_LINE)) {
      throw new Error(
        "withAndroidReleaseSigning: unexpected app/build.gradle layout, cannot inject release signing.",
      );
    }

    if (!contents.includes("def noctaRepoRoot = rootProject.projectDir")) {
      contents = contents.replace(
        PROJECT_ROOT_LINE,
        `${PROJECT_ROOT_LINE}${KEYSTORE_PROPS}`,
      );
    }

    if (contents.includes(SIGNING_BLOCK)) {
      contents = contents.replace(SIGNING_BLOCK, SIGNING_BLOCK_RELEASE);
    }

    if (contents.includes(RELEASE_DEBUG_SIGNING)) {
      contents = contents.replace(
        RELEASE_DEBUG_SIGNING,
        RELEASE_CONDITIONAL_SIGNING,
      );
    }

    if (
      !contents.includes("noctaReleaseSigningReady ? signingConfigs.release")
    ) {
      throw new Error(
        "withAndroidReleaseSigning: signingConfigs / release block changed. Update plugins/withAndroidReleaseSigning.js.",
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = createRunOncePlugin(
  withAndroidReleaseSigning,
  "with-android-release-signing",
  "1.0.1",
);
