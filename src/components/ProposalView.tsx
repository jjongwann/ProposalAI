import type { ProposalContent } from '@/types'
import { ProposalSection } from './ProposalSection'

interface ProposalViewProps {
  proposal: ProposalContent | null
  isLoading: boolean
  error: string | null
  status: string
}

const SECTIONS: { key: keyof ProposalContent; title: string }[] = [
  { key: 'overview', title: '서비스 개요' },
  { key: 'keyFeatures', title: '핵심 기능' },
  { key: 'targetCustomers', title: '타겟 고객' },
  { key: 'differentiators', title: '차별화 포인트' },
  { key: 'expectedBenefits', title: '기대 효과' },
  { key: 'howToAdopt', title: '도입 방법' },
]

export function ProposalView({ proposal, isLoading, error, status }: ProposalViewProps) {
  if (isLoading) {
    return (
      <div className="proposal-view proposal-view--loading">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-status">{status}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="proposal-view proposal-view--error glass-card">
        <p className="error-message">오류: {error}</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="proposal-view proposal-view--empty">
        <p className="empty-message">URL을 입력하고 소개서를 생성해보세요.</p>
      </div>
    )
  }

  return (
    <div className="proposal-view proposal-view--result">
      {SECTIONS.map(({ key, title }) => (
        <ProposalSection
          key={key}
          title={title}
          content={proposal[key] as string | string[]}
        />
      ))}
    </div>
  )
}
