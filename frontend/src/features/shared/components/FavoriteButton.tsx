import { LucideStar } from "@/Icons/Icons";

interface FavoriteButtonProps {
  active: boolean;
  pending?: boolean;
  onToggle: () => void;
  "aria-label"?: string;
}

/**
 * Star toggle used in LinkCard, SnippetCard, PromptCard, InfraCard.
 */
export default function FavoriteButton({ active, pending, onToggle, "aria-label": ariaLabel }: FavoriteButtonProps) {
  return (
    <>
      <style>{CSS}</style>
      <button
        className={["fav-btn", active ? "fav-btn--active" : ""].filter(Boolean).join(" ")}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        aria-label={ariaLabel ?? (active ? "Remove from favorites" : "Add to favorites")}
        disabled={pending}
        type="button"
      >
        <LucideStar width={15} />
      </button>
    </>
  );
}

const CSS = `
.fav-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  min-width:       28px;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  flex-shrink:     0;
  transition:      color var(--transition-fast), transform var(--transition-fast);
}
.fav-btn:hover    { color: #fbbf24; transform: scale(1.15); }
.fav-btn--active  { color: #fbbf24; }
.fav-btn:disabled { opacity: 0.5; pointer-events: none; }
`;
