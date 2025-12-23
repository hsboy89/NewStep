import { Link } from 'react-router-dom'
import { Calendar, Tag } from 'lucide-react'

const NewsCard = ({ article }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음'
    
    // 다양한 날짜 형식 지원
    let date
    try {
      date = new Date(dateString)
      // 유효하지 않은 날짜 체크
      if (isNaN(date.getTime())) {
        // "22-12-2025 15:00" 형식 처리
        const parts = dateString.match(/(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/)
        if (parts) {
          date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:00`)
        } else {
          date = new Date(dateString.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'))
        }
      }
    } catch (e) {
      return dateString // 파싱 실패 시 원본 반환
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case '1':
        return 'bg-green-100 text-green-800'
      case '2':
        return 'bg-yellow-100 text-yellow-800'
      case '3':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      sport: '스포츠',
      science: '과학',
      technology: '기술',
      environment: '환경',
      economy: '경제',
      health: '건강',
      politics: '정치',
      culture: '문화',
      general: '일반'
    }
    return labels[category] || category
  }

  return (
    <Link
      to={`/article/${encodeURIComponent(article.id)}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {article.thumbnail && (
          <div className="md:w-48 flex-shrink-0">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-48 md:h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="flex-1 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelBadgeColor(article.level)}`}>
              Level {article.level}
            </span>
            <span className="flex items-center text-xs text-gray-500">
              <Tag className="w-3 h-3 mr-1" />
              {getCategoryLabel(article.category)}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
            {article.description || '기사 설명이 없습니다.'}
          </p>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(article.pubDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default NewsCard

