// components/mobile/BottomNavBar.tsx
'use client';

import { useState } from 'react';

import Modal from '@/components/ui/Modal';
import LinkForm from '@/components/links/LinkForm';
import NoteForm from '@/components/notes/NoteForm';
import SnippetForm from '@/components/snippets/SnippetForm';
import PromptForm from '@/components/prompts/PromptForm';
import {
  SolarAddCircleBold,
  LucideLink2,
  LucideMessageSquare,
  LucideCodeXml,
  LucideNotebookPen,
} from '@/Icons/Icons';
import { useSidebar } from './SidebarContext';

type ActiveFormType = 'link' | 'note' | 'snippet' | 'prompt' | null;

export default function BottomNavBar() {
  const { setMobileOpen } = useSidebar();
  const [activeForm, setActiveForm] = useState<ActiveFormType>(null);

  const handleCloseForm = () => {
    setActiveForm(null);
  };

  const getFormTitle = () => {
    switch (activeForm) {
      case 'link':
        return 'Add Link';
      case 'note':
        return 'Add Note';
      case 'snippet':
        return 'Add Snippet';
      case 'prompt':
        return 'Add Prompt';
      default:
        return '';
    }
  };

  const renderForm = () => {
    switch (activeForm) {
      case 'link':
        return <LinkForm onClose={handleCloseForm} />;
      case 'note':
        return <NoteForm onClose={handleCloseForm} />;
      case 'snippet':
        return <SnippetForm onClose={handleCloseForm} />;
      case 'prompt':
        return <PromptForm onClose={handleCloseForm} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <nav className="bottom-nav">
        {/* Menu */}
        <button
          className="bottom-nav-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <SolarAddCircleBold width={22} />
          <span className="bottom-nav-label">Menu</span>
        </button>

        {/* Add Link */}
        <button
          className="bottom-nav-btn"
          onClick={() => setActiveForm('link')}
          aria-label="Add Link"
        >
          <LucideLink2 width={22} />
          <span className="bottom-nav-label">Link</span>
        </button>

        {/* Add Prompt */}
        <button
          className="bottom-nav-btn"
          onClick={() => setActiveForm('prompt')}
          aria-label="Add Prompt"
        >
          <LucideMessageSquare width={22} />
          <span className="bottom-nav-label">Prompt</span>
        </button>

        {/* Add Snippet */}
        <button
          className="bottom-nav-btn"
          onClick={() => setActiveForm('snippet')}
          aria-label="Add Snippet"
        >
          <LucideCodeXml width={22} />
          <span className="bottom-nav-label">Snippet</span>
        </button>

        {/* Add Note */}
        <button
          className="bottom-nav-btn"
          onClick={() => setActiveForm('note')}
          aria-label="Add Note"
        >
          <LucideNotebookPen width={22} />
          <span className="bottom-nav-label">Note</span>
        </button>
      </nav>

      {/* Form Modal */}
      <Modal
        isOpen={!!activeForm}
        onClose={handleCloseForm}
        title={getFormTitle()}
        size="lg"
      >
        {renderForm()}
      </Modal>
    </>
  );
}

const CSS = `
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-default);
  padding: 8px 12px;
  justify-content: space-around;
  align-items: center;
  z-index: var(--z-sticky);
  backdrop-filter: blur(10px);
  background: rgba(var(--bg-surface-rgb), 0.95);
}

.bottom-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 6px 4px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-size: 10px;
  font-weight: 500;
}

.bottom-nav-btn:active {
  transform: scale(0.95);
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 500;
}

@media (max-width: 767px) {
  .bottom-nav {
    display: flex;
  }
  
  /* Add padding to main content to account for bottom nav */
  .dashboard-page,
  main {
    padding-bottom: 80px !important;
  }
}

@media (max-width: 479px) {
  .bottom-nav {
    padding: 8px 6px;
  }
  
  .bottom-nav-label {
    font-size: 9px;
  }
}
`;