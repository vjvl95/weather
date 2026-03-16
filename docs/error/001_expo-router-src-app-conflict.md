# ERR-001: expo-router "Unmatched Route" - src/app 디렉토리 충돌

## 증상

- 앱 실행 시 **"Unmatched Route Page could not be found"** 화면 표시
- 콘솔 경고: `Route "./index.tsx" is missing the required default export.`
- `app/` 디렉토리의 라우트 파일이 정상임에도 라우팅 실패
- Metro 캐시 클리어, 패키지 재설치 등으로 해결되지 않음

## 원인

expo-router는 라우터 루트 디렉토리를 자동 탐지하는 로직이 있다:

```javascript
// node_modules/@expo/cli/build/src/start/server/metro/router.js
function getRouterDirectory(projectRoot) {
    if (directoryExistsSync(path.join(projectRoot, 'src', 'app'))) {
        return path.join('src', 'app');  // src/app 우선!
    }
    return 'app';
}
```

**`src/app/` 디렉토리가 존재하면 `app/` 대신 `src/app/`을 라우터 루트로 사용한다.**

FSD(Feature-Sliced Design) 구조에서 `src/app/`을 앱 초기화 레이어로 사용하면, expo-router가 이를 라우트 디렉토리로 오인하여 실제 `app/` 디렉토리의 라우트 파일들이 전부 무시된다.

## 해결

### 방법 1: src/app 디렉토리 제거 (채택)

`src/app/` 디렉토리를 삭제하고, FSD app 레이어의 역할(프로바이더, 초기화)을 `app/_layout.tsx`에서 직접 처리한다.

```bash
rm -rf src/app
```

### 방법 2: app.json에서 라우터 루트 명시 지정

`src/app/`을 유지해야 한다면 `app.json`에서 라우터 루트를 명시적으로 지정할 수 있다:

```json
{
  "expo": {
    "extra": {
      "router": {
        "root": "app"
      }
    }
  }
}
```

## 교훈

- expo-router는 `src/app/` > `app/` 순서로 라우터 루트를 탐색한다
- FSD의 `src/app/` 레이어와 expo-router의 `app/` 디렉토리는 명명 충돌이 발생한다
- 라우팅 문제 디버깅 시 Metro 캐시뿐 아니라 **디렉토리 구조 자체**도 확인해야 한다

## 관련 환경

- Expo SDK 54
- expo-router 6.x
- FSD 아키텍처

## 발견일

2026-02-26
