import type { KeyboardEvent } from 'react'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  onGenerate: () => void
  isLoading: boolean
}

export function UrlInput({ value, onChange, onGenerate, isLoading }: UrlInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onGenerate()
    }
  }

  return (
    <div className="url-input-group">
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
      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={isLoading || !value.trim()}
        aria-label="소개서 생성"
      >
        {isLoading ? '생성 중...' : '소개서 생성'}
      </button>
    </div>
  )
}
