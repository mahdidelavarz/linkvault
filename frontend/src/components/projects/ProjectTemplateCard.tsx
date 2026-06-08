"use client";

import { type ProjectTemplate } from "@/lib/projectTemplates";
import { PROJECT_COLOR_CSS } from "@/types/project";
import { LucideArrowRight, LucideFolder } from "@/Icons/Icons";

interface ProjectTemplateCardProps {
    template: ProjectTemplate;
    onUse: (template: ProjectTemplate) => void;
}

export default function ProjectTemplateCard({ template, onUse }: ProjectTemplateCardProps) {
    const accentColor = PROJECT_COLOR_CSS[template.color] ?? 'var(--cyan-400)';

    return (
        <>
            <style>{CSS}</style>
            <div
                className="ptcard"
                style={{ '--ptcard-accent': accentColor } as React.CSSProperties}
                onClick={() => onUse(template)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onUse(template); }}
            >
                <div className="ptcard-accent" />
                <div className="ptcard-body">
                    <span className="ptcard-emoji">{template.emoji}</span>
                    <div className="ptcard-info">
                        <span className="ptcard-title">{template.title}</span>
                        <p className="ptcard-desc">{template.description}</p>
                        <div className="ptcard-meta">
                            <LucideFolder width={10} />
                            {template.items.length} items
                        </div>
                    </div>
                    <div className="ptcard-arrow">
                        <LucideArrowRight width={14} />
                    </div>
                </div>
            </div>
        </>
    );
}

const CSS = `
.ptcard {
    display: flex;
    flex-direction: row;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
    min-width: 220px; max-width: 280px;
    flex-shrink: 0;
}
.ptcard:hover { border-color: var(--ptcard-accent, var(--cyan-400)); box-shadow: var(--shadow-sm); }
.ptcard:active { transform: scale(0.98); }

.ptcard-accent {
    width: 3px; flex-shrink: 0;
    background: var(--ptcard-accent, var(--cyan-400));
}
.ptcard-body {
    flex: 1; display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 12px 12px 10px; min-width: 0;
}
.ptcard-emoji { font-size: 20px; flex-shrink: 0; line-height: 1.3; }
.ptcard-info { flex: 1; min-width: 0; }
.ptcard-title {
    display: block;
    font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;
}
.ptcard-desc {
    font-size: var(--text-xs); color: var(--text-secondary);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin: 0 0 5px;
}
.ptcard-meta {
    display: flex; align-items: center; gap: 4px;
    font-size: 10px; color: var(--text-muted);
}
.ptcard-arrow {
    display: flex; align-items: center; flex-shrink: 0;
    color: var(--text-muted);
    transition: color var(--transition-fast), transform var(--transition-fast);
}
.ptcard:hover .ptcard-arrow { color: var(--ptcard-accent, var(--cyan-400)); transform: translateX(2px); }
`;
