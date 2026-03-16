# ERR-005: babel-preset-expo 누락으로 Android 네이티브 빌드 실패

## 증상

- `npx expo run:android` 실행 시 Gradle 빌드 에러
- 에러 메시지: `Process 'command 'node'' finished with non-zero exit value 1`
- 에러 위치: `settings.gradle` line 29 (expo-modules-autolinking)
- Metro 서버와 무관 — **빌드 단계에서 실패**

## 원인

Expo의 autolinking 시스템은 빌드 시 Node.js를 실행하여 네이티브 모듈을 탐색한다:

```bash
node --no-warnings --eval \
  "require('expo/bin/autolinking')" \
  expo-modules-autolinking react-native-config --platform android --json
```

이 스크립트 내부에서 `babel-preset-expo`를 `require()`하는데, 패키지가 `node_modules`에 없으면 실패한다.

### 왜 누락되었나?

`npm install --legacy-peer-deps`로 의존성을 설치할 때 peer dependency 충돌로 인해 일부 패키지가 설치되지 않거나 제거될 수 있다. `babel-preset-expo`가 이 과정에서 누락된 것으로 추정.

## 진단 방법

Gradle 에러 메시지만으로는 원인 파악이 어렵다. 실패한 node 명령을 직접 실행하여 확인:

```bash
# Gradle --debug 로그에서 실패 명령 추출 후 수동 실행
node --no-warnings --eval "require('expo/bin/autolinking')" \
  expo-modules-autolinking react-native-config --platform android --json

# 출력: Cannot find module 'babel-preset-expo'
```

## 해결

```bash
npx expo install babel-preset-expo
```

`npx expo install`을 사용하면 현재 Expo SDK 버전에 호환되는 버전이 자동 선택된다.

## 교훈

- Gradle 빌드 에러 중 `settings.gradle`에서 발생하는 node 명령 실패는 **JS 의존성 문제**일 가능성이 높다
- `--legacy-peer-deps` 사용 시 의존성 무결성을 별도로 검증해야 한다
- Gradle `--debug` 플래그로 실패한 정확한 명령을 확인한 후, 수동 실행하여 에러 메시지를 얻는 것이 효과적
- `expo-modules-autolinking`은 빌드 시 Babel을 사용하므로, `babel-preset-expo`는 dev dependency가 아닌 **빌드 필수 의존성**

## 관련 환경

- Expo SDK 55
- Android native build (`npx expo run:android`)
- npm with `--legacy-peer-deps`

## 발견일

2026-03-09
