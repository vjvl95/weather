# 에러 해결 기록 (Error Log)

> 개발 중 실제로 겪었던 트러블슈팅 기록입니다.
> 새 프로젝트 시작 시 반드시 숙지하세요 — 같은 실수를 반복하지 않기 위해.

---

## 에러 목록

| 번호 | 파일 | 요약 | 환경 |
|------|------|------|------|
| ERR-001 | [001_expo-router-src-app-conflict.md](./001_expo-router-src-app-conflict.md) | `src/app/` 존재 시 expo-router 라우팅 실패 | FSD + expo-router |
| ERR-002 | [002_metro-config-missing-nativewind.md](./002_metro-config-missing-nativewind.md) | `metro.config.js` 누락으로 NativeWind 스타일 전체 미적용 | NativeWind v4 |
| ERR-003 | [003_index-js-missing-android.md](./003_index-js-missing-android.md) | `index.js` 누락으로 Android 네이티브 빌드 번들 로딩 실패 | EAS Dev Client (Android) |
| ERR-004 | [004_redirect-usefonts-infinite-remount.md](./004_redirect-usefonts-infinite-remount.md) | `<Redirect>` + `useFonts` 에러 조합으로 무한 리마운트 루프 | expo-router + expo-font |
| ERR-005 | [005_babel-preset-expo-missing.md](./005_babel-preset-expo-missing.md) | `babel-preset-expo` 누락으로 Gradle 빌드 실패 | Android native build |
| ERR-006 | [006_android-sdk-location-not-found.md](./006_android-sdk-location-not-found.md) | Android SDK 경로 미설정으로 Gradle 빌드 실패 | macOS + Android CLI |

---

## 새 에러 추가 방법

```
docs/error/
└── 00N_에러-키워드-요약.md
```

파일명 형식: `[번호]_[핵심-키워드].md`

문서 형식: 증상 → 원인 → 해결 → 교훈 → 관련 환경 → 발견일

---

## 자주 발생하는 패턴

### FSD + expo-router 조합 주의
- `src/app/` 폴더 사용 금지 → ERR-001

### NativeWind 세팅 체크리스트
- `metro.config.js` 존재 확인 → ERR-002
- `tailwind.config.js` content 경로 확인
- `babel.config.js` `jsxImportSource` 확인
- `src/global.css` `@tailwind` 지시문 확인

### EAS Dev Client / Android 빌드 체크리스트
- 프로젝트 루트에 `index.js` 존재 확인 → ERR-003
- `babel-preset-expo` 설치 확인 → ERR-005
- Android SDK 경로 설정 확인 → ERR-006

### expo-router _layout.tsx 작성 주의
- `<Redirect>`를 `<Stack>` 외부 조건부 렌더 금지 → ERR-004
- 폰트 에러도 "완료"로 처리 (Dev Client 한정 현상) → ERR-004
