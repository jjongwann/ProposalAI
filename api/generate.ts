import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { ProposalContent } from '../src/types/index.js'
import { buildMessages } from '../src/lib/prompt.js'

const FREE_MODELS = [
  'stepfun/step-3.5-flash:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'arcee-ai/trinity-large-preview:free',
  'arcee-ai/trinity-mini:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
]

function safeParseJson(raw: string): unknown {
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1)
  } else if (start !== -1) {
    text = text.slice(start)
    const quoteCount = (text.match(/(?<!\\)"/g) ?? []).length
    if (quoteCount % 2 !== 0) text += '"'
    const openArr = (text.match(/\[/g) ?? []).length - (text.match(/\]/g) ?? []).length
    for (let i = 0; i < openArr; i++) text += ']'
    text = text.replace(/,\s*$/, '')
    text += '}'
  }
  return JSON.parse(text)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const body = req.body as { pageText?: string; prompt?: string }
  const { pageText, prompt } = body

  if (!pageText || !prompt) {
    return res.status(400).json({ success: false, error: '필수 필드가 누락되었습니다.' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'API 키가 설정되지 않았습니다.' })
  }

  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:5173'

  const messages = buildMessages(prompt, pageText)

  let lastError = ''
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': siteUrl,
          'X-Title': 'ProposalAI',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          max_tokens: 2000,
        }),
      })

      if (response.status === 429 || response.status === 404) {
        lastError = `${model}: rate-limited or unavailable`
        continue
      }

      if (!response.ok) {
        const errText = await response.text()
        return res.status(500).json({
          success: false,
          error: `AI 호출 실패: ${errText.slice(0, 200)}`,
        })
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>
      }
      const rawContent = data.choices[0]?.message?.content ?? '{}'
      const proposal = safeParseJson(rawContent) as ProposalContent
      return res.status(200).json({ success: true, data: proposal })
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      continue
    }
  }

  return res.status(503).json({
    success: false,
    error: `모든 무료 모델이 현재 사용 불가합니다. 잠시 후 다시 시도해주세요. (${lastError})`,
  })
}
