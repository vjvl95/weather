# docs 폴더 구조

> **docs 폴더는 "프로젝트의 두뇌"입니다.**
> 기획, 설계 결정, 에러 해결 기록, AI 협업 지시서가 모두 여기에 있습니다.
> Claude 세션을 시작할 때 항상 관련 docs 파일을 먼저 읽으세요.

```
docs/
├── CHARACTER_V1_ARCHITECTURE.md  # 몽글이 v1 캐릭터 아키텍처
├── SETUP_CHECKLIST.md  # 새 프로젝트 시작 체크리스트
├── design/             # 🎨 디자인 시스템 스펙
├── error/              # 🚨 트러블슈팅 기록 (가장 중요)
├── work-orders/        # 📋 작업 지시서 시스템
│   └── archive/        # 완료된 WO 보관
└── gamma-dispatch.md   # AI 2인 병렬 작업 시 프롬프트
```

## 하위 폴더별 안내

- **CHARACTER_V1_ARCHITECTURE.md**: 몽글이 v1 캐릭터 구현 방향 문서
- **error/**: 에러 목록은 `docs/error/README.md` 참고
- **design/**: 디자인 스펙 파일 목록은 `docs/design/` 안에서 직접 확인
- **work-orders/**: WO 시스템 파일 역할은 `docs/work-orders/README.md` 참고
