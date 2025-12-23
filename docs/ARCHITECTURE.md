# NewStep 아키텍처 문서

## 프로젝트 구조

```
newstep/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── Layout.jsx     # 전체 레이아웃 (헤더, 푸터, 네비게이션)
│   │   ├── NewsCard.jsx   # 뉴스 카드 컴포넌트
│   │   └── WordTooltip.jsx # 단어 툴팁 컴포넌트
│   │
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.jsx       # 메인 페이지 (뉴스 목록)
│   │   ├── Reader.jsx     # 독해 페이지 (기사 읽기)
│   │   └── Voca.jsx       # 단어장 페이지
│   │
│   ├── store/              # Zustand 상태 관리
│   │   ├── newsStore.js   # 뉴스 관련 상태 (기사 목록, 필터, 로딩 상태)
│   │   └── vocaStore.js   # 단어장 관련 상태 (저장된 단어들)
│   │
│   ├── utils/              # 유틸리티 함수
│   │   ├── rssParser.js   # RSS 피드 파싱
│   │   ├── dictionary.js  # 사전 API 연동
│   │   └── textToSpeech.js # TTS 기능
│   │
│   ├── App.jsx            # 메인 앱 컴포넌트 (라우팅)
│   ├── main.jsx           # 진입점
│   └── index.css          # 전역 스타일
│
├── docs/                   # 문서
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 상태 관리 (State Management)

### Zustand 스토어 구조

#### 1. newsStore.js
뉴스 관련 전역 상태를 관리합니다.

**상태:**
- `articles`: 기사 배열
- `selectedLevel`: 선택된 난이도 ('all', '1', '2', '3')
- `selectedCategory`: 선택된 카테고리
- `lastCheckedTime`: 마지막 업데이트 시간
- `loading`: 로딩 상태
- `error`: 에러 메시지

**액션:**
- `setArticles`: 기사 목록 설정
- `setSelectedLevel`: 난이도 필터 설정
- `setSelectedCategory`: 카테고리 필터 설정
- `addArticle`: 새 기사 추가
- `getFilteredArticles`: 필터링된 기사 목록 반환

**영속성:**
- 로컬 스토리지에 `articles`와 `lastCheckedTime` 저장

#### 2. vocaStore.js
단어장 관련 전역 상태를 관리합니다.

**상태:**
- `words`: 저장된 단어 배열

**액션:**
- `addWord`: 단어 추가
- `removeWord`: 단어 삭제
- `getWord`: 특정 단어 조회
- `clearWords`: 모든 단어 삭제

**영속성:**
- 로컬 스토리지에 `words` 배열 저장

---

## 데이터 흐름 (Data Flow)

### 1. 뉴스 데이터 로딩
```
Home 컴포넌트
  ↓ (마운트 시)
useEffect → loadNews()
  ↓
fetchNewsFromRSS('all')
  ↓
rss2json API 호출
  ↓
데이터 파싱 및 변환
  ↓
newsStore.setArticles()
  ↓
컴포넌트 리렌더링
```

### 2. 단어 클릭 → 사전 조회
```
Reader 컴포넌트 (단어 클릭)
  ↓
handleWordClick()
  ↓
WordTooltip 컴포넌트 표시
  ↓
useEffect → fetchWordDefinition()
  ↓
Dictionary API 호출
  ↓
단어 정보 표시
  ↓ (사용자가 저장 버튼 클릭)
vocaStore.addWord()
  ↓
로컬 스토리지 저장
```

### 3. TTS 재생
```
Reader 컴포넌트 (듣기 버튼 클릭)
  ↓
handlePlayText()
  ↓
speakText() (Web Speech API)
  ↓
브라우저 TTS 엔진으로 음성 재생
```

---

## 컴포넌트 계층 구조

```
App
└── Router
    └── Layout
        ├── Header (네비게이션)
        ├── Routes
        │   ├── Home
        │   │   ├── FilterControls (난이도/카테고리 필터)
        │   │   └── NewsCard[] (기사 카드 리스트)
        │   │
        │   ├── Reader
        │   │   ├── ArticleHeader (제목, 메타 정보)
        │   │   ├── ArticleContent (본문, 클릭 가능한 단어)
        │   │   ├── WordTooltip (조건부 렌더링)
        │   │   └── TTS Controls
        │   │
        │   └── Voca
        │       └── WordCard[] (단어 카드 리스트)
        │
        └── Footer
```

---

## API 연동

### 1. RSS 피드 파싱 (rss2json)
```
URL: https://api.rss2json.com/v1/api.json?rss_url={RSS_URL}
Method: GET
Response: {
  status: "ok",
  items: [
    {
      title: "...",
      description: "...",
      content: "...",
      link: "...",
      pubDate: "...",
      thumbnail: "..."
    }
  ]
}
```

### 2. 사전 API (Free Dictionary API)
```
URL: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
Method: GET
Response: [
  {
    word: "...",
    phonetic: "...",
    phonetics: [...],
    meanings: [
      {
        partOfSpeech: "...",
        definitions: [
          {
            definition: "...",
            example: "...",
            synonyms: [...]
          }
        ]
      }
    ]
  }
]
```

### 3. Web Speech API
브라우저 내장 API (별도 서버 불필요)
- `speechSynthesis.speak(utterance)`: 음성 재생
- `speechSynthesis.cancel()`: 재생 중지

---

## 주요 유틸리티 함수

### rssParser.js
- `fetchNewsFromRSS(level)`: RSS 피드에서 기사 목록 가져오기
- `cleanContent(html)`: HTML 태그 제거 및 텍스트 정리
- `extractCategory(title, description)`: 카테고리 추출
- `extractKeywords(title, description)`: 키워드 추출

### dictionary.js
- `fetchWordDefinition(word)`: 단어 정의 조회

### textToSpeech.js
- `speakText(text, language)`: 텍스트를 음성으로 재생
- `stopSpeaking()`: 음성 재생 중지
- `pauseSpeaking()`: 음성 일시정지
- `resumeSpeaking()`: 음성 재개

---

## 스타일링

### Tailwind CSS
- 유틸리티 퍼스트 접근 방식
- 반응형 디자인 (sm, md, lg 브레이크포인트)
- 커스텀 색상:
  - Level 1: green-600
  - Level 2: yellow-600
  - Level 3: red-600
  - 기본: blue-600

### 주요 클래스 패턴
- 카드: `bg-white rounded-lg shadow-md hover:shadow-lg`
- 버튼: `px-4 py-2 bg-{color}-600 text-white rounded-lg hover:bg-{color}-700`
- 배지: `px-2 py-1 rounded text-xs font-semibold bg-{color}-100 text-{color}-800`

---

## 성능 최적화

1. **로컬 스토리지 캐싱**: 기사 목록과 단어장을 로컬 스토리지에 저장하여 재방문 시 빠른 로딩
2. **조건부 렌더링**: WordTooltip은 단어 클릭 시에만 렌더링
3. **디바운싱**: 자동 업데이트는 10분 간격으로 제한
4. **이미지 로딩 에러 처리**: 썸네일 로드 실패 시 숨김 처리

---

## 향후 확장 가능성

1. **서버 사이드 렌더링 (SSR)**: Next.js로 마이그레이션
2. **백엔드 API**: 자체 백엔드 구축하여 RSS 파싱 및 캐싱
3. **사용자 인증**: Firebase Auth 등을 통한 계정 연동
4. **클라우드 동기화**: 단어장과 학습 진행상황 클라우드 저장
5. **AI 기능**: OpenAI API를 통한 요약 및 퀴즈 생성

