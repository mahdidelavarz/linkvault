'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'

interface ApiResponse {
  status:     number
  statusText: string
  body:       any
  headers:    Record<string, string>
  size:       number
  time:       number
}

interface ResponseViewerProps {
  response: ApiResponse | null
  isLoading: boolean
}

type Tab = 'body' | 'headers'

function getStatusColor(status: number): string {
  if (status === 0)    return 'var(--danger)'
  if (status < 300)    return 'var(--success)'
  if (status < 400)    return 'var(--warning)'
  return 'var(--danger)'
}

function formatBody(body: any): string {
  if (typeof body === 'string') {
    try { return JSON.stringify(JSON.parse(body), null, 2) }
    catch { return body }
  }
  return JSON.stringify(body, null, 2)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [tab,      setTab]      = useState<Tab>('body')
  const [copied,   setCopied]   = useState(false)
  const [wordWrap, setWordWrap] = useState(true)

  const handleCopyBody = async () => {
    if (!response) return
    await navigator.clipboard.writeText(formatBody(response.body))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading state
  if (isLoading) return (
    <>
      <style>{CSS}</style>
      <div className="rv rv--loading">
        <Icon icon="svg-spinners:ring-resize" width={28} className="rv-spinner" />
        <p className="rv-loading-text">Sending request…</p>
      </div>
    </>
  )

  // Empty state
  if (!response) return (
    <>
      <style>{CSS}</style>
      <div className="rv rv--empty">
        <div className="rv-empty-icon">
          <Icon icon="lucide:send" width={26} />
        </div>
        <p className="rv-empty-title">No response yet</p>
        <p className="rv-empty-sub">Enter a URL and press Send to test your API</p>
      </div>
    </>
  )

  const formattedBody = formatBody(response.body)
  const statusColor   = getStatusColor(response.status)
  const headerCount   = Object.keys(response.headers ?? {}).length

  return (
    <>
      <style>{CSS}</style>
      <div className="rv">

        {/* ── Status bar ── */}
        <div className="rv-status-bar">
          <div className="rv-status-left">
            <span className="rv-status-badge" style={{ color: statusColor, borderColor: statusColor + '33', background: statusColor + '1a' }}>
              {response.status} {response.statusText}
            </span>
            <span className="rv-stat"><Icon icon="lucide:timer" width={12} />{response.time}ms</span>
            {response.size > 0 && (
              <span className="rv-stat"><Icon icon="lucide:hard-drive" width={12} />{formatSize(response.size)}</span>
            )}
          </div>

          <div className="rv-status-right">
            <button
              className={['rv-tool-btn', wordWrap ? 'rv-tool-btn--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setWordWrap((p) => !p)}
              title="Toggle word wrap"
            >
              <Icon icon="lucide:wrap-text" width={13} />
            </button>
            <button
              className={['rv-copy-btn', copied ? 'rv-copy-btn--copied' : ''].filter(Boolean).join(' ')}
              onClick={handleCopyBody}
            >
              <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} width={13} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="rv-tabs">
          <button
            className={['rv-tab', tab === 'body' ? 'rv-tab--active' : ''].filter(Boolean).join(' ')}
            onClick={() => setTab('body')}
          >
            <Icon icon="lucide:braces" width={13} />Body
          </button>
          <button
            className={['rv-tab', tab === 'headers' ? 'rv-tab--active' : ''].filter(Boolean).join(' ')}
            onClick={() => setTab('headers')}
          >
            <Icon icon="lucide:list" width={13} />Headers
            <span className="rv-tab-count">{headerCount}</span>
          </button>
        </div>

        {/* ── Body ── */}
        {tab === 'body' && (
          <div className="rv-body-wrap">
            <pre className={['rv-body', wordWrap ? 'rv-body--wrap' : ''].filter(Boolean).join(' ')}>
              <code>{formattedBody}</code>
            </pre>
          </div>
        )}

        {/* ── Headers ── */}
        {tab === 'headers' && (
          <div className="rv-headers-wrap">
            {headerCount === 0 ? (
              <p className="rv-headers-empty">No response headers</p>
            ) : (
              Object.entries(response.headers).map(([key, val]) => (
                <div key={key} className="rv-header-row">
                  <span className="rv-header-key">{key}</span>
                  <span className="rv-header-sep">:</span>
                  <span className="rv-header-val">{val}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}

const CSS = `
.rv {
  display:        flex;
  flex-direction: column;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
  overflow:       hidden;
  min-height:     200px;
}

/* Loading / Empty */
.rv--loading, .rv--empty {
  flex:            1;
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             12px;
  padding:         40px;
  text-align:      center;
}
.rv-spinner      { color: var(--accent); }
.rv-loading-text { font-size: var(--text-sm); color: var(--text-tertiary); }
.rv-empty-icon   {
  display:         flex; align-items: center; justify-content: center;
  width:           52px; height: 52px;
  background:      var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius:   var(--radius-lg); color: var(--text-tertiary);
}
.rv-empty-title { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.rv-empty-sub   { font-size: var(--text-sm); color: var(--text-tertiary); }

/* Status bar */
.rv-status-bar {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         10px 14px;
  border-bottom:   1px solid var(--border-subtle);
  flex-shrink:     0;
  flex-wrap:       wrap;
}
.rv-status-left  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rv-status-badge {
  display:       inline-flex; align-items: center;
  padding:       3px 10px; border-radius: var(--radius-full);
  border:        1px solid; font-size: var(--text-xs); font-weight: 700; font-family: var(--font-mono);
}
.rv-stat {
  display:     flex; align-items: center; gap: 4px;
  font-size:   var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono);
}
.rv-status-right { display: flex; align-items: center; gap: 6px; }

.rv-tool-btn {
  display:         flex; align-items: center; justify-content: center;
  width:           28px; height: 28px; border-radius: var(--radius-sm);
  background:      transparent; border: 1px solid var(--border-default);
  color:           var(--text-tertiary); cursor: pointer; min-height: 40px;
  transition:      background var(--transition-fast), color var(--transition-fast);
}
.rv-tool-btn:hover      { background: var(--bg-overlay); color: var(--text-primary); }
.rv-tool-btn--active    { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }

.rv-copy-btn {
  display:       flex; align-items: center; gap: 5px;
  height:        28px; padding: 0 10px; border-radius: var(--radius-sm);
  background:    var(--bg-elevated); border: 1px solid var(--border-default);
  color:         var(--text-secondary); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor:        pointer; min-height: 40px;
  transition:    background var(--transition-fast), color var(--transition-fast);
}
.rv-copy-btn:hover     { background: var(--bg-overlay); color: var(--text-primary); }
.rv-copy-btn--copied   { background: var(--success-muted); border-color: rgba(16,185,129,0.3); color: #34d399; }

/* Tabs */
.rv-tabs {
  display:       flex; gap: 2px;
  padding:       6px 10px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink:   0;
}
.rv-tab {
  display:       flex; align-items: center; gap: 5px;
  height:        28px; padding: 0 10px;
  background:    transparent; border: 1px solid transparent; border-radius: var(--radius-md);
  color:         var(--text-tertiary); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor:        pointer; min-height: 40px;
  transition:    background var(--transition-fast), color var(--transition-fast);
}
.rv-tab:hover    { background: var(--bg-overlay); color: var(--text-primary); }
.rv-tab--active  { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.rv-tab-count {
  background: var(--bg-overlay); color: var(--text-tertiary);
  font-size: 10px; padding: 0 5px; border-radius: 99px; font-weight: 600;
}

/* Body */
.rv-body-wrap { flex: 1; overflow: auto; }
.rv-body {
  margin:      0;
  padding:     14px 16px;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: var(--leading-relaxed);
  color:       var(--cyan-200);
  white-space: pre;
  tab-size:    2;
}
.rv-body--wrap { white-space: pre-wrap; word-break: break-word; }
.rv-body::-webkit-scrollbar { width: 6px; height: 6px; }
.rv-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

/* Headers */
.rv-headers-wrap {
  flex:       1;
  overflow-y: auto;
  padding:    8px 16px;
  display:    flex;
  flex-direction: column;
  gap:        4px;
}
.rv-headers-empty { font-size: var(--text-sm); color: var(--text-tertiary); padding: 16px 0; }
.rv-header-row    { display: flex; gap: 8px; font-size: var(--text-xs); font-family: var(--font-mono); padding: 3px 0; flex-wrap: wrap; }
.rv-header-key    { color: var(--cyan-300); font-weight: 600; }
.rv-header-sep    { color: var(--text-tertiary); }
.rv-header-val    { color: var(--text-secondary); word-break: break-all; }
`