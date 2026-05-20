'use client';

import { Snippet, SNIPPET_TYPES, SnippetType } from '@/types/snippet';
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
  regex: 'javascript', // Use JS highlighting for regex
  curl: 'bash',        // Use bash for curl
};

export default function SnippetCard({ snippet, onEdit, onCopy }: SnippetCardProps) {
  const toggleFavorite = useToggleSnippetFavorite();
  const deleteSnippet = useDeleteSnippet();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      deleteSnippet.mutate(snippet.id);
    }
  };

  // Safely get snippet type info
  const snippetTypeKey = (snippet.snippetType || 'code') as SnippetType;
  const snippetType = SNIPPET_TYPES[snippetTypeKey] || SNIPPET_TYPES.code;
  
  // Safely get language
  const highlightLanguage = languageMap[snippet.language] || 'text';
  
  // Get language name
  const languageName = getLanguageName(snippet.language);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getLanguageIcon(snippet.language)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {snippet.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Badge */}
              <span className={`text-xs text-white px-2 py-0.5 rounded-full ${snippetType.color}`}>
                {snippetType.icon} {snippetType.label}
              </span>
              {/* Language */}
              <span className="text-xs text-gray-500">
                {languageName}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite.mutate(snippet.id)}
          className="text-2xl hover:scale-110 transition-transform flex-shrink-0"
        >
          {snippet.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {snippet.description && (
        <p className="text-sm text-gray-600 mb-3">{snippet.description}</p>
      )}

      {/* Code Preview */}
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

      {/* Tags & Category */}
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

      {/* Type-specific metadata */}
      {snippetTypeKey === 'regex' && snippet.metadata?.flags && (
        <div className="text-xs text-gray-500 mb-2">
          Flags: <code className="bg-gray-100 px-1 rounded">{snippet.metadata.flags}</code>
        </div>
      )}
      {snippetTypeKey === 'sql' && snippet.metadata?.databaseType && (
        <div className="text-xs text-gray-500 mb-2">
          Database: <span className="font-medium">{snippet.metadata.databaseType}</span>
        </div>
      )}
      {snippetTypeKey === 'command' && snippet.metadata?.shellType && (
        <div className="text-xs text-gray-500 mb-2">
          Shell: <span className="font-medium">{snippet.metadata.shellType}</span>
        </div>
      )}

      {/* Timestamp */}
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