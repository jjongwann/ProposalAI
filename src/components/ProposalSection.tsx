interface ProposalSectionProps {
  title: string
  icon: string
  index: number
  content: string | string[]
  onCopy: (text: string) => void
}

export function ProposalSection({ title, icon, index, content, onCopy }: ProposalSectionProps) {
  const textContent = Array.isArray(content) ? content.join('\n') : content
  const count = Array.isArray(content) ? `${content.length}개` : `${textContent.length}자`

  return (
    <div
      className="proposal-section glass-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="proposal-section__header">
        <div className="proposal-section__title-row">
          <span className="proposal-section__icon">{icon}</span>
          <h3 className="proposal-section__title">{title}</h3>
          <span className="proposal-section__count">{count}</span>
        </div>
        <button
          type="button"
          className="section-copy-btn"
          onClick={() => onCopy(textContent)}
          title={`${title} 복사`}
          aria-label={`${title} 복사`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
      {Array.isArray(content) ? (
        <ul className="proposal-section__list">
          {content.map((item, i) => (
            <li key={i} className="proposal-section__list-item">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="proposal-section__text">{content}</p>
      )}
    </div>
  )
}
