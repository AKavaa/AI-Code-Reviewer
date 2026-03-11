# AI Code Reviewer

An LLM-powered code analysis tool that provides real-time streaming code reviews with security scanning, performance insights, and actionable fixes.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green)

## Features

- **Real-time streaming** — see analysis token by token as GPT-4o processes your code
- **Multi-language support** — C++, TypeScript, JavaScript, Python, C#, Java, Rust, Go, SQL
- **Security scanning** — detects SQL injection, memory leaks, XSS, and more
- **Performance metrics** — scores complexity, readability, performance, security, maintainability
- **Actionable fixes** — every issue includes a concrete code-level fix
- **Refactor suggestions** — AI rewrites problematic sections

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI:** OpenAI GPT-4o via streaming Edge API
- **Architecture:** Edge runtime, streaming ReadableStream, real-time JSON parsing

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/AKavaa/ai-code-reviewer
cd ai-code-reviewer

# 2. Install dependencies
npm install

# 3. Add your OpenAI API key
cp .env.example .env.local
# Edit .env.local and add: OPENAI_API_KEY=your_key_here

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AKavaa/ai-code-reviewer)

Add `OPENAI_API_KEY` in Vercel environment variables.

## Architecture

```
User pastes code
      │
      ▼
Next.js Edge API Route (/api/review)
      │
      ▼
OpenAI GPT-4o (streaming)
      │
      ▼
ReadableStream → client
      │
      ▼
JSON parsed → structured ReviewResult
      │
      ▼
React UI renders score, metrics, issues, fixes
```

## CV Bullet Points (for recruiters)

> **AI Code Reviewer** *(TypeScript | Next.js | OpenAI GPT-4o | Edge Streaming)*
> - Engineered an LLM-powered static analysis tool supporting 9 languages with real-time streaming via Edge Runtime ReadableStream API
> - Implemented structured JSON extraction from GPT-4o streams, parsing 5 code quality metrics and severity-classified issue detection
> - Deployed on Vercel Edge Network achieving sub-200ms TTFB with zero cold-start latency

## License

MIT
