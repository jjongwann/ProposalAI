import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

type NodeReq = IncomingMessage
type NodeRes = ServerResponse

function readBody(req: NodeReq): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

// JSON이 잘려도 파싱 시도: 마크다운 코드블록 제거 후 첫 { } 추출
function safeParseJson(raw: string): unknown {
  // 마크다운 코드블록 제거
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
  // 첫 { 부터 마지막 } 까지 추출
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1)
  } else if (start !== -1) {
    // JSON이 잘린 경우: 마지막 완전한 키-값까지 복구 시도
    text = text.slice(start)
    // 열린 따옴표 닫기
    const quoteCount = (text.match(/(?<!\\)"/g) ?? []).length
    if (quoteCount % 2 !== 0) text += '"'
    // 열린 배열 닫기
    const openArr = (text.match(/\[/g) ?? []).length - (text.match(/\]/g) ?? []).length
    for (let i = 0; i < openArr; i++) text += ']'
    // 쉼표로 끝나는 경우 제거
    text = text.replace(/,\s*$/, '')
    text += '}'
  }
  return JSON.parse(text)
}

function json(res: NodeRes, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function localApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/fetch-url', async (req: NodeReq, res: NodeRes) => {
        if (req.method !== 'POST') { json(res, 405, { success: false, error: 'Method not allowed' }); return }
        try {
          const body = await readBody(req)
          const { url } = JSON.parse(body) as { url?: string }
          if (!url) { json(res, 400, { success: false, error: '유효한 URL을 입력해주세요.' }); return }

          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProposalAI/1.0)' },
            signal: AbortSignal.timeout(10_000),
          })
          if (!response.ok) { json(res, 400, { success: false, error: `페이지 접근 실패: HTTP ${response.status}` }); return }

          const text = stripHtml(await response.text())
          if (text.length < 100) { json(res, 400, { success: false, error: '페이지에서 충분한 텍스트를 추출하지 못했습니다.' }); return }

          json(res, 200, { success: true, data: { text, url } })
        } catch (err) {
          json(res, 500, { success: false, error: `URL 가져오기 실패: ${String(err)}` })
        }
      })

      server.middlewares.use('/api/generate', async (req: NodeReq, res: NodeRes) => {
        if (req.method !== 'POST') { json(res, 405, { success: false, error: 'Method not allowed' }); return }
        try {
          const body = await readBody(req)
          const { pageText, prompt } = JSON.parse(body) as { pageText?: string; prompt?: string }
          if (!pageText || !prompt) { json(res, 400, { success: false, error: '필수 필드가 누락되었습니다.' }); return }

          const apiKey = env.OPENROUTER_API_KEY
          if (!apiKey) { json(res, 500, { success: false, error: 'OPENROUTER_API_KEY가 .env.local에 설정되지 않았습니다.' }); return }

          const FREE_MODELS = [
            'stepfun/step-3.5-flash:free',
            'nvidia/nemotron-3-nano-30b-a3b:free',
            'arcee-ai/trinity-large-preview:free',
            'arcee-ai/trinity-mini:free',
            'liquid/lfm-2.5-1.2b-instruct:free',
          ]

          const messages = [
            { role: 'system', content: prompt },
            { role: 'user', content: pageText.slice(0, 4000) },
          ]

          let lastError = ''
          for (const model of FREE_MODELS) {
            const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'ProposalAI',
              },
              body: JSON.stringify({
                model,
                messages,
                response_format: { type: 'json_object' },
                max_tokens: 2000,
              }),
            })

            if (aiRes.status === 429 || aiRes.status === 404) {
              lastError = `${model}: rate-limited or unavailable`
              continue
            }

            if (!aiRes.ok) {
              const errText = await aiRes.text()
              json(res, 500, { success: false, error: `AI 호출 실패: ${errText.slice(0, 200)}` })
              return
            }

            const data = await aiRes.json() as { choices: Array<{ message: { content: string } }> }
            const proposal = safeParseJson(data.choices[0]?.message?.content ?? '{}')
            json(res, 200, { success: true, data: proposal })
            return
          }

          json(res, 503, { success: false, error: `모든 무료 모델이 현재 사용 불가합니다. 잠시 후 다시 시도해주세요. (${lastError})` })
        } catch (err) {
          json(res, 500, { success: false, error: `소개서 생성 실패: ${String(err)}` })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), localApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test-setup.ts',
    },
  }
})
