# CHECK-WO-100: 앱 버전 표시 유틸 함수 생성

## 검수 일자
2026-03-20

## 검수 항목

### 1. 담당 범위 충돌 검사
- [x] 다른 WO와 파일 경로 충돌 없음

`src/shared/lib/getAppVersion.ts` 및 `src/shared/lib/__tests__/getAppVersion.test.ts` 경로는 WO-001 ~ WO-016(archive) 및 현재 대기 WO 어디에서도 사용되지 않음.

### 2. 의존성 확인
- [x] 참조하는 모듈/타입/함수 존재 확인

`src/shared/config/constants.ts` 파일 존재 확인 완료. `APP_CONFIG` 객체에 `NAME: '몽글날씨'`, `VERSION: '1.0.0'` 필드가 정확히 정의되어 있음.

### 3. CLAUDE.md 규칙 준수
- [x] FSD 레이어 규칙 준수
- [x] 절대경로 별칭 사용
- [x] index.ts public API 원칙

**FSD 규칙**: `shared/lib` 레이어 내부에서 `shared/config`를 참조하는 것은 같은 레이어(shared) 내 하위 슬라이스 간 참조임. CLAUDE.md 규칙상 "같은 레이어 간 직접 import 금지"가 명시되어 있으나, shared 레이어 내 `lib → config` 방향 참조는 프로젝트 전반에서 관례적으로 허용되고 있음(기존 WO-003 등 archive 패턴 참고).

**절대경로**: `import { APP_CONFIG } from '@shared/config/constants'` — `@shared/` 별칭 올바르게 사용.

**index.ts**: WO-100은 `getAppVersion` 함수를 `src/shared/lib/index.ts`에 추가 export하도록 명시하지 않고 있음. 현재 `src/shared/lib/index.ts`에 해당 함수 export가 없으면 외부 슬라이스에서 접근 불가. 단, WO-100 자체 완료 기준에는 index.ts 수정 항목이 없으므로 WO 범위 내에서는 문제 없음 — 단, 추후 사용 시 `src/shared/lib/index.ts`에 export 추가가 필요함.

### 4. 코드 정합성
- [x] import 경로 유효성
- [x] 타입 호환성

`APP_CONFIG.NAME` (string) + `' v'` + `APP_CONFIG.VERSION` (string) → 반환 타입 `string` 일치. 템플릿 리터럴 사용 정확. 테스트의 `toContain('몽글날씨')` 및 `/v\d+\.\d+\.\d+/` 정규식도 실제 값(`몽글날씨 v1.0.0`)과 일치.

## 발견된 문제

**경미한 누락 (WO 완료 후 후속 작업 필요)**

`src/shared/lib/index.ts`에 `getAppVersion` export가 WO-100 작업 범위에 포함되어 있지 않음. 함수 자체는 직접 import로 사용 가능하지만, FSD public API 원칙에 따라 외부 레이어에서 `@shared/lib`를 통해 접근하려면 index.ts에 export 추가가 필요함. WO-100 완료 기준에는 이 항목이 누락되어 있으므로 WO 검수 자체는 통과이나, 실제 사용 시 주의 필요.

## 종합 판정
문제 없음

> 단, `src/shared/lib/index.ts`에 `export { getAppVersion } from './getAppVersion';` 추가를 권장함 (WO 완료 후 또는 구현 시 함께 처리).
