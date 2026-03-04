import type { KeyboardEvent } from 'react'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  onGenerate: () => void
  isLoading: boolean
}

export function UrlInput({ value, onChange, onGenerate, isLoading }: UrlInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) onGenerate()
  }

  return (
    <div className="url-input-section">
      <label className="url-input-label">웹사이트 URL</label>
      <div className="url-input-group">
        <div className="url-input-wrapper">
          <svg className="url-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <input
            type="url"
            className="url-input"
            placeholder="https://example.com"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="분석할 URL 입력"
          />
        </div>
        <button
          className="generate-btn"
          onClick={onGenerate}
          disabled={isLoading || !value.trim()}
          aria-label="소개서 생성"
        >
          {isLoading ? (
            <>
              <span className="btn-spinner" />
              생성 중
            </>
          ) : '생성하기'}
        </button>
      </div>
      <p className="url-input-hint">Enter 키로 빠르게 생성</p>
    </div>
  )
}
