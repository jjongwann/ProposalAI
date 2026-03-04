import type { ProposalRecord } from '@/types'
import { HistoryItem } from './HistoryItem'

interface HistoryPanelProps {
  history: ProposalRecord[]
  isLoadingHistory: boolean
  onSelect: (proposal: ProposalRecord) => void
  onDelete: (id: string) => void
}

export function HistoryPanel({ history, isLoadingHistory, onSelect, onDelete }: HistoryPanelProps) {
  return (
    <aside className="history-panel glass-card">
      <div className="history-panel__header">
        <h2 className="history-panel__title">생성 기록</h2>
        {history.length > 0 && (
          <span className="history-panel__badge">{history.length}</span>
        )}
      </div>
      {isLoadingHistory ? (
        <p className="history-panel__loading">불러오는 중...</p>
      ) : history.length === 0 ? (
        <p className="history-panel__empty">아직 생성된 소개서가 없습니다</p>
      ) : (
        <ul className="history-panel__list">
          {history.map((item) => (
            <li key={item.id}>
              <HistoryItem proposal={item} onSelect={onSelect} onDelete={onDelete} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
