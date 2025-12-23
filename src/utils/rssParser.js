import axios from 'axios'

// News in Levels RSS 피드 URL들
const RSS_FEEDS = {
  level1: 'https://www.newsinlevels.com/feed/',
  level2: 'https://www.newsinlevels.com/level-2/feed/',
  level3: 'https://www.newsinlevels.com/level-3/feed/'
}

/**
 * RSS 피드를 파싱하여 기사 배열로 변환
 */
export const fetchNewsFromRSS = async (level = 'all') => {
  try {
    const feedsToFetch = level === 'all' 
      ? Object.values(RSS_FEEDS)
      : level === '1' ? [RSS_FEEDS.level1]
      : level === '2' ? [RSS_FEEDS.level2]
      : [RSS_FEEDS.level3]

    const allArticles = []

    for (const feedUrl of feedsToFetch) {
      try {
        // CORS 프록시를 통해 RSS 피드 가져오기
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
        const response = await axios.get(proxyUrl, {
          timeout: 10000 // 10초 타임아웃
        })
        
        if (response.data.status === 'ok' && response.data.items) {
          console.log(`✅ RSS 피드 로드 성공: ${feedUrl} (${response.data.items.length}개 기사)`)
          const articles = response.data.items.map((item, index) => {
            // 레벨 추출 (제목에서 먼저 확인, 없으면 URL에서)
            let articleLevel = '1'
            const titleLower = (item.title || '').toLowerCase()
            if (titleLower.includes('level 3') || titleLower.includes('– level 3')) {
              articleLevel = '3'
            } else if (titleLower.includes('level 2') || titleLower.includes('– level 2')) {
              articleLevel = '2'
            } else if (feedUrl.includes('level-2')) {
              articleLevel = '2'
            } else if (feedUrl.includes('level-3')) {
              articleLevel = '3'
            }

            // 제목 정리 (레벨 정보 제거)
            let cleanTitle = item.title || 'Untitled'
            cleanTitle = cleanTitle.replace(/\s*–\s*level\s*[123]\s*/gi, '')
            cleanTitle = cleanTitle.replace(/\s*-\s*level\s*[123]\s*/gi, '')
            cleanTitle = cleanTitle.trim()

            // 설명 정리
            let cleanDescription = cleanContent(item.description || '')
            // "The post..." 같은 불필요한 텍스트 제거
            const postIndex = cleanDescription.toLowerCase().indexOf('the post')
            if (postIndex > 0) {
              cleanDescription = cleanDescription.substring(0, postIndex).trim()
            }
            // 날짜 패턴 제거 (예: "22-12-2025 15:00")
            cleanDescription = cleanDescription.replace(/\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{2}/g, '').trim()
            // 연속된 공백 정리
            cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim()
            // 첫 150자 정도만 추출 (요약)
            if (cleanDescription.length > 150) {
              const lastSpace = cleanDescription.lastIndexOf(' ', 150)
              cleanDescription = cleanDescription.substring(0, lastSpace > 0 ? lastSpace : 150) + '...'
            }

            // 카테고리 추출
            const category = extractCategory(cleanTitle, cleanDescription)

            return {
              id: `${articleLevel}-${item.pubDate}-${index}`,
              title: cleanTitle,
              description: cleanDescription,
              content: cleanContent(item.content || item.description || ''),
              link: item.link || '',
              pubDate: item.pubDate || new Date().toISOString(),
              thumbnail: item.thumbnail || item.enclosure?.link || '',
              level: articleLevel,
              category: category,
              keywords: extractKeywords(cleanTitle, cleanDescription)
            }
          })
          
          allArticles.push(...articles)
        }
        } catch (error) {
        console.warn(`⚠️ RSS 피드 로드 실패: ${feedUrl}`, error.response?.status || error.message)
        // rss2json API 실패 시 해당 피드는 건너뛰기
      }
    }

    // 날짜순 정렬 (최신순)
    const sortedArticles = allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    console.log(`📰 총 ${sortedArticles.length}개의 기사를 불러왔습니다.`)
    return sortedArticles
  } catch (error) {
    console.error('❌ 뉴스 가져오기 실패:', error)
    throw error
  }
}

/**
 * HTML 태그 제거 및 텍스트 정리
 */
const cleanContent = (html) => {
  if (!html) return ''
  
  // HTML 태그 제거
  let text = html.replace(/<[^>]*>/g, '')
  // HTML 엔티티 디코딩
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&apos;/g, "'")
  text = text.replace(/&rsquo;/g, "'")
  text = text.replace(/&lsquo;/g, "'")
  text = text.replace(/&rdquo;/g, '"')
  text = text.replace(/&ldquo;/g, '"')
  text = text.replace(/&mdash;/g, '—')
  text = text.replace(/&ndash;/g, '–')
  text = text.replace(/&hellip;/g, '...')
  // 연속된 공백 제거
  text = text.replace(/\s+/g, ' ')
  // 줄바꿈 정리
  text = text.replace(/\n+/g, '\n')
  
  return text.trim()
}

/**
 * 제목과 설명에서 카테고리 추출
 */
const extractCategory = (title, description) => {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.includes('sport') || text.includes('football') || text.includes('soccer')) return 'sport'
  if (text.includes('science') || text.includes('discovery') || text.includes('research')) return 'science'
  if (text.includes('technology') || text.includes('tech') || text.includes('computer')) return 'technology'
  if (text.includes('environment') || text.includes('climate') || text.includes('nature')) return 'environment'
  if (text.includes('economy') || text.includes('economic') || text.includes('business')) return 'economy'
  if (text.includes('health') || text.includes('medical') || text.includes('disease')) return 'health'
  if (text.includes('politics') || text.includes('government') || text.includes('president')) return 'politics'
  if (text.includes('culture') || text.includes('art') || text.includes('music')) return 'culture'
  
  return 'general'
}

/**
 * 키워드 추출 (간단한 버전)
 */
const extractKeywords = (title, description) => {
  const text = (title + ' ' + description).toLowerCase()
  const words = text.split(/\s+/).filter(word => word.length > 4)
  const commonWords = ['the', 'this', 'that', 'there', 'their', 'these', 'those', 'which', 'where', 'when', 'about', 'after', 'before', 'during']
  return [...new Set(words.filter(word => !commonWords.includes(word)))].slice(0, 5)
}

