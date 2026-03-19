# 새 프로젝트 시작 체크리스트

> 이 템플릿을 클론한 직후 반드시 아래 순서대로 진행하세요.

---

## 1단계 — 식별자 교체

| 파일                  | 변경 항목                | 예시                    |
| --------------------- | ------------------------ | ----------------------- |
| `package.json`        | `"name"`                 | `"my-new-app"`          |
| `app.json`            | `name`, `slug`, `scheme` | `"나의 앱"`, `"my-app"` |
| `app.json`            | `ios.bundleIdentifier`   | `"com.mycompany.myapp"` |
| `app.json`            | `android.package`        | `"com.mycompany.myapp"` |
| `CLAUDE.md` (이 파일) | 프로젝트명 및 기획 내용  | 직접 작성               |

## 2단계 — 템플릿 예제 파일 제거

새 프로젝트에 맞지 않는 예제 파일들을 삭제합니다:

```bash
# 예제 엔티티 / 피처 삭제
rm -rf src/entities/example
rm -rf src/features/counter

# 예제 페이지 삭제 (필요에 따라)
rm -rf src/pages/detail
```

> **⛔ `src/app/` 폴더는 절대 생성하지 마세요** (이 템플릿에서는 이미 제거됨)
> expo-router가 `src/app/`을 라우터 루트로 오인하여 `app/` 디렉토리의
> 라우트가 전부 무시됩니다. → `docs/error/001_expo-router-src-app-conflict.md` 참고

## 3단계 — 의존성 설치 및 확인

```bash
npm install

# NativeWind 핵심 설정 확인 (ERR-002 방지)
# ✅ metro.config.js withNativeWind 확인
# ✅ tailwind.config.js content 경로 확인
# ✅ babel.config.js jsxImportSource + nativewind/babel 확인
# ✅ src/global.css @tailwind 지시문 확인
# ✅ web 지원 시 app.json web.bundler = "metro" 확인
```

## 4단계 — EAS 설정 (네이티브 빌드 필요 시)

```bash
# eas.json 생성
eas build:configure

# Android 빌드 전 확인 (ERR-003, ERR-005, ERR-006 방지)
# ✅ package.json main = expo-router/entry 확인
# ✅ (템플릿 유지 시) 루트 index.js 브리지 확인
# ✅ babel-preset-expo 설치 확인
# ✅ Android SDK 경로 설정 확인
```

## 5단계 — docs 문서 작성

```
docs/work-orders/README.md  ← 이 프로젝트의 WO 의존성 그래프 작성
docs/work-orders/ROADMAP.md ← 마일스톤 및 WO 목록 작성
```
