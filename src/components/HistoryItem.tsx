import type { ProposalRecord } from '@/types'

interface HistoryItemProps {
  proposal: ProposalRecord
  onSelect: (proposal: ProposalRecord) => void
  onDelete: (id: string) => void
}

export function HistoryItem({ proposal, onSelect, onDelete }: HistoryItemProps) {
  const date = new Date(proposal.created_at).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const domain = (() => {
    try {
      return new URL(proposal.url).hostname
    } catch {
      return proposal.url
    }
  })()

  return (
    <div className="history-item-wrapper">
      <button
        type="button"
        className="history-item"
        onClick={() => onSelect(proposal)}
        aria-label={`${domain} 소개서 불러오기`}
      >
        <span className="history-item__domain">{domain}</span>
        <span className="history-item__date">{date}</span>
      </button>
      <button
        type="button"
        className="history-item__delete"
        onClick={() => onDelete(proposal.id)}
        aria-label="삭제"
      >
        ×
      </button>
    </div>
  )
}
