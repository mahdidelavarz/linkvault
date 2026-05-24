'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type Note } from '@/types/note'
import { useCreateNote, useUpdateNote } from '@/hooks/useNote'
import { useCategories } from '@/hooks/useCategories'
import Input       from '@/components/ui/Input'
import Button      from '@/components/ui/Button'
import Alert       from '@/components/ui/Alert'
import TagSelector from '@/components/tags/TagSelector'
import { LucideCheck, LucideChevronDown, LucideFileText, LucideFolder, LucidePin } from '@/Icons/Icons'

const schema = z.object({
  title:      z.string().min(1, 'Title is required').max(200),
  isPinned:   z.boolean(),
  categoryId: z.number().optional(),
  tagIds:     z.array(z.number()),
})
type FormData = z.infer<typeof schema>

interface NoteFormProps {
  note?:   Note | null
  onClose: () => void
}

export default function NoteForm({ note, onClose }: NoteFormProps) {
  const isEditing = !!note
  const { data: categories } = useCategories()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const isLoading  = createNote.isPending || updateNote.isPending
  const error      = createNote.error     || updateNote.error

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { title: '', isPinned: false, categoryId: undefined, tagIds: [] },
    })

  useEffect(() => {
    if (note) {
      reset({
        title:      note.title,
        isPinned:   note.isPinned,
        categoryId: note.categoryId,
        tagIds:     note.tags?.map((t: any) => t.id) ?? [],
      })
    }
  }, [note, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && note) {
        await updateNote.mutateAsync({ id: note.id, ...data })
      } else {
        await createNote.mutateAsync({ ...data, content: '' })
      }
      onClose()
    } catch { /* shown via Alert */ }
  }

  return (
    <>
      <style>{CSS}</style>
      <form className="nform" onSubmit={handleSubmit(onSubmit)} noValidate>

        {error && (
          <Alert type="error" message={error instanceof Error ? error.message : 'Something went wrong'} />
        )}

        <Input
          label="Title"
          type="text"
          placeholder="Note title…"
          leftIcon={LucideFileText}
          error={errors.title?.message}
          autoFocus
          {...register('title')}
        />

        {/* Category */}
        <div className="nform-field">
          <label className="nform-label">
            Category <span className="nform-optional">optional</span>
          </label>
          <div className="nform-select-wrap">
            <LucideFolder className="nform-select-icon" />
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <select
                  className="nform-select"
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
            <LucideChevronDown className="nform-select-chevron" />
          </div>
        </div>

        {/* Tags */}
        <div className="nform-field">
          <label className="nform-label">
            Tags <span className="nform-optional">optional</span>
          </label>
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <TagSelector selectedTagIds={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Pin */}
        <Controller
          name="isPinned"
          control={control}
          render={({ field }) => (
            <label className="nform-checkbox">
              <div className={['nform-check-box', field.value ? 'nform-check-box--checked' : ''].filter(Boolean).join(' ')}>
                {field.value && <LucideCheck width={11} />}
              </div>
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <span className="nform-check-label">
                <LucidePin width={13} style={{ color: 'var(--cyan-400)' }} />
                Pin this note
              </span>
            </label>
          )}
        />

        <div className="nform-footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save changes' : 'Create note'}
          </Button>
        </div>

      </form>
    </>
  )
}

const CSS = `
.nform { display: flex; flex-direction: column; gap: 16px; }

.nform-field { display: flex; flex-direction: column; gap: 6px; }
.nform-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.nform-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

.nform-select-wrap { position: relative; display: flex; align-items: center; }
.nform-select-icon { position: absolute; left: 10px; width: 14px; height: 14px; color: var(--text-tertiary); pointer-events: none; }
.nform-select-chevron { position: absolute; right: 10px; width: 12px; height: 12px; color: var(--text-tertiary); pointer-events: none; }
.nform-select {
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
.nform-select:focus { border-color: var(--border-focus); background: var(--bg-elevated); box-shadow: 0 0 0 3px var(--accent-muted); }
.nform-select option { background: var(--bg-elevated); }

.nform-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; width: fit-content; }
.nform-check-box {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: var(--bg-subtle); border: 1px solid var(--border-default);
  border-radius: var(--radius-sm); flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.nform-check-box--checked { background: var(--accent); border-color: var(--accent); color: white; }
.nform-check-label { display: flex; align-items: center; gap: 6px; font-size: var(--text-sm); color: var(--text-secondary); }

.nform-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
@media (max-width: 479px) {
  .nform-footer { flex-direction: column-reverse; }
  .nform-footer > * { width: 100%; }
}
`