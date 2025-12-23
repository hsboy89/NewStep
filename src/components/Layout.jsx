import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Home, Volume2 } from 'lucide-react'
import Aurora from './Aurora'

const Layout = ({ children }) => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* 배경 Aurora 효과 */}
      <div className="fixed inset-0 -z-10">
        <Aurora
          colorStops={['#3A29FF', '#FF94B4', '#FF3232']}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
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

