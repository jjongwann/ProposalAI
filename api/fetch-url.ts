import type { VercelRequest, VercelResponse } from '@vercel/node'

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function stripHtml(html: string): string {
  // Remove script and style blocks
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ')
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  // Collapse whitespace
  return text.replace(/\s+/g, ' ').trim()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const body = req.body as { url?: string }
  const url = body?.url

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ success: false, error: '유효한 URL을 입력해주세요.' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProposalAI/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: `페이지 접근 실패: HTTP ${response.status}`,
      })
    }

    const html = await response.text()
    const text = stripHtml(html)

    if (text.length < 100) {
      return res.status(400).json({
        success: false,
        error: '페이지에서 충분한 텍스트를 추출하지 못했습니다.',
      })
    }

    return res.status(200).json({ success: true, data: { text, url } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({
      success: false,
      error: `URL 가져오기 실패: ${message}`,
    })
  }
}
