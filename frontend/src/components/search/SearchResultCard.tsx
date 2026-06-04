"use client";

import { type SearchResult } from "@/types/search";
import { useRouter } from "next/navigation";
import { getLanguageIcon, getLanguageName } from "@/lib/languageDetector";
import {
  LucideLink2,
  LucideNotebookPen,
  LucideCodeXml,
  LucideExternalLink,
  LucideFolder,
  LucideTag,
  LucideClock,
  LucideMessageSquare,
  LucideServer,
} from "@/Icons/Icons";

interface SearchResultCardProps {
  result: SearchResult;
  searchTerm: string;
}

const typeConfig: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  link: {
    icon: LucideLink2,
    color: "var(--primary, #06b6d4)",
    bg: "var(--accent-muted)",
  },
  note: {
    icon: LucideNotebookPen,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  snippet: {
    icon: LucideCodeXml,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  prompt: {
    icon: LucideMessageSquare,
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
  },
  infrastructure: {
    icon: LucideServer,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
  },
};

export default function SearchResultCard({
  result,
  searchTerm,
}: SearchResultCardProps) {
  const router = useRouter();

  const handleClick = () => {
    switch (result.type) {
      case "link":
        window.open((result as any).url, "_blank");
        break;
      // P1-6: Navigate with ?open=<id> so the module page can open the specific item
      case "note":
        router.push(`/notes?open=${result.id}`);
        break;
      case "snippet":
        router.push(`/snippets?open=${result.id}`);
        break;
      case "prompt":
        router.push(`/prompts?open=${result.id}`);
        break;
      case "infrastructure":
        router.push(`/infrastructure?open=${result.id}`);
        break;
    }
  };

  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text;

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="highlight-mark">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const getPreview = () => {
    if (result.type === "link") {
      return (result as any).url || "";
    }
    const content = (result as any).content || (result as any).description || "";
    if (!content) return "";
    const cleaned = content.substring(0, 200).replace(/[#*`\n]/g, " ");
    return cleaned + (content.length > 200 ? "…" : "");
  };

  const config = typeConfig[result.type] ?? typeConfig.note;
  const Icon = config.icon;
  const preview = getPreview();

  return (
    <>
      <style>{CSS}</style>
      <div onClick={handleClick} className="result-card">
        {/* Type Icon */}
        <div
          className="result-type-icon"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          <Icon width={18} />
        </div>

        {/* Content */}
        <div className="result-content">
          <div className="result-header">
            <span
              className="result-type-badge"
              style={{
                backgroundColor: config.bg,
                color: config.color,
              }}
            >
              {result.type}
            </span>
            {result.type === "snippet" && (result as any).language && (
              <span className="result-language">
                {getLanguageIcon((result as any).language)}{" "}
                {getLanguageName((result as any).language)}
              </span>
            )}
          </div>

          <h3 className="result-title">{highlightText(result.title)}</h3>

          {preview && (
            <p className="result-preview">{highlightText(preview)}</p>
          )}

          <div className="result-meta">
            {result.category && (
              <span className="result-category">
                <LucideFolder width={11} />
                {result.category.name}
              </span>
            )}
            {result.tags?.map((tag: any) => (
              <span key={tag.id} className="result-tag">
                <LucideTag width={10} />
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Date & Action */}
        <div className="result-right">
          <span className="result-date">
            <LucideClock width={11} />
            {new Date(result.updatedAt).toLocaleDateString()}
          </span>
          <span className="result-action-icon">
            <LucideExternalLink width={14} />
          </span>
        </div>
      </div>
    </>
  );
}

const CSS = `
.result-card {
  display:       flex;
  align-items:   flex-start;
  gap:           14px;
  padding:       16px;
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  cursor:        pointer;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.result-card:hover {
  border-color: var(--border-strong);
  box-shadow:   0 2px 12px rgba(0,0,0,0.08);
}

/* Type icon */
.result-type-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           38px;
  height:          38px;
  border-radius:   var(--radius-md);
  flex-shrink:     0;
  margin-top:      2px;
}

/* Content */
.result-content {
  flex:      1;
  min-width: 0;
}
.result-header {
  display:     flex;
  align-items: center;
  gap:         8px;
  margin-bottom: 4px;
}
.result-type-badge {
  display:      inline-flex;
  align-items:  center;
  padding:      2px 8px;
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  font-weight:  500;
  text-transform: capitalize;
}
.result-language {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
}
.result-title {
  font-size:     var(--text-base);
  font-weight:   600;
  color:         var(--text-primary);
  margin-bottom: 6px;
  transition:    color var(--transition-fast);
  line-height:   1.4;
}
.result-card:hover .result-title { color: var(--accent); }
.result-preview {
  font-size:     var(--text-sm);
  color:         var(--text-tertiary);
  line-height:   1.5;
  margin-bottom: 8px;
  overflow:      hidden;
  display:       -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Highlight */
.highlight-mark {
  background:    rgba(250,204,21,0.25);
  color:         #facc15;
  border-radius: var(--radius-sm);
  padding:       0 2px;
}

/* Meta */
.result-meta {
  display:   flex;
  flex-wrap: wrap;
  gap:       6px;
}
.result-category {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      3px 10px;
  background:   var(--accent-muted);
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  color:        var(--accent);
}
.result-tag {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      3px 10px;
  background:   var(--bg-overlay);
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  color:        var(--text-tertiary);
}

/* Right */
.result-right {
  display:        flex;
  flex-direction: column;
  align-items:    flex-end;
  gap:            8px;
  flex-shrink:    0;
}
.result-date {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  white-space: nowrap;
}
.result-action-icon {
  color:    var(--text-tertiary);
  opacity:  0;
  transition: opacity var(--transition-fast);
}
.result-card:hover .result-action-icon { opacity: 1; }

@media (max-width: 639px) {
  .result-right { display: none; }
  .result-card { padding: 12px; gap: 10px; }
  .result-type-icon { width: 32px; height: 32px; }
}
`;
