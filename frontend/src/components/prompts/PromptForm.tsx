"use client";

import { useState, useEffect } from "react";
import {
  type Prompt,
  type CreatePromptDto,
  PROMPT_TYPES,
  AI_PLATFORMS,
  type PromptType,
  type AIPlatform,
} from "@/types/prompt";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompt";
import { useCategories } from "@/hooks/useCategories";
import { extractVariables } from "@/lib/promptUtils";
import Button from "@/components/ui/Button";
import TagSelector from "@/components/tags/TagSelector";
import {
  LucideFolder,
  LucideMessageSquare,
  LucideBot,
  LucideVariable,
} from "@/Icons/Icons";

interface PromptFormProps {
  prompt?: Prompt | null;
  onClose: () => void;
}

export default function PromptForm({ prompt, onClose }: PromptFormProps) {
  const isEditing = !!prompt;

  const [formData, setFormData] = useState<CreatePromptDto>({
    title: "",
    content: "",
    description: "",
    promptType: "ai-chat",
    targetAI: undefined,
    expectedOutput: "",
    isFavorite: false,
    categoryId: undefined,
    tagIds: [],
  });

  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        content: prompt.content,
        description: prompt.description || "",
        promptType: prompt.promptType as PromptType,
        targetAI: prompt.targetAI as AIPlatform,
        expectedOutput: prompt.expectedOutput || "",
        isFavorite: prompt.isFavorite,
        categoryId: prompt.categoryId,
        tagIds: prompt.tags ? prompt.tags.map((tag: any) => tag.id) : [],
      });
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (isEditing && prompt) {
        await updatePrompt.mutateAsync({ id: prompt.id, ...formData });
      } else {
        await createPrompt.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  const variables = extractVariables(formData.content);
  const isLoading = createPrompt.isPending || updatePrompt.isPending;

  return (
    <>
      <style>{CSS}</style>
      <div className="prompt-wrapper">
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="prompt-content">
        {/* Title */}
        <div className="form-field">
          <label className="form-label" htmlFor="prompt-title">
            Title <span className="required">*</span>
          </label>
          <input
            id="prompt-title"
            className="form-input"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., React Component Generator"
            required
            autoFocus
          />
        </div>

        {/* Type & Target AI */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="prompt-type">
              Type
            </label>
            <div className="form-select-wrap">
              <LucideMessageSquare className="form-select-icon" />
              <select
                id="prompt-type"
                className="form-select"
                value={formData.promptType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    promptType: e.target.value as PromptType,
                  }))
                }
              >
                {Object.entries(PROMPT_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="prompt-target">
              Target AI
            </label>
            <div className="form-select-wrap">
              <LucideBot className="form-select-icon" />
              <select
                id="prompt-target"
                className="form-select"
                value={formData.targetAI || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetAI: (e.target.value || undefined) as AIPlatform,
                  }))
                }
              >
                <option value="">None (Generic)</option>
                {Object.entries(AI_PLATFORMS).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="form-field">
          <label className="form-label" htmlFor="prompt-category">
            Category
          </label>
          <div className="form-select-wrap">
            <LucideFolder className="form-select-icon" />
            <select
              id="prompt-category"
              className="form-select"
              value={formData.categoryId || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                }))
              }
            >
              <option value="">No Category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <TagSelector
          selectedTagIds={formData.tagIds || []}
          onChange={(tagIds) =>
            setFormData((prev) => ({ ...prev, tagIds }))
          }
        />

        {/* Description */}
        <div className="form-field">
          <label className="form-label" htmlFor="prompt-desc">
            Description
          </label>
          <textarea
            id="prompt-desc"
            className="form-textarea"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={2}
            placeholder="What does this prompt do?"
          />
        </div>

        {/* Content */}
        <div className="form-field">
          <label className="form-label" htmlFor="prompt-content">
            Prompt Content <span className="required">*</span>
            <span className="form-label-hint">
              Use {"{{variable_name}}"} for template variables
            </span>
          </label>
          <textarea
            id="prompt-content"
            className="form-textarea form-textarea--code"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={10}
            placeholder={`You are an expert React developer. Create a {{component_type}} component with:\n- {{feature_1}}\n- {{feature_2}}`}
            required
          />
          {variables.length > 0 && (
            <p className="form-hint form-hint--success">
              <LucideVariable width={12} />
              {variables.length} variable{variables.length > 1 ? "s" : ""}{" "}
              detected: {variables.map((v) => v.name).join(", ")}
            </p>
          )}
        </div>

        {/* Expected Output */}
        <div className="form-field">
          <label className="form-label" htmlFor="prompt-output">
            Expected Output
          </label>
          <textarea
            id="prompt-output"
            className="form-textarea"
            value={formData.expectedOutput}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expectedOutput: e.target.value,
              }))
            }
            rows={3}
            placeholder="Describe what this prompt should generate..."
          />
        </div>

        {/* Favorite */}
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isFavorite: e.target.checked,
              }))
            }
            className="form-checkbox"
          />
          <span>Mark as favorite</span>
        </label>

        </div>

        {/* Actions */}
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? "Update Prompt" : "Create Prompt"}
          </Button>
        </div>
      </form>
      </div>
    </>
  );
}

