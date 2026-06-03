import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

/**
 * Reusable delete-confirmation dialog.
 * Used in LinkCard, NoteCard, SnippetCard, PromptCard, InfraCard.
 */
export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  itemName,
  isLoading,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <>
      <style>{CSS}</style>
      <Modal isOpen={isOpen} onClose={onClose} title="Delete item" size="sm">
        <div className="cdm-body">
          <p className="cdm-text">
            Are you sure you want to delete <strong className="cdm-name">{itemName}</strong>?
            This cannot be undone.
          </p>
          <div className="cdm-actions">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

const CSS = `
.cdm-body    { display: flex; flex-direction: column; gap: 20px; }
.cdm-text    { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); }
.cdm-name    { color: var(--text-primary); font-weight: 600; }
.cdm-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;
