# ERR-007: Windows에서 Expo Android 로컬 실행이 안 될 때 바로 테스트하는 체크리스트

## 대상

- Windows 10/11
- Android Emulator 또는 USB 연결 실기기
- Expo SDK 55 기반 Dev Client / 로컬 Android 빌드

## 증상

- `npx expo run:android` 또는 `.\gradlew.bat installDebug`가 실패한다
- 앱은 설치되지만 흰 화면이 뜨거나 JS 번들을 못 받는다
- `Unable to download JS bundle` 또는 `URL: http://10.0.2.2:8081/...` 에러가 나온다
- `expo-doctor` 또는 `babel-preset-expo` 관련 에러가 나온다

## 원인

Windows에서 가장 자주 막히는 지점은 아래 네 가지다:

1. `git pull` 후 `node_modules`와 `package-lock.json` 상태가 어긋남
2. Android SDK / JDK 경로가 정확히 안 잡힘
3. 에뮬레이터 또는 ADB 연결이 안 됨
4. `8081` 포트를 다른 Metro 서버가 이미 쓰고 있어서 앱이 엉뚱한 프로젝트에 붙음

## 바로 테스트 체크리스트

모든 명령은 프로젝트 루트에서 PowerShell 기준으로 실행한다.

### 1. 의존성 상태 확인

```powershell
node -v
npm -v
npm install
npm run doctor -- --verbose
```

통과 기준:

- `npm run doctor -- --verbose`가 `17/17 checks passed`로 끝난다

여기서 자주 나오는 에러:

- `expo-doctor: command not found`
- `Cannot find module 'babel-preset-expo'`

이 둘은 대부분 `npm install`로 해결된다.

### 2. Android SDK / JDK 경로 확인

```powershell
where adb
where emulator
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
```

통과 기준:

- `adb`, `emulator` 경로가 출력된다
- `ANDROID_HOME`이 Android SDK 경로를 가리킨다
- `JAVA_HOME`이 JDK 17 경로를 가리킨다

Android SDK를 못 찾는다면 `android\local.properties`를 만든다:

```properties
sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

### 3. 에뮬레이터 / 디바이스 연결 확인

```powershell
adb devices
emulator -list-avds
```

에뮬레이터가 안 떠 있으면:

```powershell
emulator @<AVD_NAME>
adb wait-for-device
adb shell getprop sys.boot_completed
```

통과 기준:

- `adb devices`에 장치가 보인다
- `sys.boot_completed` 결과가 `1`이다

### 4. 네이티브 빌드만 먼저 확인

```powershell
npx expo prebuild --platform android --no-install
cd android
.\gradlew.bat assembleDebug
cd ..
```

통과 기준:

- Gradle 출력에 `BUILD SUCCESSFUL`이 보인다

여기서 `settings.gradle`에서 `node` exit code 1이 나면, 대부분 JS 의존성 설치가 깨진 상태다. 다시 `npm install`부터 확인한다.

### 5. Metro 포트 충돌 확인

```powershell
netstat -ano | findstr :8081
```

이미 `8081`을 다른 프로젝트가 쓰고 있으면, 이 프로젝트는 다른 포트로 띄워야 한다.

예시: `8082` 사용

터미널 1:

```powershell
npx expo start --dev-client --android --port 8082
```

터미널 2:

```powershell
cd android
.\gradlew.bat installDebug -PreactNativeDevServerPort=8082
cd ..
```

핵심:

- Metro 포트와 `installDebug -PreactNativeDevServerPort=<port>` 값이 반드시 같아야 한다
- 앱이 한 번 `8081` 기준으로 설치되었다면, 포트를 바꾼 뒤 다시 설치해야 한다

### 6. 앱이 실제로 떴는지 확인

```powershell
adb shell pidof com.myapp.app
adb shell dumpsys activity activities | findstr com.myapp.app/.MainActivity
```

통과 기준:

- PID가 출력된다
- `MainActivity`가 `ResumedActivity` 또는 `topResumedActivity`로 보인다

### 7. JS 번들이 실제로 로드됐는지 확인

```powershell
adb logcat -d -t 200 | findstr /i "ReactNativeJS Running main Unable to download JS bundle"
```

통과 기준:

- `Running "main"` 로그가 보인다

실패 패턴:

- `Unable to download JS bundle`
- URL이 `10.0.2.2:8081`처럼 잘못된 포트를 가리킴

이 경우는 거의 항상 앱이 다른 Metro 포트를 보고 있는 상태다. 5번 단계대로 다시 설치한다.

## 최소 성공 루트

아래 순서가 가장 빠르게 검증된다:

1. `npm install`
2. `npm run doctor -- --verbose`
3. `adb devices`
4. `cd android && .\gradlew.bat assembleDebug`
5. 포트 충돌 없으면 `npx expo start --dev-client --android`
6. 포트 충돌 있으면 `npx expo start --dev-client --android --port 8082`
7. 그 경우 `.\gradlew.bat installDebug -PreactNativeDevServerPort=8082`

## 교훈

- Windows 문제처럼 보여도 실제 원인은 프로젝트 의존성 불일치인 경우가 많다
- Dev Client는 Metro 포트와 앱 내부 dev server 포트가 다르면 정상 실행되지 않는다
- `npm run doctor`와 `.\gradlew.bat assembleDebug`를 먼저 통과시키면, 문제를 절반 이상 줄일 수 있다

## 관련 환경

- Windows 10/11
- Expo SDK 55
- Android Emulator
- Expo Dev Client

## 발견일

2026-03-18
