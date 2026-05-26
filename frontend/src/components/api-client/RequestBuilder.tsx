'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { type HttpMethod, HTTP_METHODS } from '@/types/api'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     '#34d399', POST:    '#60a5fa', PUT:     '#fbbf24',
  PATCH:   '#a78bfa', DELETE:  '#f87171', HEAD:    '#22d3ee', OPTIONS: '#9ca3af',
}

interface RequestBuilderProps {
  method:       HttpMethod
  url:          string
  headers:      string
  body:         string
  bodyType:     'json' | 'raw' | 'form-data'
  isSaved:      boolean
  isSending:    boolean
  onMethodChange:   (m: HttpMethod) => void
  onUrlChange:      (u: string) => void
  onHeadersChange:  (h: string) => void
  onBodyChange:     (b: string) => void
  onBodyTypeChange: (t: 'json' | 'raw' | 'form-data') => void
  onSend:       () => void
  onSave:       () => void
  onDelete:     () => void
  title:        string
}

type Tab = 'headers' | 'body'

export default function RequestBuilder({
  method, url, headers, body, bodyType,
  isSaved, isSending,
  onMethodChange, onUrlChange, onHeadersChange, onBodyChange, onBodyTypeChange,
  onSend, onSave, onDelete,
  title,
}: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('headers')
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  return (
    <>
      <style>{CSS}</style>
      <div className="rb">

        {/* ── Title row ── */}
        <div className="rb-title-row">
          <span className="rb-title">{title}</span>
          <div className="rb-title-actions">
            <button className="rb-save-btn" onClick={onSave} title={isSaved ? 'Update' : 'Save'}>
              <Icon icon={isSaved ? 'lucide:save' : 'lucide:bookmark-plus'} width={14} />
              {isSaved ? 'Update' : 'Save'}
            </button>
            {isSaved && (
              <button className="rb-del-btn" onClick={onDelete} title="Delete endpoint">
                <Icon icon="lucide:trash-2" width={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── URL bar ── */}
        <div className="rb-url-bar">
          {/* Method select */}
          <div className="rb-method-wrap">
            <select
              className="rb-method"
              value={method}
              onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
              style={{ color: METHOD_COLORS[method] }}
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Icon icon="lucide:chevron-down" className="rb-method-chevron" style={{ color: METHOD_COLORS[method] }} />
          </div>

          {/* URL input */}
          <input
            className="rb-url"
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            spellCheck={false}
          />

          {/* Send button */}
          <button
            className="rb-send-btn"
            onClick={onSend}
            disabled={!url.trim() || isSending}
            aria-label="Send request"
          >
            {isSending
              ? <Icon icon="svg-spinners:ring-resize" width={16} />
              : <Icon icon="lucide:send" width={16} />
            }
            <span className="rb-send-label">Send</span>
          </button>
        </div>

        {/* ── Tabs: Headers / Body ── */}
        <div className="rb-tabs">
          <button
            className={['rb-tab', activeTab === 'headers' ? 'rb-tab--active' : ''].filter(Boolean).join(' ')}
            onClick={() => setActiveTab('headers')}
          >
            <Icon icon="lucide:list" width={13} />
            Headers
            {headers.trim() && <span className="rb-tab-dot" />}
          </button>
          <button
            className={['rb-tab', activeTab === 'body' ? 'rb-tab--active' : '', !hasBody ? 'rb-tab--disabled' : ''].filter(Boolean).join(' ')}
            onClick={() => hasBody && setActiveTab('body')}
            disabled={!hasBody}
            title={!hasBody ? 'Body not available for ' + method : undefined}
          >
            <Icon icon="lucide:braces" width={13} />
            Body
            {hasBody && body.trim() && <span className="rb-tab-dot" />}
          </button>
        </div>

        {/* ── Headers panel ── */}
        {activeTab === 'headers' && (
          <div className="rb-panel">
            <p className="rb-panel-hint">
              One header per line: <code>Key: Value</code>
            </p>
            <textarea
              className="rb-textarea rb-textarea--mono"
              value={headers}
              onChange={(e) => onHeadersChange(e.target.value)}
              placeholder={'Content-Type: application/json\nAuthorization: Bearer token'}
              rows={6}
              spellCheck={false}
            />
          </div>
        )}

        {/* ── Body panel ── */}
        {activeTab === 'body' && hasBody && (
          <div className="rb-panel">
            <div className="rb-body-type-row">
              {(['json', 'raw', 'form-data'] as const).map((t) => (
                <button
                  key={t}
                  className={['rb-body-type-btn', bodyType === t ? 'rb-body-type-btn--active' : ''].filter(Boolean).join(' ')}
                  onClick={() => onBodyTypeChange(t)}
                >
                  {t === 'json' ? 'JSON' : t === 'raw' ? 'Raw' : 'Form Data'}
                </button>
              ))}
            </div>
            <textarea
              className="rb-textarea rb-textarea--mono"
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : bodyType === 'form-data' ? 'key=value\nfoo=bar' : 'Raw body content'}
              rows={8}
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </>
  )
}

const CSS = `
.rb {
  display:        flex;
  flex-direction: column;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
  overflow:       hidden;
}

/* Title row */
.rb-title-row {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         12px 16px;
  border-bottom:   1px solid var(--border-subtle);
  flex-shrink:     0;
}
.rb-title        { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rb-title-actions{ display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.rb-save-btn {
  display:       flex; align-items: center; gap: 6px;
  height:        30px; padding: 0 12px;
  background:    var(--accent-muted); border: 1px solid var(--accent-border);
  border-radius: var(--radius-md); color: var(--cyan-300);
  font-size:     var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor:        pointer; min-height: 44px;
  transition:    background var(--transition-fast), box-shadow var(--transition-fast);
}
.rb-save-btn:hover { background: var(--accent); color: white; }
.rb-del-btn {
  display:         flex; align-items: center; justify-content: center;
  width:           34px; height: 30px; min-height: 44px;
  background:      transparent; border: 1px solid var(--border-default);
  border-radius:   var(--radius-md); color: var(--text-tertiary); cursor: pointer;
  transition:      background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.rb-del-btn:hover { background: var(--danger-muted); border-color: rgba(239,68,68,0.3); color: var(--danger); }

/* URL bar */
.rb-url-bar {
  display:     flex;
  align-items: center;
  gap:         8px;
  padding:     12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.rb-method-wrap { position: relative; display: flex; align-items: center; flex-shrink: 0; }
.rb-method {
  height:38px;
  padding:            0 28px 0 10px;
  background:         var(--bg-elevated);
  border:             1px solid var(--border-default);
  border-radius:      var(--radius-md);
  font-family:        var(--font-mono);
  font-size:          var(--text-sm);
  font-weight:        700;
  outline:            none;
  cursor:             pointer;
  appearance:         none;
  -webkit-appearance: none;
  transition:         border-color var(--transition-fast);
}
.rb-method:focus           { border-color: var(--border-focus); }
.rb-method option          { background: var(--bg-elevated); color: var(--text-primary); font-weight: 700; }
.rb-method-chevron         { position: absolute; right: 8px; width: 12px; height: 12px; pointer-events: none; }

.rb-url {
  flex:          1;
  height:        38px;
  padding:       0 12px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-mono);
  font-size:     var(--text-sm);
  outline:       none;
  transition:    border-color var(--transition-fast), background var(--transition-fast);
  min-width:     0;
}
.rb-url::placeholder { color: var(--text-tertiary); }
.rb-url:focus        { border-color: var(--border-focus); background: var(--bg-elevated); }

.rb-send-btn {
  display:       flex; align-items: center; gap: 6px;
  height:        38px; padding: 0 16px;
  background:    var(--accent); border: none;
  border-radius: var(--radius-md); color: var(--text-inverse);
  font-size:     var(--text-sm); font-family: var(--font-sans); font-weight: 600;
  cursor:        pointer; flex-shrink: 0; min-height: 44px;
  transition:    background var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
}
.rb-send-btn:hover:not(:disabled) { background: var(--accent-hover); box-shadow: var(--shadow-glow); }
.rb-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 479px) { .rb-send-label { display: none; } }

/* Tabs */
.rb-tabs {
  display:       flex;
  gap:           2px;
  padding:       8px 12px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink:   0;
}
.rb-tab {
  display:       flex; align-items: center; gap: 5px;
  height:        30px; padding: 0 12px;
  background:    transparent; border: 1px solid transparent; border-radius: var(--radius-md);
  color:         var(--text-tertiary); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor:        pointer; min-height: 40px; position: relative;
  transition:    background var(--transition-fast), color var(--transition-fast);
}
.rb-tab:hover         { background: var(--bg-overlay); color: var(--text-primary); }
.rb-tab--active       { background: var(--bg-overlay); color: var(--text-primary); border-color: var(--border-default); }
.rb-tab--disabled     { opacity: 0.4; cursor: not-allowed; }
.rb-tab-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent); position: absolute; top: 6px; right: 6px;
}

/* Panel */
.rb-panel { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.rb-panel-hint { font-size: var(--text-xs); color: var(--text-tertiary); }
.rb-panel-hint code { background: var(--bg-overlay); color: var(--cyan-300); padding: 1px 5px; border-radius: 3px; font-family: var(--font-mono); }

.rb-textarea {
  width:         100%;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  line-height:   var(--leading-relaxed);
  padding:       10px 12px;
  outline:       none;
  resize:        vertical;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.rb-textarea--mono   { font-family: var(--font-mono); font-size: var(--text-xs); }
.rb-textarea::placeholder { color: var(--text-tertiary); }
.rb-textarea:focus   { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-muted); }

/* Body type */
.rb-body-type-row { display: flex; gap: 4px; }
.rb-body-type-btn {
  height:        28px; padding: 0 12px;
  background:    transparent; border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color:         var(--text-tertiary); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor:        pointer; min-height: 40px;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.rb-body-type-btn:hover       { border-color: var(--border-strong); color: var(--text-primary); }
.rb-body-type-btn--active     { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }
`