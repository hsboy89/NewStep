# NewStep PRD (Product Requirements Document)

## 1. 프로젝트 개요

### 목적
영어 뉴스(RSS/API)를 활용하여 학생들의 수준에 맞는 읽기/듣기 학습 환경 제공

### 타겟
영어 기사로 공부하고 싶은 중·고등학생 및 대학생

### 핵심 가치
"어려운 외신을 내 수준에 맞춰 쉽고 재미있게 읽자."

---

## 2. 사용자 기능 요구사항 (Functional Requirements)

### 2.1. 뉴스 큐레이션 및 필터링

#### 기사 목록 조회
- RSS(News in Levels, VOA, BBC 등)를 통해 최신 뉴스 피드를 카드 형태로 나열
- 썸네일, 제목, 요약, 발행일 표시

#### 난이도 선택
- 상단 탭이나 토글을 통해 선택
- **Basic (Level 1)**: 초급 - 1,000단어 수준
- **Intermediate (Level 2)**: 중급 - 2,000단어 수준
- **Advanced (Level 3)**: 고급 - 3,000단어 수준
- 전체 보기 옵션

#### 카테고리 분류
- 경제, 과학, 기술, 환경, 스포츠, 건강, 정치, 문화 등
- 관심 분야별 필터링 기능

### 2.2. 인터랙티브 독해 도구

#### 클릭 사전 (Click-to-Definition)
- 본문의 단어를 클릭하면 툴팁이나 사이드바에 정보 노출
- 제공 정보:
  - 한글 뜻
  - 발음 기호 (IPA)
  - 품사
  - 예문 (선택적)

#### TTS (Text-to-Speech)
- 'Listen' 버튼 클릭 시 기사 본문을 영어 성우 음성으로 재생
- 브라우저 내장 Web Speech API 활용
- 재생/일시정지/중지 기능

#### 하이라이트 기능
- 주요 구문이나 어려운 단어에 형광펜 효과 부여 (호버 시)

### 2.3. 개인화 기능

#### 나만의 단어장
- 클릭했던 단어를 'Save' 버튼으로 저장
- 나중에 복습 가능
- 로컬 스토리지에 저장 (브라우저 재시작 후에도 유지)

#### AI 요약 (확장 기능)
- OpenAI API를 연동하여 긴 기사를 3줄로 쉬운 영어 요약 제공
- *현재 버전에서는 미구현 (향후 추가 예정)*

### 2.4. 자동 업데이트
- 새로운 기사가 올라오면 자동으로 체크
- 10분마다 백그라운드에서 새 기사 확인
- 브라우저 알림 기능 (선택적)

---

## 3. 기술 스택 (Tech Stack)

### Frontend
- **React.js**: UI 프레임워크
- **Tailwind CSS**: 스타일링
- **Lucide React**: 아이콘 라이브러리

### State Management
- **Zustand**: 경량 상태 관리 라이브러리
- 로컬 스토리지 연동 (persist 미들웨어)

### Data Fetching
- **Axios**: HTTP 클라이언트
- **rss2json API**: RSS 데이터를 JSON으로 변환 (CORS 문제 해결)

### APIs
- **Free Dictionary API**: 단어 뜻 조회
- **Web Speech API**: TTS 음성 서비스

---

## 4. 화면 구성 (UI/UX)

| 화면명 | 주요 구성 요소 |
|--------|---------------|
| **메인 (Home)** | 뉴스 소스 선택, 카테고리 칩, 최신 뉴스 카드 리스트 (썸네일 + 제목), 난이도 필터, 새로고침 버튼 |
| **독해 페이지 (Reader)** | 좌측: 기사 본문 영역 (클릭 가능한 단어), 우측: 실시간 단어장 및 핵심 키워드, TTS 재생 버튼 |
| **단어장 (Voca)** | 저장한 단어 목록 (카드 형태), 발음 재생 버튼, 삭제 기능, 저장 날짜 표시 |

---

## 5. 데이터 구조 (Data Schema)

### 기사 데이터
```json
{
  "id": "1-2024-05-20-0",
  "title": "NASA's New Discovery",
  "description": "Scientists have found a new planet...",
  "content": "Full article content here...",
  "link": "https://www.newsinlevels.com/articles/...",
  "pubDate": "2024-05-20T10:00:00Z",
  "thumbnail": "https://...",
  "level": "1",
  "category": "science",
  "keywords": ["Discovery", "Planet", "Scientists"]
}
```

### 단어장 데이터
```json
{
  "word": "discovery",
  "meaning": "발견",
  "pronunciation": "/dɪˈskʌvəri/",
  "partOfSpeech": "noun",
  "example": "The discovery of new species...",
  "savedAt": "2024-05-20T10:30:00Z"
}
```

---

## 6. 개발 단계별 로드맵 (Roadmap)

### ✅ 1단계 (MVP) - 완료
- rss2json을 이용해 특정 뉴스 피드를 불러와 화면에 리스트로 표시
- News in Levels RSS 피드 연동

### ✅ 2단계 (Reading UI) - 완료
- 뉴스 리스트 클릭 시 상세 페이지로 이동하여 본문 보여주기
- 카테고리 및 난이도 필터링

### ✅ 3단계 (Study Tools) - 완료
- 단어 클릭 시 사전 API 연결
- TTS 재생 기능 구현
- 단어장 저장 기능

### ✅ 4단계 (Refinement) - 완료
- 로컬 스토리지를 이용한 단어 저장 기능
- 자동 업데이트 기능
- 새 기사 알림 기능

### 🔄 향후 개선 사항
- 다크모드 지원
- AI 요약 기능
- 퀴즈 모드 (단어장 기반)
- 학습 통계 (읽은 기사 수, 저장한 단어 수 등)
- 사용자 인증 및 클라우드 동기화

---

## 7. 뉴스 소스

### 주요 소스
- **News in Levels**: https://www.newsinlevels.com/
  - Level 1: https://www.newsinlevels.com/feed/
  - Level 2: https://www.newsinlevels.com/level-2/feed/
  - Level 3: https://www.newsinlevels.com/level-3/feed/

### 향후 추가 예정
- VOA Learning English
- BBC Learning English
- 기타 교육용 영어 뉴스 소스

