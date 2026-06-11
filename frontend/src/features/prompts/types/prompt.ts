export interface PromptVersion {
  title: string;
  content: string;
  description?: string;
  promptType: string;
  targetAI?: string;
  expectedOutput?: string;
  variables?: PromptVariable[];
  savedAt: string;
}

export interface Prompt {
  id: number;
  title: string;
  content: string;
  description?: string;
  promptType: PromptType;
  targetAI?: AIPlatform;
  expectedOutput?: string;
  usageCount: number;
  lastUsedAt?: string;
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
  variables?: PromptVariable[];
  versions?: PromptVersion[];
}

export interface Tag {
  id: number;
  name: string;
}

export type PromptType = 'ai-chat' | 'project-template' | 'code-generation' | 'documentation' | 'system-design' | 'custom';

export type AIPlatform = 'chatgpt' | 'claude' | 'gemini' | 'copilot' | 'perplexity' | 'deepseek' | 'generic';

export interface CreatePromptDto {
  title: string;
  content: string;
  description?: string;
  promptType: PromptType;
  targetAI?: AIPlatform;
  expectedOutput?: string;
  isFavorite?: boolean;
  categoryId?: number;
  tagIds?: number[];
  variables?: PromptVariable[];
}

export interface UpdatePromptDto extends Partial<CreatePromptDto> {
  id: number;
}

export interface PromptVariable {
  name: string;
  defaultValue: string;
  description?: string;
}

// AI Platform URLs and paste instructions
export const AI_PLATFORMS: Record<AIPlatform, {
  name: string;
  icon: string;
  url: string;
  color: string;
}> = {
  chatgpt: {
    name: 'ChatGPT',
    icon: '🤖',
    url: 'https://chat.openai.com',
    color: 'bg-green-600',
  },
  claude: {
    name: 'Claude',
    icon: '🧠',
    url: 'https://claude.ai',
    color: 'bg-orange-600',
  },
  gemini: {
    name: 'Gemini',
    icon: '💎',
    url: 'https://gemini.google.com',
    color: 'bg-blue-600',
  },
  copilot: {
    name: 'Copilot',
    icon: '💻',
    url: 'https://copilot.microsoft.com',
    color: 'bg-purple-600',
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔮',
    url: 'https://www.perplexity.ai',
    color: 'bg-indigo-600',
  },
  deepseek: {
    name: 'DeepSeek',
    icon: '🐋',
    url: 'https://chat.deepseek.com',
    color: 'bg-teal-600',
  },
  generic: {
    name: 'Generic AI',
    icon: '🤖',
    url: '',
    color: 'bg-gray-600',
  },
};

export const PROMPT_TYPES: Record<PromptType, { label: string; icon: string }> = {
  'ai-chat': { label: 'AI Chat', icon: '💬' },
  'project-template': { label: 'Project Template', icon: '📋' },
  'code-generation': { label: 'Code Generation', icon: '⚡' },
  'documentation': { label: 'Documentation', icon: '📚' },
  'system-design': { label: 'System Design', icon: '🏗️' },
  'custom': { label: 'Custom', icon: '✨' },
};