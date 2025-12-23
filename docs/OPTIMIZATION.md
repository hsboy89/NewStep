# NewStep 성능 최적화 가이드

## 개요

NewStep은 rss2json API의 무료 티어 제한(일일 10,000건)을 고려하여 로컬 스토리지 캐싱을 통해 API 호출을 최소화합니다.

## 최적화 전략

### 1. 로컬 스토리지 캐싱

#### 캐시 유효 시간
- **캐시 유효 시간**: 1시간 (3,600,000ms)
- **이유**: rss2json API의 데이터 갱신 주기가 1시간이므로, 그보다 자주 호출해도 의미 없음

#### 캐시 확인 로직
```javascript
// src/store/newsStore.js
isCacheValid: () => {
  const lastChecked = get().lastCheckedTime
  if (!lastChecked) return false
  const cacheAge = Date.now() - new Date(lastChecked).getTime()
  const oneHour = 60 * 60 * 1000 // 1시간
  return cacheAge < oneHour
}
```

#### 사용 시나리오

**초기 로드:**
1. 캐시 확인
2. 캐시가 유효하고 데이터가 있으면 → API 호출 생략, 캐시된 데이터 사용
3. 캐시가 없거나 만료되었으면 → API 호출

**자동 업데이트:**
1. 1시간마다 자동으로 새 기사 체크
2. 캐시가 유효하면 → API 호출 생략
3. 캐시가 만료되었으면 → API 호출하여 새 기사 확인

**수동 새로고침:**
1. 사용자가 새로고침 버튼 클릭
2. 강제로 API 호출 (캐시 무시)

### 2. 자동 업데이트 간격 조정

#### 변경 전
- 업데이트 간격: 10분마다
- 일일 API 호출: 약 432회 (24시간 × 6회/시간 × 3개 피드)

#### 변경 후
- 업데이트 간격: 1시간마다
- 일일 API 호출: 약 24회 (24시간 × 1회/시간 × 3개 피드)
- **감소율**: 약 95% 감소

### 3. 사용자별 독립 캐싱

각 사용자의 브라우저에 독립적으로 캐시가 저장되므로:
- 사용자 A가 API를 호출해도 사용자 B의 캐시에는 영향 없음
- 사용자별로 1시간마다만 API 호출
- 동시 접속자 100명이어도 일일 약 2,400회 호출 (무료 티어 내)

## 구현 세부사항

### newsStore.js

```javascript
// 캐시 유효 시간 체크 함수
isCacheValid: () => {
  const lastChecked = get().lastCheckedTime
  if (!lastChecked) return false
  const cacheAge = Date.now() - new Date(lastChecked).getTime()
  const oneHour = 60 * 60 * 1000
  return cacheAge < oneHour
}
```

### Home.jsx

```javascript
const loadNews = async (forceRefresh = false) => {
  // 캐시 확인 (강제 새로고침이 아닌 경우)
  if (!forceRefresh) {
    const cacheValid = isCacheValid()
    const currentArticles = useNewsStore.getState().articles
    
    if (cacheValid && currentArticles.length > 0) {
      console.log('📦 캐시된 데이터 사용 (API 호출 생략)')
      return // 캐시가 유효하면 API 호출 안 함
    }
  }
  
  // API 호출...
}
```

## 성능 개선 효과

### API 호출 감소

| 시나리오 | 최적화 전 | 최적화 후 | 감소율 |
|---------|----------|----------|--------|
| 사용자 1명 | 432회/일 | 24회/일 | 95% ↓ |
| 사용자 10명 | 4,320회/일 | 240회/일 | 95% ↓ |
| 사용자 100명 | 43,200회/일 | 2,400회/일 | 95% ↓ |

### 사용자 경험 개선

1. **빠른 로딩**: 캐시된 데이터는 즉시 표시
2. **네트워크 절약**: 불필요한 API 호출 제거
3. **안정성 향상**: API 제한 내에서 안정적 운영

## rss2json API 제한사항

### 무료 플랜 제한
- **일일 요청 횟수**: 약 10,000건
- **데이터 갱신 주기**: 1시간 (60분)
- **기사 개수**: 최대 10개 (한 번에 최신 기사 10개까지만)
- **유지 기간**: 무제한

### 최적화 후 사용량 예상

최적화 후에도 안전하게 무료 티어 내에서 운영 가능:
- 사용자 100명: 약 2,400회/일 (여유 있음)
- 사용자 400명: 약 9,600회/일 (여전히 무료 티어 내)
- 사용자 500명 이상: 유료 플랜 고려 필요

## 모니터링

### 콘솔 로그 확인

브라우저 개발자 도구(F12)에서 다음 로그를 확인할 수 있습니다:

- `📦 캐시된 데이터 사용 (API 호출 생략)`: 캐시 사용 중
- `✅ 새로운 데이터를 불러왔습니다.`: API 호출 성공
- `📦 캐시가 아직 유효합니다. 새 기사 체크 생략`: 자동 업데이트 생략
- `🆕 새로운 기사 N개 발견!`: 새 기사 발견

### UI 표시

메인 페이지에서 캐시 상태를 확인할 수 있습니다:
- "📦 캐시된 데이터 사용 중" 메시지
- 다음 업데이트 시간 표시

## 향후 개선 방안

1. **서버 사이드 캐싱**: 백엔드 구축 시 서버에서 캐싱하여 모든 사용자가 공유
2. **Service Worker**: 오프라인 지원 및 더 효율적인 캐싱
3. **인덱스드DB**: 더 큰 데이터 저장 및 복잡한 쿼리 지원
4. **API 키 관리**: rss2json 유료 플랜 사용 시 API 키 환경 변수 관리

