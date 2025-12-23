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

**Rate Limits:**
- 무료 티어: 일일 요청 제한 있음 (정확한 수치는 공식 문서 참조)

**Usage:**
```javascript
// src/utils/rssParser.js
import axios from 'axios'

const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
const response = await axios.get(proxyUrl)

if (response.data.status === 'ok' && response.data.items) {
  // items 배열 처리
}
```

---

### 2. Free Dictionary API

영어 단어의 정의, 발음, 예문 등을 제공하는 무료 API입니다.

**Base URL:** `https://api.dictionaryapi.dev/api/v2/entries/en`

**Endpoint:**
```
GET /api/v2/entries/en/{word}
```

**Parameters:**
- `word` (required): 조회할 영어 단어 (URL 경로에 포함)

**Example Request:**
```javascript
const word = "discovery"
const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
```

**Response:**
```json
[
  {
    "word": "discovery",
    "phonetic": "/dɪˈskʌvəri/",
    "phonetics": [
      {
        "text": "/dɪˈskʌvəri/",
        "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/discovery-us.mp3"
      }
    ],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "The act of discovering.",
            "synonyms": ["finding", "uncovering"],
            "antonyms": [],
            "example": "The discovery of new species is important for science."
          }
        ],
        "synonyms": ["finding", "uncovering", "detection"],
        "antonyms": []
      }
    ],
    "license": {
      "name": "CC BY-SA 3.0",
      "url": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "sourceUrls": ["https://en.wiktionary.org/wiki/discovery"]
  }
]
```

**Error Handling:**
단어를 찾을 수 없는 경우 404 응답:
```json
{
  "title": "No Definitions Found",
  "message": "Sorry pal, we couldn't find definitions for the word you were looking for.",
  "resolution": "You can try the search again at later time or head to the web instead."
}
```

**Usage:**
```javascript
// src/utils/dictionary.js
import axios from 'axios'

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'

export const fetchWordDefinition = async (word) => {
  try {
    const response = await axios.get(`${DICTIONARY_API}/${word.toLowerCase()}`)
    
    if (response.data && response.data.length > 0) {
      const entry = response.data[0]
      // 데이터 처리...
      return processedData
    }
    return null
  } catch (error) {
    console.error('Error fetching word definition:', error)
    return null
  }
}
```

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

