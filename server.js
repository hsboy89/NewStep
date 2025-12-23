// 로컬 개발용 간단한 Express 서버 (프록시 역할)
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env 파일에서 API 키 읽기
let kakaoApiKey = ''
try {
  const envFile = readFileSync(resolve(__dirname, '.env'), 'utf-8')
  const match = envFile.match(/VITE_KAKAO_REST_API_KEY=(.+)/)
  if (match) {
    kakaoApiKey = match[1].trim()
  }
} catch (error) {
  console.warn('.env 파일을 읽을 수 없습니다.')
}

const app = express()
const PORT = 3001

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// 카카오 번역 API 프록시
app.post('/api/translate', async (req, res) => {
  try {
    const { query, src_lang = 'en', target_lang = 'kr' } = req.body

    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' })
    }

    if (!kakaoApiKey) {
      return res.status(500).json({ error: 'API key is not configured' })
    }

    // 카카오 번역 API 호출
    const response = await fetch('https://dapi.kakao.com/v2/translation/translate', {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${kakaoApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query: query,
        src_lang: src_lang,
        target_lang: target_lang,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Kakao API error:', response.status, errorData)
      return res.status(response.status).json({ 
        error: 'Translation failed',
        details: errorData 
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Translation error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 프록시 서버가 http://localhost:${PORT}에서 실행 중입니다.`)
  console.log(`📝 API 키: ${kakaoApiKey ? '설정됨' : '설정되지 않음'}`)
})

