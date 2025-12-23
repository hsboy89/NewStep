import axios from 'axios'

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'

/**
 * 단어를 정리하여 API에 적합한 형태로 변환
 */
const cleanWord = (word) => {
  if (!word) return ''
  
  // 소문자 변환
  let cleaned = word.toLowerCase().trim()
  
  // 특수문자 제거 (하이픈은 유지)
  cleaned = cleaned.replace(/['"`]/g, '')
  
  // 구두점 제거
  cleaned = cleaned.replace(/[.,!?;:()[\]{}]/g, '')
  
  // 공백 제거
  cleaned = cleaned.replace(/\s+/g, '')
  
  // 빈 문자열 체크
  if (cleaned.length < 2) return null
  
  return cleaned
}

/**
 * 단어의 뜻을 사전 API에서 가져오기 (여러 시도)
 */
export const fetchWordDefinition = async (word) => {
  if (!word) return null
  
  const cleanedWord = cleanWord(word)
  if (!cleanedWord) return null
  
  // 시도할 단어 변형들
  const wordVariations = [
    cleanedWord,                    // 원본 정리된 단어
    cleanedWord.replace(/s$/, ''),  // 복수형 제거
    cleanedWord.replace(/es$/, ''), // 복수형 제거 (es)
    cleanedWord.replace(/ies$/, 'y'), // 복수형 제거 (ies -> y)
    cleanedWord.replace(/ed$/, ''),  // 과거형 제거
    cleanedWord.replace(/ing$/, ''), // 진행형 제거
  ]
  
  // 중복 제거
  const uniqueVariations = [...new Set(wordVariations)]
  
  // 각 변형을 시도
  for (const variation of uniqueVariations) {
    if (!variation || variation.length < 2) continue
    
    try {
      const response = await axios.get(`${DICTIONARY_API}/${encodeURIComponent(variation)}`, {
        timeout: 5000
      })
      
      if (response.data && response.data.length > 0) {
        const entry = response.data[0]
        const firstMeaning = entry.meanings?.[0]
        const firstDefinition = firstMeaning?.definitions?.[0]
        
        return {
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
          pronunciation: entry.phonetics?.find(p => p.audio)?.audio || '',
          meaning: firstDefinition?.definition || '',
          partOfSpeech: firstMeaning?.partOfSpeech || '',
          example: firstDefinition?.example || '',
          synonyms: firstDefinition?.synonyms?.slice(0, 3) || []
        }
      }
    } catch (error) {
      // 404 에러는 조용히 넘어가고 다음 변형 시도
      if (error.response?.status === 404) {
        continue
      }
      // 다른 에러는 로그만 남기고 계속
      if (error.response?.status !== 404) {
        console.warn(`Dictionary API error for "${variation}":`, error.response?.status)
      }
    }
  }
  
  // 모든 시도 실패
  return null
}

