'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Icon } from '@iconify/react'
import { type Link, type CreateLinkDto } from '@/types/link'
import { useCreateLink, useUpdateLink } from '@/hooks/useLinks'
import { useCategories } from '@/hooks/useCategories'
import Input    from '@/components/ui/Input'
import Textarea from '@/components/ui/TextArea'
import Button   from '@/components/ui/Button'
import Alert    from '@/components/ui/Alert'
import TagSelector from '@/components/tags/TagSelector'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  url:         z.string().min(1, 'URL is required').url('Must be a valid URL'),
  title:       z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  username:    z.string().max(100).optional(),
  password:    z.string().max(200).optional(),
  email:       z.string().email('Invalid email').optional().or(z.literal('')),
  phone:       z.string().max(30).optional(),
  isFavorite:  z.boolean(),
  categoryId:  z.number().optional(),
  tagIds:      z.array(z.number()),
})

type FormData = z.infer<typeof schema>

// ─── Component ────────────────────────────────────────────────────────────────

interface LinkFormProps {
  link?:    Link | null
  onClose:  () => void
}

export default function LinkForm({ link, onClose }: LinkFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isEditing = !!link

  const { data: categories } = useCategories()
  const createLink = useCreateLink()
  const updateLink = useUpdateLink()

  const isLoading = createLink.isPending || updateLink.isPending
  const error     = createLink.error     || updateLink.error

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        url:         '',
        title:       '',
        description: '',
        username:    '',
        password:    '',
        email:       '',
        phone:       '',
        isFavorite:  false,
        categoryId:  undefined,
        tagIds:      [],
      },
    })

  // Populate form when editing
  useEffect(() => {
    if (link) {
      reset({
        url:         link.url,
        title:       link.title,
        description: link.description ?? '',
        username:    link.username    ?? '',
        password:    '',
        email:       link.email       ?? '',
        phone:       link.phone       ?? '',
        isFavorite:  link.isFavorite,
        categoryId:  link.categoryId,
        tagIds:      link.tags?.map((t: any) => t.id) ?? [],
      })
    }
  }, [link, reset])

  const onSubmit = async (data: FormData) => {
    const payload: CreateLinkDto = {
      ...data,
      description: data.description || undefined,
      username:    data.username    || undefined,
      password:    data.password    || undefined,
      email:       data.email       || undefined,
      phone:       data.phone       || undefined,
    }
    try {
      if (isEditing && link) {
        await updateLink.mutateAsync({ id: link.id, ...payload })
      } else {
        await createLink.mutateAsync(payload)
      }
      onClose()
    } catch { /* error shown via Alert */ }
  }

  return (
    <>
      <style>{CSS}</style>
      <form className="lform" onSubmit={handleSubmit(onSubmit)} noValidate>

        {error && (
          <Alert
            type="error"
            message={error instanceof Error ? error.message : 'Something went wrong'}
          />
        )}

        {/* ── Section: Basic info ── */}
        <div className="lform-section">
          <p className="lform-section-title">
            <Icon icon="lucide:link-2" width={13} /> Basic info
          </p>
          <div className="lform-fields">
            <Input
              label="URL"
              type="url"
              placeholder="https://example.com"leftIcon="lucide:globe"
              error={errors.url?.message}
              autoFocus
              {...register('url')}
            />
            <Input
              label="Title"
              type="text"
              placeholder="My awesome link"
              leftIcon="lucide:type"
              error={errors.title?.message}
              {...register('title')}
            />
            <Textarea
              label="Description"
              placeholder="Optional description…"
              optional
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </div>

        {/* ── Section: Organize ── */}
        <div className="lform-section">
          <p className="lform-section-title">
            <Icon icon="lucide:folder" width={13} /> Organize
          </p>
          <div className="lform-fields">

            {/* Category select */}
            <div className="lform-field">
              <label className="lform-label">Category <span className="lform-optional">optional</span></label>
              <div className="lform-select-wrap">
                <Icon icon="lucide:folder" className="lform-select-icon" />
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <select
                      className="lform-select"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">No category</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                />
                <Icon icon="lucide:chevron-down" className="lform-select-chevron" />
              </div>
            </div>

            {/* Tags */}
            <div className="lform-field">
              <label className="lform-label">Tags <span className="lform-optional">optional</span></label>
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <TagSelector selectedTagIds={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Favorite checkbox */}
            <Controller
              name="isFavorite"
              control={control}
              render={({ field }) => (
                <label className="lform-checkbox">
                  <div className={['lform-check-box', field.value ? 'lform-check-box--checked' : ''].filter(Boolean).join(' ')}>
                    {field.value && <Icon icon="lucide:check" width={11} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <span className="lform-check-label">
                    <Icon icon="lucide:star" width={13} style={{ color: '#fbbf24' }} />
                    Mark as favorite
                  </span>
                </label>
              )}
            />
          </div>
        </div>

        {/* ── Section: Credentials ── */}
        <div className="lform-section">
          <p className="lform-section-title">
            <Icon icon="lucide:lock" width={13} /> Credentials <span className="lform-section-hint">optional</span>
          </p>
          <div className="lform-fields">
            <div className="lform-grid-2">
              <Input
                label="Username"
                type="text"
                placeholder="username"
                leftIcon="lucide:user"
                optional
                error={errors.username?.message}{...register('username')}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditing ? 'Leave blank to keep' : 'password'}
                leftIcon="lucide:lock"
                optional
                error={errors.password?.message}
                rightNode={
                  <button
                    type="button"
                    className="lform-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                  >
                    <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} width={13} />
                  </button>
                }
                {...register('password')}
              />
            </div>
            <div className="lform-grid-2">
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                leftIcon="lucide:mail"
                optional
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 890"
                leftIcon="lucide:phone"
                optional
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="lform-footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save changes' : 'Add link'}
          </Button>
        </div>

      </form>
    </>
  )
}

