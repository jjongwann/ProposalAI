export const DEFAULT_PROMPT = `당신은 B2B 서비스 기획 전문가입니다.
제공된 웹사이트 내용을 분석하여 아래 JSON 형식으로 서비스 소개서를 작성하세요.

반드시 JSON만 출력하고, 다른 텍스트는 포함하지 마세요.

{
  "overview": "서비스 개요 (2-3문장, 서비스의 핵심 가치와 목적 설명)",
  "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3", "핵심 기능 4"],
  "targetCustomers": "타겟 고객 설명 (누가, 왜 이 서비스를 필요로 하는지 1-2문장)",
  "differentiators": ["경쟁사 대비 차별화 포인트 1", "차별화 포인트 2", "차별화 포인트 3"],
  "expectedBenefits": "도입 시 기대 효과 (정량적/정성적 효과 2-3문장)",
  "howToAdopt": "도입 방법 및 다음 단계 안내 (CTA 포함, 1-2문장)"
}`

export function buildMessages(prompt: string, pageText: string) {
  return [
    { role: 'system' as const, content: prompt },
    { role: 'user' as const, content: pageText.slice(0, 4000) },
  ]
}
