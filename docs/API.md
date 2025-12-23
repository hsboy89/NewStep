# NewStep API 문서

## 외부 API 사용

### 1. rss2json API

RSS 피드를 JSON 형식으로 변환해주는 서비스입니다.

**Base URL:** `https://api.rss2json.com/v1/api.json`

**Endpoint:**
```
GET /v1/api.json?rss_url={RSS_URL}
```

**Parameters:**
- `rss_url` (required): 변환할 RSS 피드 URL (URL 인코딩 필요)

**Example Request:**
```javascript
const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://www.newsinlevels.com/feed/')}`
const response = await axios.get(proxyUrl)
```

**Response:**
```json
{
  "status": "ok",
  "feed": {
    "url": "...",
    "title": "...",
    "link": "...",
    "author": "...",
    "description": "...",
    "image": "..."
  },
  "items": [
    {
      "title": "Article Title",
      "pubDate": "2024-05-20 10:00:00",
      "link": "https://...",
      "guid": "...",
      "author": "...",
      "thumbnail": "https://...",
      "description": "Article description...",
      "content": "Full HTML content...",
      "enclosure": {
        "link": "...",
        "type": "..."
      },
      "categories": [...]
    }
  ]
}
```

**Rate Limits (무료 플랜):**
- 일일 요청 횟수: 약 10,000건
- 데이터 갱신 주기: 1시간 (60분)
- 기사 개수: 최대 10개 (한 번에 최신 기사 10개까지만 가져올 수 있음)
- 유지 기간: 무제한 (유료 결제 없이 계속 사용 가능)

**주의사항:**
- 사용자가 많아질 경우 API 호출 횟수가 급증할 수 있음
- 로컬 스토리지 캐싱을 통해 API 호출 최소화 필요

**Usage:**
```javascript
// src/utils/rssParser.js
import axios from 'axios'

const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
const response = await axios.get(proxyUrl, {
  timeout: 10000 // 10초 타임아웃
})

if (response.data.status === 'ok' && response.data.items) {
  // items 배열 처리
  console.log(`✅ RSS 피드 로드 성공: ${feedUrl} (${response.data.items.length}개 기사)`)
}
```

**캐싱 전략:**
프로젝트에서는 로컬 스토리지를 활용하여 API 호출을 최소화합니다:
- 캐시 유효 시간: 1시간 (rss2json 갱신 주기와 동일)
- 자동 업데이트: 1시간마다만 체크
- 수동 새로고침: 강제로 API 호출 (캐시 무시)
- 예상 API 호출 감소율: 약 95% (432회/일 → 24회/일)

자세한 내용은 [OPTIMIZATION.md](./OPTIMIZATION.md) 참고

---

### 2. Glosbe Dictionary API

영어 단어의 한글 뜻을 제공하는 다국어 사전 API입니다. 여러 개의 정의와 예문을 제공하여 학습에 유용합니다.

**Base URL:** `https://glosbe.com/gapi/translate`

**Endpoint:**
```
GET /gapi/translate?from=en&dest=ko&format=json&phrase={word}&pretty=true
```

**Parameters:**
- `from` (required): 원본 언어 (`en`)
- `dest` (required): 번역할 언어 (`ko`)
- `format` (required): 응답 형식 (`json`)
- `phrase` (required): 조회할 영어 단어
- `pretty` (optional): JSON 포맷팅 (`true`)

**특징:**
- API 키 불필요: 복잡한 승인 절차 없이 바로 사용 가능
- 다중 정의: 단어의 여러 의미를 배열로 제공
- 예문 포함: 실제 문장에서의 사용 예시 제공
- 커뮤니티 기반: 전 세계 사용자가 기여한 오픈 사전 데이터

**주의사항:**
- CORS 정책으로 인해 브라우저에서 직접 호출 불가
- Vercel Serverless Function을 통해 호출 필요
- 커뮤니티 데이터 기반이라 가끔 검색 결과가 부족하거나 속도가 느릴 수 있음

**Response 예시:**
```json
{
  "tuc": [
    {
      "phrase": {
        "text": "발견"
      },
      "meanings": [
        {
          "text": "발견하다"
        }
      ],
      "examples": [
        {
          "text": "The discovery of new species is important."
        }
      ]
    }
  ]
}
```

**Usage:**
```javascript
// src/utils/dictionary.js
import axios from 'axios'

const DICTIONARY_API = '/api/dictionary' // Vercel Serverless Function

export const fetchWordDefinition = async (word) => {
  try {
    const response = await axios.get(
      `${DICTIONARY_API}?word=${encodeURIComponent(word)}`
    )
    
    if (response.data && response.data.meanings && response.data.meanings.length > 0) {
      const firstMeaning = response.data.meanings[0]
      return {
        word: word,
        meaning: firstMeaning.definition, // 첫 번째 한글 뜻
        example: firstMeaning.examples?.[0]?.text || '', // 예문
        allMeanings: response.data.meanings // 모든 정의
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching word definition:', error)
    return null
  }
}
```

