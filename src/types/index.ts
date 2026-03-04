export interface ProposalContent {
  overview: string
  keyFeatures: string[]
  targetCustomers: string
  differentiators: string[]
  expectedBenefits: string
  howToAdopt: string
}

export interface ProposalRecord {
  id: string
  url: string
  title: string | null
  prompt: string
  content: ProposalContent
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
