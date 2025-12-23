import { useState } from 'react'
import { Trash2, Volume2, BookOpen } from 'lucide-react'
import { useVocaStore } from '../store/vocaStore'
import { speakText } from '../utils/textToSpeech'

const Voca = () => {
  const { words, removeWord, clearWords } = useVocaStore()
  const [selectedWord, setSelectedWord] = useState(null)

  const handlePlayPronunciation = (word) => {
    speakText(word)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">단어장이 비어있습니다</h2>
        <p className="text-gray-500 mb-6">기사를 읽으며 단어를 클릭하고 저장하세요!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">나의 단어장</h1>
          <p className="text-sm text-gray-500">총 {words.length}개의 단어</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('모든 단어를 삭제하시겠습니까?')) {
              clearWords()
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                  {word.pronunciation && (
                    <span className="text-sm text-gray-500">[{word.pronunciation}]</span>
                  )}
                </div>
                {word.partOfSpeech && (
                  <span className="text-xs text-blue-600 italic">{word.partOfSpeech}</span>
                )}
              </div>
              <button
                onClick={() => removeWord(word.word)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-700 mb-3">{word.meaning}</p>

            {word.example && (
              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">예문:</p>
                <p className="text-sm text-gray-800 italic">{word.example}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => handlePlayPronunciation(word.word)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              >
                <Volume2 className="w-4 h-4" />
                <span>발음</span>
              </button>
              <span className="text-xs text-gray-400">
                {formatDate(word.savedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Voca

