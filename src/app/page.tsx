'use client'

import { useState, useRef, useCallback } from 'react'
import { ReviewResult, ReviewIssue } from '@/lib/types'
import {
  Code2, Zap, Shield, Activity, Eye, ChevronRight,
  AlertTriangle, AlertCircle, Info, CheckCircle2,
  Copy, RotateCcw, Github, ExternalLink
} from 'lucide-react'

const LANGUAGES = ['Auto Detect', 'TypeScript', 'JavaScript', 'Python', 'C++', 'C#', 'Java', 'Rust', 'Go', 'SQL']

const EXAMPLES: Record<string, { lang: string; code: string }> = {
  'Memory Leak (C++)': {
    lang: 'C++',
    code: `#include <iostream>
#include <vector>

class DataProcessor {
public:
    int* data;
    int size;

    DataProcessor(int n) {
        size = n;
        data = new int[n];
        for (int i = 0; i < n; i++) data[i] = i * 2;
    }

    int* getSlice(int from, int to) {
        int* slice = new int[to - from];
        for (int i = from; i < to; i++)
            slice[i - from] = data[i];
        return slice;
    }

    int sum() {
        int total = 0;
        for (int i = 0; i < size; i++) total += data[i];
        return total;
    }
};

int main() {
    DataProcessor p(1000);
    int* s = p.getSlice(0, 500);
    std::cout << p.sum() << std::endl;
    return 0;
}`
  },
  'SQL Injection (JS)': {
    lang: 'JavaScript',
    code: `const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'users_db'
});

app.get('/user', (req, res) => {
  const username = req.query.username;
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  const sql = \`SELECT * FROM users WHERE user='\${user}' AND pass='\${pass}'\`;
  db.query(sql, (e, r) => res.json(r[0] || { error: 'Not found' }));
});

app.listen(3000);`
  },
  'React Perf Issues': {
    lang: 'TypeScript',
    code: `import React, { useState } from 'react';

interface User { id: number; name: string; email: string; }

const UserList = ({ users }: { users: User[] }) => {
  const [filter, setFilter] = useState('');
  const [count, setCount] = useState(0);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getStats = () => {
    let total = 0;
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        total += users[i].id * users[j].id;
      }
    }
    return total;
  };

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>
      <p>Stats: {getStats()}</p>
      {filtered.map(u => (
        <div key={u.id} style={{ background: Math.random() > 0.5 ? '#fff' : '#f0f0f0' }}>
          <span>{u.name}</span>
          <span>{u.email}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;`
  }
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 8 ? '#4ade80' : score >= 5 ? '#facc15' : '#f87171'
  const pct = score * 10
  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a24" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="50" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 50}`}
          strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold mono" style={{ color }}>{score}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</div>
      </div>
    </div>
  )
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? '#4ade80' : value >= 5 ? '#facc15' : '#f87171'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="mono" style={{ color }}>{value}/10</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value * 10}%`, background: color, transition: 'width 0.8s ease' }}
        />
      </div>
    </div>
  )
}

function IssueCard({ issue, index }: { issue: ReviewIssue; index: number }) {
  const [open, setOpen] = useState(false)
  const cfg = {
    critical: { icon: AlertCircle, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
    warning: { icon: AlertTriangle, color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)' },
    info: { icon: Info, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  }[issue.severity]
  const Icon = cfg.icon

  return (
    <div
      className="rounded-lg overflow-hidden cursor-pointer animate-fade-up"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, animationDelay: `${index * 60}ms`, opacity: 0 }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3 p-3">
        <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: cfg.color }}>{issue.title}</span>
            {issue.line !== 'general' && (
              <span className="mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                L{issue.line}
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      {open && (
        <div className="px-3 pb-3 space-y-2 animate-fade-in">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{issue.description}</p>
          <div className="p-2 rounded text-xs mono" style={{ background: 'var(--surface2)', color: 'var(--green)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            💡 {issue.fix}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Auto Detect')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState('')
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const review = useCallback(async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setStreaming('')

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: language === 'Auto Detect' ? '' : language }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreaming(full)
      }

      const clean = full.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(clean) as ReviewResult
      setResult(parsed)
      setStreaming('')
    } catch (e) {
      setError('Failed to analyze code. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }, [code, language])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setCode('')
    setResult(null)
    setError('')
    setStreaming('')
    textareaRef.current?.focus()
  }

  const loadExample = (key: string) => {
    const ex = EXAMPLES[key]
    setCode(ex.code)
    setLanguage(ex.lang)
    setResult(null)
    setError('')
  }

  const issueCount = (sev: string) => result?.issues.filter(i => i.severity === sev).length || 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
              <Code2 size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CodeReview<span style={{ color: 'var(--accent)' }}>.ai</span></h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>LLM-powered analysis • Real-time streaming</p>
            </div>
          </div>
          <a
            href="https://github.com/AKavaa/ai-code-reviewer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — Input */}
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm mono outline-none"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <div className="flex gap-2">
                {Object.keys(EXAMPLES).map(key => (
                  <button
                    key={key}
                    onClick={() => loadExample(key)}
                    className="px-2.5 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f87171' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#facc15' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }} />
                </div>
                <div className="flex items-center gap-2">
                  {code && (
                    <button onClick={copyCode} className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                      <Copy size={12} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                  {code && (
                    <button onClick={reset} className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                      <RotateCcw size={12} />
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={`// Paste your code here...\n// Supports C++, TypeScript, Python, C#, Java, and more\n\nfunction example() {\n  return "Ready to review";\n}`}
                className="w-full p-4 mono text-sm resize-none outline-none"
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  minHeight: '420px',
                  lineHeight: '1.7',
                  caretColor: 'var(--accent)',
                }}
                spellCheck={false}
              />
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 text-xs mono" style={{ color: 'var(--text-muted)' }}>
              <span>{code.split('\n').length} lines</span>
              <span>{code.length} chars</span>
              {language !== 'Auto Detect' && <span style={{ color: 'var(--accent)' }}>{language}</span>}
            </div>

            {/* Review button */}
            <button
              onClick={review}
              disabled={loading || !code.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading || !code.trim() ? 'var(--surface2)' : 'var(--accent)',
                color: loading || !code.trim() ? 'var(--text-muted)' : 'white',
                border: '1px solid transparent',
                cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
                boxShadow: !loading && code.trim() ? '0 0 30px rgba(108,99,255,0.3)' : 'none',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Analyze Code
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}
          </div>

          {/* RIGHT — Results */}
          <div className="space-y-4">
            {/* Streaming indicator */}
            {streaming && !result && (
              <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Streaming analysis...</span>
                </div>
                <pre className="mono text-xs overflow-auto max-h-40 typing-cursor" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {streaming.slice(-300)}
                </pre>
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && !streaming && (
              <div className="rounded-xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}>
                  <Eye size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-semibold mb-2">Awaiting Code</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Paste any code on the left and click Analyze.<br />
                  Get instant AI feedback on bugs, security, and performance.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { icon: Shield, label: 'Security Scan', color: '#f87171' },
                    { icon: Activity, label: 'Perf Analysis', color: '#facc15' },
                    { icon: CheckCircle2, label: 'Best Practices', color: '#4ade80' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="p-3 rounded-lg text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <Icon size={20} className="mx-auto mb-1" style={{ color }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4 animate-fade-up">
                {/* Score + summary */}
                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-4">
                    <ScoreRing score={result.score} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--accent)' }}>
                          {result.language}
                        </span>
                        <div className="flex gap-2 text-xs">
                          {issueCount('critical') > 0 && <span style={{ color: '#f87171' }}>{issueCount('critical')} critical</span>}
                          {issueCount('warning') > 0 && <span style={{ color: '#facc15' }}>{issueCount('warning')} warnings</span>}
                          {issueCount('info') > 0 && <span style={{ color: '#60a5fa' }}>{issueCount('info')} info</span>}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold">Code Metrics</h3>
                  {Object.entries(result.metrics).map(([k, v]) => (
                    <MetricBar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
                  ))}
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3">Issues <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>({result.issues.length})</span></h3>
                    {result.issues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
                  </div>
                )}

                {/* Strengths */}
                {result.strengths.length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3">Strengths</h3>
                    <div className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ color: 'var(--text-muted)' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refactored snippet */}
                {result.refactored_snippet && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3">Suggested Refactor</h3>
                    <pre className="mono text-xs p-3 rounded-lg overflow-auto" style={{ background: 'var(--surface2)', color: '#4ade80', whiteSpace: 'pre-wrap', maxHeight: 200 }}>
                      {result.refactored_snippet}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t mt-12 py-6 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        Built by <a href="https://alexkavaleuskiy.me" style={{ color: 'var(--accent)' }}>Aleksander Kavaleuskiy</a>
        {' · '}
        <a href="https://github.com/AKavaa/ai-code-reviewer" className="inline-flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
          <Github size={12} /> Source
        </a>
      </footer>
    </div>
  )
}
