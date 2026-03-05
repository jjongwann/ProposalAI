import { useState, useEffect } from 'react'
import type { ProposalContent } from '@/types'

type ImageMap = Partial<Record<keyof ProposalContent, string>>

const SECTION_QUERIES: Record<keyof ProposalContent, string> = {
  overview:          'business technology digital innovation brand',
  keyFeatures:       'software app interface dashboard feature',
  targetCustomers:   'business team people professional office',
  differentiators:   'innovation unique excellence award quality',
  expectedBenefits:  'growth success results achievement performance',
  howToAdopt:        'partnership collaboration onboarding handshake',
}

export function useImages(proposal: ProposalContent | null): ImageMap {
  const [imageMap, setImageMap] = useState<ImageMap>({})
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY as string | undefined

  useEffect(() => {
    if (!proposal || !apiKey) return
    setImageMap({})

    const entries = Object.entries(SECTION_QUERIES) as [keyof ProposalContent, string][]

    Promise.allSettled(
      entries.map(async ([key, query]) => {
        const url =
          `https://pixabay.com/api/?key=${apiKey}` +
          `&q=${encodeURIComponent(query)}` +
          `&image_type=photo&orientation=horizontal` +
          `&per_page=3&safesearch=true&min_width=640`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json() as { hits?: { webformatURL: string }[] }
        if (data.hits?.[0]) {
          setImageMap(prev => ({ ...prev, [key]: data.hits![0].webformatURL }))
        }
      })
    )
  }, [proposal, apiKey])

  return imageMap
}

export type { ImageMap }
