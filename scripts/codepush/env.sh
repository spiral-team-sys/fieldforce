#!/bin/bash

# Only enable errexit when the script is executed directly.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  set -e
fi

# ==============================
# CONFIG
# ==============================
CONFIG_FILE="./src/Core/Revopush.js"
ANDROID_STRINGS_FILE="./android/app/src/main/res/values/strings.xml"
IOS_PLIST_FILE="./ios/fieldforce/Info.plist"

# ==============================
# INPUT
# ==============================
# Usage:
#   source env.sh <app_key>
#   source env.sh signify
#   source env.sh fieldforce
APP_KEY=$1
PLATFORM=$2   # android | ios | all
APP_VERSION=$3 
# ==============================
# VALIDATE INPUT
# ==============================
if [ -z "$APP_KEY" ]; then
  echo "❌ Missing APP_KEY"
  echo "👉 Usage: source env.sh <app_key>"
  echo "👉 Example: source env.sh default_app"
  exit 1
fi
if [ -z "$APP_VERSION" ]; then
  echo "❌ Missing APP_VERSION"
  echo "👉 Usage: source env.sh <app_key> <android|ios|TEST_android|TEST_ios|all> <app_version>"
  echo "👉 Example: source env.sh signify android 1.2.3"
  exit 1
fi
# ==============================
# VALIDATE CONFIG FILE
# ==============================
if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Revopush config not found: $CONFIG_FILE"
  exit 1
fi

# ==============================
# VALIDATE APP KEY EXISTS
# ==============================
node -e "
const cfg = require('$CONFIG_FILE');
if (!cfg.apps['$APP_KEY']) {
  console.error('❌ App key not found:', '$APP_KEY');
  console.error('👉 Available apps:', Object.keys(cfg.apps).join(', '));
  process.exit(1);
}
" 
# ==============================
# LOAD CONFIG
# ==============================
APP_NAME=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].appNameBuild)")
ANDROID_DEPLOYMENT=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deployments.android)")
IOS_DEPLOYMENT=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deployments.ios)")
TEST_ANDROID_DEPLOYMENT=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deployments?.TEST_android || '')")
TEST_IOS_DEPLOYMENT=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deployments?.TEST_ios || '')")
ANDROID_EXPECTED_KEY=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deploymentKeys?.android || '')")
IOS_EXPECTED_KEY=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deploymentKeys?.ios || '')")
TEST_ANDROID_EXPECTED_KEY=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deploymentKeys?.TEST_android || '')")
TEST_IOS_EXPECTED_KEY=$(node -e "console.log(require('$CONFIG_FILE').apps['$APP_KEY'].deploymentKeys?.TEST_ios || '')")

# ==============================
# READ NATIVE DEPLOYMENT KEYS
# ==============================
ANDROID_NATIVE_KEY=""
IOS_NATIVE_KEY=""

if [ -f "$ANDROID_STRINGS_FILE" ]; then
  ANDROID_NATIVE_KEY=$(sed -nE 's/^[[:space:]]*<string name="CodePushDeploymentKey"[^>]*>([^<]+)<\/string>[[:space:]]*$/\1/p' "$ANDROID_STRINGS_FILE" | head -n 1)
fi

if [ -f "$IOS_PLIST_FILE" ]; then
  IOS_NATIVE_KEY=$(awk -F'[<>]' '/<key>CodePushDeploymentKey<\/key>/ {getline; print $3; exit}' "$IOS_PLIST_FILE")
fi

# ==============================
# EXPORT
# ==============================
export APP_KEY
export APP_NAME
export ANDROID_DEPLOYMENT
export IOS_DEPLOYMENT
export TEST_ANDROID_DEPLOYMENT
export TEST_IOS_DEPLOYMENT
export ANDROID_EXPECTED_KEY
export IOS_EXPECTED_KEY
export TEST_ANDROID_EXPECTED_KEY
export TEST_IOS_EXPECTED_KEY
export ANDROID_NATIVE_KEY
export IOS_NATIVE_KEY

