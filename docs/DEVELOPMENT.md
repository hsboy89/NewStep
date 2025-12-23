# NewStep 개발 가이드

## 개발 환경 설정

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 초기 설정

```bash
# 프로젝트 클론 또는 다운로드
cd newstep

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

---

## 프로젝트 구조 이해하기

### 컴포넌트 개발 규칙

1. **함수형 컴포넌트 사용**: 모든 컴포넌트는 함수형 컴포넌트로 작성
2. **Props 타입 정의**: PropTypes 또는 TypeScript 사용 권장 (현재는 주석으로 문서화)
3. **컴포넌트 분리 원칙**: 재사용 가능한 컴포넌트는 `components/` 폴더에, 페이지는 `pages/` 폴더에

### 스타일링 규칙

1. **Tailwind CSS 사용**: 인라인 클래스로 스타일 적용
2. **반응형 디자인**: `sm:`, `md:`, `lg:` 브레이크포인트 활용
3. **일관된 색상 시스템**:
   - Primary: `blue-600`
   - Success: `green-600`
   - Warning: `yellow-600`
   - Danger: `red-600`
   - Gray scale: `gray-50` ~ `gray-900`

### 상태 관리 규칙

1. **Zustand 사용**: 전역 상태는 Zustand 스토어에 저장
2. **로컬 상태**: 컴포넌트 내부 상태는 `useState` 사용
3. **영속성**: 사용자 데이터(단어장, 기사 목록)는 persist 미들웨어로 로컬 스토리지에 저장

---

## 새로운 기능 추가하기

### 1. 새로운 페이지 추가

1. `src/pages/` 폴더에 새 컴포넌트 생성
2. `src/App.jsx`에 라우트 추가:

```jsx
import NewPage from './pages/NewPage'

// Routes 내부에
<Route path="/new-page" element={<NewPage />} />
```

3. 필요시 `Layout.jsx`의 네비게이션에 링크 추가

### 2. 새로운 컴포넌트 추가

1. `src/components/` 폴더에 컴포넌트 생성
2. 재사용 가능한 컴포넌트는 Props 인터페이스 문서화
3. Tailwind CSS로 스타일링

**예시:**
```jsx
// src/components/NewComponent.jsx
/**
 * 새 컴포넌트 설명
 * @param {Object} props
 * @param {string} props.title - 제목
 * @param {Function} props.onClick - 클릭 핸들러
 */
const NewComponent = ({ title, onClick }) => {
  return (
    <div className="bg-white p-4 rounded-lg">
      <h2>{title}</h2>
      <button onClick={onClick}>Click</button>
    </div>
  )
}

