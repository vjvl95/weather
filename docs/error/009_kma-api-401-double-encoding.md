# ERR-009: 기상청 API 401 — serviceKey 이중 인코딩

## 증상

- 기상청 단기예보 API 호출 시 `401 Unauthorized` 응답
- API 키가 정상 발급되었음에도 인증 실패

## 원인

공공데이터포털에서 발급된 API 키는 이미 **URL 인코딩된 상태**입니다:

```
7JIX7LspGdO%2FMnbpG%2FHQU%2FbcgNUg8s2ZbXGNkp8I1VB%2BlmmVzzjXkPq2O4zLvUepIIuvhuWhlSVds1DuwSTFsA%3D%3D
```

`URLSearchParams`에 이 키를 넣으면 `%2F` → `%252F`로 **이중 인코딩**되어 서버에서 키를 인식하지 못합니다.

```typescript
// ❌ 이중 인코딩 발생 → 401
const params = new URLSearchParams({
  serviceKey: API_CONFIG.SERVICE_KEY,  // %2F가 %252F로 변환됨
  ...
});
const url = `${BASE_URL}?${params}`;
```

## 해결

`serviceKey`만 URL에 직접 붙이고, 나머지 파라미터는 `URLSearchParams`를 사용합니다:

```typescript
// ✅ serviceKey는 직접 붙이기 (이미 인코딩됨)
const params = new URLSearchParams({
  numOfRows: '1000',
  dataType: 'JSON',
  ...
});
const url = `${BASE_URL}?serviceKey=${API_CONFIG.SERVICE_KEY}&${params}`;
```

## 관련 파일

- `src/shared/lib/api.ts` — `fetchShortForecast`
- `src/shared/config/constants.ts` — `API_CONFIG.SERVICE_KEY`