# ==============================
# LOG
# ==============================
echo "======================================"
echo "🚀 Revopush ENV loaded"
echo "👉 App Key        : $APP_KEY"
echo "👉 App Name       : $APP_NAME"
echo "👉 Android Deploy : $ANDROID_DEPLOYMENT"
echo "👉 iOS Deploy     : $IOS_DEPLOYMENT"
echo "👉 TEST Android Deploy : $TEST_ANDROID_DEPLOYMENT"
echo "👉 TEST iOS Deploy     : $TEST_IOS_DEPLOYMENT"
echo "👉 App Version    : $APP_VERSION"
echo "👉 Android Key(cfg): $ANDROID_EXPECTED_KEY"
echo "👉 Android Key(app): $ANDROID_NATIVE_KEY"
echo "👉 iOS Key(cfg)    : $IOS_EXPECTED_KEY"
echo "👉 iOS Key(app)    : $IOS_NATIVE_KEY"
echo "👉 TEST Android Key(cfg): $TEST_ANDROID_EXPECTED_KEY"
echo "👉 TEST iOS Key(cfg)    : $TEST_IOS_EXPECTED_KEY"
echo "======================================"

# ==============================
# CHECK NATIVE KEY MATCH
# ==============================
KEY_CHECK_FAILED=0

check_key_match () {
  local label="$1"
  local expected="$2"
  local native="$3"

  if [ -n "$expected" ] && [ -n "$native" ]; then
    if [ "$expected" = "$native" ]; then
      echo "✅ $label deployment key matched"
    else
      echo "❌ $label deployment key mismatch"
      KEY_CHECK_FAILED=1
    fi
  else
    echo "⚠️ $label key check skipped (missing config key or native key)"
  fi
}

case "$PLATFORM" in
  android)
    check_key_match "Android" "$ANDROID_EXPECTED_KEY" "$ANDROID_NATIVE_KEY"
    ;;
  ios)
    check_key_match "iOS" "$IOS_EXPECTED_KEY" "$IOS_NATIVE_KEY"
    ;;
  TEST_android)
    check_key_match "TEST Android" "$TEST_ANDROID_EXPECTED_KEY" "$ANDROID_NATIVE_KEY"
    ;;
  TEST_ios)
    check_key_match "TEST iOS" "$TEST_IOS_EXPECTED_KEY" "$IOS_NATIVE_KEY"
    ;;
  all)
    check_key_match "Android" "$ANDROID_EXPECTED_KEY" "$ANDROID_NATIVE_KEY"
    check_key_match "iOS" "$IOS_EXPECTED_KEY" "$IOS_NATIVE_KEY"
    ;;
  *)
    echo "⚠️ Key check skipped (invalid platform or missing platform)"
    ;;
esac

if [ "$KEY_CHECK_FAILED" -eq 1 ]; then
  echo "❌ Stop release because native deployment keys are not matched with config"
  return 1
fi


# ==============================
# Run Update
# ============================== 
if [ -z "$PLATFORM" ]; then
  echo "❌ Missing PLATFORM"
  echo "👉 Usage: source env.sh <app_key> <android|ios|TEST_android|TEST_ios|all>"
  exit 1
fi

release_android () {
  echo "📦 Revopush release ANDROID..."
  revopush release-react "$APP_KEY" android -d "$ANDROID_DEPLOYMENT" --appVersion "$APP_VERSION"
}

release_ios () {
  echo "📦 Revopush release IOS..."
  revopush release-react "$APP_KEY" ios -d "$IOS_DEPLOYMENT" --appVersion "$APP_VERSION"
}

release_test_android () {
  echo "📦 Revopush release TEST ANDROID..."
  revopush release-react "$APP_KEY" android -d "$TEST_ANDROID_DEPLOYMENT" --appVersion "$APP_VERSION"
}

release_test_ios () {
  echo "📦 Revopush release TEST IOS..."
  revopush release-react "$APP_KEY" ios -d "$TEST_IOS_DEPLOYMENT" --appVersion "$APP_VERSION"
}

case "$PLATFORM" in
  android)
    release_android
    ;;
  ios)
    release_ios
    ;;
  TEST_android)
    release_test_android
    ;;
  TEST_ios)
    release_test_ios
    ;;
  all)
    release_android
    release_ios
    ;;
  *)
    echo "❌ Invalid PLATFORM: $PLATFORM"
    echo "👉 Use android | ios | TEST_android | TEST_ios | all"
    ;;
esac


