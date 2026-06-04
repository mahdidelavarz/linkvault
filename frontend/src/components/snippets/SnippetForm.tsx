"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type Snippet,
  type CreateSnippetDto,
  SNIPPET_TYPES,
  TYPE_LANGUAGES,
  type SnippetType,
} from "@/types/snippet";
import { getLanguageName, detectLanguage } from "@/lib/languageDetector";
import { useCreateSnippet, useUpdateSnippet } from "@/hooks/useSnippet";
import { useCategories } from "@/hooks/useCategories";
import FormLayout from "@/components/layout/FormLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import TagSelector from "@/components/tags/TagSelector";
import {
  LucideArrowRight,
  LucideArrowRightLeft,
  LucideCheck,
  LucideCircleAlert,
  LucideCodeXml,
  LucideCpu,
  LucideDatabase,
  LucideFileCode2,
  LucideFolder,
  LucideServer,
  LucideSettings2,
  LucideStar,
  LucideTerminal,
  LucideType,
  LucideZap,
} from "@/Icons/Icons";
import TypeSelector from "./TypeSelector";
import FormSelect from "./FormSelect";
import Textarea from "../ui/TextArea";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  snippetType: z.string().min(1),
  language: z.string().min(1),
  content: z.string().min(1, "Content is required"),
  description: z.string().max(1000).optional(),
  isFavorite: z.boolean(),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SnippetForm({
  snippet,
  onClose,
}: {
  snippet?: Snippet | null;
  onClose: () => void;
}) {
  const isEditing = !!snippet;
  const [activeTab, setActiveTab] = useState<"basic" | "meta">("basic");

  const { data: categories } = useCategories();
  const createSnippet = useCreateSnippet();
  const updateSnippet = useUpdateSnippet();
  const isLoading = createSnippet.isPending || updateSnippet.isPending;
  const error = createSnippet.error || updateSnippet.error;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      snippetType: "code",
      language: "txt",
      content: "",
      description: "",
      isFavorite: false,
      categoryId: undefined,
      tagIds: [],
      metadata: {},
    },
  });

  const watchedType = watch("snippetType") as SnippetType;
  const watchedLang = watch("language");
  const watchedContent = watch("content");

  // Auto-detect language from content
  const detectedLang = watchedContent ? detectLanguage(watchedContent) : null;

  // Available languages for current type
  const typeLangs = TYPE_LANGUAGES[watchedType] ?? [];

  // When type changes, reset language to first of that type
  const handleTypeChange = (type: SnippetType) => {
    setValue("snippetType", type);
    const langs = TYPE_LANGUAGES[type];
    if (langs && langs.length > 0) setValue("language", langs[0]);
  };

  useEffect(() => {
    if (snippet) {
      reset({
        title: snippet.title,
        snippetType: snippet.snippetType,
        language: snippet.language,
        content: snippet.content,
        description: snippet.description ?? "",
        isFavorite: snippet.isFavorite,
        categoryId: snippet.categoryId,
        tagIds: snippet.tags?.map((t: any) => t.id) ?? [],
        metadata: (snippet.metadata ?? {}) as Record<string, unknown>,
      });
    }
  }, [snippet, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload: CreateSnippetDto = {
        ...data,
        snippetType: data.snippetType as SnippetType, // Add explicit type assertion
        description: data.description || undefined,
      };
      if (isEditing && snippet) {
        await updateSnippet.mutateAsync({ id: snippet.id, ...payload });
      } else {
        await createSnippet.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* shown via Alert */
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <FormLayout
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        footerJustify="between"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <div className="sform-footer-right">
              {activeTab === "basic" && (
                <Button type="button" variant="secondary" rightIcon={LucideArrowRight} onClick={() => setActiveTab("meta")}>
                  Details
                </Button>
              )}
              <Button type="submit" isLoading={isLoading}>
                {isEditing ? "Save changes" : "Create snippet"}
              </Button>
            </div>
          </>
        }
      >
        <div className="sform-top">
          {error && (
            <Alert
              type="error"
              message={
                error instanceof Error ? error.message : "Something went wrong"
              }
            />
          )}

          {/* ── Tabs: Basic / Metadata ── */}
          <div className="sform-tabs">
          <button
            type="button"
            className={[
              "sform-tab",
              activeTab === "basic" ? "sform-tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveTab("basic")}
          >
            <LucideFileCode2 width={14} />
            Content
          </button>
          <button
            type="button"
            className={[
              "sform-tab",
              activeTab === "meta" ? "sform-tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveTab("meta")}
          >
            <LucideSettings2 width={14} />
            Details
          </button>
          </div>
          </div>

          <div className="sform-content">

        {/* ══ Tab: Basic ══ */}
        {activeTab === "basic" && (
          <div className="sform-panel">
            {/* Title */}
            <Input
              label="Title"
              type="text"
              placeholder="e.g., Fetch user with JOIN"
              leftIcon={LucideType}
              error={errors.title?.message}
              autoFocus
              {...register("title")}
            />

            {/* Type selector */}
            <div className="sform-field">
              <label className="sform-label">Type</label>
              <Controller
                name="snippetType"
                control={control}
                render={({ field }) => (
                  <TypeSelector
                    value={field.value as SnippetType}
                    onChange={handleTypeChange}
                  />
                )}
              />
            </div>

            {/* Language + auto-detect hint */}
            <div className="sform-field">
              <FormSelect
                label="Language"
                leftIcon={LucideCodeXml}
                {...register("language")}
              >
                {typeLangs.map((lang) => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </FormSelect>
              {detectedLang && detectedLang !== watchedLang && (
                <button
                  type="button"
                  className="sform-detect-hint"
                  onClick={() => setValue("language", detectedLang)}
                >
                  <LucideZap width={12} />
                  Auto-detected:{" "}
                  <strong>{getLanguageName(detectedLang)}</strong> — click to
                  apply
                </button>
              )}
            </div>

            {/* Code editor */}
            <div className="sform-field">
              <div className="sform-code-header">
                <label className="sform-label">
                  {watchedType === "command"
                    ? "Command"
                    : watchedType === "curl"
                      ? "cURL Request"
                      : watchedType === "regex"
                        ? "Pattern"
                        : watchedType === "sql"
                          ? "Query"
                          : watchedType === "json"
                            ? "JSON"
                            : "Code"}
                </label>
                <span className="sform-lang-pill">{watchedLang}</span>
              </div>
              <div
                className={[
                  "sform-code-wrap",
                  errors.content ? "sform-code-wrap--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <textarea
                  className="sform-code"
                  placeholder={
                    watchedType === "command"
                      ? 'git commit -m "feat: add feature"'
                      : watchedType === "regex"
                        ? "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                        : watchedType === "json"
                          ? '{\n  "key": "value"\n}'
                          : watchedType === "sql"
                            ? "SELECT u.*, p.name\nFROM users u\nJOIN profiles p ON p.user_id = u.id\nWHERE u.active = true;"
                            : "// Your code here"
                  }
                  rows={12}
                  spellCheck={false}
                  {...register("content")}
                />
              </div>
              {errors.content && (
                <p className="sform-field-error">
                  <LucideCircleAlert width={12} />
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="What does this snippet do? When should you use it?"
              optional
              rows={2}
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
        )}

        {/* ══ Tab: Details ══ */}
        {activeTab === "meta" && (
          <div className="sform-panel">
            {/* Category */}
            <FormSelect
              label="Category"
              optional
              leftIcon={LucideFolder}
              {...register("categoryId", {
                setValueAs: (v) => (v ? parseInt(v) : undefined),
              })}
            >
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FormSelect>

            {/* Tags */}
            <div className="sform-field">
              <label className="sform-label">
                Tags <span className="sform-optional">optional</span>
              </label>
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <TagSelector
                    selectedTagIds={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Type-specific metadata */}
            <TypeMetadataFields snippetType={watchedType} register={register} />

            {/* Favorite */}
            <Controller
              name="isFavorite"
              control={control}
              render={({ field }) => (
                <label className="sform-checkbox">
                  <div
                    className={[
                      "sform-check",
                      field.value ? "sform-check--on" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {field.value && <LucideCheck width={11} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />
                  <span className="sform-check-label">
                    <LucideStar width={13} style={{ color: "#fbbf24" }} />
                    Mark as favorite
                  </span>
                </label>
              )}
            />
          </div>
        )}

          </div>

      </FormLayout>
    </>
  );
}

// ─── Type-specific metadata fields ───────────────────────────────────────────

function TypeMetadataFields({
  snippetType,
  register,
}: {
  snippetType: SnippetType;
  register: any;
}) {
  if (snippetType === "sql")
    return (
      <div className="sform-meta-section">
        <p className="sform-meta-title">
          <LucideDatabase width={12} />
          SQL options
        </p>
        <FormSelect
          label="Database"
          optional
          leftIcon={LucideServer}
          {...register("metadata.database")}
        >
          <option value="">Any</option>
          {["PostgreSQL", "MySQL", "SQLite", "MSSQL", "Oracle", "MongoDB"].map(
            (db) => (
              <option key={db} value={db.toLowerCase()}>
                {db}
              </option>
            ),
          )}
        </FormSelect>
      </div>
    );

  if (snippetType === "command")
    return (
      <div className="sform-meta-section">
        <p className="sform-meta-title">
          <LucideTerminal width={12} />
          Command options
        </p>
        <div className="sform-grid-2">
          <FormSelect
            label="Shell"
            optional
            leftIcon={LucideTerminal}
            {...register("metadata.shell")}
          >
            <option value="">Any shell</option>
            {["bash", "zsh", "fish", "powershell", "cmd"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FormSelect>
          <Input
            label="Working directory"
            placeholder="/home/user/project"
            optional
            {...register("metadata.workingDirectory")}
          />
        </div>
      </div>
    );

  if (snippetType === "script")
    return (
      <div className="sform-meta-section">
        <p className="sform-meta-title">
          <LucideFileCode2 width={12} />
          Script options
        </p>
        <div className="sform-grid-2">
          <FormSelect
            label="Runtime"
            optional
            leftIcon={LucideCpu}
            {...register("metadata.scriptLanguage")}
          >
            <option value="">Any</option>
            {["bash", "python", "ruby", "perl", "lua", "r"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </FormSelect>
          <Input
            label="Dependencies"
            placeholder="requests, numpy"
            optional
            {...register("metadata.dependencies")}
          />
        </div>
      </div>
    );

  if (snippetType === "curl")
    return (
      <div className="sform-meta-section">
        <p className="sform-meta-title">
          <LucideArrowRightLeft width={12} />
          cURL options
        </p>
        <div className="sform-grid-2">
          <FormSelect label="Method" optional {...register("metadata.method")}>
            {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(
              (m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ),
            )}
          </FormSelect>
          <Input
            label="Base URL"
            placeholder="https://api.example.com"
            optional
            {...register("metadata.baseUrl")}
          />
        </div>
      </div>
    );

  return null;
}

const CSS = `
.sform-top { flex-shrink: 0; }
.sform-content { flex: 1; overflow-y: auto; }

/* Tabs */
.sform-tabs {
  display:       flex;
  gap:           4px;
  padding:       0 0 16px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 0;
}
.sform-tab {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        34px;
  padding:       0 14px;
  background:    transparent;
  border:        1px solid transparent;
  border-radius: var(--radius-md);
  color:         var(--text-tertiary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.sform-tab:hover    { background: var(--bg-overlay); color: var(--text-primary); }
.sform-tab--active  { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }

/* Panel */
.sform-panel { display: flex; flex-direction: column; gap: 16px; padding: 16px 0; }

/* Field */
.sform-field { display: flex; flex-direction: column; gap: 6px; }
.sform-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.sform-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

/* Language detect hint */
.sform-detect-hint {
  display:     flex;
  align-items: center;
  gap:         5px;
  font-size:   var(--text-xs);
  color:       var(--text-accent);
  background:  var(--accent-subtle);
  border:      1px solid var(--accent-border);
  border-radius: var(--radius-sm);
  padding:     4px 10px;
  cursor:      pointer;
  font-family: var(--font-sans);
  transition:  background var(--transition-fast);
  width:       fit-content;
}
.sform-detect-hint:hover { background: var(--accent-muted); }
.sform-detect-hint strong { color: var(--text-primary); }

/* Code editor */
.sform-code-header { display: flex; align-items: center; justify-content: space-between; }
.sform-lang-pill {
  font-size:     10px;
  font-family:   var(--font-mono);
  color:         var(--text-tertiary);
  background:    var(--bg-overlay);
  border:        1px solid var(--border-subtle);
  padding:       1px 8px;
  border-radius: var(--radius-sm);
}
.sform-code-wrap {
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow:      hidden;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.sform-code-wrap:focus-within {
  border-color: var(--border-focus);
  box-shadow:   0 0 0 3px var(--accent-muted);
}
.sform-code-wrap--error { border-color: var(--danger); }
.sform-code-wrap--error:focus-within { box-shadow: 0 0 0 3px var(--danger-muted); }

.sform-code {
  display:     block;
  width:       100%;
  padding:     12px 14px;
  background:  var(--bg-elevated);
  border:      none;
  outline:     none;
  color:       var(--cyan-200);
  font-family: var(--font-mono);
  font-size:   var(--text-sm);
  line-height: var(--leading-relaxed);
  resize:      vertical;
  min-height:  200px;
  tab-size:    2;
}
.sform-code::placeholder { color: var(--text-tertiary); font-style: italic; }
@media (max-width: 767px) {
  .sform-code { min-height: 150px; font-size: var(--text-xs); }
}

.sform-field-error {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--text-xs); color: var(--danger); font-weight: 500;
}

/* Metadata section */
.sform-meta-section {
  display:        flex;
  flex-direction: column;
  gap:            12px;
  padding:        14px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-subtle);
  border-radius:  var(--radius-md);
}
.sform-meta-title {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-xs);
  font-weight: 600;
  color:       var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.sform-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 479px) { .sform-grid-2 { grid-template-columns: 1fr; } }

/* Checkbox */
.sform-checkbox {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; position: relative; width: fit-content;
}
.sform-check {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: var(--bg-subtle); border: 1px solid var(--border-default);
  border-radius: var(--radius-sm); flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.sform-check--on { background: var(--accent); border-color: var(--accent); color: white; }
.sform-check-label { display: flex; align-items: center; gap: 6px; font-size: var(--text-sm); color: var(--text-secondary); }

.sform-footer-right { display: flex; align-items: center; gap: 8px; }
`;
