'use client';

import { useState, useEffect } from 'react';
import { CreateLinkDto, Link } from '@/types/link';
import { useCreateLink, useUpdateLink } from '@/hooks/useLinks';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface LinkFormProps {
  link?: Link | null;
  onClose: () => void;
}

export default function LinkForm({ link, onClose }: LinkFormProps) {
  const isEditing = !!link;
  
  const [formData, setFormData] = useState<CreateLinkDto>({
    url: '',
    title: '',
    description: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    isFavorite: false,
  });

  const createLink = useCreateLink();
  const updateLink = useUpdateLink();

  useEffect(() => {
    if (link) {
      setFormData({
        url: link.url,
        title: link.title,
        description: link.description || '',
        username: link.username || '',
        password: '',
        email: link.email || '',
        phone: link.phone || '',
        isFavorite: link.isFavorite,
      });
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && link) {
        await updateLink.mutateAsync({ id: link.id, ...formData });
      } else {
        await createLink.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const isLoading = createLink.isPending || updateLink.isPending;
  const error = createLink.error || updateLink.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Link' : 'Create New Link'}
      </h3>

      {error && (
        <Alert 
          type="error" 
          message={error instanceof Error ? error.message : 'An error occurred'} 
        />
      )}

      <Input
        label="URL *"
        name="url"
        type="url"
        value={formData.url}
        onChange={handleChange}
        required
        placeholder="https://example.com"
      />

      <Input
        label="Title *"
        name="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="My Link"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Optional"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={isEditing ? 'Leave blank to keep' : 'Optional'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Optional"
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isFavorite"
          checked={formData.isFavorite}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Mark as favorite</span>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update Link' : 'Create Link'}
        </Button>
      </div>
    </form>
  );
}