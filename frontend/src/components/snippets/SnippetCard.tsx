'use client';

import { Snippet } from '@/types/snippet';
import { useToggleSnippetFavorite, useDeleteSnippet } from '@/hooks/useSnippet';
import { getLanguageIcon, getLanguageName } from '@/lib/languageDetector';
import Button from '@/components/ui/Button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onCopy: (snippet: Snippet) => void;
}

// Map our language keys to react-syntax-highlighter language keys
const languageMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  py: 'python',
  rb: 'ruby',
  java: 'java',
  go: 'go',
  rs: 'rust',
  php: 'php',
  cs: 'csharp',
  cpp: 'cpp',
  c: 'c',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  ps1: 'powershell',
  dockerfile: 'docker',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  md: 'markdown',
  graphql: 'graphql',
  txt: 'text',
};

export default function SnippetCard({ snippet, onEdit, onCopy }: SnippetCardProps) {
  const toggleFavorite = useToggleSnippetFavorite();
  const deleteSnippet = useDeleteSnippet();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      deleteSnippet.mutate(snippet.id);
    }
  };

  const highlightLanguage = languageMap[snippet.language] || 'text';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getLanguageIcon(snippet.language)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {snippet.title}
            </h3>
            <span className="text-xs text-gray-500">
              {getLanguageName(snippet.language)}
            </span>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite.mutate(snippet.id)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          {snippet.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {snippet.description && (
        <p className="text-sm text-gray-600 mb-3">{snippet.description}</p>
      )}

      <div className="mb-3 rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
        <SyntaxHighlighter
          language={highlightLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          {snippet.content.substring(0, 500)}
        </SyntaxHighlighter>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {snippet.category && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            📁 {snippet.category.name}
          </span>
        )}
        {snippet.tags?.map((tag: any) => (
          <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            🏷️ {tag.name}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        <span className="text-xs text-gray-400">
          {new Date(snippet.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onCopy(snippet)}>
            📋 Copy
          </Button>
          <Button variant="outline" onClick={() => onEdit(snippet)}>
            ✏️ Edit
          </Button>
          <Button variant="secondary" onClick={handleDelete}>
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}