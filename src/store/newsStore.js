import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNewsStore = create(
  persist(
    (set, get) => ({
      articles: [],
      selectedLevel: 'all', // 'all', '1', '2', '3'
      selectedCategory: 'all',
      lastCheckedTime: null,
      loading: false,
      error: null,

      setArticles: (articles) => set({ articles }),
      setSelectedLevel: (level) => set({ selectedLevel: level }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setLastCheckedTime: (time) => set({ lastCheckedTime: time }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      addArticle: (article) => {
        const articles = get().articles
        const exists = articles.find(a => a.id === article.id)
        if (!exists) {
          set({ articles: [article, ...articles] })
        }
      },

      getFilteredArticles: () => {
        const { articles, selectedLevel, selectedCategory } = get()
        return articles.filter(article => {
          const levelMatch = selectedLevel === 'all' || article.level === selectedLevel
          const categoryMatch = selectedCategory === 'all' || article.category === selectedCategory
          return levelMatch && categoryMatch
        })
      },

      // 캐시 유효 시간 체크 (1시간 = 3600000ms)
      isCacheValid: () => {
        const lastChecked = get().lastCheckedTime
        if (!lastChecked) return false
        const cacheAge = Date.now() - new Date(lastChecked).getTime()
        const oneHour = 60 * 60 * 1000 // 1시간
        return cacheAge < oneHour
      }
    }),
    {
      name: 'news-storage',
      partialize: (state) => ({ 
        articles: state.articles,
        lastCheckedTime: state.lastCheckedTime 
      })
    }
  )
)

