'use client';

import { useState, useEffect } from 'react';
import { Snippet, CreateSnippetDto, LANGUAGES } from '@/types/snippet';
import { useCreateSnippet, useUpdateSnippet } from '@/hooks/useSnippet';
import { useCategories } from '@/hooks/useCategories';
import { detectLanguage, getLanguageName } from '@/lib/languageDetector';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TagSelector from '@/components/tags/TagSelector';
import CodeEditor from './CodeEditor';

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
    description: '',
    isFavorite: false,
    categoryId: undefined,
    tagIds: [],
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
        description: snippet.description || '',
        isFavorite: snippet.isFavorite,
        categoryId: snippet.categoryId,
        tagIds: snippet.tags ? snippet.tags.map((tag: any) => tag.id) : [],
      });
    }
  }, [snippet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (isEditing && snippet) {
        await updateSnippet.mutateAsync({ id: snippet.id, ...formData });
      } else {
        await createSnippet.mutateAsync(formData);
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

  const isLoading = createSnippet.isPending || updateSnippet.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
      </h3>

      <Input
        label="Title *"
        name="title"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
        placeholder="e.g., Docker compose for PostgreSQL"
      />

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="txt">Auto Detect</option>
            {Object.entries(LANGUAGES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          {formData.content && (
            <p className="text-xs text-gray-500 mt-1">
              Detected: {getLanguageName(detectLanguage(formData.content))}
            </p>
          )}
        </div>
      </div>

      <TagSelector
        selectedTagIds={formData.tagIds || []}
        onChange={(tagIds) => setFormData(prev => ({ ...prev, tagIds }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What does this snippet do?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code *
        </label>
        <CodeEditor
          value={formData.content}
          onChange={handleCodeChange}
          language={formData.language}
          height="300px"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isFavorite}
          onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Mark as favorite</span>
      </label>

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