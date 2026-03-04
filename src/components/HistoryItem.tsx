import type { ProposalRecord } from '@/types'

interface HistoryItemProps {
  proposal: ProposalRecord
  onSelect: (proposal: ProposalRecord) => void
}

export function HistoryItem({ proposal, onSelect }: HistoryItemProps) {
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
    <button
      type="button"
      className="history-item"
      onClick={() => onSelect(proposal)}
      aria-label={`${domain} 소개서 불러오기`}
    >
      <span className="history-item__domain">{domain}</span>
      <span className="history-item__date">{date}</span>
    </button>
  )
}