export default NewComponent
```

### 3. 새로운 스토어 추가

1. `src/store/` 폴더에 새 스토어 파일 생성
2. Zustand 패턴 따르기:

```jsx
// src/store/newStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNewStore = create(
  persist(
    (set, get) => ({
      // 상태
      data: [],
      
      // 액션
      setData: (data) => set({ data }),
      addItem: (item) => set({ data: [...get().data, item] })
    }),
    {
      name: 'new-storage',
      partialize: (state) => ({ data: state.data })
    }
  )
)
```

---

## 디버깅

### 개발자 도구 활용

1. **React DevTools**: 컴포넌트 계층 구조 및 Props 확인
2. **Redux DevTools**: Zustand 스토어 상태 확인 (Zustand DevTools 확장 설치)
3. **Network 탭**: API 요청 확인 및 응답 검사

### 일반적인 문제 해결

#### RSS 피드가 로드되지 않음
- CORS 문제일 수 있음 → rss2json API 사용 확인
- RSS URL이 올바른지 확인
- 네트워크 요청 실패 여부 확인

#### 단어 정의가 표시되지 않음
- Dictionary API 응답 확인 (Network 탭)
- 단어가 존재하는지 확인 (고유명사, 축약어 등은 API에서 지원하지 않을 수 있음)
- 에러 핸들링 로직 확인

#### TTS가 작동하지 않음
- 브라우저가 Web Speech API를 지원하는지 확인
- HTTPS 환경인지 확인 (일부 브라우저는 HTTP에서 TTS 제한)
- 음성 재생 권한 확인

#### 로컬 스토리지 데이터가 사라짐
- 브라우저 설정에서 쿠키/로컬 스토리지 차단 여부 확인
- 시크릿 모드에서는 저장되지 않음
- 브라우저 데이터 삭제 시 초기화됨

---

## 테스트

### 수동 테스트 체크리스트

- [ ] 메인 페이지에서 뉴스 목록이 정상적으로 표시되는가?
- [ ] 난이도 필터가 정상적으로 작동하는가?
- [ ] 카테고리 필터가 정상적으로 작동하는가?
- [ ] 기사 클릭 시 상세 페이지로 이동하는가?
- [ ] 단어 클릭 시 툴팁이 표시되는가?
- [ ] 단어 저장 기능이 작동하는가?
- [ ] TTS 재생이 정상적으로 작동하는가?
- [ ] 단어장 페이지에서 저장된 단어가 표시되는가?
- [ ] 새로고침 시 데이터가 유지되는가?

### 브라우저 호환성 테스트

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

---

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 배포 옵션

1. **Vercel**: Vite 프로젝트 자동 감지 및 배포
2. **Netlify**: 빌드 명령어 `npm run build`, 출력 디렉토리 `dist`
3. **GitHub Pages**: GitHub Actions를 통한 자동 배포 설정 필요

### 환경 변수 (필요 시)

`.env` 파일 생성 (현재는 사용하지 않음, 향후 API 키 등이 필요할 수 있음):

```
VITE_RSS2JSON_API_KEY=your_api_key
VITE_DICTIONARY_API_URL=https://api.dictionaryapi.dev
```

---

## 코드 컨벤션

### 네이밍 규칙

- **컴포넌트**: PascalCase (`NewsCard.jsx`)
- **함수/변수**: camelCase (`fetchNews`, `selectedLevel`)
- **상수**: UPPER_SNAKE_CASE (`RSS_FEEDS`, `DICTIONARY_API`)
- **파일명**: 컴포넌트는 PascalCase, 유틸리티는 camelCase

### 코드 포맷팅

- 2칸 들여쓰기
- 세미콜론 사용
- 작은따옴표 사용 (큰따옴표는 JSX에서만)

### 주석 작성

- 복잡한 로직은 주석으로 설명
- 함수는 JSDoc 스타일 주석 권장
- TODO 주석 사용 가능

---

## 성능 최적화 팁

1. **이미지 최적화**: 썸네일은 가능한 한 작은 크기로 로드
2. **리렌더링 최소화**: `useMemo`, `useCallback` 적절히 사용
3. **코드 스플리팅**: 필요시 React.lazy() 사용
4. **번들 크기 최적화**: 사용하지 않는 라이브러리 제거

---

## 문제 해결 및 FAQ

### Q: RSS 피드가 로드되지 않아요.
A: rss2json API의 일일 제한에 도달했을 수 있습니다. 브라우저 콘솔에서 에러 메시지를 확인하세요.

### Q: 단어 정의가 표시되지 않아요.
A: Dictionary API가 해당 단어를 찾지 못했을 수 있습니다. 고유명사나 특수한 용어는 정의가 없을 수 있습니다.

### Q: TTS 음성이 너무 빨라요/느려요.
A: `textToSpeech.js`의 `utterance.rate` 값을 조정하세요 (0.1 ~ 10).

### Q: 로컬 스토리지가 가득 찼어요.
A: 저장된 단어가 너무 많을 수 있습니다. 단어장 삭제 기능을 사용하거나 브라우저 설정에서 로컬 스토리지 용량을 확인하세요.

---

## 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 브랜치 생성 (`feature/새기능` 또는 `fix/버그수정`)
3. 변경사항 커밋 및 푸시
4. Pull Request 생성

