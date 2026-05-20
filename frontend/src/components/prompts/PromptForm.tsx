'use client';

import { useState, useEffect } from 'react';
import { Prompt, CreatePromptDto, PROMPT_TYPES, AI_PLATFORMS, PromptType, AIPlatform } from '@/types/prompt';
import { useCreatePrompt, useUpdatePrompt } from '@/hooks/usePrompt';
import { useCategories } from '@/hooks/useCategories';
import { extractVariables } from '@/lib/promptUtils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TagSelector from '@/components/tags/TagSelector';

interface PromptFormProps {
  prompt?: Prompt | null;
  onClose: () => void;
}

export default function PromptForm({ prompt, onClose }: PromptFormProps) {
  const isEditing = !!prompt;

  const [formData, setFormData] = useState<CreatePromptDto>({
    title: '',
    content: '',
    description: '',
    promptType: 'ai-chat',
    targetAI: undefined,
    expectedOutput: '',
    isFavorite: false,
    categoryId: undefined,
    tagIds: [],
  });

  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        content: prompt.content,
        description: prompt.description || '',
        promptType: prompt.promptType as PromptType,
        targetAI: prompt.targetAI as AIPlatform,
        expectedOutput: prompt.expectedOutput || '',
        isFavorite: prompt.isFavorite,
        categoryId: prompt.categoryId,
        tagIds: prompt.tags ? prompt.tags.map((tag: any) => tag.id) : [],
      });
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (isEditing && prompt) {
        await updatePrompt.mutateAsync({ id: prompt.id, ...formData });
      } else {
        await createPrompt.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const variables = extractVariables(formData.content);
  const isLoading = createPrompt.isPending || updatePrompt.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
      </h3>

      <Input
        label="Title *"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder="e.g., React Component Generator"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.promptType}
            onChange={(e) => setFormData(prev => ({ ...prev, promptType: e.target.value as PromptType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PROMPT_TYPES).map(([key, { label, icon }]) => (
              <option key={key} value={key}>{icon} {label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target AI</label>
          <select
            value={formData.targetAI || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAI: (e.target.value || undefined) as AIPlatform }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None (Generic)</option>
            {Object.entries(AI_PLATFORMS).map(([key, { name, icon }]) => (
              <option key={key} value={key}>{icon} {name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.categoryId || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value ? parseInt(e.target.value) : undefined }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Category</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <TagSelector
        selectedTagIds={formData.tagIds || []}
        onChange={(tagIds) => setFormData(prev => ({ ...prev, tagIds }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What does this prompt do?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prompt Content * 
          <span className="text-xs text-gray-500 ml-2">
            (Use {'{{variable_name}}'} for template variables)
          </span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`You are an expert React developer. Create a {{component_type}} component with the following features:\n- {{feature_1}}\n- {{feature_2}}`}
        />
        {variables.length > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            ✓ {variables.length} variable{variables.length > 1 ? 's' : ''} detected: {variables.map(v => v.name).join(', ')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output (optional)</label>
        <textarea
          value={formData.expectedOutput}
          onChange={(e) => setFormData(prev => ({ ...prev, expectedOutput: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what this prompt should generate..."
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isFavorite}
          onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <span className="text-sm text-gray-700">Mark as favorite</span>
      </label>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update Prompt' : 'Create Prompt'}
        </Button>
      </div>
    </form>
  );
}