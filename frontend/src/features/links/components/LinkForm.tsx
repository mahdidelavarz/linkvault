"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Link } from "@/features/links/types/link";
import { useCreateLink, useUpdateLink, useFetchLinkMeta, useCheckDuplicateUrl, type DuplicateResult } from "@/features/links/hooks/useLinks";
import { useVault } from "@/features/settings/security/hooks/useVault";
import { VaultGuard } from "@/features/settings/security/components/VaultGuard";
import { VaultSecretHint } from "@/features/settings/security/components/VaultSecretHint";
import { detectSecret } from "@/features/settings/security/utils/detectSecret";
import { useCategories } from "@/features/categories/hooks/useCategories";

import Input from "@/features/shared/ui/Input";
import Textarea from "@/features/shared/ui/TextArea";
import Button from "@/features/shared/ui/Button";
import Alert from "@/features/shared/ui/Alert";
import Disclosure from "@/features/shared/ui/Disclosure";
import Switch from "@/features/shared/ui/Switch";
import TagSelector from "@/features/tags/components/TagSelector";
import {
  LucideChevronDown,
  LucideEye,
  LucideEyeOff,
  LucideFolder,
  LucideGlobe,
  LucideLock,
  LucideMail,
  LucidePhone,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideStar,
  LucideType,
  LucideUser,
} from "@/Icons/Icons";
import FormLayout from "@/features/shared/layout/FormLayout";

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
  initialUrl?: string;
  onClose: () => void;
}