const CSS = `
.prompt-wrapper {
  height:         80dvh;
  display:        flex;
  flex-direction: column;
}
.prompt-form {
  display:        flex;
  flex-direction: column;
  gap:            0;
  height:         100%;
  overflow:       hidden;
}
.prompt-content {
  flex:       1;
  overflow-y: auto;
  padding:    16px 16px 0;
  display:    flex;
  flex-direction: column;
  gap:        20px;
}

.form-field {
  display:        flex;
  flex-direction: column;
  gap:            6px;
}
.form-label {
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-secondary);
}
.form-label-hint {
  font-weight: 400;
  color:       var(--text-tertiary);
  margin-left: 8px;
  font-size:   var(--text-xs);
}
.required { color: var(--danger); }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 479px) {
  .form-row { grid-template-columns: 1fr; }
}

.form-input {
  height:          40px;
  padding:         0 12px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-md);
  color:           var(--text-primary);
  font-family:     var(--font-sans);
  font-size:       var(--text-sm);
  outline:         none;
  transition:      border-color var(--transition-fast), background var(--transition-fast);
}
.form-input::placeholder { color: var(--text-tertiary); }
.form-input:focus { border-color: var(--border-focus); background: var(--bg-elevated); }

.form-select-wrap {
  position: relative;
  display:  flex;
  align-items: center;
}
.form-select-icon {
  position:  absolute;
  left:      10px;
  width:     14px;
  height:    14px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.form-select {
  width:            100%;
  height:           40px;
  padding:          0 12px 0 32px;
  background:       var(--bg-subtle);
  border:           1px solid var(--border-default);
  border-radius:    var(--radius-md);
  color:            var(--text-primary);
  font-family:      var(--font-sans);
  font-size:        var(--text-sm);
  outline:          none;
  cursor:           pointer;
  appearance:       none;
  -webkit-appearance: none;
  transition:       border-color var(--transition-fast);
}
.form-select:focus { border-color: var(--border-focus); }
.form-select option { background: var(--bg-elevated); }

.form-textarea {
  padding:         10px 12px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-md);
  color:           var(--text-primary);
  font-family:     var(--font-sans);
  font-size:       var(--text-sm);
  outline:         none;
  resize:          vertical;
  transition:      border-color var(--transition-fast), background var(--transition-fast);
}
.form-textarea::placeholder { color: var(--text-tertiary); }
.form-textarea:focus { border-color: var(--border-focus); background: var(--bg-elevated); }
.form-textarea--code {
  font-family: var(--font-mono, monospace);
}

.form-hint {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
  display:   flex;
  align-items: center;
  gap:       4px;
  margin-top: 2px;
}
.form-hint--success { color: var(--primary); }

.form-checkbox-label {
  display:     flex;
  align-items: center;
  gap:         8px;
  font-size:   var(--text-sm);
  color:       var(--text-secondary);
  cursor:      pointer;
}
.form-checkbox {
  width:  16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

.form-actions {
  display:         flex;
  justify-content: flex-end;
  gap:             12px;
  padding:         10px 16px;
  border-top:      1px solid var(--border-default);
  background:      var(--bg-subtle);
  border-radius:   20px;
  flex-shrink:     0;
  position:        sticky;
  bottom:          0;
  z-index:         10;
}
`;