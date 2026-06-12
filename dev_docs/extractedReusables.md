# Extracted Reusables — LinkVault Frontend

What to build once and use everywhere. Grouped by type.

---

## Part 1 — Shared Features (cross-module functionality)

These features appear in the frontendOptimization.md for Links but are needed in **Snippets, Prompts, Infrastructure** (and partially Notes). Building them as shared hooks/components instead of per-module copies is the right move.

---

### F1. Bulk Selection & Actions 
**Needed in:** Links ✅, Snippets, Prompts, Infrastructure

**What to extract:**
- `useBulkSelection(items: {id:number}[])` hook — manages `selectedIds: Set<number>`, `isSelectMode`, `toggleSelect`, `toggleSelectAll`, `exitSelectMode`
- `<BulkActionBar>` component — floating bottom bar showing count + action buttons (Delete, Favorite). Accepts `selectedCount`, `onDelete`, `onFavorite`, `onClear` props
- `<SelectBar>` component — replaces the filters bar when in select mode (Select All checkbox + count + Cancel)
- `<CardCheckbox>` — the absolute-positioned checkbox overlay on a card

**Why shared:** The selection logic is 100% identical across all modules. Only the mutations differ (which the page passes as props).

---

### F2. Grid Density Toggle
**Needed in:** Links, Snippets, Prompts, Infrastructure

**What to extract:**
- `useGridDensity(storageKey: string)` hook — reads/writes `"comfortable" | "compact"` from `localStorage`
- `<GridDensityToggle density onChange>` component — two-state toggle button (grid icon variants)
- CSS convention: parent grid gets `data-density="comfortable|compact"` attribute; a single global CSS block handles the `minmax` values for both states

---

### F3. Recently Visited Tracking
**Needed in:** Links (via open-click), possibly Prompts (usage tracking already exists)

**What to extract:**
- `useTrackVisit(endpoint: string)` hook — calls `PATCH /api/:module/:id/visit` and updates `lastVisitedAt` on the cached item
- **Backend:** a `recordVisit(id, userId, repo)` utility — sets `lastVisitedAt = NOW()` on any entity that has the column
- **Display:** `<LastVisitedLabel date>` — shows "Visited 3 days ago" or "Never visited" in a card footer

**Note:** Prompts already has `usageCount` + `lastUsedAt` — `useTrackVisit` should wrap the same `PATCH /api/prompts/:id/use` endpoint.

---

## Part 2 — Shared UI Components

These are copy-pasted in every module right now. Each should live in `components/ui/` or `components/shared/`.

---

### U1. `<PageHeader>` ✅ — `components/ui/PageHeader.tsx`
**Used in:** All 7 modules (100% identical structure)

```tsx
<PageHeader
  title="Links"
  subtitle="42 saved"
  action={<Button leftIcon={LucidePlus}>Add Link</Button>}
/>
```

CSS: flex space-between, `page-title` + `page-subtitle`, already defined globally.

---

### U2. `<EmptyState>` ✅ — `components/ui/EmptyState.tsx`
**Used in:** All 7 modules (100% identical)

```tsx
<EmptyState
  icon={LucideLink2}
  title="No links yet"
  subtitle="Save your first link to get started"
  action={<Button>Add your first link</Button>}
  // When filters active:
  filteredTitle="No links found"
  filteredSubtitle="Try adjusting your filters"
  filteredAction={<Button>Clear filters</Button>}
  hasFilters={hasFilters}
/>
```

---

### U3. `<FormLayout>` ✅ — `components/ui/FormLayout.tsx`
**Used in:** LinkForm, SnippetForm, PromptForm, InfraForm (80dvh wrapper + scrollable content + sticky footer)

```tsx
<FormLayout
  onSubmit={handleSubmit(onSubmit)}
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button type="submit" isLoading={isLoading} fullWidth>
        {isEditing ? "Save changes" : "Add link"}
      </Button>
    </>
  }
>
  {/* form sections go here */}
</FormLayout>
```

Internal CSS: `height: 80dvh`, scrollable `flex: 1` content area, sticky footer with `border-radius: 20px`.
Replaces `.lform-wrapper / .sform-wrapper / .iform-wrapper / .prompt-wrapper` — all identical.

---

### U4. `<FormSection>` ✅ — `components/ui/FormSection.tsx`
**Used in:** All forms (Basic info / Organize / Credentials sections)

```tsx
<FormSection icon={LucideLink2} title="Basic info">
  {/* fields */}
</FormSection>
```

Renders the `<p className="section-title">` row + bottom border + child fields with 12px gap.

---

### U5. `<FilterSearch>` — `components/shared/FilterSearch.tsx` *(skipped — inline in each page filter bar is cleaner)*
**Used in:** Links, Snippets, Prompts, Infrastructure, Notes (search input with icon + clear)

```tsx
<FilterSearch
  value={search}
  onChange={setSearch}
  placeholder="Search links…"
/>
```

---

### U6. `<FavoriteButton>` ✅ — `components/shared/FavoriteButton.tsx`
**Used in:** LinkCard, SnippetCard, PromptCard, InfraCard + filter toggles

