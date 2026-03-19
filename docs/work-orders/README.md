# 작업 지시서 (Work Orders) — 몽글날씨

## 마일스톤 목표

> **"몽글이가 날씨를 알려주는 v1 앱 완성 — GPS 위치 기반 현재/시간별/주간 날씨 + 캐릭터 교감"**

---

## 의존성 그래프

```
Wave 1 (동시 진행 가능) ─ 선행 작업, 의존성 없음
├── WO-001: 공통 타입 및 날씨 상수         → src/shared/types/, src/shared/config/
└── WO-002: 에셋 배치 및 탭 네비게이션     → src/shared/assets/, app/
        │
        ▼
Wave 2 (동시 진행 가능) ─ Wave 1 완료 후
├── WO-003: 기상청 API 유틸 + 좌표 변환   [의존: WO-001]  → src/shared/lib/
├── WO-004: Weather 엔티티                 [의존: WO-001]  → src/entities/weather/
├── WO-005: Location Feature               [의존: WO-001]  → src/features/location/
└── WO-007: Character Feature              [의존: WO-001]  → src/features/character/
        │
        ▼
Wave 3 (동시 진행 가능) ─ Wave 2 완료 후
├── WO-006: Weather Fetch Feature          [의존: WO-003, WO-005]  → src/features/weather-fetch/
├── WO-008: Character View 위젯           [의존: WO-002, WO-007]  → src/widgets/character-view/
└── WO-009: Forecast 위젯                  [의존: WO-004]          → src/widgets/forecast/
        │
        ▼
Wave 4 (동시 진행 가능) ─ Wave 3 완료 후
├── WO-010: 홈 페이지 조립                 [의존: WO-006, WO-008]  → src/pages/home/
├── WO-011: 시간별/주간 예보 페이지        [의존: WO-006, WO-009]  → src/pages/hourly/, weekly/
└── WO-012: 설정 + 도시 검색 페이지        [의존: WO-005]          → src/pages/settings/, city-search/
        │
        ▼
Wave 5 ─ Wave 4 완료 후
└── WO-013: 통합 테스트 및 테마 연동       [의존: WO-010~012]      → app/, features/theme-manager/
```

---

## 충돌 방지 규칙 (필독)

1. **각 WO는 "담당 경로"에 명시된 파일/폴더만 생성·수정·삭제한다**
2. 다른 WO의 담당 경로에 있는 파일을 **절대** 수정하지 않는다
3. 같은 Wave 내 WO끼리는 담당 경로가 완전히 분리되어 있으므로 동시 작업 가능
4. 다른 WO에서 export한 모듈을 import하는 것은 허용 (읽기 전용)
5. `src/shared/` 하위 index.ts는 해당 서브폴더 WO 담당자만 수정

---

## WO 총괄표

| WO | 제목 | Wave | 담당 경로 | 의존성 | 예상 소요 |
|----|------|:----:|-----------|--------|:---------:|
| 001 | 공통 타입 및 날씨 상수 | 1 | `src/shared/types/`, `src/shared/config/` | 없음 | 1~2h |
| 002 | 에셋 배치 및 탭 네비게이션 | 1 | `src/shared/assets/`, `app/` | 없음 | 1~2h |
| 003 | 기상청 API 유틸 + 좌표 변환 | 2 | `src/shared/lib/` | WO-001 | 2~3h |
| 004 | Weather 엔티티 | 2 | `src/entities/weather/` | WO-001 | 1~2h |
| 005 | Location Feature | 2 | `src/features/location/` | WO-001 | 2~3h |
| 007 | Character Feature | 2 | `src/features/character/` | WO-001 | 1~2h |
| 006 | Weather Fetch Feature | 3 | `src/features/weather-fetch/` | WO-003, 005 | 2~3h |
| 008 | Character View 위젯 | 3 | `src/widgets/character-view/` | WO-002, 007 | 3~4h |
| 009 | Forecast 위젯 | 3 | `src/widgets/hourly-forecast/`, `weekly-forecast/` | WO-004 | 2~3h |
| 010 | 홈 페이지 조립 | 4 | `src/pages/home/` | WO-006, 008 | 2~3h |
| 011 | 시간별/주간 예보 페이지 | 4 | `src/pages/hourly/`, `src/pages/weekly/` | WO-006, 009 | 1~2h |
| 012 | 설정 + 도시 검색 페이지 | 4 | `src/pages/settings/`, `src/pages/city-search/` | WO-005 | 2~3h |
| 013 | 통합 테스트 및 테마 연동 | 5 | `app/`, `src/features/theme-manager/` | WO-010~012 | 2~3h |

---

## 작업 순서 요약

```
Wave 1 → WO-001, WO-002 동시 진행
Wave 2 → WO-003, WO-004, WO-005, WO-007 동시 진행
Wave 3 → WO-006, WO-008, WO-009 동시 진행
Wave 4 → WO-010, WO-011, WO-012 동시 진행
Wave 5 → WO-013 진행 (최종 통합)
```

> 각 Wave는 이전 Wave가 모두 완료 & 머지된 후 시작한다.

---

## 기술 스택 (공통)

| 항목 | 선택 |
|------|------|
| 프레임워크 | Expo SDK 55 |
| 언어 | TypeScript (strict mode) |
| 아키텍처 | FSD (Feature-Sliced Design) |
| 스타일링 | NativeWind v4 |
| 상태관리 | Zustand 5.x |
| 애니메이션 | React Native Reanimated 4.x |
| 네비게이션 | expo-router |
| 날씨 API | 기상청 단기/중기예보 (공공데이터포털) |
| 패키지 매니저 | npm |

---

## FSD import 규칙 (전 WO 공통)

```
상위 → 하위만 허용:
app → pages → widgets → features → entities → shared
```

- 같은 레이어 간 직접 import 금지
- 절대경로 필수 (`@shared/`, `@entities/`, `@features/`, `@widgets/`, `@pages/`)
- 각 슬라이스의 `index.ts`에서 public API만 export
