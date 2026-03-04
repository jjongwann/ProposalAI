import { DEFAULT_PROMPT } from '@/lib/prompt'

interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
}

export function PromptEditor({ value, onChange }: PromptEditorProps) {
  const handleReset = () => {
    onChange(DEFAULT_PROMPT)
  }

  return (
    <details className="prompt-editor">
      <summary className="prompt-editor__summary">
        <span>AI 프롬프트 수정</span>
        <span className="prompt-editor__char-count">{value.length}자</span>
      </summary>
      <div className="prompt-editor__body">
        <textarea
          className="prompt-editor__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          aria-label="AI 프롬프트 편집"
        />
        <button
          type="button"
          className="prompt-editor__reset-btn"
          onClick={handleReset}
        >
          기본값으로 초기화
        </button>
      </div>
    </details>
  )
}
