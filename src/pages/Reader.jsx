import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useNewsStore } from '../store/newsStore'
import { speakText, stopSpeaking } from '../utils/textToSpeech'
import WordTooltip from '../components/WordTooltip'

const Reader = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { articles } = useNewsStore()
  const [selectedWord, setSelectedWord] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const contentRef = useRef(null)

  const article = articles.find(a => a.id === decodeURIComponent(id))

  useEffect(() => {
    // 컴포넌트 언마운트 시 음성 중지
    return () => {
      stopSpeaking()
    }
  }, [])

  const handleWordClick = (word, event) => {
    // 단어 정리 (구두점 제거)
    const cleanWord = word.replace(/[.,!?;:"'()[\]{}]/g, '').trim()
    
    if (cleanWord.length < 2) return

    const rect = event.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left,
      y: rect.top
    })
    setSelectedWord(cleanWord)
  }

  const handlePlayText = () => {
    if (isPlaying) {
      stopSpeaking()
      setIsPlaying(false)
    } else {
      if (contentRef.current) {
        const text = contentRef.current.innerText
        speakText(text)
        setIsPlaying(true)
        
        // 음성 재생 완료 감지
        const checkEnd = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsPlaying(false)
            clearInterval(checkEnd)
          }
        }, 100)
      }
    }
  }

  // 본문을 단어 단위로 분리하여 클릭 가능하게 만들기
  const renderContent = (content) => {
    if (!content) return null

    const words = content.split(/(\s+|[.,!?;:"'()[\]{}])/g)
    
    return words.map((word, index) => {
      const isPunctuation = /^[.,!?;:"'()[\]{}\s]+$/.test(word)
      
      if (isPunctuation) {
        return <span key={index}>{word}</span>
      }

      return (
        <span
          key={index}
          onClick={(e) => handleWordClick(word, e)}
          className="hover:bg-yellow-200 hover:cursor-pointer transition-colors rounded px-0.5"
        >
          {word}
        </span>
      )
    })
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">기사를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로</span>
      </button>

      {/* 기사 헤더 */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              article.level === '1' ? 'bg-green-100 text-green-800' :
              article.level === '2' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Level {article.level}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(article.pubDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <button
            onClick={handlePlayText}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-5 h-5" />
                <span>중지</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>듣기</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
        {article.description && (
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">{article.description}</p>
        )}
      </div>

      {/* 본문 영역 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">본문</h2>
          <div className="prose max-w-none">
            <p
              ref={contentRef}
              className="text-lg text-gray-800 leading-relaxed"
            >
              {renderContent(article.content)}
            </p>
          </div>
        </div>

        {/* 키워드 */}
        {article.keywords && article.keywords.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">주요 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 원문 링크 */}
        {article.link && (
          <div className="mt-6">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              원문 보기 →
            </a>
          </div>
        )}
      </div>

      {/* 단어 툴팁 */}
      {selectedWord && (
        <WordTooltip
          word={selectedWord}
          position={tooltipPosition}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  )
}

export default Reader

