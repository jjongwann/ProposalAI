import { useState, useCallback } from 'react'
import { UrlInput } from '@/components/UrlInput'
import { PromptEditor } from '@/components/PromptEditor'
import { ProposalView } from '@/components/ProposalView'
import { HistoryPanel } from '@/components/HistoryPanel'
import { useProposal } from '@/hooks/useProposal'
import { useHistory } from '@/hooks/useHistory'
import { useImages } from '@/hooks/useImages'
import { DEFAULT_PROMPT } from '@/lib/prompt'
import { proposalToMarkdown } from '@/lib/markdown'
import type { ProposalContent, ProposalRecord } from '@/types'
import './index.css'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function App() {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState<string>(
    () => localStorage.getItem('proposalai_prompt') ?? DEFAULT_PROMPT
  )
  const [proposal, setProposal] = useState<ProposalContent | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const { generate, isLoading, error, status } = useProposal()
  const { history, saveProposal, deleteProposal, isLoadingHistory } = useHistory()
  const imageMap = useImages(proposal)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const handlePromptChange = (value: string) => {
    setPrompt(value)
    localStorage.setItem('proposalai_prompt', value)
  }

  const handleGenerate = async () => {
    if (!url.trim() || isLoading) return
    const result = await generate(url, prompt)
    if (result) {
      setProposal(result)
      await saveProposal({ url, prompt, content: result })
      showToast('소개서가 생성됐습니다')
    }
  }

  const handleSelectHistory = (record: ProposalRecord) => {
    setUrl(record.url)
    setProposal(record.content)
  }

  const handleCopyAll = async () => {
    if (!proposal) return
    await navigator.clipboard.writeText(proposalToMarkdown(proposal, url))
    showToast('전체 내용이 복사됐습니다')
  }

  const handleDownload = () => {
    if (!proposal) return
    showToast('PDF 저장 창이 열립니다')
    setTimeout(() => window.print(), 300)
  }

  const handleCopySection = async (text: string) => {
    await navigator.clipboard.writeText(text)
    showToast('섹션 내용이 복사됐습니다')
  }

  return (
    <div className="app">
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
        ))}
      </div>

      <header className="app-header">
        <div className="app-header__inner">
          <button
            type="button"
            className="app-brand"
            onClick={() => window.location.reload()}
            aria-label="새로고침"
            title="클릭하여 새로고침"
          >
            <span className="app-brand__icon">M</span>
            <h1 className="app-title">ProposalAI</h1>
          </button>
          <div className="app-header-divider" />
          <p className="app-subtitle">URL만 입력하면 AI가 서비스 소개서를 자동으로 작성해드립니다</p>
        </div>
      </header>

      <div className="app-layout">
        <aside className="app-sidebar">
          <div className="input-section glass-card">
            <UrlInput
              value={url}
              onChange={setUrl}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <PromptEditor value={prompt} onChange={handlePromptChange} />
          </div>
          <HistoryPanel
            history={history}
            isLoadingHistory={isLoadingHistory}
            onSelect={handleSelectHistory}
            onDelete={deleteProposal}
          />
        </aside>

        <main className="app-main">
          <ProposalView
            proposal={proposal}
            isLoading={isLoading}
            error={error}
            status={status}
            onCopyAll={handleCopyAll}
            onDownload={handleDownload}
            onCopySection={handleCopySection}
            imageMap={imageMap}
          />
        </main>
      </div>
    </div>
  )
}

export default App