```tsx
<FavoriteButton
  active={link.isFavorite}
  pending={toggleFavorite.isPending}
  onToggle={() => toggleFavorite.mutate(link.id)}
/>
```

---

### U7. `<CopyButton>` ✅ — `components/shared/CopyButton.tsx`
**Used in:** SnippetCard, PromptCard, InfraCard (copy text + "Copied!" feedback)

```tsx
<CopyButton text={snippet.content} size="sm" />
```

Internal: `useState(copied)` + `setTimeout` reset, `navigator.clipboard.writeText`.

---

### U8. `<ConfirmDeleteModal>` ✅ — `components/shared/ConfirmDeleteModal.tsx`
**Used in:** LinkCard, NoteCard, SnippetCard, InfraCard (100% identical delete confirm dialog)

```tsx
<ConfirmDeleteModal
  isOpen={confirmDelete}
  onClose={() => setConfirmDelete(false)}
  itemName={link.title}
  isLoading={deleteLink.isPending}
  onConfirm={() => deleteLink.mutate(link.id, { onSuccess: closeModal })}
/>
```

---

### U9. `<TagSection>` ✅ — `components/shared/TagSection.tsx`
**Used in:** All cards that show tags + category

```tsx
<TagSection tags={link.tags} category={link.category} />
```

Renders flex-wrap of `<Badge>` components. Identical across 5 modules.

---

### U10. `<ActionButtons>` ✅ — `components/shared/ActionButtons.tsx`
**Used in:** LinkCard, NoteCard, SnippetCard, InfraCard (Edit + Delete icon buttons)

```tsx
<ActionButtons
  onEdit={() => onEdit(link)}
  onDelete={() => setConfirmDelete(true)}
  extraLeft={<OpenButton href={link.url} />}
/>
```

---

### U11. `<CardGrid>` ✅ — `components/shared/CardGrid.tsx`
**Used in:** Links, Snippets, Prompts, Infrastructure

```tsx
<CardGrid minCardWidth={300} density={density}>
  {links.map(link => <LinkCard ... />)}
</CardGrid>
```

Standardizes `minmax(300px, 1fr)` grid, gap, and the `data-density` attribute. Each module currently hand-writes its own `.X-grid` CSS class with slightly different `minmax` values.

---

### U12. `<BulkActionBar>` ✅ — `components/shared/BulkActionBar.tsx`
*(From F1 above — listed here as a UI component)*

```tsx
<BulkActionBar
  count={selectedIds.size}
  onDelete={handleBulkDelete}
  onFavorite={handleBulkFavorite}
  isProcessing={isBulkProcessing}
/>
```

---

### U13. `<SelectBar>` ✅ — `components/shared/SelectBar.tsx`
*(From F1 above)*

```tsx
<SelectBar
  selectedCount={selectedIds.size}
  totalCount={links.length}
  isAllSelected={isAllSelected}
  onToggleAll={toggleSelectAll}
  onCancel={exitSelectMode}
/>
```

---

### U14. `<SortSelect>` ✅ — `components/shared/SortSelect.tsx`
*(From F3 above)*

```tsx
<SortSelect
  value={sortBy}
  onChange={setSortBy}
  options={[
    { value: "updatedAt_desc", label: "Newest" },
    { value: "updatedAt_asc",  label: "Oldest" },
    { value: "title_asc",      label: "A–Z"    },
  ]}
/>
```

---

### U15. `<GridDensityToggle>` ✅ — `components/shared/GridDensityToggle.tsx` + `hooks/useGridDensity.ts`
*(From F4 above)*

```tsx
<GridDensityToggle density={density} onChange={setDensity} />
```

---

## Part 3 — Backend Shared Utilities

These are patterns that repeat across all 5 CRUD services.

| Utility | Location | Used by |
|---|---|---|
| `loadTagsForItems` | `utils/tagLoader.ts` ✅ Done | Link, Note, Snippet, Prompt, Infra services |
| `applyPagination(qb, page, limit)` | `utils/pagination.ts` | All 5 services (currently inline) |
| `applySortToQuery(qb, sortBy, sortDir, alias)` | `utils/sort.ts` | All 5 services |
| `applyReorder(repo, userId, ids)` | `utils/reorder.ts` | All 5 controllers (drag reorder) |
| `recordVisit(repo, id, userId)` | `utils/visit.ts` | Link, Prompt (visit tracking) |

---

## Implementation Priority

Build in this order — each layer unlocks the next:

| # | What | Unblocks |
|---|---|---|
| 1 | `FormLayout` + `FormSection` | All form refactors |
| 2 | `EmptyState` + `PageHeader` | All page refactors |
| 3 | `ConfirmDeleteModal` + `FavoriteButton` + `CopyButton` + `ActionButtons` | All card refactors |
| 4 | `TagSection` + `CardGrid` | Grid density feature |
| 5 | `useBulkSelection` + `BulkActionBar` + `SelectBar` | Bulk actions in all modules |
| 6 | `SortSelect` + backend `applySortToQuery` | Sort controls in all modules |
| 7 | `GridDensityToggle` + `useGridDensity` | Density toggle |
| 8 | `useSortableList` + backend `applyReorder` | Drag reorder |
| 9 | `useTrackVisit` + backend `recordVisit` | Recently visited |
