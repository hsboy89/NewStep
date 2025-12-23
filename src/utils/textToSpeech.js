/**
 * Web Speech API를 사용한 TTS 기능
 */
export const speakText = (text, language = 'en-US') => {
  if ('speechSynthesis' in window) {
    // 기존 음성 중지
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.9 // 속도 조절 (0.1 ~ 10)
    utterance.pitch = 1 // 음조 (0 ~ 2)
    utterance.volume = 1 // 음량 (0 ~ 1)
    
    window.speechSynthesis.speak(utterance)
    
    return utterance
  } else {
    console.warn('Speech synthesis not supported')
    return null
  }
}

/**
 * TTS 중지
 */
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * TTS 일시정지
 */
export const pauseSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause()
  }
}

/**
 * TTS 재개
 */
export const resumeSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume()
  }
}

