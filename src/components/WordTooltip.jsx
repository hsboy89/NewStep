import { useState, useEffect, useRef } from 'react'
import { X, Volume2, Bookmark, BookmarkCheck } from 'lucide-react'
import { fetchWordDefinition } from '../utils/dictionary'
import { speakText } from '../utils/textToSpeech'
import { useVocaStore } from '../store/vocaStore'

const WordTooltip = ({ word, position, onClose }) => {
  const [definition, setDefinition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const tooltipRef = useRef(null)
  const { addWord, getWord } = useVocaStore()
  const savedWord = getWord(word)

  useEffect(() => {
    const loadDefinition = async () => {
      setLoading(true)
      setDefinition(null) // 이전 정의 초기화
      
      try {
        const def = await fetchWordDefinition(word)
        setDefinition(def)
      } catch (error) {
        // 에러는 조용히 처리 (이미 dictionary.js에서 처리됨)
        setDefinition(null)
      } finally {
        setLoading(false)
      }
    }

    if (word) {
      loadDefinition()
    }
  }, [word])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSave = () => {
    if (definition && !savedWord) {
      setSaving(true)
      addWord({
        word: definition.word,
        meaning: definition.meaning,
        pronunciation: definition.phonetic,
        example: definition.example,
        partOfSpeech: definition.partOfSpeech
      })
      setTimeout(() => setSaving(false), 500)
    }
  }

  const handlePlayPronunciation = () => {
    if (definition) {
      speakText(definition.word)
    }
  }

  if (!word) return null

  const style = {
    position: 'fixed',
    top: `${position.y + 20}px`,
    left: `${position.x}px`,
    zIndex: 1000
  }

  return (
    <div
      ref={tooltipRef}
      style={style}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm w-80"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-bold text-gray-900">{word}</h4>
            {definition?.phonetic && (
              <span className="text-sm text-gray-500">[{definition.phonetic}]</span>
            )}
          </div>
          {definition?.partOfSpeech && (
            <span className="text-xs text-blue-600 italic">{definition.partOfSpeech}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">로딩 중...</div>
      ) : definition ? (
        <>
          <p className="text-sm text-gray-700 mb-3">{definition.meaning}</p>
          
          {definition.example && (
            <div className="bg-gray-50 rounded p-2 mb-3">
              <p className="text-xs text-gray-600 italic">예문:</p>
              <p className="text-sm text-gray-800">{definition.example}</p>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2 border-t">
            <button
              onClick={handlePlayPronunciation}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>발음</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!!savedWord || saving}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-colors text-sm ${
                savedWord
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {savedWord ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>저장됨</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>저장</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">정의를 찾을 수 없습니다.</div>
      )}
    </div>
  )
}

export default WordTooltip

