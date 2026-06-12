'use client';

import { createPortal } from 'react-dom';
import Button from '@/features/shared/ui/Button';
import { LucideFolderOpen } from '@/Icons/Icons';

interface MultiProjectEditWarningProps {
    isOpen: boolean;
    projectNames: string[];
    onConfirm: () => void;
    onCancel: () => void;
}

export default function MultiProjectEditWarning({ isOpen, projectNames, onConfirm, onCancel }: MultiProjectEditWarningProps) {
    if (!isOpen || typeof document === 'undefined') return null;
    return createPortal(
        <>
            <style>{CSS}</style>
            <div className="mpew-backdrop" onClick={onCancel} />
            <div className="mpew-modal" role="alertdialog" aria-modal>
                <div className="mpew-icon"><LucideFolderOpen width={20} /></div>
                <h3 className="mpew-title">Item used in multiple projects</h3>
                <p className="mpew-body">
                    This item appears in{' '}
                    <strong>{projectNames.length} projects</strong>
                    {projectNames.length <= 3 && (
                        <> ({projectNames.join(', ')})</>
                    )}
                    . Editing it will update it across all of them.
                </p>
                <div className="mpew-actions">
                    <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
                    <Button size="sm" onClick={onConfirm}>Edit anyway</Button>
                </div>
            </div>
        </>,
        document.body
    );
}

const CSS = `
.mpew-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
    z-index: 510;
}
.mpew-modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 511;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px;
    width: min(360px, 92vw);
    padding: 24px 20px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
    box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.4));
}
.mpew-icon {
    display: flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--warning-muted, rgba(251,191,36,0.12));
    color: var(--warning, #fbbf24);
}
.mpew-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: 0; }
.mpew-body  { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin: 0; }
.mpew-actions { display: flex; gap: 8px; justify-content: center; margin-top: 4px; }
`;
