import { useState, useEffect } from 'react'

interface ProposalSectionProps {
  title: string
  icon: string
  index: number
  content: string | string[]
  onCopy: (text: string) => void
  imageUrl?: string
}

export function ProposalSection({ title, icon, index, content, onCopy, imageUrl }: ProposalSectionProps) {
  const textContent = Array.isArray(content) ? content.join('\n') : content
  const count = Array.isArray(content) ? `${content.length}개` : `${textContent.length}자`

  // 이미지가 실제로 로드된 후에만 컨테이너 표시 (검은 빈 박스 방지)
  const [imgLoaded, setImgLoaded] = useState(false)
  useEffect(() => { setImgLoaded(false) }, [imageUrl])

  return (
    <div
      className="proposal-section glass-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {imageUrl && (
        <>
          {/* 실제 이미지는 숨겨진 채로 로드 — onLoad 후 컨테이너 표시 */}
          <img
            src={imageUrl}
            alt=""
            style={{ display: 'none' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(false)}
          />
          {imgLoaded && (
            <div className="section-image">
              <img src={imageUrl} alt={title} />
              <div className="section-image__overlay" />
            </div>
          )}
        </>
      )}
      <div className="section-content">
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
    </div>
  )
}
