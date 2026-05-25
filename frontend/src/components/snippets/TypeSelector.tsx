// Reusable type-pill selector for snippet types
import { SNIPPET_TYPES, type SnippetType } from "@/types/snippet";
import {
  LucideArrowRightLeft,
  LucideBraces,
  LucideCodeXml,
  LucideDatabase,
  LucideFileCode2,
  LucideRegex,
  LucideSettings,
  LucideTerminal,
} from "@/Icons/Icons";

interface TypeSelectorProps {
  value: SnippetType;
  onChange: (type: SnippetType) => void;
}

// Map type keys to Iconify icons
const TYPE_ICONS = {
  code: LucideCodeXml,
  sql: LucideDatabase,
  command: LucideTerminal,
  regex: LucideRegex,
  curl: LucideArrowRightLeft,
  json: LucideBraces,
  script: LucideFileCode2,
};

type InfraIconKey = keyof typeof TYPE_ICONS;

export default function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="type-selector" role="group" aria-label="Snippet type">
        {Object.entries(SNIPPET_TYPES).map(([key, { label }]) => {
          const isActive = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={["type-pill", isActive ? "type-pill--active" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange(key as SnippetType)}
            >
              {(() => {
                const Icon = TYPE_ICONS[key as InfraIconKey];
                return Icon ? (
                  <Icon width={13} />
                ) : (
                  <LucideCodeXml width={13} />
                );
              })()}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

const CSS = `
.type-selector {
  display:   flex;
  flex-wrap: wrap;
  gap:       6px;
}

.type-pill {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        34px;
  padding:       0 12px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  transition:    background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
  white-space:   nowrap;
  /* Comfortable tap target */
  min-height:    44px;
}
.type-pill:hover {
  background:   var(--bg-overlay);
  border-color: var(--border-strong);
  color:        var(--text-primary);
}
.type-pill--active {
  background:   var(--accent-muted);
  border-color: var(--border-focus);
  color:        var(--cyan-300);
  box-shadow:   0 0 0 1px var(--border-focus);
}
.type-pill-icon { width: 14px; height: 14px; flex-shrink: 0; }

/* On mobile: wrap nicely, 2 per row */
@media (max-width: 479px) {
  .type-pill { flex: 1; min-width: calc(50% - 3px); justify-content: center; }
}
`;
