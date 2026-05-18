'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTag';
import { Tag } from '@/types/tag';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function TagsPage() {
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');

  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await createTag.mutateAsync({ name: newTagName.trim() });
      setNewTagName('');
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingTag) return;

    try {
      await updateTag.mutateAsync({ id: editingTag.id, name: editName.trim() });
      setEditingTag(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all items.')) {
      deleteTag.mutate(id);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create tags to organize your links and notes
        </p>
      </div>

      {/* Create Tag Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Tag</h3>
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1">
            <Input
              label=""
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" isLoading={createTag.isPending}>
              Add Tag
            </Button>
          </div>
        </form>
        {createTag.isError && (
          <div className="mt-3">
            <Alert 
              type="error" 
              message={createTag.error instanceof Error ? createTag.error.message : 'Error creating tag'} 
            />
          </div>
        )}
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tags...</p>
          </div>
        ) : tags && tags.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tags.map((tag: any) => (
              <li key={tag.id} className="p-4 hover:bg-gray-50">
                {editingTag?.id === tag.id ? (
                  <form onSubmit={handleUpdate} className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        label=""
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Edit tag name"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="submit" isLoading={updateTag.isPending}>
                        Save
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          setEditingTag(null);
                          setEditName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏷️</span>
                      <div>
                        <span className="text-lg font-medium text-gray-900">
                          {tag.name}
                        </span>
                        {tag._count && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({tag._count.items} items)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingTag(tag);
                          setEditName(tag.name);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(tag.id)}
                        isLoading={deleteTag.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tags yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first tag above</p>
          </div>
        )}
      </div>
    </div>
  );
}