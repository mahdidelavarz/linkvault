'use client';

import { useState, useEffect } from 'react';
import { Note, CreateNoteDto } from '@/types/note';
import { useCreateNote, useUpdateNote } from '@/hooks/useNote';
import { useCategories } from '@/hooks/useCategories';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TagSelector from '@/components/tags/TagSelector';

interface NoteFormProps {
  note?: Note | null;
  onClose: () => void;
}

export default function NoteForm({ note, onClose }: NoteFormProps) {
  const isEditing = !!note;

  const [formData, setFormData] = useState<CreateNoteDto>({
    title: '',
    content: '',
    isPinned: false,
    categoryId: undefined,
    tagIds: [],
  });

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        isPinned: note.isPinned,
        categoryId: note.categoryId,
        tagIds: note.tags ? note.tags.map((tag: any) => tag.id) : [],
      });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    try {
      if (isEditing && note) {
        await updateNote.mutateAsync({ id: note.id, ...formData });
      } else {
        await createNote.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const isLoading = createNote.isPending || updateNote.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Note Details' : 'Create New Note'}
      </h3>

      <Input
        label="Title *"
        name="title"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
        placeholder="Note title"
      />

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
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <TagSelector
        selectedTagIds={formData.tagIds || []}
        onChange={(tagIds) => setFormData(prev => ({ ...prev, tagIds }))}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isPinned}
          onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Pin this note</span>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
}