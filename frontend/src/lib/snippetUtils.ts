// SQL Keywords for basic formatting
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'UPDATE', 'DELETE',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'INTO', 'VALUES',
  'SET', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'JOIN', 'ON', 'GROUP', 'BY',
  'ORDER', 'ASC', 'DESC', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
  'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'IN', 'NOT',
  'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CASCADE'
];

export function formatSQL(sql: string): string {
  let formatted = sql;
  
  // Uppercase keywords
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, keyword);
  });
  
  // Basic indentation (simple version)
  formatted = formatted
    .replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING)\b/g, '\n$1')
    .replace(/\b(LEFT|RIGHT|INNER|OUTER|JOIN)\b/g, '\n  $1')
    .trim();
  
  return formatted;
}

export function testRegex(pattern: string, testString: string, flags: string = ''): { matches: string[]; isValid: boolean } {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = testString.match(regex);
    return {
      matches: matches ? Array.from(matches) : [],
      isValid: true
    };
  } catch (error) {
    return {
      matches: [],
      isValid: false
    };
  }
}

export function parseCurlCommand(curlCommand: string): {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
} | null {
  try {
    const result: any = {
      method: 'GET',
      url: '',
      headers: {},
      body: ''
    };

    // Join line-continuations so multi-line cURL commands parse as one
    const cmd = curlCommand.replace(/\\\r?\n/g, ' ');

    // Extract URL — first quoted or bare http(s) token, regardless of flag order
    const urlMatch = cmd.match(/curl\s+[\s\S]*?(?:['"](https?:\/\/[^'"]+)['"]|(https?:\/\/\S+))/);
    if (urlMatch) result.url = (urlMatch[1] ?? urlMatch[2]).replace(/[,;]+$/, '');
    if (!result.url) return null;

    // Extract method
    const methodMatch = cmd.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/);
    if (methodMatch) result.method = methodMatch[1].toUpperCase();

    // Extract headers (-H / --header). Use indexOf so a colon inside the
    // value (e.g. "Authorization: Bearer abc:def") isn't truncated.
    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(cmd)) !== null) {
      const colonIdx = headerMatch[1].indexOf(':');
      if (colonIdx === -1) continue;
      const key = headerMatch[1].slice(0, colonIdx).trim();
      const value = headerMatch[1].slice(colonIdx + 1).trim();
      if (key) result.headers[key] = value;
    }

    // Extract body (-d / --data / --data-raw / --data-binary)
    const bodyMatch = cmd.match(/(?:-d|--data(?:-raw|-binary)?)\s+['"]([\s\S]*?)['"](?=\s+-|\s*$)/);
    if (bodyMatch) result.body = bodyMatch[1];

    // cURL defaults to POST when a body is given without an explicit method
    if (!methodMatch && result.body) result.method = 'POST';

    return result;
  } catch {
    return null;
  }
}

export function formatJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

/** Validates a JSON string, returning the parse error message when invalid. */
export function validateJSON(jsonString: string): { isValid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

const SQL_STATEMENT_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
  'TRUNCATE', 'REPLACE', 'MERGE', 'WITH', 'EXPLAIN', 'GRANT', 'REVOKE',
];

/** Lightweight SQL sanity check — balanced parens/quotes and a recognized statement keyword. Not a full parser. */
export function checkSQLSyntax(sql: string): { isValid: boolean; error?: string } {
  const trimmed = sql.trim();
  if (!trimmed) return { isValid: false, error: 'Query is empty' };

  let depth = 0;
  for (const ch of trimmed) {
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth < 0) return { isValid: false, error: 'Unmatched closing parenthesis' };
    }
  }
  if (depth > 0) return { isValid: false, error: 'Unmatched opening parenthesis' };

  if (((trimmed.match(/'/g) || []).length) % 2 !== 0) {
    return { isValid: false, error: 'Unmatched single quote' };
  }
  if (((trimmed.match(/"/g) || []).length) % 2 !== 0) {
    return { isValid: false, error: 'Unmatched double quote' };
  }

  const firstWord = trimmed.match(/^[A-Za-z]+/)?.[0]?.toUpperCase();
  if (!firstWord || !SQL_STATEMENT_KEYWORDS.includes(firstWord)) {
    return { isValid: false, error: `Unrecognized statement keyword: "${firstWord ?? trimmed.slice(0, 10)}"` };
  }

  return { isValid: true };
}

/** Generates a JS `fetch()` call equivalent to the given cURL command. */
export function curlToFetch(curlCommand: string): string {
  const parsed = parseCurlCommand(curlCommand);
  if (!parsed) return '// Could not parse cURL command';
  const { method, url, headers, body } = parsed;
  const hasHeaders = Object.keys(headers).length > 0;

  const lines = [`fetch(${JSON.stringify(url)}, {`, `  method: ${JSON.stringify(method)},`];
  if (hasHeaders) {
    lines.push('  headers: {');
    for (const [k, v] of Object.entries(headers)) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    lines.push('  },');
  }
  if (body) lines.push(`  body: ${JSON.stringify(body)},`);
  lines.push('});');
  return lines.join('\n');
}

/** Generates an `axios()` call equivalent to the given cURL command. */
export function curlToAxios(curlCommand: string): string {
  const parsed = parseCurlCommand(curlCommand);
  if (!parsed) return '// Could not parse cURL command';
  const { method, url, headers, body } = parsed;
  const hasHeaders = Object.keys(headers).length > 0;

  const lines = ['axios({', `  method: ${JSON.stringify(method.toLowerCase())},`, `  url: ${JSON.stringify(url)},`];
  if (hasHeaders) {
    lines.push('  headers: {');
    for (const [k, v] of Object.entries(headers)) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    lines.push('  },');
  }
  if (body) lines.push(`  data: ${JSON.stringify(body)},`);
  lines.push('});');
  return lines.join('\n');
}

/** Generates a Python `requests` call equivalent to the given cURL command. */
export function curlToPython(curlCommand: string): string {
  const parsed = parseCurlCommand(curlCommand);
  if (!parsed) return '# Could not parse cURL command';
  const { method, url, headers, body } = parsed;
  const hasHeaders = Object.keys(headers).length > 0;

  const lines: string[] = [];
  if (hasHeaders) {
    lines.push('headers = {');
    for (const [k, v] of Object.entries(headers)) lines.push(`    "${k}": "${v}",`);
    lines.push('}');
  }
  if (body) lines.push(`data = ${JSON.stringify(body)}`);

  const args = [JSON.stringify(url)];
  if (hasHeaders) args.push('headers=headers');
  if (body) args.push('data=data');
  lines.push(`response = requests.${method.toLowerCase()}(${args.join(', ')})`);
  return lines.join('\n');
}