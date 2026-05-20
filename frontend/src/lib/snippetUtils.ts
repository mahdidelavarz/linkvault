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

    // Extract URL
    const urlMatch = curlCommand.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"]+)['"]?/);
    if (urlMatch) result.url = urlMatch[1];

    // Extract method
    const methodMatch = curlCommand.match(/-X\s+(\w+)/);
    if (methodMatch) result.method = methodMatch[1];

    // Extract headers
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(curlCommand)) !== null) {
      const [key, value] = headerMatch[1].split(':');
      result.headers[key.trim()] = value.trim();
    }

    // Extract body
    const bodyMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);
    if (bodyMatch) result.body = bodyMatch[1];

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