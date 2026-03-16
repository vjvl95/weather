# ERR-003: index.js 누락으로 Android 네이티브 번들 로딩 실패

## 증상

- `npx expo run:android` 빌드 성공 후 앱이 **크래시 또는 빈 화면**
- Metro 로그: `Unable to resolve module ./index` 또는 번들 요청 404
- iOS(Expo Go)에서는 정상 동작하는데 Android 네이티브 빌드에서만 실패

## 원인

Android 네이티브 앱(dev client)은 Metro에 `/index.bundle`을 요청한다. 이때 프로젝트 루트의 `index.js`를 엔트리포인트로 찾는다.

`package.json`의 `"main": "expo-router/entry"` 설정은 Expo Go에서는 정상 동작하지만, **네이티브 빌드에서는 Metro가 `index.js` 파일을 직접 탐색**하기 때문에 파일이 없으면 번들링 실패한다.

### package.json 설정만으로는 부족한 이유

```json
{
  "main": "expo-router/entry"  // Expo Go: OK, Native build: 무시될 수 있음
}
```

Android의 `MainApplication` / `ReactNativeHost`가 번들 URL을 `/index.bundle`로 하드코딩하는 경우가 있어, `main` 필드와 무관하게 `index.js`를 찾는다.

## 해결

프로젝트 루트에 `index.js` 생성:

```javascript
// index.js
import 'expo-router/entry';
```

이 한 줄이 expo-router의 엔트리포인트로 브릿지 역할을 한다.

## 교훈

- Expo Managed → EAS Dev Client로 전환 시 `index.js` 필요 여부를 확인
- `package.json`의 `main` 필드만 믿지 말고, 네이티브 빌드 환경에서의 번들 요청 경로를 확인
- `npx expo prebuild`로 생성된 네이티브 프로젝트의 엔트리포인트 설정 점검

## 관련 환경

- Expo SDK 55
- expo-router
- EAS Dev Client (Android)
- `npx expo run:android`

## 발견일

2026-03-09
