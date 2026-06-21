## 1. Sidebar behavior

Refactor `NovaSidebar` + `NovaLayout`:

- Lift the `collapsed` state into `NovaLayout` (or a small `LayoutContext`) so both sidebars can react.
- Primary sidebar starts **expanded** on first load (default `collapsed = false`).
- When the user clicks any nav item, set `collapsed = true` automatically (only collapse if the click navigates to a different route, and only when a secondary sidebar exists for that route).
- Keep the manual collapse/expand toggle so the user can re-open it.
- Collapsed primary sidebar stays as the 64px icon rail (already implemented).

Add a new **SecondarySidebar** component rendered between the primary sidebar and `<main>` in `NovaLayout`. It reads the current route and renders a section-specific panel:

```text
[Primary 64px] [Secondary 240px] [Topbar + Main content]
```

Per-route secondary nav definitions (kept in `src/components/nova/secondaryNav.ts`):

- `/` Dashboard → Overview, Activity, Quick actions
- `/analytics` → Traffic, Conversions, Retention, Cohorts
- `/users`, `/users/:id` → All users, Invited, Suspended, Segments
- `/subscriptions` → Plans, Invoices, Coupons, Churn
- `/devices` → All devices, Browser ext, Mobile, Sessions
- `/support` → Inbox, Open, Closed, SLA
- `/security` → Threats, Breaches, Policies, MFA
- `/audit` → All events, Auth, Admin, Data
- `/rbac` → Roles, Permissions, API keys
- `/content`, `/docs`, `/changelog`, `/announcements` → page-specific sub-sections
- `/system` → Services, Incidents, Regions, Webhooks
- `/settings` → Profile, Organization, Notifications, Integrations, Billing, API

Routes without a defined secondary nav: hide the panel and don't auto-collapse the primary sidebar.

## 2. Breadcrumbs

Add a `PageBreadcrumb` component rendered inside `NovaTopbar` (or as a thin bar directly under it) using the existing `components/ui/breadcrumb.tsx`.

- Derive crumbs from the path segments + a label map (`/users/usr_123` → `Users / John Doe`).
- For detail pages (e.g. `UserDetailPage`), the page passes a `title` override via a small `usePageMeta` hook so the last crumb shows the entity name.

## 3. Reusable DataTable

Create `src/components/nova/DataTable.tsx` (built on existing `components/ui/table.tsx` and `pagination.tsx`) supporting:

- Column definitions with `key`, `header`, `accessor`, `sortable`, `filterable`, `render`.
- Global search input (top-right).
- Per-column filter inputs (text) and dropdown filters for enum columns (e.g. status, role, plan).
- Column sorting (click header to toggle asc/desc/none).
- Pagination (page size selector: 10 / 25 / 50, page navigator).
- Row count / "showing X–Y of Z" indicator.
- Empty state and loading skeleton hooks.

Apply it to existing tables on:

- `UsersPage` (search, role + status filters, sort by name/created/lastSeen)
- `SubscriptionsPage` (plan + status filters, sort by MRR/renewsAt)
- `DevicesPage` (platform + status filters)
- `AuditPage` (action + severity filters, sort by time)
- `SecurityPage` threat table
- `SupportPage` ticket table
- `ContentPage`, `DocsPage`, `ChangelogPage`, `AnnouncementsPage` content tables
- `RBACPage` roles table
- `SystemPage` services table

Each page swaps its current hand-rolled table for `<DataTable columns={...} rows={...} />` while keeping its existing data source from `mockData.ts`.

## 4. Out of scope

- No backend changes; everything stays client-side with `mockData.ts`.
- No changes to design tokens, theme, or topbar role switcher.
- Mobile: secondary sidebar collapses into a `Sheet` triggered from the topbar (basic responsive behavior, not a full mobile redesign).

## Technical notes

- New files: `src/components/nova/SecondarySidebar.tsx`, `src/components/nova/secondaryNav.ts`, `src/components/nova/PageBreadcrumb.tsx`, `src/components/nova/DataTable.tsx`, `src/context/LayoutContext.tsx`.
- Edited: `NovaLayout.tsx`, `NovaSidebar.tsx`, `NovaTopbar.tsx`, every page listed above.
- Sorting/filtering implemented in-component with `useMemo` (no new deps); existing shadcn `Pagination` reused.
