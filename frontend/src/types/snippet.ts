export interface Snippet {
  id: number;
  title: string;
  content: string;
  language: string;
  snippetType: SnippetType;
  description?: string;
  isFavorite: boolean;
  categoryId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  metadata?: SnippetMetadata;
  category?: {
    id: number;
    name: string;
  };
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
}

// New snippet types
export type SnippetType = 'code' | 'sql' | 'regex' | 'command' | 'curl' | 'json' | 'script';

// Type-specific metadata
export interface SnippetMetadata {
  // SQL
  databaseType?: 'mysql' | 'postgresql' | 'sqlserver' | 'sqlite' | 'oracle';
  
  // Regex
  testString?: string;
  flags?: string;
  
  // Command
  shellType?: 'bash' | 'zsh' | 'powershell' | 'cmd';
  workingDirectory?: string;
  
  // cURL
  curlMethod?: string;
  curlHeaders?: string;
  curlBody?: string;
  
  // Script
  scriptLanguage?: string;
  dependencies?: string;
}

export interface CreateSnippetDto {
  title: string;
  content: string;
  language?: string;
  snippetType: SnippetType;
  description?: string;
  isFavorite?: boolean;
  categoryId?: number;
  tagIds?: number[];
  metadata?: SnippetMetadata;
}

export interface UpdateSnippetDto extends Partial<CreateSnippetDto> {
  id: number;
}

export const SNIPPET_TYPES: Record<SnippetType, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  code: { 
    label: 'Code', 
    icon: '💻', 
    color: 'bg-blue-600',
    description: 'Code snippets in various languages'
  },
  sql: { 
    label: 'SQL', 
    icon: '🗄️', 
    color: 'bg-orange-600',
    description: 'SQL queries and database scripts'
  },
  regex: { 
    label: 'Regex', 
    icon: '📝', 
    color: 'bg-green-600',
    description: 'Regular expressions with test strings'
  },
  command: { 
    label: 'Command', 
    icon: '⚡', 
    color: 'bg-yellow-600',
    description: 'CLI commands and shell scripts'
  },
  curl: { 
    label: 'cURL', 
    icon: '🌐', 
    color: 'bg-teal-600',
    description: 'cURL requests and API calls'
  },
  json: { 
    label: 'JSON', 
    icon: '📋', 
    color: 'bg-purple-600',
    description: 'JSON templates and data structures'
  },
  script: { 
    label: 'Script', 
    icon: '🔧', 
    color: 'bg-red-600',
    description: 'Bash, Python, and other scripts'
  },
};

// Language mapping for each type
export const TYPE_LANGUAGES: Record<SnippetType, string[]> = {
  code: ['js', 'ts', 'py', 'java', 'go', 'rust', 'cpp', 'php', 'rb', 'swift', 'kt', 'scala'],
  sql: ['sql', 'mysql', 'pgsql', 'plsql'],
  regex: ['regex'],
  command: ['bash', 'zsh', 'sh', 'ps1', 'cmd'],
  curl: ['bash', 'curl'],
  json: ['json'],
  script: ['bash', 'py', 'rb', 'pl', 'lua', 'r'],
};