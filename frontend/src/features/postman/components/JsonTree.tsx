'use client'

import { useState } from 'react'

type JV = string | number | boolean | null | JV[] | { [k: string]: JV }

interface NodeProps {
  value: JV
  keyName?: string
  depth: number
  last: boolean
}

function JsonNode({ value, keyName, depth, last }: NodeProps) {
  const isArr = Array.isArray(value)
  const isObj = value !== null && typeof value === 'object' && !isArr
  const isColl = isArr || isObj

  const [open, setOpen] = useState(depth < 2)

  const entries: [string, JV][] = isColl
    ? isArr
      ? (value as JV[]).map((v, i) => [String(i), v])
      : Object.entries(value as Record<string, JV>)
    : []
  const count = entries.length

  const keyEl = keyName !== undefined
    ? <><span className="jt-key">"{keyName}"</span><span className="jt-colon">: </span></>
    : null

  if (isColl) {
    const openB  = isArr ? '[' : '{'
    const closeB = isArr ? ']' : '}'
    return (
      <div className="jt-node">
        <span
          className="jt-row"
          onClick={() => count && setOpen((o) => !o)}
          style={{ cursor: count ? 'pointer' : 'default' }}
        >
          <span className={['jt-arrow', count ? '' : 'jt-arrow--hidden'].filter(Boolean).join(' ')}>
            {open ? '▾' : '▸'}
          </span>
          {keyEl}
          <span className="jt-bracket">{openB}</span>
          {!open && (
            <>
              <span className="jt-summary">{count} {isArr ? (count === 1 ? 'item' : 'items') : (count === 1 ? 'key' : 'keys')}</span>
              <span className="jt-bracket">{closeB}</span>
            </>
          )}
          {open && count === 0 && <span className="jt-bracket">{closeB}</span>}
          {(!open || count === 0) && !last && <span className="jt-comma">,</span>}
        </span>

        {open && count > 0 && (
          <div className="jt-children">
            {entries.map(([k, v], i) => (
              <JsonNode
                key={k}
                value={v}
                keyName={isArr ? undefined : k}
                depth={depth + 1}
                last={i === count - 1}
              />
            ))}
          </div>
        )}

        {open && count > 0 && (
          <span className="jt-row jt-row--close">
            <span className="jt-arrow jt-arrow--hidden" />
            <span className="jt-bracket">{closeB}</span>
            {!last && <span className="jt-comma">,</span>}
          </span>
        )}
      </div>
    )
  }

  let valueEl: React.ReactNode
  if (value === null)            valueEl = <span className="jt-null">null</span>
  else if (typeof value === 'string')  valueEl = <span className="jt-string">"{value}"</span>
  else if (typeof value === 'number')  valueEl = <span className="jt-number">{value}</span>
  else if (typeof value === 'boolean') valueEl = <span className="jt-bool">{String(value)}</span>

  return (
    <div className="jt-node">
      <span className="jt-row">
        <span className="jt-arrow jt-arrow--hidden" />
        {keyEl}
        {valueEl}
        {!last && <span className="jt-comma">,</span>}
      </span>
    </div>
  )
}

interface JsonTreeProps {
  data: JV
}

export default function JsonTree({ data }: JsonTreeProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="jt-root">
        <JsonNode value={data} depth={0} last={true} />
      </div>
    </>
  )
}

const CSS = `
.jt-root {
  padding:     14px 16px;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: 1.8;
  user-select: text;
}
.jt-node    { display: flex; flex-direction: column; }
.jt-row     { display: flex; align-items: baseline; gap: 2px; white-space: pre; }
.jt-row--close { }
.jt-children { padding-left: 20px; border-left: 1px solid var(--border-subtle); margin-left: 6px; }
.jt-arrow   { width: 14px; flex-shrink: 0; color: var(--text-tertiary); font-size: 10px; line-height: 1.8; text-align: center; }
.jt-arrow--hidden { visibility: hidden; }
.jt-key     { color: var(--cyan-300); }
.jt-colon   { color: var(--text-tertiary); }
.jt-bracket { color: var(--text-secondary); }
.jt-summary { color: var(--text-tertiary); font-style: italic; margin: 0 4px; }
.jt-comma   { color: var(--text-tertiary); }
.jt-string  { color: #86efac; }
.jt-number  { color: #fbbf24; }
.jt-bool    { color: #c084fc; }
.jt-null    { color: #f87171; }
`
