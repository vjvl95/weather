# App (Layer 1)

앱 초기화, 프로바이더, 글로벌 설정.

## 규칙

- **모든 레이어를 import 가능** (최상위 레이어)
- 글로벌 Provider, 초기화 로직, 앱 레벨 설정을 배치
- 실제 라우팅은 프로젝트 루트의 `app/` 디렉토리(expo-router)에서 처리
- 이 폴더는 FSD의 app 레이어로, 필요 시 Provider 래퍼 등을 배치

## 폴더 구조

```
app/
├── providers/       # (선택) Context Provider 래퍼
└── README.md
```
