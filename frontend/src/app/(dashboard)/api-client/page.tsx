'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Icon } from '@iconify/react'
import {
  useCollections, useEndpoints,
  useCreateEndpoint, useUpdateEndpoint, useDeleteEndpoint,
  useTestEndpoint,
} from '@/hooks/useApiClient'
import { useCategories } from '@/hooks/useCategories'
import { type ApiEndpoint, type HttpMethod } from '@/types/api'
import CollectionSidebar from '@/components/api-client/CollectionSidebar'
import RequestBuilder    from '@/components/api-client/RequestBuilder'
import ResponseViewer    from '@/components/api-client/ResponseViewer'
import Button            from '@/components/ui/Button'
import Modal             from '@/components/ui/Modal'
import Input             from '@/components/ui/Input'
import Textarea          from '@/components/ui/TextArea'
import Alert             from '@/components/ui/Alert'
import TagSelector       from '@/components/tags/TagSelector'
import FormSelect        from '@/components/snippets/FormSelect'
import { LucideFolder, LucideType } from '@/Icons/Icons'

// ─── Save form schema ─────────────────────────────────────────────────────────
const saveSchema = z.object({
  title:        z.string().min(1, 'Title is required'),
  description:  z.string().optional(),
  collectionId: z.number().optional(),
  categoryId:   z.number().optional(),
  tagIds:       z.array(z.number()),
  isFavorite:   z.boolean(),
})
type SaveFormData = z.infer<typeof saveSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApiClientPage() {
  // Sidebar state
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const [mobileSidebarOpen,  setMobileSidebarOpen]  = useState(false)

  // Request state
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [method,     setMethod]     = useState<HttpMethod>('GET')
  const [url,        setUrl]        = useState('')
  const [headers,    setHeaders]    = useState('')
  const [body,       setBody]       = useState('')
  const [bodyType,   setBodyType]   = useState<'json' | 'raw' | 'form-data'>('json')

  // Response
  const [response,   setResponse]   = useState<any>(null)

  // Save modal
  const [saveOpen,   setSaveOpen]   = useState(false)

  // Confirm delete
  const [confirmDel, setConfirmDel] = useState(false)

  const { data: collections }          = useCollections()
  const { data: categories }           = useCategories()
  const { data: endpoints, refetch }   = useEndpoints({ collectionId: selectedCollection || undefined })
  const createEndpoint                 = useCreateEndpoint()
  const updateEndpoint                 = useUpdateEndpoint()
  const deleteEndpoint                 = useDeleteEndpoint()
  const testEndpoint                   = useTestEndpoint()

  // ─── Save form ──────────────────────────────────────────────────────────────
  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<SaveFormData>({
      resolver: zodResolver(saveSchema),
      defaultValues: { title: '', description: '', tagIds: [], isFavorite: false },
    })

  const openSave = () => {
    if (selectedEndpoint) {
      reset({
        title:        selectedEndpoint.title,
        description:  selectedEndpoint.description ?? '',
        collectionId: selectedEndpoint.collectionId,
        categoryId:   selectedEndpoint.categoryId,
        tagIds:       selectedEndpoint.tags?.map((t: any) => t.id) ?? [],
        isFavorite:   selectedEndpoint.isFavorite,
      })
    } else {
      reset({ title: '', description: '', collectionId: selectedCollection ?? undefined, tagIds: [], isFavorite: false })
    }
    setSaveOpen(true)
  }

  const onSave = async (data: SaveFormData) => {
    // Parse headers string → array
    const parsedHeaders = headers
      .split('\n').filter((l) => l.trim())
      .map((l) => {
        const [key, ...rest] = l.split(':')
        return { key: key?.trim() ?? '', value: rest.join(':').trim(), enabled: true }
      })
      .filter((h) => h.key)

    const payload = {
      ...data,
      url, method,
      headers:     parsedHeaders,
      queryParams: [],
      body:        body || undefined,
      bodyType:    bodyType as any,
      authType:    'none' as const,
    }

    try {
      if (selectedEndpoint) {
        await updateEndpoint.mutateAsync({ id: selectedEndpoint.id, ...payload })
      } else {
        await createEndpoint.mutateAsync(payload)
      }
      setSaveOpen(false)
      refetch()
    } catch { /* shown via Alert */ }
  }

  // ─── Send request ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!url.trim()) return
    try {
      let parsedHeaders: Record<string, string> = {}
      if (headers.trim()) {
        try { parsedHeaders = JSON.parse(headers) }
        catch {
          headers.split('\n').forEach((line) => {
            const [key, ...vals] = line.split(':')
            if (key && vals.length) parsedHeaders[key.trim()] = vals.join(':').trim()
          })
        }
      }
      const result = await testEndpoint.mutateAsync({ method, url, headers: parsedHeaders, body: body || undefined, bodyType })
      setResponse(result)
    } catch (err: any) {
      setResponse({ status: 0, statusText: 'Error', body: JSON.stringify({ error: err.message }, null, 2), headers: {}, size: 0, time: 0 })
    }
  }

  // ─── Select endpoint ─────────────────────────────────────────────────────────
  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep)
    setMethod(ep.method)
    setUrl(ep.url)
    setHeaders(ep.headers?.filter((h) => h.enabled !== false).map((h) => `${h.key}: ${h.value}`).join('\n') ?? '')
    setBody(ep.body ?? '')
    setBodyType((ep.bodyType as any) ?? 'json')
    setResponse(null)
  }

  const handleNewRequest = () => {
    setSelectedEndpoint(null)
    setMethod('GET'); setUrl(''); setHeaders(''); setBody(''); setBodyType('json'); setResponse(null)
  }

  const handleDelete = async () => {
    if (!selectedEndpoint) return
    await deleteEndpoint.mutateAsync(selectedEndpoint.id)
    handleNewRequest()
    refetch()
    setConfirmDel(false)
  }

  const requestTitle = selectedEndpoint ? selectedEndpoint.title : 'New Request'

  return (
    <>
      <style>{CSS}</style>
      <div className="acp">

        {/* ── Mobile top bar ── */}
        <div className="acp-mobile-bar">
          <button className="acp-menu-btn" onClick={() => setMobileSidebarOpen(true)} aria-label="Open collections">
            <Icon icon="lucide:panel-left" width={18} />
          </button>
          <span className="acp-mobile-title">API Client</span>
          <button className="acp-new-btn" onClick={handleNewRequest}>
            <Icon icon="lucide:plus" width={18} />
          </button>
        </div>

        {/* ── Main layout ── */}
        <div className="acp-layout">

          {/* Sidebar */}
          <CollectionSidebar
            collections={collections}
            endpoints={endpoints}
            selectedCollection={selectedCollection}
            selectedEndpoint={selectedEndpoint}
            onSelectCollection={setSelectedCollection}
            onSelectEndpoint={handleSelectEndpoint}
            onNewRequest={handleNewRequest}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />

          {/* ── Right pane ── */}
          <div className="acp-right">
            <RequestBuilder
              method={method}       url={url}
              headers={headers}     body={body}
              bodyType={bodyType}   isSaved={!!selectedEndpoint}
              isSending={testEndpoint.isPending}
              title={requestTitle}
              onMethodChange={setMethod}     onUrlChange={setUrl}
              onHeadersChange={setHeaders}   onBodyChange={setBody}
              onBodyTypeChange={setBodyType}
              onSend={handleSend}
              onSave={openSave}
              onDelete={() => setConfirmDel(true)}
            />

            <ResponseViewer response={response} isLoading={testEndpoint.isPending} />
          </div>
        </div>
      </div>

      {/* ── Save / Update modal ── */}
      <Modal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={selectedEndpoint ? 'Update Endpoint' : 'Save Endpoint'}
        size="md"
      >
        <form className="save-form" onSubmit={handleSubmit(onSave)} noValidate>

          {(createEndpoint.isError || updateEndpoint.isError) && (
            <Alert type="error" message="Failed to save endpoint. Please try again." />
          )}

          <Input
            label="Title"
            leftIcon={LucideType}
            placeholder="e.g., Get User Profile"
            error={errors.title?.message}
            autoFocus
            {...register('title')}
          />

          <Textarea
            label="Description"
            placeholder="What does this endpoint do?"
            optional rows={2}
            {...register('description')}
          />

          <div className="save-form-grid">
            <FormSelect
              label="Collection"
              optional
              leftIcon={LucideFolder}
              {...register('collectionId', { setValueAs: (v) => v ? parseInt(v) : undefined })}
            >
              <option value="">No collection</option>
              {collections?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>

            <FormSelect
              label="Category"
              optional
              leftIcon={LucideFolder}
              {...register('categoryId', { setValueAs: (v) => v ? parseInt(v) : undefined })}
            >
              <option value="">No category</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
          </div>

          <div className="save-form-field">
            <label className="save-form-label">Tags <span className="save-form-optional">optional</span></label>
            <Controller
              name="tagIds"
              control={control}
              render={({ field }) => (
                <TagSelector selectedTagIds={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <Controller
            name="isFavorite"
            control={control}
            render={({ field }) => (
              <label className="save-form-check">
                <div className={['sf-check-box', field.value ? 'sf-check-box--on' : ''].filter(Boolean).join(' ')}>
                  {field.value && <Icon icon="lucide:check" width={11} />}
                </div>
                <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                <span className="save-form-check-label">
                  <Icon icon="lucide:star" width={13} style={{ color: '#fbbf24' }} />
                  Mark as favorite
                </span>
              </label>
            )}
          />

          <div className="save-form-footer">
            <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createEndpoint.isPending || updateEndpoint.isPending}>
              {selectedEndpoint ? 'Update' : 'Save Endpoint'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirm ── */}
      <Modal isOpen={confirmDel} onClose={() => setConfirmDel(false)} title="Delete endpoint" size="sm">
        <div className="del-confirm">
          <p className="del-confirm-text">
            Delete <strong>{selectedEndpoint?.title}</strong>? This cannot be undone.
          </p>
          <div className="del-confirm-actions">
            <Button variant="secondary" onClick={() => setConfirmDel(false)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteEndpoint.isPending} onClick={handleDelete}>Delete</Button>
            </div>
        </div>
      </Modal>
    </>
  )
}

const CSS = `
.acp { display: flex; flex-direction: column; height: calc(100dvh - 56.5px); gap: 0; }

/* Mobile top bar */
.acp-mobile-bar {
  display:         none;
  align-items:     center;
  justify-content: space-between;
  padding:         10px 16px;
  background:      var(--bg-surface);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  margin-bottom:   12px;
  flex-shrink:     0;
}
@media (max-width: 767px) { .acp-mobile-bar { display: flex; } }
.acp-menu-btn, .acp-new-btn {
  display:         flex; align-items: center; justify-content: center;
  width:           36px; height: 36px;
  background:      transparent; border: 1px solid var(--border-default);
  border-radius:   var(--radius-md); color: var(--text-secondary); cursor: pointer;
  min-height:      44px; min-width: 44px;
  transition:      background var(--transition-fast), color var(--transition-fast);
}
.acp-menu-btn:hover, .acp-new-btn:hover { background: var(--bg-overlay); color: var(--text-primary); }
.acp-new-btn { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-400); }
.acp-mobile-title { font-size: var(--text-md); font-weight: 600; color: var(--text-primary); }

/* Layout */
.acp-layout {
  display:    flex;
  gap:        12px;
  flex:       1;
  min-height: 0;
  overflow:   hidden;
}

/* Right pane */
.acp-right {
  flex:           1;
  display:        flex;
  flex-direction: column;
  gap:            12px;
  min-width:      0;
  overflow-y:     auto;
}
.acp-right::-webkit-scrollbar { width: 4px; }
.acp-right::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

@media (max-width: 767px) {
  .acp-layout  { flex-direction: column; overflow-y: auto; }
  .acp-right   { overflow-y: unset; }
  .acp         { height: auto; }
}

/* Save form */
.save-form       { display: flex; flex-direction: column; gap: 14px; }
.save-form-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 479px) { .save-form-grid { grid-template-columns: 1fr; } }
.save-form-field { display: flex; flex-direction: column; gap: 6px; }
.save-form-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.save-form-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }
.save-form-check { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; width: fit-content; }
.sf-check-box {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: var(--bg-subtle); border: 1px solid var(--border-default);
  border-radius: var(--radius-sm); flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.sf-check-box--on { background: var(--accent); border-color: var(--accent); color: white; }
.save-form-check-label { display: flex; align-items: center; gap: 6px; font-size: var(--text-sm); color: var(--text-secondary); }
.save-form-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; border-top: 1px solid var(--border-subtle); }
@media (max-width: 479px) {
  .save-form-footer { flex-direction: column-reverse; }
  .save-form-footer > * { width: 100%; }
}

/* Delete confirm */
.del-confirm         { display: flex; flex-direction: column; gap: 20px; }
.del-confirm-text    { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); }
.del-confirm-text strong { color: var(--text-primary); }
.del-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
`