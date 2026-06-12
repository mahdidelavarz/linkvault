# Projects Module

## Purpose

The projects module provides a cross-module organizing layer. A project is a named collection that can hold any mix of items from any module — links, notes, snippets, prompts, infrastructure items. While categories and tags organize by attribute, a project organizes by theme or goal: "everything related to my backend API", "everything for the client onboarding flow", "all the things I'm using for this specific deployment".

---

## The User

A developer who is working on several distinct topics or initiatives at once and wants to group all relevant vault items under a single name, regardless of their type.

---

## Information & Data

### Project fields

| Field | Description | Required |
|-------|-------------|----------|
| Title | The name of the project | Yes |
| Description | What this project is about | No |
| Emoji | A single emoji used as a visual identifier | No |
| Color | A color used as a visual identifier | No |
| Items | A list of item references from any module | Managed separately |

### Project item reference
Each item added to a project stores:
- Item ID
- Item type (link, note, snippet, prompt, infrastructure)
- Sort order (user-controlled position within the project)
- Date added to the project

An item can belong to **multiple projects simultaneously**. There is no limit to the number of projects an item can belong to.

---

## Projects List

The projects list page shows all of the user's projects. Each project entry shows:
- Title, emoji, color
- Description
- Number of items in the project

---

## Project Detail View

When the user opens a project, they see all of its items in one place — a mixed collection of links, notes, snippets, prompts, and infrastructure items. Each item shows its type and key identifying information (title, URL for links, etc.).

Items within a project can be:
- Reordered manually by dragging
- Filtered by item type
- Removed from the project (this does not delete the item from the vault; it only removes it from this project)

---

## Project Membership Indicator

Every item in every module displays how many projects it currently belongs to. Clicking this indicator opens a management interface where the user can:
- See which projects this item is in
- Add the item to additional projects
- Remove the item from specific projects

---

## Project Templates

When creating a new project, the user can optionally start from one of 5 built-in templates. Each template pre-populates the project with a set of example items relevant to a common development scenario:

| Template | Theme |
|----------|-------|
| JWT Auth | JSON Web Token authentication setup |
| Docker Compose | Container orchestration configuration |
| REST API | REST API development workflow |
| PostgreSQL | PostgreSQL database setup and queries |
| CI/CD | Continuous integration and deployment pipeline |

Starting from a template creates the project and adds the template's pre-defined items. The user can modify, remove, or add to them freely afterward.

---

## Actions

| Action | Description |
|--------|-------------|
| Create project | Fill in title and optional fields; optionally choose a template |
| Edit project | Change title, description, emoji, or color |
| Delete project | Remove the project; does not delete any vault items (only the grouping is removed) |
| Open project | Navigate to the project's detail view |
| Add item to project | From any module, add an item to one or more projects |
| Remove item from project | Detach an item from a project (item remains in the vault) |
| Reorder items | Change the display order of items within a project |
| Filter by type | In a project's detail view, narrow to only items of a specific module type |

---

## States

| State | Description |
|-------|-------------|
| Empty (no projects) | User has no projects; prompt to create first project |
| Projects list | User sees all their projects with counts |
| Project detail — empty | A project exists but has no items yet; prompt to add items |
| Project detail — populated | Mixed-type items are displayed |
| Project detail — filtered | Only one item type is shown |
| Loading | Projects or project items are being fetched |

---

## Rules & Constraints

- Title is required; emoji, color, and description are optional
- An item can belong to multiple projects (no limit)
- An item appears with a badge showing its total project membership count (0 = not in any project)
- Deleting a project does not delete the items in it
- Deleting an item from any module also removes all its project memberships
- Sort order within a project is user-controlled and persisted (items retain their position across sessions)
- Filter by type within a project is not persisted — resets on navigation

---

## Edge Cases

- **Item deleted from vault**: If an item is deleted from its original module, it is automatically removed from all projects it belonged to. The project's item count updates accordingly.
- **Template items**: Items added via templates are real vault items (not read-only or template-only). They can be edited, deleted, or added to other projects.
- **Project with no items**: Valid state; the project exists as an empty container until the user adds items.
- **Item in many projects**: An item can be in many projects. Its module page and search results always reflect the current membership count.
