import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { ProposalRecord, ProposalContent } from '@/types'

interface UseHistoryResult {
  history: ProposalRecord[]
  saveProposal: (record: { url: string; prompt: string; content: ProposalContent }) => Promise<void>
  deleteProposal: (id: string) => Promise<void>
  isLoadingHistory: boolean
}

export function useHistory(): UseHistoryResult {
  const [history, setHistory] = useState<ProposalRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoadingHistory(false)
      return
    }

    const loadHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const { data, error } = await supabase!
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (!error && data) {
          setHistory(data as ProposalRecord[])
        }
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [])

  const saveProposal = async (record: {
    url: string
    prompt: string
    content: ProposalContent
  }) => {
    if (!isSupabaseConfigured || !supabase) return

    const title = record.content.overview.slice(0, 80)
    const { data, error } = await supabase
      .from('proposals')
      .insert({ ...record, title })
      .select()
      .single()

    if (!error && data) {
      setHistory((prev) => [data as ProposalRecord, ...prev])
    }
  }

  const deleteProposal = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.from('proposals').delete().eq('id', id)
    if (!error) {
      setHistory((prev) => prev.filter((item) => item.id !== id))
    }
  }

  return { history, saveProposal, deleteProposal, isLoadingHistory }
}