export default function LinkForm({ link, initialUrl, onClose }: LinkFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateResult>(null);
  const isEditing = !!link;
  const fetchMeta = useFetchLinkMeta();
  const checkDuplicate = useCheckDuplicateUrl();
  const initialUrlRef = useRef(link?.url ?? "");

  const { isEnabled, isUnlocked, encrypt } = useVault();
  const { data: categories } = useCategories();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();

  const isLoading = createLink.isPending || updateLink.isPending;
  const mutationError = createLink.error || updateLink.error;

  const { register, handleSubmit, control, reset, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: initialUrl ?? "https://", title: "", description: "", username: "", password: "",
      email: "", phone: "", isFavorite: false, categoryId: undefined, tagIds: [],
    },
  });

  const urlValue = useWatch({ control, name: "url" });

  useEffect(() => {
    if (link) {
      initialUrlRef.current = link.url;
      reset({
        url: link.url, title: link.title, description: link.description ?? "",
        username: link.username ?? "", password: "", email: link.email ?? "",
        phone: link.phone ?? "", isFavorite: link.isFavorite,
        categoryId: link.categoryId, tagIds: link.tags?.map((t: any) => t.id) ?? [],
      });
    }
  }, [link, reset]);

  // Auto-fetch metadata + duplicate check when URL changes (debounced 600ms)
  useEffect(() => {
    setDuplicate(null);
    if (!urlValue || urlValue === initialUrlRef.current) return;
    try { new URL(urlValue); } catch { return; }
    setAutoFilled(false);
    const timer = setTimeout(async () => {
      setMetaLoading(true);
      try {
        const [meta, dup] = await Promise.all([
          fetchMeta(urlValue),
          !isEditing ? checkDuplicate(urlValue) : Promise.resolve(null),
        ]);
        let filled = false;
        if (meta.title && !getValues("title")) { setValue("title", meta.title, { shouldValidate: true }); filled = true; }
        if (meta.description && !getValues("description")) { setValue("description", meta.description); filled = true; }
        if (filled) setAutoFilled(true);
        if (dup) setDuplicate(dup);
      } catch { /* silent */ }
      setMetaLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [urlValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (/^https?:\/\//i.test(pasted)) {
      e.preventDefault();
      setValue("url", pasted.replace(/^http:\/\//i, "https://"), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    setVaultError(null);
    const password = data.password || undefined;
    // When the vault is active and a password is present, store it ONLY in the vault
    // (zero-knowledge) and persist a 'vault:encrypted' sentinel server-side — the
    // plaintext never leaves the device. Matches the Infrastructure flow.
    const useVaultStorage = isEnabled && isUnlocked && !!password;

    const basePayload = {
      ...data,
      description: data.description || undefined,
      username: data.username || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };

    // A vault save upserts the field to the server and needs a real record id, so it
    // cannot be queued offline — refuse rather than lose the plaintext to a temp id.
    if (useVaultStorage && typeof navigator !== 'undefined' && !navigator.onLine) {
      setVaultError('Saving a vault-protected password requires an internet connection.');
      return;
    }

    try {
      if (isEditing && link) {
        if (useVaultStorage) {
          // Vault write first; only persist the sentinel once it has succeeded.
          await encrypt('link', String(link.id), 'password', password);
          await updateLink.mutateAsync({ id: link.id, ...basePayload, password: 'vault:encrypted' });
        } else {
          await updateLink.mutateAsync({ id: link.id, ...basePayload, password });
        }
      } else {
        if (useVaultStorage) {
          // Create without the password to obtain a real id, then write the vault field
          // and persist the sentinel. The plaintext is never sent to the server.
          const created = await createLink.mutateAsync({ ...basePayload, password: undefined });
          if (!created || created.id <= 0) {
            setVaultError('Could not reach the server to store the vault-protected password. Please try again.');
            return;
          }
          await encrypt('link', String(created.id), 'password', password);
          await updateLink.mutateAsync({ id: created.id, password: 'vault:encrypted' });
        } else {
          await createLink.mutateAsync({ ...basePayload, password });
        }
      }
      onClose();
    } catch (e) {
      // Vault-encrypt failures surface here; mutation errors render via Alert separately.
      setVaultError(e instanceof Error ? e.message : 'Failed to save the vault-protected password.');
    }
  };

  const fetchingNode = metaLoading ? <span className="lf-spinner" aria-label="Fetching…" /> : null;

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
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Save changes" : "Add link"}
            </Button>
          </>
        }
      >
        <div className="lf-body">
          {(vaultError || mutationError) && (
            <Alert
              type="error"
              message={vaultError ?? (mutationError instanceof Error ? mutationError.message : "Something went wrong")}
            />
          )}

          {/* ══ Essentials ══ */}
          <div className="lf-essentials">
            <Input
              label="URL" type="url" placeholder="https://example.com"
              leftIcon={LucideGlobe} error={errors.url?.message} autoFocus
              rightNode={fetchingNode ?? undefined}
              onPaste={handleUrlPaste}
              {...register("url")}
            />
            {duplicate && (
              <div className="lf-duplicate-warn">
                Already saved as &ldquo;<strong>{duplicate.title}</strong>&rdquo; — you can still save a second copy.
              </div>
            )}
            <div className="lf-title-wrap">
              <Input
                label="Title" type="text" placeholder="My awesome link"
                leftIcon={LucideType} error={errors.title?.message}
                {...register("title")}
              />
              {autoFilled && (
                <span className="lf-autofill">
                  <LucideSparkles width={10} /> Auto-filled
                </span>
              )}
            </div>
          </div>

          {/* ══ More details (collapsed by default) ══ */}
          <Disclosure
            title="More details"
            summary="Description · category · tags · favorite"
            icon={LucideSlidersHorizontal}
            defaultOpen={isEditing}
          >
            <Textarea
              label="Description" placeholder="Optional description…" optional
              error={errors.description?.message} {...register("description")}
            />

            <div className="lf-field">
              <label className="lf-label">Category <span className="lf-optional">optional</span></label>
              <div className="lf-select-wrap">
                <LucideFolder className="lf-select-icon" />
                <Controller
                  name="categoryId" control={control}
                  render={({ field }) => (
                    <select
                      className="lf-select"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">No category</option>
                      {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                />
                <LucideChevronDown className="lf-select-chevron" />
              </div>
            </div>

            <div className="lf-field">
              <label className="lf-label">Tags <span className="lf-optional">optional</span></label>
              <Controller
                name="tagIds" control={control}
                render={({ field }) => <TagSelector selectedTagIds={field.value} onChange={field.onChange} />}
              />
            </div>

            <Controller
              name="isFavorite" control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Mark as favorite"
                  description="Pin this link to the top of your list"
                  icon={LucideStar}
                  iconColor="#fbbf24"
                />
              )}
            />
          </Disclosure>

          {/* ══ Credentials (collapsed by default) ══ */}
          <Disclosure
            title="Credentials"
            summary="Username · password · email · phone"
            icon={LucideLock}
            defaultOpen={isEditing && !!(link?.username || link?.email || link?.phone || link?.passwordEncrypted)}
          >
            {/* Only gate behind vault-unlock when there's an existing encrypted secret to
                protect — a brand-new link has nothing to unlock for yet. */}
            <VaultGuard enabled={isEditing && !!link?.passwordEncrypted}>
              <div className="lf-grid-2">
                <Input label="Username" type="text" placeholder="username" leftIcon={LucideUser} optional error={errors.username?.message} {...register("username")} />
                <div>
                  <Input
                    label="Password" type={showPassword ? "text" : "password"}
                    placeholder={isEditing ? "Leave blank to keep" : "password"}
                    leftIcon={LucideLock} optional error={errors.password?.message}
                    rightNode={
                      <button type="button" className="lf-eye" onClick={() => setShowPassword((p) => !p)} tabIndex={-1}>
                        {showPassword ? <LucideEyeOff width={13} /> : <LucideEye width={13} />}
                      </button>
                    }
                    {...register("password", {
                      onChange: (e) => setPasswordValue(e.target.value),
                    })}
                  />
                  <VaultSecretHint
                    secretType={detectSecret(passwordValue, 'PASSWORD')}
                    onEncrypt={
                      isEnabled && isUnlocked && link
                        ? () => encrypt('link', String(link.id), 'password', passwordValue)
                        : undefined
                    }
                  />
                </div>
              </div>
              <div className="lf-grid-2">
                <Input label="Email" type="email" placeholder="email@example.com" leftIcon={LucideMail} optional error={errors.email?.message} {...register("email")} />
                <Input label="Phone" type="tel" placeholder="+1 234 567 890" leftIcon={LucidePhone} optional error={errors.phone?.message} {...register("phone")} />
              </div>
            </VaultGuard>
          </Disclosure>
        </div>
      </FormLayout>
    </>
  );
}

// ─── Form-specific styles only (layout handled by FormLayout/Disclosure) ──────

const CSS = `
.lf-body       { display: flex; flex-direction: column; gap: 16px; padding: 16px 0; }
.lf-essentials { display: flex; flex-direction: column; gap: 12px; }

.lf-title-wrap  { position: relative; }
.lf-autofill {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 4px; font-size: 10px; font-weight: 500;
  color: var(--text-accent); opacity: 0.85; animation: fadeIn 0.2s ease;
}
.lf-spinner {
  display: block; width: 14px; height: 14px;
  border: 2px solid var(--border-default); border-top-color: var(--text-accent);
  border-radius: 50%; animation: lf-spin 0.6s linear infinite; flex-shrink: 0;
}
@keyframes lf-spin { to { transform: rotate(360deg); } }

.lf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 479px) { .lf-grid-2 { grid-template-columns: 1fr; } }

.lf-field   { display: flex; flex-direction: column; gap: 6px; }
.lf-label   { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.lf-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

.lf-select-wrap    { position: relative; display: flex; align-items: center; }
.lf-select-icon    { position: absolute; left: 10px; width: 14px; height: 14px; color: var(--text-tertiary); pointer-events: none; }
.lf-select-chevron { position: absolute; right: 10px; width: 12px; height: 12px; color: var(--text-tertiary); pointer-events: none; }
.lf-select {
  width: 100%; height: 36px; padding: 0 28px 0 32px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-primary); font-family: var(--font-sans); font-size: var(--text-sm);
  outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.lf-select:focus { border-color: var(--border-focus); background: var(--bg-elevated); box-shadow: 0 0 0 3px var(--accent-muted); }
.lf-select option { background: var(--bg-elevated); }

.lf-duplicate-warn {
  margin-top: 4px; padding: 7px 10px; font-size: var(--text-xs); color: var(--warning);
  background: var(--warning-muted); border: 1px solid rgba(245,158,11,0.25); border-radius: var(--radius-md);
  line-height: 1.4;
}

.lf-eye {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; background: transparent; border: none;
  color: var(--text-tertiary); cursor: pointer; border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.lf-eye:hover { color: var(--text-primary); }
`;
