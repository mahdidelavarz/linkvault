export interface Snippet {
  id: number;
  title: string;
  content: string;
  language: string;
  description?: string;
  isFavorite: boolean;
  categoryId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
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

export interface CreateSnippetDto {
  title: string;
  content: string;
  language?: string;
  description?: string;
  isFavorite?: boolean;
  categoryId?: number;
  tagIds?: number[];
}

export interface UpdateSnippetDto extends Partial<CreateSnippetDto> {
  id: number;
}

// Language detection utility
export const LANGUAGES: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'React JSX',
  ts: 'TypeScript',
  tsx: 'React TSX',
  py: 'Python',
  rb: 'Ruby',
  java: 'Java',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  cs: 'C#',
  cpp: 'C++',
  c: 'C',
  swift: 'Swift',
  kt: 'Kotlin',
  scala: 'Scala',
  sql: 'SQL',
  sh: 'Shell/Bash',
  bash: 'Bash',
  zsh: 'Zsh',
  ps1: 'PowerShell',
  dockerfile: 'Docker',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  md: 'Markdown',
  graphql: 'GraphQL',
  proto: 'Protobuf',
  tf: 'Terraform',
  hcl: 'HCL',
  nginx: 'Nginx',
  env: 'Environment',
  txt: 'Plain Text',
};