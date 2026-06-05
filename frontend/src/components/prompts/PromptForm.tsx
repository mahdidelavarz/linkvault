"use client";

import { useState, useEffect } from "react";
import {
  type Prompt,
  type CreatePromptDto,
  type PromptVariable,
  PROMPT_TYPES,
  AI_PLATFORMS,
  type PromptType,
  type AIPlatform,
} from "@/types/prompt";
import { useCreatePrompt, useUpdatePrompt, usePrompt } from "@/hooks/usePrompt";
import { useCategories } from "@/hooks/useCategories";
import { extractVariables } from "@/lib/promptUtils";
import FormLayout from "@/components/layout/FormLayout";
import Button from "@/components/ui/Button";
import TagSelector from "@/components/tags/TagSelector";
import {
  LucideFolder,
  LucideMessageSquare,
  LucideBot,
  LucideVariable,
  LucideClock,
  LucideRefreshCw,
} from "@/Icons/Icons";

interface PromptFormProps {
  prompt?: Prompt | null;
  onClose: () => void;
  initialValues?: Prompt;
}

export default function PromptForm({ prompt, onClose, initialValues }: PromptFormProps) {
  const isEditing = !!prompt;

  const [titleError,   setTitleError]   = useState("");
  const [contentError, setContentError] = useState("");
  const [varDefaults, setVarDefaults]   = useState<Record<string, string>>({});
  const [restoredIdx, setRestoredIdx]   = useState<number | null>(null);

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
  const { data: freshPrompt } = usePrompt(prompt?.id ?? 0);
  const { data: categories } = useCategories();

  // Edit mode — load existing prompt
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
      // Init var defaults from stored variables
      const defaults: Record<string, string> = {};
      for (const v of prompt.variables ?? []) {
        defaults[v.name] = v.defaultValue;
      }
      setVarDefaults(defaults);
    }
  }, [prompt]);

  // Duplicate mode — pre-fill from initialValues
  useEffect(() => {
    if (!prompt && initialValues) {
      setFormData({
        title: `Copy of ${initialValues.title}`,
        content: initialValues.content,
        description: initialValues.description || "",
        promptType: initialValues.promptType as PromptType,
        targetAI: initialValues.targetAI as AIPlatform,
        expectedOutput: initialValues.expectedOutput || "",
        isFavorite: false,
        categoryId: initialValues.categoryId,
        tagIds: initialValues.tags?.map((t: any) => t.id) ?? [],
      });
      const defaults: Record<string, string> = {};
      for (const v of initialValues.variables ?? []) {
        defaults[v.name] = v.defaultValue;
      }
      setVarDefaults(defaults);
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const titleValid   = formData.title.trim().length > 0;
    const contentValid = formData.content.trim().length > 0;
    setTitleError(titleValid   ? "" : "Title is required.");
    setContentError(contentValid ? "" : "Prompt content is required.");
    if (!titleValid || !contentValid) return;

    // Build variables array from current defaults
    const variables: PromptVariable[] = extractVariables(formData.content).map(v => ({
      name: v.name,
      defaultValue: varDefaults[v.name] ?? '',
      description: '',
    }));

    try {
      if (isEditing && prompt) {
        await updatePrompt.mutateAsync({ id: prompt.id, ...formData, variables });
      } else {
        await createPrompt.mutateAsync({ ...formData, variables });
      }
      onClose();
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  const variables = extractVariables(formData.content);
  const isLoading = createPrompt.isPending || updatePrompt.isPending;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentError("");
    const content = e.target.value;
    setFormData((prev) => ({ ...prev, content }));
    // Sync varDefaults: keep existing values, init new vars as ''
    const newVars = extractVariables(content);
    setVarDefaults((prev) => {
      const next: Record<string, string> = {};
      for (const v of newVars) {
        next[v.name] = prev[v.name] ?? '';
      }
      return next;
    });
  };

  const restoreVersion = (ver: NonNullable<Prompt['versions']>[number]) => {
    setFormData((prev) => ({
      ...prev,
      title:          ver.title,
      content:        ver.content,
      description:    ver.description || '',
      promptType:     ver.promptType as PromptType,
      targetAI:       (ver.targetAI || undefined) as AIPlatform,
      expectedOutput: ver.expectedOutput || '',
    }));
    if (ver.variables) {
      const defaults: Record<string, string> = {};
      for (const v of ver.variables) defaults[v.name] = v.defaultValue;
      setVarDefaults(defaults);
    }
    setRestoredIdx(null);
  };

  return (
    <>
      <style>{CSS}</style>
      <FormLayout
        onSubmit={handleSubmit}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Update Prompt" : "Create Prompt"}
            </Button>
          </>
        }
      >
        <div className="pf-fields">
        {/* Title */}
        <div className="form-field">
          <label className="form-label" htmlFor="prompt-title">
            Title <span className="required">*</span>
          </label>
          <input
            id="prompt-title"
            className={["form-input", titleError ? "form-input--error" : ""].filter(Boolean).join(" ")}
            type="text"
            value={formData.title}
            onChange={(e) => {
              setTitleError("");
              setFormData((prev) => ({ ...prev, title: e.target.value }));
            }}
            placeholder="e.g., React Component Generator"
            autoFocus
          />
          {titleError && <span className="form-field-error">{titleError}</span>}
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
            className={["form-textarea form-textarea--code", contentError ? "form-textarea--error" : ""].filter(Boolean).join(" ")}
            value={formData.content}
            onChange={handleContentChange}
            rows={10}
            placeholder={`You are an expert React developer. Create a {{component_type}} component with:\n- {{feature_1}}\n- {{feature_2}}`}
          />
          {contentError && <span className="form-field-error">{contentError}</span>}

          {/* P3-8: Live variable defaults panel */}
          {variables.length > 0 && (
            <div className="pf-vars-panel">
              <span className="pf-vars-title">
                <LucideVariable width={12} />
                Variable defaults ({variables.length})
              </span>
              <div className="pf-vars-grid">
                {variables.map((v) => (
                  <div key={v.name} className="pf-var-item">
                    <span className="pf-var-name">{`{{${v.name}}}`}</span>
                    <input
                      className="pf-var-input"
                      type="text"
                      placeholder="Default value…"
                      value={varDefaults[v.name] ?? ''}
                      onChange={(e) =>
                        setVarDefaults((p) => ({ ...p, [v.name]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
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

        {/* P3-9: Version history (edit mode only) */}
        {isEditing && (
          <div className="pf-versions">
            <div className="pf-versions-header">
              <LucideClock width={13} />
              Version history
              {((freshPrompt?.versions ?? prompt?.versions)?.length ?? 0) > 0 && (
                <span className="pf-versions-count">{(freshPrompt?.versions ?? prompt?.versions)!.length}</span>
              )}
            </div>
            {((freshPrompt?.versions ?? prompt?.versions)?.length ?? 0) > 0 ? (
              <div className="pf-versions-list">
                {(freshPrompt?.versions ?? prompt?.versions)!.map((ver, idx) => (
                  <div
                    key={idx}
                    className={["pf-version-item", restoredIdx === idx ? "pf-version-item--restored" : ""].filter(Boolean).join(" ")}
                  >
                    <div className="pf-version-meta">
                      <span className="pf-version-title">{ver.title}</span>
                      <span className="pf-version-date">
                        {new Date(ver.savedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <pre className="pf-version-preview">
                      {ver.content.length > 140 ? ver.content.slice(0, 140) + '…' : ver.content}
                    </pre>
                    <button
                      type="button"
                      className="pf-version-restore"
                      onClick={() => { restoreVersion(ver); setRestoredIdx(idx); }}
                    >
                      <LucideRefreshCw width={11} />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pf-versions-empty">
                No history yet — versions are saved automatically when you update this prompt.
              </p>
            )}
          </div>
        )}

        </div>
      </FormLayout>
    </>
  );
}

const CSS = `
.pf-fields {
  display:        flex;
  flex-direction: column;
  gap:            20px;
  padding:        8px 0;
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

.form-input--error   { border-color: var(--danger) !important; }
.form-textarea--error { border-color: var(--danger) !important; }
.form-field-error {
  font-size:   var(--text-xs);
  color:       var(--danger);
  font-weight: 500;
  margin-top:  2px;
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

/* P3-8: Variable defaults panel */
.pf-vars-panel {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  padding:        12px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-subtle);
  border-radius:  var(--radius-md);
  margin-top:     4px;
}
.pf-vars-title {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-xs);
  font-weight: 600;
  color:       var(--text-tertiary);
}
.pf-vars-grid {
  display:               grid;
  grid-template-columns: 1fr 1fr;
  gap:                   8px;
}
@media (max-width: 479px) {
  .pf-vars-grid { grid-template-columns: 1fr; }
}
.pf-var-item {
  display:        flex;
  flex-direction: column;
  gap:            4px;
}
.pf-var-name {
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  color:       var(--accent);
  font-weight: 500;
}
.pf-var-input {
  height:        32px;
  padding:       0 10px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color:         var(--text-primary);
  font-size:     var(--text-xs);
  font-family:   var(--font-sans);
  outline:       none;
  transition:    border-color var(--transition-fast);
}
.pf-var-input:focus { border-color: var(--border-focus); }
.pf-var-input::placeholder { color: var(--text-tertiary); }

/* P3-9: Version history */
.pf-versions {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  padding:        14px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-subtle);
  border-radius:  var(--radius-md);
}
.pf-versions-header {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-secondary);
}
.pf-versions-count {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  width:           18px;
  height:          18px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-subtle);
  border-radius:   50%;
  font-size:       10px;
  color:           var(--text-tertiary);
}
.pf-versions-list {
  display:        flex;
  flex-direction: column;
  gap:            8px;
}
.pf-version-item {
  display:        flex;
  flex-direction: column;
  gap:            6px;
  padding:        10px 12px;
  background:     var(--bg-subtle);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-md);
  transition:     border-color var(--transition-fast);
}
.pf-version-item--restored { border-color: var(--accent-border); }
.pf-version-meta {
  display:     flex;
  align-items: center;
  gap:         8px;
  flex-wrap:   wrap;
}
.pf-version-title {
  font-size:   var(--text-xs);
  font-weight: 600;
  color:       var(--text-primary);
  flex:        1;
  min-width:   0;
  overflow:    hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pf-version-date {
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}
.pf-version-preview {
  font-family:        var(--font-mono);
  font-size:          var(--text-xs);
  color:              var(--text-secondary);
  line-height:        var(--leading-relaxed);
  white-space:        pre-wrap;
  word-break:         break-word;
  display:            -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow:           hidden;
  margin:             0;
}
.pf-version-restore {
  display:       inline-flex;
  align-items:   center;
  gap:           5px;
  align-self:    flex-start;
  padding:       4px 10px;
  background:    transparent;
  border:        1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color:         var(--text-secondary);
  font-size:     var(--text-xs);
  font-family:   var(--font-sans);
  cursor:        pointer;
  transition:    all var(--transition-fast);
}
.pf-version-restore:hover { border-color: var(--accent-border); color: var(--accent); }
.pf-versions-empty {
  font-size:  var(--text-xs);
  color:      var(--text-tertiary);
  font-style: italic;
  margin:     0;
}

`;