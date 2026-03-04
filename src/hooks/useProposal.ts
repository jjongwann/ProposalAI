import { useState } from 'react'
import type { ProposalContent, ApiResponse } from '@/types'

interface UseProposalResult {
  generate: (url: string, prompt: string) => Promise<ProposalContent | null>
  isLoading: boolean
  error: string | null
  status: string
}

export function useProposal(): UseProposalResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const generate = async (url: string, prompt: string): Promise<ProposalContent | null> => {
    setIsLoading(true)
    setError(null)
    setStatus('페이지 내용을 가져오는 중...')

    try {
      // Step 1: Fetch URL content via serverless function
      const fetchRes = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const fetchData = (await fetchRes.json()) as ApiResponse<{ text: string; url: string }>

      if (!fetchData.success || !fetchData.data) {
        throw new Error(fetchData.error ?? '페이지 가져오기 실패')
      }

      setStatus('AI가 소개서를 작성하는 중...')

      // Step 2: Generate proposal via serverless function
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageText: fetchData.data.text, prompt }),
      })
      const genData = (await genRes.json()) as ApiResponse<ProposalContent>

      if (!genData.success || !genData.data) {
        throw new Error(genData.error ?? '소개서 생성 실패')
      }

      setStatus('')
      return genData.data
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      setError(message)
      setStatus('')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { generate, isLoading, error, status }
}
