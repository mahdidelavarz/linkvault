"use client";

import { useState } from "react";
import {
  type Prompt,
  PROMPT_TYPES,
  AI_PLATFORMS,
  type AIPlatform,
} from "@/types/prompt";
import {
  useTogglePromptFavorite,
  useDeletePrompt,
  useIncrementPromptUsage,
} from "@/hooks/usePrompt";
import {
  extractVariables,
  replaceVariables,
  copyToClipboard,
  sendToAI,
} from "@/lib/promptUtils";
import VariableForm from "./VariableForm";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import {
  LucideStar,
  LucideCopy,
  LucidePencil,
  LucideTrash2,
  LucideExternalLink,
  LucideVariable,
  LucideFolder,
  LucideTag,
  LucideClock,
  LucideBarChart3,
  LucideBot,
  LucideBrain,
  LucideSparkles,
  LucideGem,
} from "@/Icons/Icons";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
}

const platformIcons: Record<string, React.ComponentType<{ width?: number }>> = {
  chatgpt: LucideBot,
  deepseek: LucideBrain,
  claude: LucideSparkles,
  gemini: LucideGem,
};

export default function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const [showVariables, setShowVariables] = useState(false);
  const [filledContent, setFilledContent] = useState(prompt.content);
  const [copied, setCopied] = useState(false);
  const [sentToAI, setSentToAI] = useState<AIPlatform | null>(null);

  const toggleFavorite = useTogglePromptFavorite();
  const deletePrompt = useDeletePrompt();
  const incrementUsage = useIncrementPromptUsage();

  const variables = extractVariables(prompt.content);
  const promptType = PROMPT_TYPES[prompt.promptType];
  const aiPlatform = prompt.targetAI ? AI_PLATFORMS[prompt.targetAI] : null;

  const handleCopy = async () => {
    const success = await copyToClipboard(filledContent);
    if (success) {
      setCopied(true);
      incrementUsage.mutate(prompt.id);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendToAI = (platform: AIPlatform) => {
    const success = sendToAI(filledContent, platform);
    if (success) {
      setSentToAI(platform);
      incrementUsage.mutate(prompt.id);
      setTimeout(() => setSentToAI(null), 3000);
    }
  };

  const handleVariablesFilled = (values: Record<string, string>) => {
    const replaced = replaceVariables(prompt.content, values);
    setFilledContent(replaced);
    setShowVariables(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      deletePrompt.mutate(prompt.id);
    }
  };

  const PlatformIcon = prompt.targetAI
    ? platformIcons[prompt.targetAI]
    : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="prompt-card">
        {/* Header */}
        <div className="prompt-card-header">
          <div className="prompt-card-type">
            <span className="prompt-card-type-icon">
              {promptType?.icon || "✨"}
            </span>
            <div>
              <h3 className="prompt-card-title">{prompt.title}</h3>
              <div className="prompt-card-meta">
                <span className="prompt-card-meta-type">
                  {promptType?.label}
                </span>
                {aiPlatform && (
                  <span className="prompt-card-platform">
                    {PlatformIcon && <PlatformIcon width={11} />}
                    {aiPlatform.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite.mutate(prompt.id)}
            className={[
              "prompt-card-fav",
              prompt.isFavorite ? "prompt-card-fav--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={prompt.isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <LucideStar width={18} />
          </button>
        </div>

        {/* Description */}
        {prompt.description && (
          <p className="prompt-card-description">{prompt.description}</p>
        )}

        {/* Content Preview */}
        <div className="prompt-card-content">
          <pre className="prompt-card-content-text">{filledContent}</pre>
        </div>

        {/* Variables */}
        {variables.length > 0 && (
          <div className="prompt-card-vars-section">
            <button
              onClick={() => setShowVariables(!showVariables)}
              className={[
                "prompt-card-vars-toggle",
                showVariables ? "prompt-card-vars-toggle--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <LucideVariable width={12} />
              {variables.length} variable{variables.length > 1 ? "s" : ""}
              <span className="prompt-card-vars-names">
                ({variables.map((v) => v.name).join(", ")})
              </span>
            </button>

            {showVariables && (
              <div className="prompt-card-vars-form">
                <VariableForm
                  variables={variables}
                  onSubmit={handleVariablesFilled}
                  onCancel={() => setShowVariables(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Tags & Category */}
        <div className="prompt-card-taxonomy">
          {prompt.category && (
            <span className="prompt-card-category">
              <LucideFolder width={11} />
              {prompt.category.name}
            </span>
          )}
          {prompt.tags?.map((tag: any) => (
            <span key={tag.id} className="prompt-card-tag">
              <LucideTag width={10} />
              {tag.name}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="prompt-card-stats">
          <span className="prompt-card-stat">
            <LucideBarChart3 width={12} />
            Used {prompt.usageCount}x
          </span>
          {prompt.lastUsedAt && (
            <span className="prompt-card-stat">
              <LucideClock width={12} />
              {new Date(prompt.lastUsedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Alerts */}
        {copied && (
          <div className="prompt-card-alert">
            <Alert type="success" message="Copied to clipboard!" />
          </div>
        )}
        {sentToAI && (
          <div className="prompt-card-alert">
            <Alert
              type="info"
              message={`Opening ${AI_PLATFORMS[sentToAI].name}...`}
            />
          </div>
        )}

        {/* Actions */}
        <div className="prompt-card-actions">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={LucideCopy}
            onClick={handleCopy}
          >
            Copy
          </Button>

          {aiPlatform && prompt.targetAI && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={LucideExternalLink}
              onClick={() => handleSendToAI(prompt.targetAI as AIPlatform)}
            >
              Send to {aiPlatform.name}
            </Button>
          )}

          {!aiPlatform && (
            <div className="prompt-card-quick-send">
              <button
                onClick={() => handleSendToAI("chatgpt")}
                className="quick-send-btn quick-send-btn--green"
                title="Send to ChatGPT"
              >
                <LucideBot width={14} />
              </button>
              <button
                onClick={() => handleSendToAI("deepseek")}
                className="quick-send-btn quick-send-btn--teal"
                title="Send to DeepSeek"
              >
                <LucideBrain width={14} />
              </button>
              <button
                onClick={() => handleSendToAI("claude")}
                className="quick-send-btn quick-send-btn--orange"
                title="Send to Claude"
              >
                <LucideSparkles width={14} />
              </button>
              <button
                onClick={() => handleSendToAI("gemini")}
                className="quick-send-btn quick-send-btn--blue"
                title="Send to Gemini"
              >
                <LucideGem width={14} />
              </button>
            </div>
          )}

          <div className="prompt-card-actions-right">
            <button
              className="prompt-card-action-btn"
              onClick={() => onEdit(prompt)}
              title="Edit"
            >
              <LucidePencil width={14} />
            </button>
            <button
              className="prompt-card-action-btn prompt-card-action-btn--danger"
              onClick={handleDelete}
              title="Delete"
            >
              <LucideTrash2 width={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
.prompt-card {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
  display:       flex;
  flex-direction: column;
  gap:           12px;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.prompt-card:hover {
  border-color: var(--border-strong);
  box-shadow:   0 2px 12px rgba(0,0,0,0.05);
}

/* Header */
.prompt-card-header {
  display:     flex;
  align-items: flex-start;
  gap:         12px;
}
.prompt-card-type {
  display: flex;
  align-items: flex-start;
  gap:     10px;
  flex:    1;
  min-width: 0;
}
.prompt-card-type-icon { font-size: 20px; flex-shrink: 0; line-height: 1; }
.prompt-card-title {
  font-size:     var(--text-base);
  font-weight:   600;
  color:         var(--text-primary);
  line-height:   1.3;
  margin-bottom: 2px;
}
.prompt-card-meta {
  display:     flex;
  align-items: center;
  gap:         8px;
  flex-wrap:   wrap;
}
.prompt-card-meta-type {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
}
.prompt-card-platform {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      2px 8px;
  background:   var(--bg-overlay);
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  color:        var(--text-secondary);
}
.prompt-card-fav {
  display:     flex;
  padding:     4px;
  background:  transparent;
  border:      none;
  border-radius: var(--radius-sm);
  color:       var(--text-tertiary);
  cursor:      pointer;
  flex-shrink: 0;
  transition:  color var(--transition-fast), transform var(--transition-fast);
}
.prompt-card-fav:hover { color: #f59e0b; transform: scale(1.15); }
.prompt-card-fav--active { color: #f59e0b; }

/* Description */
.prompt-card-description {
  font-size: var(--text-sm);
  color:     var(--text-tertiary);
  line-height: 1.5;
}

/* Content */
.prompt-card-content {
  background:    #1e1e2e;
  border-radius: var(--radius-md);
  padding:       14px;
  max-height:    160px;
  overflow-y:    auto;
}
.prompt-card-content-text {
  font-family:   var(--font-mono, monospace);
  font-size:     var(--text-xs);
  color:         #e2e8f0;
  white-space:   pre-wrap;
  word-break:    break-word;
  margin:        0;
}

/* Variables */
.prompt-card-vars-section {
  display:        flex;
  flex-direction: column;
  gap:            8px;
}
.prompt-card-vars-toggle {
  display:       inline-flex;
  align-items:   center;
  gap:           6px;
  padding:       4px 10px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-xs);
  font-family:   var(--font-sans);
  cursor:        pointer;
  transition:    all var(--transition-fast);
  align-self:    flex-start;
}
.prompt-card-vars-toggle:hover { border-color: var(--border-strong); color: var(--text-primary); }
.prompt-card-vars-toggle--active { border-color: var(--primary); color: var(--primary); }
.prompt-card-vars-names { color: var(--text-tertiary); }

/* Taxonomy */
.prompt-card-taxonomy {
  display:   flex;
  flex-wrap: wrap;
  gap:       6px;
}
.prompt-card-category {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      3px 10px;
  background:   var(--primary-muted);
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  color:        var(--primary);
}
.prompt-card-tag {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      3px 10px;
  background:   var(--bg-overlay);
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  color:        var(--text-tertiary);
}

/* Stats */
.prompt-card-stats {
  display:     flex;
  align-items: center;
  gap:         12px;
  flex-wrap:   wrap;
}
.prompt-card-stat {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
}

/* Alert */
.prompt-card-alert { margin-top: -4px; }

/* Actions */
.prompt-card-actions {
  display:     flex;
  align-items: center;
  gap:         8px;
  flex-wrap:   wrap;
  padding-top: 12px;
  border-top:  1px solid var(--border-default);
}
.prompt-card-actions-right {
  display:     flex;
  align-items: center;
  gap:         2px;
  margin-left: auto;
}
.prompt-card-action-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           30px;
  height:          30px;
  padding:         0;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      color var(--transition-fast), background var(--transition-fast);
}
.prompt-card-action-btn:hover          { color: var(--text-primary); background: var(--bg-overlay); }
.prompt-card-action-btn--danger:hover  { color: var(--danger); background: var(--danger-muted); }

/* Quick send */
.prompt-card-quick-send {
  display: flex;
  gap:     2px;
}
.quick-send-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           30px;
  height:          30px;
  padding:         0;
  border:          none;
  border-radius:   var(--radius-sm);
  cursor:          pointer;
  transition:      all var(--transition-fast);
}
.quick-send-btn--green  { background: rgba(16,185,129,0.1);  color: #10b981; }
.quick-send-btn--teal   { background: rgba(20,184,166,0.1);  color: #14b8a6; }
.quick-send-btn--orange { background: rgba(249,115,22,0.1);  color: #f97316; }
.quick-send-btn--blue   { background: rgba(59,130,246,0.1);  color: #3b82f6; }
.quick-send-btn:hover   { filter: brightness(0.9); transform: scale(1.1); }
`;