// P5-8 A-1: Generate runnable client code from a request the user just sent in the API client.

export interface RequestSnapshot {
  method:  string
  url:     string
  headers: Record<string, string>
  body?:   string
}

export type CodeFormat = 'curl' | 'fetch' | 'axios' | 'python'

export const CODE_FORMATS: { value: CodeFormat; label: string }[] = [
  { value: 'curl',  label: 'cURL' },
  { value: 'fetch', label: 'fetch' },
  { value: 'axios', label: 'axios' },
  { value: 'python', label: 'Python' },
]

function generateCurl({ method, url, headers, body }: RequestSnapshot): string {
  const parts = [`curl -X ${method} '${url}'`]
  for (const [key, value] of Object.entries(headers)) {
    parts.push(`  -H '${key}: ${value}'`)
  }
  if (body) parts.push(`  -d '${body.replace(/'/g, "'\\''")}'`)
  return parts.join(' \\\n')
}

function generateFetch({ method, url, headers, body }: RequestSnapshot): string {
  const hasHeaders = Object.keys(headers).length > 0
  const lines = [`fetch(${JSON.stringify(url)}, {`, `  method: ${JSON.stringify(method)},`]
  if (hasHeaders) {
    lines.push('  headers: {')
    for (const [k, v] of Object.entries(headers)) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    lines.push('  },')
  }
  if (body) lines.push(`  body: ${JSON.stringify(body)},`)
  lines.push('});')
  return lines.join('\n')
}

function generateAxios({ method, url, headers, body }: RequestSnapshot): string {
  const hasHeaders = Object.keys(headers).length > 0
  const lines = ['axios({', `  method: ${JSON.stringify(method.toLowerCase())},`, `  url: ${JSON.stringify(url)},`]
  if (hasHeaders) {
    lines.push('  headers: {')
    for (const [k, v] of Object.entries(headers)) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    lines.push('  },')
  }
  if (body) lines.push(`  data: ${JSON.stringify(body)},`)
  lines.push('});')
  return lines.join('\n')
}

function generatePython({ method, url, headers, body }: RequestSnapshot): string {
  const hasHeaders = Object.keys(headers).length > 0
  const lines = ['import requests', '']
  if (hasHeaders) {
    lines.push('headers = {')
    for (const [k, v] of Object.entries(headers)) lines.push(`    "${k}": "${v}",`)
    lines.push('}')
    lines.push('')
  }
  if (body) {
    lines.push(`data = ${JSON.stringify(body)}`)
    lines.push('')
  }

  const args = [JSON.stringify(url)]
  if (hasHeaders) args.push('headers=headers')
  if (body) args.push('data=data')
  lines.push(`response = requests.${method.toLowerCase()}(${args.join(', ')})`)
  return lines.join('\n')
}

export function generateCode(format: CodeFormat, request: RequestSnapshot): string {
  switch (format) {
    case 'curl':   return generateCurl(request)
    case 'fetch':  return generateFetch(request)
    case 'axios':  return generateAxios(request)
    case 'python': return generatePython(request)
  }
}
