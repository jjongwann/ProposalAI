import type { ProposalContent } from '@/types'
import { ProposalSection } from './ProposalSection'

interface ProposalViewProps {
  proposal: ProposalContent | null
  isLoading: boolean
  error: string | null
  status: string
  onCopyAll: () => void
  onDownload: () => void
  onCopySection: (text: string) => void
}

const SECTIONS: { key: keyof ProposalContent; title: string; icon: string }[] = [
  { key: 'overview',         title: '서비스 개요',   icon: '⬡' },
  { key: 'keyFeatures',      title: '핵심 기능',     icon: '⊕' },
  { key: 'targetCustomers',  title: '타겟 고객',     icon: '◎' },
  { key: 'differentiators',  title: '차별화 포인트', icon: '◆' },
  { key: 'expectedBenefits', title: '기대 효과',     icon: '↑' },
  { key: 'howToAdopt',       title: '도입 방법',     icon: '→' },
]

const LOADING_STEPS = ['URL 콘텐츠 가져오는 중', 'AI가 분석하는 중', '소개서 작성 중']

export function ProposalView({
  proposal, isLoading, error, status, onCopyAll, onDownload, onCopySection,
}: ProposalViewProps) {
  if (isLoading) {
    return (
      <div className="proposal-view proposal-view--loading">
        <div className="loading-pulse">
          <span /><span /><span />
        </div>
        <p className="loading-status">{status || LOADING_STEPS[0]}</p>
        <div className="loading-steps">
          {LOADING_STEPS.map((step, i) => (
            <p key={i} className="loading-step">{step}</p>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="proposal-view proposal-view--error glass-card">
        <div className="error-icon">!</div>
        <div>
          <p className="error-title">생성 실패</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="proposal-view proposal-view--empty">
        <div className="empty-state">
          <div className="empty-state__icon">✦</div>
          <p className="empty-state__title">소개서를 생성해보세요</p>
          <p className="empty-state__desc">
            왼쪽에 서비스 URL을 입력하고<br />소개서 생성 버튼을 누르세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="proposal-view proposal-view--result">
      <div className="proposal-toolbar">
        <span className="proposal-toolbar__label">소개서 완성 · {SECTIONS.length}개 섹션</span>
        <div className="proposal-toolbar__actions">
          <button type="button" className="toolbar-btn" onClick={onCopyAll}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            전체 복사
          </button>
          <button type="button" className="toolbar-btn" onClick={onDownload}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            저장
          </button>
        </div>
      </div>
      {SECTIONS.map(({ key, title, icon }, index) => (
        <ProposalSection
          key={key}
          title={title}
          icon={icon}
          index={index}
          content={proposal[key] as string | string[]}
          onCopy={onCopySection}
        />
      ))}
    </div>
  )
}
