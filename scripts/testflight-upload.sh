#!/usr/bin/env bash
# App Store Connect API 키로 iOS 빌드를 아카이브하고 TestFlight 에 올린다.
# Xcode 에 Apple 계정을 로그인하지 않아도 된다 (개인 개발자 계정의 팀원용).
#
# 필요한 환경변수 (키 값은 리포에 커밋하지 말 것)
#   ASC_KEY_ID      키 ID (예: ABC123DEFG)
#   ASC_ISSUER_ID   발급자 ID (UUID)
#   ASC_KEY_PATH    AuthKey_<키ID>.p8 파일 경로
#   APPLE_TEAM_ID   개발 팀 ID (10자리)
#   BUILD_NUMBER    이번 빌드 번호. 올릴 때마다 이전보다 커야 한다
#
# 사용
#   ASC_KEY_ID=... ASC_ISSUER_ID=... ASC_KEY_PATH=~/.appstoreconnect/private_keys/AuthKey_XXX.p8 \
#   APPLE_TEAM_ID=... BUILD_NUMBER=1 ./scripts/testflight-upload.sh
set -euo pipefail

: "${ASC_KEY_ID:?ASC_KEY_ID 가 필요해요}"
: "${ASC_ISSUER_ID:?ASC_ISSUER_ID 가 필요해요}"
: "${ASC_KEY_PATH:?ASC_KEY_PATH 가 필요해요}"
: "${APPLE_TEAM_ID:?APPLE_TEAM_ID 가 필요해요}"
: "${BUILD_NUMBER:?BUILD_NUMBER 가 필요해요}"

ASC_KEY_PATH="${ASC_KEY_PATH/#\~/$HOME}"
[ -f "$ASC_KEY_PATH" ] || { echo "키 파일이 없어요: $ASC_KEY_PATH" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKSPACE="$ROOT/ios/GudYeeDay.xcworkspace"
OUT="$ROOT/build/testflight"
ARCHIVE="$OUT/GudYeeDay.xcarchive"
[ -d "$WORKSPACE" ] || { echo "ios/ 가 없어요. 먼저 npx expo prebuild --platform ios" >&2; exit 1; }

# 로컬 .env.local(목 서버 주소 등)이 번들에 섞이지 않게 배포 서버 주소를 고정한다
export EXPO_PUBLIC_API_BASE_URL="http://ec2-15-164-237-188.ap-northeast-2.compute.amazonaws.com"
export LANG=en_US.UTF-8

AUTH=(
  -allowProvisioningUpdates
  -authenticationKeyPath "$ASC_KEY_PATH"
  -authenticationKeyID "$ASC_KEY_ID"
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"
)

rm -rf "$OUT" && mkdir -p "$OUT"

echo "▶ 아카이브 (빌드 번호 $BUILD_NUMBER)"
# 자동 서명으로 아카이브하면 개발용 프로파일이 필요하고, 그건 팀에 등록된 기기가 있어야 만들어진다.
# 그래서 아카이브는 서명 없이 만들고, 내보내기 단계에서 배포용 인증서로 서명한다
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme GudYeeDay \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  | tee "$OUT/archive.log" | grep -E "error:|warning: .*sign|ARCHIVE (SUCCEEDED|FAILED)" || true

[ -d "$ARCHIVE" ] || { echo "아카이브 실패. 로그: $OUT/archive.log" >&2; exit 1; }

# 서명 없이 만든 앱에는 권한(entitlements)이 없어서, 내보내기에서 서명해도 Apple 로그인·푸시 권한이 빠진다.
# 임시 서명(-)으로 권한을 먼저 박아 두면 내보내기가 그 권한을 그대로 배포 서명에 옮긴다
APP="$ARCHIVE/Products/Applications/GudYeeDay.app"
ENTITLEMENTS="$ROOT/ios/GudYeeDay/GudYeeDay.entitlements"
find "$APP/Frameworks" -maxdepth 1 \( -name "*.framework" -o -name "*.dylib" \) -exec codesign --force --sign - {} \; 2>/dev/null || true
codesign --force --sign - --entitlements "$ENTITLEMENTS" "$APP"
echo "▶ 앱 권한"
codesign -d --entitlements - --xml "$APP" 2>/dev/null | plutil -p - || true

cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>signingStyle</key><string>automatic</string>
  <key>teamID</key><string>$APPLE_TEAM_ID</string>
  <key>uploadSymbols</key><true/>
</dict>
</plist>
PLIST

echo "▶ App Store Connect 업로드"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportOptionsPlist "$OUT/ExportOptions.plist" \
  -exportPath "$OUT/export" \
  "${AUTH[@]}" | tee "$OUT/export.log" | grep -E "error:|Upload succeeded|EXPORT (SUCCEEDED|FAILED)" || true

grep -q "EXPORT SUCCEEDED" "$OUT/export.log" \
  && echo "✅ 업로드 완료. 10~30분 뒤 App Store Connect → TestFlight 에 나타나요" \
  || { echo "업로드 실패. 로그: $OUT/export.log" >&2; exit 1; }
