interface ProposalSectionProps {
  title: string
  content: string | string[]
}

export function ProposalSection({ title, content }: ProposalSectionProps) {
  return (
    <div className="proposal-section glass-card">
      <h3 className="proposal-section__title">{title}</h3>
      {Array.isArray(content) ? (
        <ul className="proposal-section__list">
          {content.map((item, i) => (
            <li key={i} className="proposal-section__list-item">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="proposal-section__text">{content}</p>
      )}
    </div>
  )
}
