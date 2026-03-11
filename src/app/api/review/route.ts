import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'edge'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an elite senior software engineer and code reviewer. Analyze code with surgical precision and return ONLY valid JSON (no markdown, no backticks, just raw JSON).

Return this exact structure:
{
  "score": <integer 1-10>,
  "language": "<detected language>",
  "summary": "<2 sentence overall assessment>",
  "metrics": {
    "complexity": <1-10>,
    "readability": <1-10>,
    "performance": <1-10>,
    "security": <1-10>,
    "maintainability": <1-10>
  },
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "line": "<line number or range, e.g. '12' or '5-8', or 'general'>",
      "title": "<short issue title>",
      "description": "<detailed explanation>",
      "fix": "<concrete code fix or suggestion>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "refactored_snippet": "<key improved code snippet if applicable, else null>"
}

Be direct, technical, and specific. Identify real bugs, security vulnerabilities, performance bottlenecks, and style issues. Score harshly but fairly.`

export async function POST(req: NextRequest) {
  const { code, language } = await req.json()

  if (!code || code.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'No code provided' }), { status: 400 })
  }

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Review this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``,
      },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 2000,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || ''
        if (delta) {
          controller.enqueue(encoder.encode(delta))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
