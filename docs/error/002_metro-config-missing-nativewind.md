# ERR-002: metro.config.js 누락으로 NativeWind 스타일 미적용

## 증상

- 앱이 정상 실행되지만 **모든 UI가 스타일 없이 렌더링** (plain/unstyled)
- NativeWind 클래스(`className="bg-gray-900"` 등)가 완전히 무시됨
- `tailwind.config.js`, `babel.config.js`, `src/global.css` 모두 정상
- 콘솔에 별도 에러 없음 — **사일런트 실패**

## 원인

NativeWind v4는 Metro 번들러에 CSS 처리 파이프라인을 주입해야 한다. 이를 위해 `metro.config.js`에서 `withNativeWind()` 래퍼를 사용해야 하는데, **`metro.config.js` 파일 자체가 프로젝트에 없었다.**

Expo의 기본 Metro 설정은 NativeWind CSS를 처리하지 않으므로, `@tailwind base/components/utilities` 지시문이 해석되지 않아 모든 유틸리티 클래스가 빈 문자열로 처리된다.

### 필요한 설정

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './src/global.css' });
```

### 왜 빠졌나?

프로젝트 초기 세팅 시 `npx create-expo-app`으로 생성하면 `metro.config.js`가 포함되지 않는 경우가 있다. NativeWind 설치 가이드의 Metro 설정 단계가 누락된 것으로 추정.

## 해결

`metro.config.js`를 프로젝트 루트에 생성하고 `withNativeWind()` 래퍼 적용.

```bash
# Metro 캐시 클리어 후 재시작 필수
npx expo start --clear
```

## 교훈

- NativeWind v4 설치 시 **4가지 파일**을 모두 확인해야 한다:
  1. `tailwind.config.js` — content 경로, presets
  2. `metro.config.js` — `withNativeWind()` 래퍼 (**이것이 빠지기 쉬움**)
  3. `babel.config.js` — `jsxImportSource: 'nativewind'`
  4. `src/global.css` — `@tailwind` 지시문
- 스타일 미적용은 에러 없이 발생하므로 디버깅이 어려움
- NativeWind v2→v4 마이그레이션 시에도 Metro 설정 변경이 필요

## 관련 환경

- Expo SDK 55
- NativeWind v4
- Metro bundler

## 발견일

2026-03-09
