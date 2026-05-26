"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LinkForm from "@/components/links/LinkForm";
import NoteForm from "@/components/notes/NoteForm";
import SnippetForm from "@/components/snippets/SnippetForm";
import PromptForm from "@/components/prompts/PromptForm";
import {
  LucideLink2,
  LucideNotebookPen,
  LucideCodeXml,
  LucideMessageSquare,
  LucideSearch,
} from "@/Icons/Icons";

type QuickActionType = "link" | "note" | "snippet" | "prompt" | null;

const actions = [
  {
    type: "link" as const,
    icon: LucideLink2,
    label: "New Link",
    variant: "blue" as const,
  },
  {
    type: "note" as const,
    icon: LucideNotebookPen,
    label: "New Note",
    variant: "green" as const,
  },
  {
    type: "snippet" as const,
    icon: LucideCodeXml,
    label: "New Snippet",
    variant: "purple" as const,
  },
  {
    type: "prompt" as const,
    icon: LucideMessageSquare,
    label: "New Prompt",
    variant: "teal" as const,
  },
];

const variantStyles = {
  blue: {
    bg: "var(--primary, #3b82f6)",
    hover: "var(--primary-hover, #2563eb)",
    muted: "var(--primary-muted, rgba(59,130,246,0.1))",
    text: "var(--primary, #3b82f6)",
  },
  green: {
    bg: "#10b981",
    hover: "#059669",
    muted: "rgba(16,185,129,0.1)",
    text: "#10b981",
  },
  purple: {
    bg: "#8b5cf6",
    hover: "#7c3aed",
    muted: "rgba(139,92,246,0.1)",
    text: "#8b5cf6",
  },
  teal: {
    bg: "#14b8a6",
    hover: "#0d9488",
    muted: "rgba(20,184,166,0.1)",
    text: "#14b8a6",
  },
};

export default function QuickActions() {
  const [activeForm, setActiveForm] = useState<QuickActionType>(null);
  const router = useRouter();

  const handleClose = () => {
    setActiveForm(null);
  };

  const renderForm = () => {
    switch (activeForm) {
      case "link":
        return <LinkForm onClose={handleClose} />;
      case "note":
        return <NoteForm onClose={handleClose} />;
      case "snippet":
        return <SnippetForm onClose={handleClose} />;
      case "prompt":
        return <PromptForm onClose={handleClose} />;
      default:
        return null;
    }
  };

  const getFormTitle = () => {
    switch (activeForm) {
      case "link":
        return "Add Link";
      case "note":
        return "Add Note";
      case "snippet":
        return "Add Snippet";
      case "prompt":
        return "Add Prompt";
      default:
        return "";
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="quick-actions-panel">
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {actions.map((action) => {
            const Icon = action.icon;
            const colors = variantStyles[action.variant];
            return (
              <button
                key={action.type}
                onClick={() => setActiveForm(action.type)}
                className="quick-action-btn"
                style={{
                  backgroundColor: colors.muted,
                  color: colors.text,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.muted;
                  e.currentTarget.style.color = colors.text;
                }}
              >
                <Icon width={18} />
                {action.label}
              </button>
            );
          })}
        </div>
        <div className="quick-actions-footer">
          <Button
            variant="secondary"
            fullWidth
            leftIcon={LucideSearch}
            onClick={() => router.push("/search")}
          >
            Search Everything
          </Button>
        </div>
      </div>

      <Modal
        isOpen={!!activeForm}
        onClose={handleClose}
        title={getFormTitle()}
        size="lg"
      >
        {renderForm()}
      </Modal>
    </>
  );
}

const CSS = `
.quick-actions-panel {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.quick-actions-title {
  font-size:     var(--text-lg);
  font-weight:   600;
  color:         var(--text-primary);
  margin-bottom: 16px;
}
.quick-actions-grid {
  display:               grid;
  grid-template-columns: repeat(2, 1fr);
  gap:                   8px;
}
.quick-action-btn {
  display:          flex;
  align-items:      center;
  justify-content:  center;
  gap:              8px;
  height:           48px;
  padding:          0 12px;
  border:           none;
  border-radius:    var(--radius-md);
  font-family:      var(--font-sans);
  font-size:        var(--text-sm);
  font-weight:      500;
  cursor:           pointer;
  transition:       all var(--transition-fast);
}
.quick-actions-footer {
  margin-top:  16px;
  padding-top: 16px;
  border-top:  1px solid var(--border-default);
}

@media (max-width: 479px) {
  .quick-actions-grid { grid-template-columns: 1fr; }
}
`;