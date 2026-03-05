import { useState, useEffect } from 'react'
import type { ProposalContent } from '@/types'

type ImageMap = Partial<Record<keyof ProposalContent, string>>

// 도메인 이름에서 의미 있는 영문 키워드 추출
// 예: "licensemusic.co.kr" → "license music"
// 예: "1kmusic.com"        → "music"
function extractDomainKeywords(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    const domain = hostname.split('.')[0] // 최상위 도메인 이름만 사용

    const words = domain
      .replace(/([a-z])([A-Z])/g, '$1 $2')   // camelCase 분리
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')   // 글자+숫자 분리
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')   // 숫자+글자 분리
      .split(/[\s\-_]+/)
      .filter(w => w.length > 1 && isNaN(Number(w))) // 숫자만 있는 토큰 제거
      .join(' ')
      .trim()

    return words
  } catch {
    return ''
  }
}

// 섹션별 보조 키워드 (도메인 키워드와 조합)
const SECTION_SUFFIX: Record<keyof ProposalContent, string> = {
  overview:          'brand service overview',
  keyFeatures:       'features technology product',
  targetCustomers:   'people customer professional',
  differentiators:   'innovation unique quality',
  expectedBenefits:  'growth success results',
  howToAdopt:        'partnership collaboration onboarding',
}

export function useImages(proposal: ProposalContent | null, serviceUrl: string): ImageMap {
  const [imageMap, setImageMap] = useState<ImageMap>({})
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY as string | undefined

  useEffect(() => {
    if (!proposal || !apiKey) return
    setImageMap({})

    const domainKeywords = extractDomainKeywords(serviceUrl)
    const entries = Object.entries(SECTION_SUFFIX) as [keyof ProposalContent, string][]

    Promise.allSettled(
      entries.map(async ([key, suffix]) => {
        // 도메인 키워드 + 섹션 보조 키워드 조합
        const query = domainKeywords ? `${domainKeywords} ${suffix}` : suffix
        const pixabayUrl =
          `https://pixabay.com/api/?key=${apiKey}` +
          `&q=${encodeURIComponent(query)}` +
          `&image_type=photo&orientation=horizontal` +
          `&per_page=5&safesearch=true&min_width=640`

        const res = await fetch(pixabayUrl)
        if (!res.ok) return
        const data = await res.json() as { hits?: { webformatURL: string }[] }

        // 결과 없으면 도메인 키워드 없이 섹션 suffix만으로 재시도
        if (!data.hits?.length && domainKeywords) {
          const fallbackUrl =
            `https://pixabay.com/api/?key=${apiKey}` +
            `&q=${encodeURIComponent(suffix)}` +
            `&image_type=photo&orientation=horizontal` +
            `&per_page=3&safesearch=true&min_width=640`
          const fallbackRes = await fetch(fallbackUrl)
          if (!fallbackRes.ok) return
          const fallbackData = await fallbackRes.json() as { hits?: { webformatURL: string }[] }
          if (fallbackData.hits?.[0]) {
            setImageMap(prev => ({ ...prev, [key]: fallbackData.hits![0].webformatURL }))
          }
          return
        }

        if (data.hits?.[0]) {
          setImageMap(prev => ({ ...prev, [key]: data.hits![0].webformatURL }))
        }
      })
    )
  }, [proposal, serviceUrl, apiKey])

  return imageMap
}

export type { ImageMap }
