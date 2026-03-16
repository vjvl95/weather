# ERR-006: Android SDK 경로 미설정으로 Gradle 빌드 실패

## 증상

- `npx expo run:android` 실행 시 Gradle 에러
- 에러 메시지: `SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file`

## 원인

Android Gradle 빌드는 Android SDK 경로를 다음 순서로 탐색한다:

1. `android/local.properties` 파일의 `sdk.dir`
2. `ANDROID_HOME` 환경변수
3. `ANDROID_SDK_ROOT` 환경변수 (deprecated)

`npx expo prebuild`로 생성된 `android/` 디렉토리에는 `local.properties`가 포함되지 않으며, 셸 프로필에 `ANDROID_HOME`이 설정되어 있지 않으면 빌드가 실패한다.

## 해결

### 방법 1: local.properties 생성 (채택)

```properties
# android/local.properties
sdk.dir=/Users/<username>/Library/Android/sdk
```

macOS 기본 Android SDK 경로: `/Users/<username>/Library/Android/sdk`

### 방법 2: 환경변수 설정

```bash
# ~/.zshrc 또는 ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 교훈

- `npx expo prebuild`는 `local.properties`를 자동 생성하지 않음
- `local.properties`는 `.gitignore`에 포함되는 것이 일반적 (머신별 경로)
- Android Studio에서 프로젝트를 열면 `local.properties`가 자동 생성됨 — CLI 전용 개발 시 수동 생성 필요

## 관련 환경

- macOS (Apple Silicon)
- Expo SDK 55
- Android Studio + CLI build

## 발견일

2026-03-09
