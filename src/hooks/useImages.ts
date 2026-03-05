import { useState, useEffect } from 'react'
import type { ProposalContent } from '@/types'

type ImageMap = Partial<Record<keyof ProposalContent, string>>

// 제안서 내용(overview + keyFeatures)에서 비즈니스 카테고리 영문 키워드 추출
// 도메인 이름 대신 AI가 분석한 실제 내용을 기반으로 이미지 검색
function detectCategoryKeywords(proposal: ProposalContent): string {
  const text = [
    typeof proposal.overview === 'string'
      ? proposal.overview
      : (proposal.overview as string[] | undefined)?.join(' '),
    Array.isArray(proposal.keyFeatures)
      ? proposal.keyFeatures.join(' ')
      : proposal.keyFeatures,
  ].filter(Boolean).join(' ')

  const categories: [RegExp, string][] = [
    [/닭가슴살|닭|치킨|chicken|육류|고기|meat|식육|단백질|현미/i,  'chicken food meal protein'],
    [/음악|뮤직|music|멜로디|악기|song|audio|레코드|음원/i,         'music audio studio'],
    [/포렌식|법의학|forensic|수사|디지털포렌식|증거/i,              'forensic investigation digital'],
    [/식품|음식|food|요리|레스토랑|restaurant|반찬|식재료|식당/i,   'food restaurant cuisine cooking'],
    [/부동산|real estate|임대|매매|건물|아파트|토지|주택/i,          'real estate property building'],
    [/의료|헬스|병원|health|medical|clinic|건강|약|제약|치료/i,      'healthcare medical wellness'],
    [/교육|학원|education|학습|강의|강좌|learning|튜터|수업/i,       'education learning study'],
    [/소프트웨어|software|app|앱|개발|platform|플랫폼|IT|SaaS/i,    'technology software digital'],
    [/물류|배송|logistics|delivery|택배|운송|shipping|화물/i,        'logistics shipping delivery'],
    [/패션|의류|fashion|clothing|옷|의상|스타일|브랜드/i,            'fashion clothing style'],
    [/여행|travel|관광|tour|호텔|hotel|숙박|항공/i,                 'travel tourism destination'],
    [/금융|finance|fintech|투자|보험|은행|bank|대출|주식/i,          'finance business investment'],
    [/뷰티|미용|beauty|화장품|cosmetic|피부|skin|헤어/i,            'beauty cosmetics skincare'],
    [/법률|법무|law|변호사|legal|attorney|소송|법/i,                'law legal business'],
    [/건설|건축|construction|인테리어|interior|리모델링/i,           'construction architecture building'],
    [/광고|마케팅|marketing|advertising|홍보|브랜딩|SNS/i,          'marketing advertising business'],
    [/커머스|쇼핑|ecommerce|e-commerce|쇼핑몰|판매|온라인 스토어/i, 'ecommerce shopping retail'],
    [/보안|security|사이버|cyber|해킹|방화벽/i,                     'security technology cyber'],
    [/농업|농산물|farm|farming|농촌|작물|수확/i,                    'farming agriculture nature'],
    [/스포츠|운동|sport|fitness|헬스장|gym|운동/i,                  'sports fitness exercise'],
  ]

  for (const [pattern, keyword] of categories) {
    if (pattern.test(text)) return keyword
  }

  return 'business service professional'
}

// 섹션별 보조 키워드 (카테고리 키워드와 조합)
const SECTION_SUFFIX: Record<keyof ProposalContent, string> = {
  overview:          'brand overview',
  keyFeatures:       'features product',
  targetCustomers:   'people customer',
  differentiators:   'innovation quality',
  expectedBenefits:  'growth success',
  howToAdopt:        'partnership collaboration',
}

export function useImages(proposal: ProposalContent | null, _serviceUrl: string): ImageMap {
  const [imageMap, setImageMap] = useState<ImageMap>({})
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY as string | undefined

  useEffect(() => {
    if (!proposal || !apiKey) return
    setImageMap({})

    const categoryKeywords = detectCategoryKeywords(proposal)
    const entries = Object.entries(SECTION_SUFFIX) as [keyof ProposalContent, string][]

    Promise.allSettled(
      entries.map(async ([key, suffix], idx) => {
        // 카테고리 키워드 + 섹션 보조 키워드 조합
        const query = `${categoryKeywords} ${suffix}`
        const pixabayUrl =
          `https://pixabay.com/api/?key=${apiKey}` +
          `&q=${encodeURIComponent(query)}` +
          `&image_type=photo&orientation=horizontal` +
          `&per_page=8&safesearch=true&min_width=640`

        const res = await fetch(pixabayUrl)
        if (!res.ok) return
        const data = await res.json() as { hits?: { webformatURL: string }[] }

        if (!data.hits?.length) {
          // 카테고리 키워드만으로 재시도 (섹션별 다른 이미지)
          const fallbackUrl =
            `https://pixabay.com/api/?key=${apiKey}` +
            `&q=${encodeURIComponent(categoryKeywords)}` +
            `&image_type=photo&orientation=horizontal` +
            `&per_page=8&safesearch=true&min_width=640`
          const fallbackRes = await fetch(fallbackUrl)
          if (!fallbackRes.ok) return
          const fallbackData = await fallbackRes.json() as { hits?: { webformatURL: string }[] }
          if (fallbackData.hits?.length) {
            const hit = fallbackData.hits[Math.min(idx, fallbackData.hits.length - 1)]
            setImageMap(prev => ({ ...prev, [key]: hit.webformatURL }))
          }
          return
        }

        // 섹션마다 다른 이미지 (인덱스로 분산)
        const hit = data.hits[Math.min(idx, data.hits.length - 1)]
        setImageMap(prev => ({ ...prev, [key]: hit.webformatURL }))
      })
    )
  }, [proposal, _serviceUrl, apiKey])

  return imageMap
}

export type { ImageMap }
