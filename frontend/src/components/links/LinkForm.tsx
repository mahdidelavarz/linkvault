"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Link, type CreateLinkDto } from "@/types/link";
import { useCreateLink, useUpdateLink, useFetchLinkMeta } from "@/hooks/useLinks";
import { useCategories } from "@/hooks/useCategories";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import TagSelector from "@/components/tags/TagSelector";
import {
  LucideCheck,
  LucideChevronDown,
  LucideEye,
  LucideEyeOff,
  LucideFolder,
  LucideGlobe,
  LucideLink2,
  LucideLock,
  LucideMail,
  LucidePhone,
  LucideSparkles,
  LucideStar,
  LucideType,
  LucideUser,
} from "@/Icons/Icons";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  url: z.string().min(1, "URL is required").url("Must be a valid URL"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  username: z.string().max(100).optional(),
  password: z.string().max(200).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  isFavorite: z.boolean(),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()),
});

type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

interface LinkFormProps {
  link?: Link | null;
  onClose: () => void;
}

export default function LinkForm({ link, onClose }: LinkFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const isEditing = !!link;
  const fetchMeta = useFetchLinkMeta();
  // Prevent fetching on initial edit-form population
  const initialUrlRef = useRef(link?.url ?? "");

  const { data: categories } = useCategories();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();

  const isLoading = createLink.isPending || updateLink.isPending;
  const error = createLink.error || updateLink.error;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: "https://",
      title: "",
      description: "",
      username: "",
      password: "",
      email: "",
      phone: "",
      isFavorite: false,
      categoryId: undefined,
      tagIds: [],
    },
  });

  const urlValue = useWatch({ control, name: "url" });

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (/^https?:\/\//i.test(pasted)) {
      e.preventDefault();
      // Normalise http → https and set the whole field
      const normalized = pasted.replace(/^http:\/\//i, "https://");
      setValue("url", normalized, { shouldValidate: true });
    }
    // No protocol → let it paste normally after the existing "https://"
  };

  // Populate form when editing
  useEffect(() => {
    if (link) {
      initialUrlRef.current = link.url;
      reset({
        url: link.url,
        title: link.title,
        description: link.description ?? "",
        username: link.username ?? "",
        password: "",
        email: link.email ?? "",
        phone: link.phone ?? "",
        isFavorite: link.isFavorite,
        categoryId: link.categoryId,
        tagIds: link.tags?.map((t: any) => t.id) ?? [],
      });
    }
  }, [link, reset]);

  // Auto-fetch metadata when URL changes (debounced 600ms)
  useEffect(() => {
    if (!urlValue || urlValue === initialUrlRef.current) return;

    try { new URL(urlValue); } catch { return; } // not yet a valid URL

    setAutoFilled(false);
    const timer = setTimeout(async () => {
      setMetaLoading(true);
      try {
        const meta = await fetchMeta(urlValue);
        let filled = false;
        if (meta.title && !getValues("title")) {
          setValue("title", meta.title, { shouldValidate: true });
          filled = true;
        }
        if (meta.description && !getValues("description")) {
          setValue("description", meta.description);
          filled = true;
        }
        if (filled) setAutoFilled(true);
      } catch { /* silent — user fills manually */ }
      setMetaLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [urlValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    const payload: CreateLinkDto = {
      ...data,
      description: data.description || undefined,
      username: data.username || undefined,
      password: data.password || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };
    try {
      if (isEditing && link) {
        await updateLink.mutateAsync({ id: link.id, ...payload });
      } else {
        await createLink.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* error shown via Alert */
    }
  };

  // Spinner SVG used as rightNode on URL input while fetching
  const fetchingNode = metaLoading ? (
    <span className="lform-meta-spinner" aria-label="Fetching page info…" />
  ) : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="lform-wrapper">
        <form className="lform" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="lform-content">
            {error && (
              <Alert
                type="error"
                message={
                  error instanceof Error ? error.message : "Something went wrong"
                }
              />
            )}

            {/* ── Section: Basic info ── */}
            <div className="lform-section">
              <p className="lform-section-title">
                <LucideLink2 width={13} /> Basic info
              </p>
              <div className="lform-fields">
                <Input
                  label="URL"
                  type="url"
                  placeholder="https://example.com"
                  leftIcon={LucideGlobe}
                  error={errors.url?.message}
                  autoFocus
                  rightNode={fetchingNode ?? undefined}
                  onPaste={handleUrlPaste}
                  {...register("url")}
                />
                <div className="lform-title-wrap">
                  <Input
                    label="Title"
                    type="text"
                    placeholder="My awesome link"
                    leftIcon={LucideType}
                    error={errors.title?.message}
                    {...register("title")}
                  />
                  {autoFilled && (
                    <span className="lform-autofill-badge">
                      <LucideSparkles width={10} />
                      Auto-filled
                    </span>
                  )}
                </div>
                <Textarea
                  label="Description"
                  placeholder="Optional description…"
                  optional
                  error={errors.description?.message}
                  {...register("description")}
                />
              </div>
            </div>

            {/* ── Section: Organize ── */}
            <div className="lform-section">
              <p className="lform-section-title">
                <LucideFolder width={13} /> Organize
              </p>
              <div className="lform-fields">
                {/* Category select */}
                <div className="lform-field">
                  <label className="lform-label">
                    Category <span className="lform-optional">optional</span>
                  </label>
                  <div className="lform-select-wrap">
                    <LucideFolder className="lform-select-icon" />
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="lform-select"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : undefined,
                            )
                          }
                        >
                          <option value="">No category</option>
                          {categories?.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <LucideChevronDown className="lform-select-chevron" />
                  </div>
                </div>

                {/* Tags */}
                <div className="lform-field">
                  <label className="lform-label">
                    Tags <span className="lform-optional">optional</span>
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

                {/* Favorite checkbox */}
                <Controller
                  name="isFavorite"
                  control={control}
                  render={({ field }) => (
                    <label className="lform-checkbox">
                      <div
                        className={[
                          "lform-check-box",
                          field.value ? "lform-check-box--checked" : "",
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
                        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                      />
                      <span className="lform-check-label">
                        <LucideStar width={13} style={{ color: "#fbbf24" }} />
                        <span className="h-4">Mark as favorite</span>
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>

            {/* ── Section: Credentials ── */}
            <div className="lform-section">
              <p className="lform-section-title">
                <LucideLock width={13} /> Credentials{" "}
                <span className="lform-section-hint">optional</span>
              </p>
              <div className="lform-fields">
                <div className="lform-grid-2">
                  <Input
                    label="Username"
                    type="text"
                    placeholder="username"
                    leftIcon={LucideUser}
                    optional
                    error={errors.username?.message}
                    {...register("username")}
                  />
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isEditing ? "Leave blank to keep" : "password"}
                    leftIcon={LucideLock}
                    optional
                    error={errors.password?.message}
                    rightNode={
                      <button
                        type="button"
                        className="lform-eye"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <LucideEyeOff width={13} />
                        ) : (
                          <LucideEye width={13} />
                        )}
                      </button>
                    }
                    {...register("password")}
                  />
                </div>
                <div className="lform-grid-2">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    leftIcon={LucideMail}
                    optional
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    leftIcon={LucidePhone}
                    optional
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="lform-footer">
            <Button type="button" variant="ghost" onClick={onClose} className="shadow-sm shadow-slate-900">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              {isEditing ? "Save changes" : "Add link"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

const CSS = `
.lform-wrapper {
  height:         80dvh;
  display:        flex;
  flex-direction: column;
}

.lform {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.lform-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.lform-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.lform-section:last-of-type { border-bottom: none; }

.lform-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}
.lform-section-hint {
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--text-tertiary);
  text-transform: none;
  letter-spacing: 0;
  margin-left: 4px;
}

.lform-fields { display: flex; flex-direction: column; gap: 12px; }

.lform-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 479px) {
  .lform-grid-2 { grid-template-columns: 1fr; }
}

/* Title row with auto-fill badge */
.lform-title-wrap { position: relative; }
.lform-autofill-badge {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  margin-top:   4px;
  font-size:    10px;
  font-weight:  500;
  color:        var(--text-accent);
  opacity:      0.85;
  animation:    fadeIn 0.2s ease;
}

/* Spinner on URL input while fetching meta */
.lform-meta-spinner {
  display:       block;
  width:         14px;
  height:        14px;
  border:        2px solid var(--border-default);
  border-top-color: var(--text-accent);
  border-radius: 50%;
  animation:     lform-spin 0.6s linear infinite;
  flex-shrink:   0;
}
@keyframes lform-spin { to { transform: rotate(360deg); } }

/* Select */
.lform-field { display: flex; flex-direction: column; gap: 6px; }
.lform-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.lform-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

.lform-select-wrap { position: relative; display: flex; align-items: center; }
.lform-select-icon {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  pointer-events: none;
}
.lform-select-chevron {
  position: absolute;
  right: 10px;
  width: 12px;
  height: 12px;
  color: var(--text-tertiary);
  pointer-events: none;
}
.lform-select {
  width: 100%;
  height: 36px;
  padding: 0 28px 0 32px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.lform-select:focus { border-color: var(--border-focus); background: var(--bg-elevated); box-shadow: 0 0 0 3px var(--accent-muted); }
.lform-select option { background: var(--bg-elevated); }

/* Checkbox */
.lform-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: fit-content;
  position: relative;
}
.lform-check-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.lform-check-box--checked { background: var(--accent); border-color: var(--accent); color: white; }
.lform-check-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Eye button */
.lform-eye {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.lform-eye:hover { color: var(--text-primary); }

/* Footer */
.lform-footer {
  display:        flex;
  justify-content: flex-end;
  gap:            8px;
  padding:        10px 16px;
  background:     var(--bg-subtle);
  border-radius:  20px;
  border-top:     1px solid var(--border-subtle);
  flex-shrink:    0;
  position:       sticky;
  bottom:         0;
  z-index:        10;
}
`;
