import { useState } from 'react'
import { UrlInput } from '@/components/UrlInput'
import { PromptEditor } from '@/components/PromptEditor'
import { ProposalView } from '@/components/ProposalView'
import { HistoryPanel } from '@/components/HistoryPanel'
import { useProposal } from '@/hooks/useProposal'
import { useHistory } from '@/hooks/useHistory'
import { DEFAULT_PROMPT } from '@/lib/prompt'
import type { ProposalContent, ProposalRecord } from '@/types'
import './index.css'

function App() {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState<string>(
    () => localStorage.getItem('proposalai_prompt') ?? DEFAULT_PROMPT
  )
  const [proposal, setProposal] = useState<ProposalContent | null>(null)

  const { generate, isLoading, error, status } = useProposal()
  const { history, saveProposal, deleteProposal, isLoadingHistory } = useHistory()

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
    }
  }

  const handleSelectHistory = (record: ProposalRecord) => {
    setUrl(record.url)
    setProposal(record.content)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">ProposalAI</h1>
        <p className="app-subtitle">URL로 서비스 소개서를 자동 생성합니다</p>
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
          />
        </main>
      </div>
    </div>
  )
}

export default App
