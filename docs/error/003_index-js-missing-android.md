# ERR-003: expo-router entry 설정과 index.js 브리지 혼동

## 증상

- 문서에는 루트 `index.js`가 "반드시 필요"하다고 적혀 있는데, 실제 Expo Router 기본 설치 문서는 그렇게 설명하지 않음
- 어떤 세션에서는 `package.json`의 `"main": "expo-router/entry"`만 유지하고, 다른 세션에서는 루트 `index.js`를 추가하려고 해서 기준이 흔들림
- 네이티브 빌드 이슈를 조사할 때 "무조건 index.js부터 추가"하는 잘못된 대응으로 이어질 수 있음

## 원인

Expo Router의 **기본 엔트리포인트는 `package.json`의 `"main": "expo-router/entry"`** 이다. 공식 설치 가이드도 이를 기준으로 설명한다.

다만 프로젝트에 따라 루트 `index.js`를 한 줄짜리 브리지로 유지하는 경우가 있다:

```javascript
// index.js
import 'expo-router/entry';
```

이 파일은 **호환성용 브리지**로는 쓸 수 있지만, Expo Router 기본 설치의 보편 규칙처럼 문서화하면 오해를 만든다.

### 혼동이 생긴 지점

```json
{
  "main": "expo-router/entry"
}
```

- `main` 설정은 기본 엔트리포인트다
- `index.js`는 일부 프로젝트에서 추가로 두는 브리지다
- 둘을 구분하지 않고 "index.js가 반드시 필요"라고 단정한 것이 문제였다

## 해결

다음 기준으로 문서를 정리한다:

1. 기본 원칙은 `package.json`의 `"main": "expo-router/entry"`로 설명한다.
2. 루트 `index.js`를 둘 경우, **호환성 브리지**라는 점을 명시한다.
3. `index.js`는 아래 한 줄 외의 로직을 넣지 않는다.

```javascript
// index.js
import 'expo-router/entry';
```

현재 템플릿은 네이티브/Dev Client 환경에서의 혼선을 줄이기 위해 이 브리지를 유지한다.

## 교훈

- Expo Router의 기본 엔트리는 `package.json#main`이다
- 루트 `index.js`는 선택적인 호환성 브리지로 취급해야 한다
- 네이티브 빌드 이슈를 entry 파일 하나로 단정하지 말고, `main`, Metro 설정, native build 로그를 함께 확인한다

## 관련 환경

- Expo SDK 55
- expo-router
- EAS Dev Client (Android)
- custom entry bridge (`index.js`)

## 발견일

2026-03-09
