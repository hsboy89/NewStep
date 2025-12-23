import { useEffect } from 'react'
import { RefreshCw, Filter } from 'lucide-react'
import { useNewsStore } from '../store/newsStore'
import { fetchNewsFromRSS } from '../utils/rssParser'
import NewsCard from '../components/NewsCard'

const Home = () => {
  const {
    articles,
    selectedLevel,
    selectedCategory,
    lastCheckedTime,
    loading,
    error,
    setArticles,
    setSelectedLevel,
    setSelectedCategory,
    setLastCheckedTime,
    setLoading,
    setError,
    getFilteredArticles
  } = useNewsStore()

  const loadNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedArticles = await fetchNewsFromRSS('all')
      setArticles(fetchedArticles)
      setLastCheckedTime(new Date().toISOString())
    } catch (err) {
      setError('뉴스를 불러오는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkForNewArticles = async () => {
    try {
      const fetchedArticles = await fetchNewsFromRSS('all')
      // store에서 현재 articles 가져오기
      const currentArticles = useNewsStore.getState().articles
      const currentArticleIds = new Set(currentArticles.map(a => a.id))
      const newArticles = fetchedArticles.filter(a => !currentArticleIds.has(a.id))
      
      if (newArticles.length > 0) {
        setArticles([...newArticles, ...currentArticles])
        setLastCheckedTime(new Date().toISOString())
        // 새 기사 알림 (선택사항)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`새로운 기사 ${newArticles.length}개가 있습니다!`)
        }
      }
    } catch (err) {
      console.error('새 기사 체크 실패:', err)
    }
  }

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    loadNews()

    // 10분마다 새 기사 체크
    const interval = setInterval(() => {
      checkForNewArticles()
    }, 10 * 60 * 1000) // 10분

    return () => {
      if (interval) clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    loadNews()
  }

  const filteredArticles = getFilteredArticles()

  const categories = ['all', 'sport', 'science', 'technology', 'environment', 'economy', 'health', 'politics', 'culture', 'general']
  const categoryLabels = {
    all: '전체',
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

  return (
    <div>
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">최신 뉴스</h1>
            {lastCheckedTime && (
              <p className="text-sm text-gray-500">
                마지막 업데이트: {new Date(lastCheckedTime).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>
        </div>

        {/* 레벨 필터 */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-gray-700">난이도:</span>
          {['all', '1', '2', '3'].map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedLevel === level
                  ? level === 'all' 
                    ? 'bg-gray-900 text-white'
                    : level === '1'
                    ? 'bg-green-600 text-white'
                    : level === '2'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level === 'all' ? '전체' : `Level ${level}`}
            </button>
          ))}
        </div>

        {/* 카테고리 필터 */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && articles.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">뉴스를 불러오는 중...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">표시할 기사가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            총 {filteredArticles.length}개의 기사
          </div>
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Home