**장점:**
- ✅ API 키 불필요 (설정 간편)
- ✅ 여러 정의 제공 (학습에 유용)
- ✅ 예문 포함 (실제 사용 예시)
- ✅ 네이버 사전 스타일의 데이터 구조

**단점:**
- ⚠️ 응답 속도가 다소 느릴 수 있음
- ⚠️ 일부 단어는 검색 결과가 부족할 수 있음
- ⚠️ CORS 정책으로 인해 서버 사이드 호출 필요

---

### 3. Web Speech API

브라우저 내장 API로 별도의 서버 요청 없이 TTS 기능을 제공합니다.

**API:** `window.speechSynthesis`

**Methods:**

#### speak(utterance)
텍스트를 음성으로 변환하여 재생합니다.

```javascript
const utterance = new SpeechSynthesisUtterance("Hello, world!")
utterance.lang = 'en-US'
utterance.rate = 0.9  // 속도 (0.1 ~ 10, 기본값: 1)
utterance.pitch = 1   // 음조 (0 ~ 2, 기본값: 1)
utterance.volume = 1  // 음량 (0 ~ 1, 기본값: 1)

window.speechSynthesis.speak(utterance)
```

#### cancel()
현재 재생 중인 음성을 중지합니다.

```javascript
window.speechSynthesis.cancel()
```

#### pause()
음성을 일시정지합니다.

```javascript
window.speechSynthesis.pause()
```

#### resume()
일시정지된 음성을 재개합니다.

```javascript
window.speechSynthesis.resume()
```

**Properties:**

#### speaking
현재 음성이 재생 중인지 여부를 나타냅니다.

```javascript
if (window.speechSynthesis.speaking) {
  console.log('현재 재생 중')
}
```

**Browser Support:**
- Chrome: ✅ 지원
- Firefox: ✅ 지원
- Safari: ✅ 지원
- Edge: ✅ 지원
- IE: ❌ 미지원

**Usage:**
```javascript
// src/utils/textToSpeech.js
export const speakText = (text, language = 'en-US') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    
    window.speechSynthesis.speak(utterance)
    return utterance
  } else {
    console.warn('Speech synthesis not supported')
    return null
  }
}
```

---

### 4. Browser Notification API

브라우저 알림을 표시하는 API입니다.

**API:** `window.Notification`

**Permission Request:**
```javascript
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('알림 권한 허용됨')
    }
  })
}
```

**Create Notification:**
```javascript
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('새로운 기사 3개가 있습니다!', {
    body: 'NewStep에서 최신 기사를 확인하세요.',
    icon: '/icon.png',
    badge: '/badge.png'
  })
}
```

**Permission States:**
- `default`: 아직 권한을 요청하지 않음
- `granted`: 권한 허용됨
- `denied`: 권한 거부됨

**Usage:**
```javascript
// src/pages/Home.jsx
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])

// 새 기사 발견 시
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification(`새로운 기사 ${newArticles.length}개가 있습니다!`)
}
```

---

## 내부 API (유틸리티 함수)

### RSS Parser

#### fetchNewsFromRSS(level)
RSS 피드에서 기사 목록을 가져옵니다.

**Parameters:**
- `level` (string): 'all', '1', '2', '3'

**Returns:**
- `Promise<Article[]>`: 기사 객체 배열

**Article Object:**
```typescript
{
  id: string
  title: string
  description: string
  content: string
  link: string
  pubDate: string
  thumbnail: string
  level: '1' | '2' | '3'
  category: string
  keywords: string[]
}
```

---

### Dictionary

#### fetchWordDefinition(word)
단어의 정의를 가져옵니다.

**Parameters:**
- `word` (string): 조회할 단어

**Returns:**
- `Promise<WordDefinition | null>`

**WordDefinition Object:**
```typescript
{
  word: string
  phonetic: string
  pronunciation: string  // 오디오 URL
  meaning: string
  partOfSpeech: string
  example: string
  synonyms: string[]
}
```

---

### Text to Speech

#### speakText(text, language)
텍스트를 음성으로 재생합니다.

**Parameters:**
- `text` (string): 재생할 텍스트
- `language` (string, optional): 언어 코드 (기본값: 'en-US')

**Returns:**
- `SpeechSynthesisUtterance | null`

#### stopSpeaking()
음성 재생을 중지합니다.

#### pauseSpeaking()
음성을 일시정지합니다.

#### resumeSpeaking()
일시정지된 음성을 재개합니다.

