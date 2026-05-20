'use client';

import { useState, useEffect } from 'react';
import { Snippet, CreateSnippetDto, SNIPPET_TYPES, TYPE_LANGUAGES, SnippetType, SnippetMetadata } from '@/types/snippet';
import { useCreateSnippet, useUpdateSnippet } from '@/hooks/useSnippet';
import { useCategories } from '@/hooks/useCategories';
import { detectLanguage, getLanguageName } from '@/lib/languageDetector';
import { formatJSON } from '@/lib/snippetUtils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TagSelector from '@/components/tags/TagSelector';
import CodeEditor from './CodeEditor';
import RegexTester from './RegexTester';
import JSONFormatter from './JSONFormatter';
import CurlParser from './CurlParser';

interface SnippetFormProps {
  snippet?: Snippet | null;
  onClose: () => void;
}

export default function SnippetForm({ snippet, onClose }: SnippetFormProps) {
  const isEditing = !!snippet;

  const [formData, setFormData] = useState<CreateSnippetDto>({
    title: '',
    content: '',
    language: 'txt',
    snippetType: 'code',
    description: '',
    isFavorite: false,
    categoryId: undefined,
    tagIds: [],
    metadata: {},
  });

  const createSnippet = useCreateSnippet();
  const updateSnippet = useUpdateSnippet();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (snippet) {
      setFormData({
        title: snippet.title,
        content: snippet.content,
        language: snippet.language,
        snippetType: (snippet as any).snippetType || 'code',
        description: snippet.description || '',
        isFavorite: snippet.isFavorite,
        categoryId: snippet.categoryId,
        tagIds: snippet.tags ? snippet.tags.map((tag: any) => tag.id) : [],
        metadata: (snippet as any).metadata || {},
      });
    }
  }, [snippet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      const dataToSubmit = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        tagIds: formData.tagIds || [],
        metadata: formData.metadata || {},
      };

      if (isEditing && snippet) {
        await updateSnippet.mutateAsync({ id: snippet.id, ...dataToSubmit });
      } else {
        await createSnippet.mutateAsync(dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };

  const handleCodeChange = (value: string, detectedLanguage?: string) => {
    setFormData(prev => ({
      ...prev,
      content: value,
      language: detectedLanguage || prev.language,
    }));
  };

  const handleTypeChange = (type: SnippetType) => {
    const defaultLanguage = TYPE_LANGUAGES[type][0] || 'txt';
    setFormData(prev => ({
      ...prev,
      snippetType: type,
      language: defaultLanguage,
      metadata: {}, // Reset metadata when type changes
    }));
  };

  const handleMetadataChange = (updates: Partial<SnippetMetadata>) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...updates },
    }));
  };

  const isLoading = createSnippet.isPending || updateSnippet.isPending;

  // Render type-specific fields based on snippetType
  const renderTypeSpecificFields = () => {
    switch (formData.snippetType) {
      case 'regex':
        return (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700">Regex Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Flags"
                value={formData.metadata?.flags || ''}
                onChange={(e) => handleMetadataChange({ flags: e.target.value })}
                placeholder="g, i, m, s, u, y"
              />
              <div className="flex items-end">
                <div className="text-xs text-gray-500">
                  <p><code>g</code> - global</p>
                  <p><code>i</code> - case insensitive</p>
                  <p><code>m</code> - multiline</p>
                  <p><code>s</code> - dotall</p>
                </div>
              </div>
            </div>
            <RegexTester 
              pattern={formData.content} 
              flags={formData.metadata?.flags} 
            />
          </div>
        );

      case 'json':
        return (
          <div className="border-t pt-4">
            <JSONFormatter
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            />
          </div>
        );

      case 'curl':
        return (
          <div className="border-t pt-4">
            <CurlParser curlCommand={formData.content} />
          </div>
        );

      case 'sql':
        return (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">SQL Options</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Type
              </label>
              <select
                value={formData.metadata?.databaseType || ''}
                onChange={(e) => handleMetadataChange({ databaseType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Database</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlserver">SQL Server</option>
                <option value="sqlite">SQLite</option>
                <option value="oracle">Oracle</option>
              </select>
            </div>
          </div>
        );

      case 'command':
        return (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Command Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shell Type
                </label>
                <select
                  value={formData.metadata?.shellType || 'bash'}
                  onChange={(e) => handleMetadataChange({ shellType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bash">Bash</option>
                  <option value="zsh">Zsh</option>
                  <option value="powershell">PowerShell</option>
                  <option value="cmd">CMD</option>
                </select>
              </div>
              <Input
                label="Working Directory"
                value={formData.metadata?.workingDirectory || ''}
                onChange={(e) => handleMetadataChange({ workingDirectory: e.target.value })}
                placeholder="/home/user/project"
              />
            </div>
          </div>
        );

      case 'script':
        return (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Script Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={formData.metadata?.scriptLanguage || ''}
                  onChange={(e) => handleMetadataChange({ scriptLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Language</option>
                  <option value="bash">Bash</option>
                  <option value="python">Python</option>
                  <option value="ruby">Ruby</option>
                  <option value="perl">Perl</option>
                  <option value="lua">Lua</option>
                  <option value="r">R</option>
                </select>
              </div>
              <Input
                label="Dependencies"
                value={formData.metadata?.dependencies || ''}
                onChange={(e) => handleMetadataChange({ dependencies: e.target.value })}
                placeholder="requests, numpy, pandas"
              />
            </div>
          </div>
        );

      case 'code':
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
      </h3>

      {/* Title */}
      <Input
        label="Title *"
        name="title"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
        placeholder="e.g., User Authentication Query"
      />

      {/* Snippet Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type *
        </label>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(SNIPPET_TYPES).map(([key, { label, icon, color }]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key as SnippetType)}
              className={`p-3 rounded-lg text-xs font-medium transition-all border-2 ${
                formData.snippetType === key
                  ? `${color} text-white border-transparent`
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block text-xl mb-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category & Language */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.categoryId || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              categoryId: e.target.value ? parseInt(e.target.value) : undefined
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="txt">Auto Detect</option>
            {TYPE_LANGUAGES[formData.snippetType]?.map((lang) => (
              <option key={lang} value={lang}>{getLanguageName(lang)}</option>
            ))}
          </select>
          {formData.content && (
            <p className="text-xs text-gray-500 mt-1">
              Detected: {getLanguageName(detectLanguage(formData.content))}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <TagSelector
        selectedTagIds={formData.tagIds || []}
        onChange={(tagIds) => setFormData(prev => ({ ...prev, tagIds }))}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What does this snippet do? When should it be used?"
        />
      </div>

      {/* Code Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.snippetType === 'command' ? 'Command *' :
           formData.snippetType === 'curl' ? 'cURL Request *' :
           formData.snippetType === 'regex' ? 'Regex Pattern *' :
           formData.snippetType === 'sql' ? 'SQL Query *' :
           formData.snippetType === 'json' ? 'JSON Data *' :
           'Code *'}
        </label>
        <CodeEditor
          value={formData.content}
          onChange={handleCodeChange}
          language={formData.language}
          height="300px"
        />
      </div>

      {/* Type-Specific Fields */}
      {renderTypeSpecificFields()}

      {/* Favorite Toggle */}
      <label className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          checked={formData.isFavorite}
          onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Mark as favorite</span>
      </label>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update Snippet' : 'Create Snippet'}
        </Button>
      </div>
    </form>
  );
}