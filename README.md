# NewStep - 영어 뉴스 학습 플랫폼

영어 뉴스를 활용하여 학생들의 수준에 맞는 읽기/듣기 학습 환경을 제공하는 웹 애플리케이션입니다.

## 주요 기능

- **뉴스 큐레이션**: News in Levels RSS 피드를 통한 최신 뉴스 제공
- **난이도별 필터링**: Level 1 (Basic), Level 2 (Intermediate), Level 3 (Advanced)
- **인터랙티브 독해 도구**:
  - 클릭 사전: 단어를 클릭하면 한글 뜻과 발음 확인
  - TTS (Text-to-Speech): 기사 본문을 영어 음성으로 재생
- **단어장**: 클릭한 단어를 저장하여 나중에 복습
- **자동 업데이트**: 10분마다 새 기사 자동 체크

## 기술 스택

- **Frontend**: React.js, Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **Icons**: Lucide React
- **API**: 
  - rss2json (RSS 파싱)
  - Free Dictionary API (단어 정의)
  - Web Speech API (TTS)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── components/       # 재사용 가능한 컴포넌트
│   ├── Layout.jsx
│   ├── NewsCard.jsx
│   └── WordTooltip.jsx
├── pages/           # 페이지 컴포넌트
│   ├── Home.jsx
│   ├── Reader.jsx
│   └── Voca.jsx
├── store/           # Zustand 상태 관리
│   ├── newsStore.js
│   └── vocaStore.js
├── utils/           # 유틸리티 함수
│   ├── rssParser.js
│   ├── dictionary.js
│   └── textToSpeech.js
├── App.jsx
└── main.jsx
```

## 사용 방법

1. **뉴스 탐색**: 메인 페이지에서 최신 뉴스를 확인하고 난이도/카테고리로 필터링
2. **기사 읽기**: 카드를 클릭하여 상세 페이지로 이동
3. **단어 학습**: 본문의 단어를 클릭하여 뜻 확인 및 단어장에 저장
4. **듣기 학습**: "듣기" 버튼을 클릭하여 기사 전체를 음성으로 재생
5. **복습**: 단어장 페이지에서 저장한 단어들을 복습

## 문서

자세한 문서는 [docs 폴더](./docs/)를 참고하세요:
- [PRD 문서](./docs/PRD.md) - 제품 요구사항 상세
- [아키텍처 문서](./docs/ARCHITECTURE.md) - 프로젝트 구조 및 설계
- [API 문서](./docs/API.md) - API 사용법
- [개발 가이드](./docs/DEVELOPMENT.md) - 개발 환경 설정 및 가이드

## 라이선스

MIT

