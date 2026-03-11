# AI Code Reviewer

An LLM-powered code analysis tool providing real-time streaming code reviews 
with security scanning, performance insights, and actionable fixes.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Claude](https://img.shields.io/badge/Anthropic-Claude-orange)

## Features
- **Real-time streaming** — see analysis token by token via Claude API
- **9 language support** — C++, TypeScript, JavaScript, Python, C#, Java, Rust, Go, SQL
- **Security scanning** — detects SQL injection, memory leaks, XSS, and more
- **Performance metrics** — scores complexity, readability, performance, security, maintainability
- **Actionable fixes** — every issue includes a concrete code-level fix

## Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI:** Anthropic Claude via streaming API
- **Architecture:** Streaming ReadableStream, real-time JSON parsing

## Getting Started
```bash
git clone https://github.com/AKavaa/AI-Code-Reviewer
cd AI-Code-Reviewer
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open http://localhost:3000