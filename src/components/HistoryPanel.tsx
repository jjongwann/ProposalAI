import type { ProposalRecord } from '@/types'
import { HistoryItem } from './HistoryItem'

interface HistoryPanelProps {
  history: ProposalRecord[]
  isLoadingHistory: boolean
  onSelect: (proposal: ProposalRecord) => void
}

export function HistoryPanel({ history, isLoadingHistory, onSelect }: HistoryPanelProps) {
  return (
    <aside className="history-panel glass-card">
      <h2 className="history-panel__title">생성 기록</h2>
      {isLoadingHistory ? (
        <p className="history-panel__loading">불러오는 중...</p>
      ) : history.length === 0 ? (
        <p className="history-panel__empty">아직 생성된 소개서가 없습니다.</p>
      ) : (
        <ul className="history-panel__list">
          {history.map((item) => (
            <li key={item.id}>
              <HistoryItem proposal={item} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
