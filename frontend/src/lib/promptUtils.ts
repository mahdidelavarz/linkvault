import { PromptVariable, AIPlatform } from '@/types/prompt';

// Extract variables from prompt content like {{variable_name}}
export function extractVariables(content: string): PromptVariable[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: PromptVariable[] = [];
  const seen = new Set<string>();
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        defaultValue: '',
        description: `Value for ${name.replace(/_/g, ' ')}`,
      });
    }
  }
  
  return variables;
}

// Replace variables in content with provided values
export function replaceVariables(content: string, values: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
  }
  return result;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Open AI platform with prompt
export function sendToAI(prompt: string, platform: AIPlatform): boolean {
  const urls: Record<AIPlatform, string> = {
    chatgpt: 'https://chat.openai.com/',
    claude: 'https://claude.ai/',
    gemini: 'https://gemini.google.com/',
    copilot: 'https://copilot.microsoft.com/',
    perplexity: 'https://www.perplexity.ai/',
    deepseek: 'https://chat.deepseek.com/',
    generic: '',
  };

  const url = urls[platform];
  if (!url) return false;

  // Open in new tab
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  
  // Copy prompt to clipboard since we can't directly paste into AI sites
  if (newWindow) {
    copyToClipboard(prompt);
    return true;
  }
  
  return false;
}