const CSS = `
.lform { display: flex; flex-direction: column; gap: 0; }

.lform-section {
  padding:       16px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.lform-section:last-of-type { border-bottom: none; }

.lform-section-title {
  display:       flex;
  align-items:   center;
  gap:           6px;
  font-size:     var(--text-xs);
  font-weight:   600;
  color:         var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}
.lform-section-hint {
  font-size:      var(--text-xs);
  font-weight:    400;
  color:          var(--text-tertiary);
  text-transform: none;
  letter-spacing: 0;
  margin-left:    4px;
}

.lform-fields { display: flex; flex-direction: column; gap: 12px; }

.lform-grid-2 {
  display:               grid;
  grid-template-columns: 1fr 1fr;
  gap:                   12px;
}
@media (max-width: 479px) {
  .lform-grid-2 { grid-template-columns: 1fr; }
}

/* Select */
.lform-field   { display: flex; flex-direction: column; gap: 6px; }
.lform-label   { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.lform-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

.lform-select-wrap { position: relative; display: flex; align-items: center; }
.lform-select-icon {
  position:       absolute;
  left:           10px;
  width:          14px;
  height:         14px;
  color:          var(--text-tertiary);
  pointer-events: none;
}
.lform-select-chevron {
  position:       absolute;
  right:          10px;
  width:          12px;
  height:         12px;
  color:          var(--text-tertiary);
  pointer-events: none;
}
.lform-select {
  width:            100%;
  height:           36px;
  padding:          0 28px 0 32px;
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
  transition:       border-color var(--transition-fast), background var(--transition-fast);
}
.lform-select:focus { border-color: var(--border-focus); background: var(--bg-elevated); box-shadow: 0 0 0 3px var(--accent-muted); }
.lform-select option { background: var(--bg-elevated); }

/* Checkbox */
.lform-checkbox {
  display:     flex;
  align-items: center;
  gap:         10px;
  cursor:      pointer;
  width:       fit-content;
  position:    relative;
}
.lform-check-box {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           18px;
  height:          18px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-sm);
  flex-shrink:     0;
  transition:      background var(--transition-fast), border-color var(--transition-fast);
}
.lform-check-box--checked { background: var(--accent); border-color: var(--accent); color: white; }
.lform-check-label {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-sm);
  color:       var(--text-secondary);
}

/* Eye button */
.lform-eye {
  display:      flex;
  align-items:  center;
  justify-content: center;
  width:        26px;
  height:       26px;
  background:   transparent;
  border:       none;
  color:        var(--text-tertiary);
  cursor:       pointer;
  border-radius: var(--radius-sm);
  transition:   color var(--transition-fast);
}
.lform-eye:hover { color: var(--text-primary); }

/* Footer */
.lform-footer {
  display:         flex;
  justify-content: flex-end;
  gap:             8px;
  padding-top:     16px;
}
@media (max-width: 479px) {
  .lform-footer { flex-direction: column-reverse; }
  .lform-footer > * { width: 100%; }
}
`