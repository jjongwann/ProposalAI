import type { ProposalContent } from '@/types'

export function proposalToMarkdown(content: ProposalContent, url: string): string {
  const hostname = (() => { try { return new URL(url).hostname } catch { return url } })()
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return [
    `# ${hostname} 서비스 소개서`,
    '',
    `> 생성일: ${date}`,
    `> 출처: ${url}`,
    '',
    '---',
    '',
    '## 서비스 개요',
    '',
    content.overview,
    '',
    '## 핵심 기능',
    '',
    ...content.keyFeatures.map(f => `- ${f}`),
    '',
    '## 타겟 고객',
    '',
    content.targetCustomers,
    '',
    '## 차별화 포인트',
    '',
    ...content.differentiators.map(d => `- ${d}`),
    '',
    '## 기대 효과',
    '',
    content.expectedBenefits,
    '',
    '## 도입 방법',
    '',
    content.howToAdopt,
    '',
  ].join('\n')
}
