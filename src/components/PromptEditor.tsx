import { DEFAULT_PROMPT } from '@/lib/prompt'

interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
}

export function PromptEditor({ value, onChange }: PromptEditorProps) {
  return (
    <details className="prompt-editor">
      <summary className="prompt-editor__summary">
        <span>AI 프롬프트</span>
        <div className="prompt-editor__meta">
          <span className="prompt-editor__char-count">{value.length}자</span>
          <span className="prompt-editor__toggle">▾</span>
        </div>
      </summary>
      <div className="prompt-editor__body">
        <textarea
          className="prompt-editor__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={9}
          aria-label="AI 프롬프트 편집"
        />
        <div className="prompt-editor__footer">
          <button
            type="button"
            className="prompt-editor__reset-btn"
            onClick={() => onChange(DEFAULT_PROMPT)}
          >
            기본값 복원
          </button>
        </div>
      </div>
    </details>
  )
}
