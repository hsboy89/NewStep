// 기사 전체를 한국어로 번역하는 유틸리티 함수
// Google Translate 비공식 엔드포인트를 사용합니다.
// 참고: 이 엔드포인트는 공식 API가 아니므로 안정성이 완벽하진 않을 수 있습니다.

export const translateArticle = async (text) => {
  if (!text) return ''

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(
    text
  )}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('번역 API 요청에 실패했습니다.')
  }

  const data = await response.json()

  // data[0]는 [ [ translatedText, originalText, ... ], ... ] 형태의 배열
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('번역 결과 형식이 올바르지 않습니다.')
  }

  const translated = data[0]
    .map((part) => (Array.isArray(part) ? part[0] : ''))
    .join('')

  return translated
}


