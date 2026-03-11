export interface ReviewMetrics {
  complexity: number
  readability: number
  performance: number
  security: number
  maintainability: number
}

export interface ReviewIssue {
  severity: 'critical' | 'warning' | 'info'
  line: string
  title: string
  description: string
  fix: string
}

export interface ReviewResult {
  score: number
  language: string
  summary: string
  metrics: ReviewMetrics
  issues: ReviewIssue[]
  strengths: string[]
  refactored_snippet: string | null
}
