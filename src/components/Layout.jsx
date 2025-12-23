import { Link, useLocation } from 'react-router-dom'
import { Suspense, useState, useEffect, lazy } from 'react'
import { BookOpen, Home, Volume2 } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'

// Dither를 lazy load로 처리하여 import 시점 에러 방지
const Dither = lazy(() => import('./Dither').catch(() => ({ default: () => null })))

const Layout = ({ children }) => {
  const location = useLocation()
  const [enableDither, setEnableDither] = useState(false)

  const isActive = (path) => location.pathname === path

  // Dither를 지연 로드하여 초기 에러 방지
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnableDither(true)
    }, 500) // 500ms 후 활성화
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 배경 Dither 효과 */}
      {enableDither && (
        <div 
          className="fixed inset-0 -z-10 opacity-20 pointer-events-none" 
          style={{ width: '100vw', height: '100vh', position: 'fixed' }}
        >
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Dither
                waveColor={[0.3, 0.4, 0.6]}
                disableAnimation={false}
                enableMouseInteraction={true}
                mouseRadius={0.3}
                colorNum={4}
                waveAmplitude={0.3}
                waveFrequency={3}
                waveSpeed={0.05}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">NewStep</span>
            </Link>
            
            <nav className="flex space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>홈</span>
              </Link>
              <Link
                to="/voca"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/voca')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>단어장</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 NewStep - 영어 뉴스 학습 플랫폼
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

