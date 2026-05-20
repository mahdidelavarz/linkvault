'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LinkForm from '@/components/links/LinkForm';
import NoteForm from '@/components/notes/NoteForm';
import SnippetForm from '@/components/snippets/SnippetForm';
import PromptForm from '@/components/prompts/PromptForm';

type QuickActionType = 'link' | 'note' | 'snippet' | 'prompt' | null;

export default function QuickActions() {
  const [activeForm, setActiveForm] = useState<QuickActionType>(null);
  const router = useRouter();

  const actions = [
    { type: 'link' as const, icon: '🔗', label: 'New Link', color: 'bg-blue-500 hover:bg-blue-600' },
    { type: 'note' as const, icon: '📝', label: 'New Note', color: 'bg-green-500 hover:bg-green-600' },
    { type: 'snippet' as const, icon: '💻', label: 'New Snippet', color: 'bg-purple-500 hover:bg-purple-600' },
    { type: 'prompt' as const, icon: '💬', label: 'New Prompt', color: 'bg-teal-500 hover:bg-teal-600' },
  ];

  const handleClose = () => {
    setActiveForm(null);
  };

  const renderForm = () => {
    switch (activeForm) {
      case 'link':
        return <LinkForm onClose={handleClose} />;
      case 'note':
        return <NoteForm onClose={handleClose} />;
      case 'snippet':
        return <SnippetForm onClose={handleClose} />;
      case 'prompt':
        return <PromptForm onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.type}
              onClick={() => setActiveForm(action.type)}
              className={`${action.color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}
            >
              <span className="text-lg">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            fullWidth
            onClick={() => router.push('/search')}
          >
            🔍 Search Everything
          </Button>
        </div>
      </div>

      <Modal isOpen={!!activeForm} onClose={handleClose} size="large">
        {renderForm()}
      </Modal>
    </>
  );
}