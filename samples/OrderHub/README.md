# OrderHub — Power Apps Code App sample

A multi-page **React + TypeScript + Vite** Power Apps code app for order management.
It demonstrates a modern front-end stack running inside the Power Apps host, and
**deep linking driven by the query parameters Power Apps passes to the app** via
`getContext()`.

## Stack showcased

| Area | Library | Where |
| --- | --- | --- |
| Routing | [React Router](https://reactrouter.com/) | `src/router.tsx`, all pages |
| UI | [`@fluentui/react-components`](https://react.fluentui.dev/) (v9) | everywhere |
| Charts | [`@fluentui/react-charts`](https://github.com/microsoft/fluentui) | Dashboard |
| Virtualized grid | [`@fluentui-contrib/react-data-grid-react-window`](https://github.com/microsoft/fluentui-contrib) | Orders |
| Resizable panels | [`@fluentui-contrib/react-resize-handle`](https://github.com/microsoft/fluentui-contrib) | Order detail |
| Keyboard tips | [`@fluentui-contrib/react-keytips`](https://github.com/microsoft/fluentui-contrib) | Nav rail (press `Alt`) |
| Chat UI | [`@fluentui-contrib/react-chat`](https://github.com/microsoft/fluentui-contrib) | Assistant |
| Collapsible nav | `Nav`/`NavDrawer` from [`@fluentui/react-components`](https://react.fluentui.dev/) | App shell |
| Drag & drop | [`@dnd-kit`](https://dndkit.com/) core + sortable | Fulfillment board |
| Data / state | [TanStack Query](https://tanstack.com/query) + [TanStack Table](https://tanstack.com/table) | hooks + Products |

## App shell

- **Header** (`src/components/AppHeader.tsx`) — left-aligned logo + title, a
  **typeahead `SearchBox`** (`GlobalSearch`) that filters a suggestion listbox across
  orders, invoices, and products (arrow keys + Enter, click to navigate), a theme
  toggle, and an **Avatar** whose **Popover** shows the signed-in user from `getContext()`.
- **Collapsible `NavDrawer`** — the header hamburger collapses/expands the side nav.
  The nav stays **always visible**: collapsing minimizes it to an icon **rail**
  (labels move into tooltips) rather than hiding it. Nav items carry keytips (`Alt`).

## Domain

Mirrors five planned Dataverse tables: **orders, order line items, products,
invoices, invoice line items**. Data is served from an in-memory mock
(`src/services/`) that is deliberately shaped like generated Dataverse services so
the mock can be swapped for real connectors later with minimal changes to the
TanStack Query hooks in `src/hooks/queries.ts`.

## Pages

- `/` — Dashboard (KPI cards + **interactive charts**: click a donut slice or bar to
  deep-link into the matching filtered list)
- `/orders` — Orders (virtualized, sortable, filterable grid)
- `/orders/:orderId` — Order detail (resizable master/detail split, breadcrumb, delete)
- `/fulfillment` — Fulfillment board: **dnd-kit** sortable within columns + across stages,
  drag overlay, and keyboard drag
- `/products` — Product catalog: **fuller TanStack Table** with paging, global filter,
  column visibility, row selection, bulk delete, and per-row edit/delete dialogs
- `/invoices` — Invoices list
- `/invoices/:invoiceId` — Invoice detail (breadcrumb, mark-as-paid)
- `/assistant` — Chat assistant

Records created/edited/deleted through the dialogs use TanStack Query mutations with
**optimistic updates** (rollback on error); failures raise an error toast. Page views
and key actions emit events through `src/lib/telemetry.ts`.

## Per-page toolbars

Every page renders a Fluent `Toolbar` (`src/components/PageToolbar.tsx`) directly
below its header, with actions tailored to that page:

| Page | Toolbar actions |
| --- | --- |
| Dashboard | Time range (`ToolbarRadioGroup`) · Refresh · Export KPIs |
| Orders | New order (dialog) · Refresh · Export · Search + Status filter · Clear |
| Order detail | Back · Set status (menu) · View invoice · Print |
| Fulfillment | Refresh · Reset board · Compact (`ToolbarToggleButton`) · Customer filter |
| Products | New product (dialog) · Refresh · Export · Search + Category filter |
| Invoices | New invoice (dialog) · Refresh · Export · Status filter |
| Invoice detail | Back · Mark as paid · View order · Print |
| Assistant | New conversation · Clear · Persona (`ToolbarRadioGroup`) |

The "New …" actions open Fluent `Dialog` forms (`src/components/dialogs/`) that add
records to the in-memory mock data via TanStack Query mutations; toolbar actions
surface feedback through a shared Fluent `Toaster` mounted in the layout.

## Deep linking

On startup `src/hooks/useDeepLink.ts` reads `getContext().app.queryParams` and
`src/lib/parseDeepLink.ts` maps them to a route. Locally, the same parameters work
straight off the browser URL. Supported parameters (case-insensitive):

| Parameter(s) | Example | Result |
| --- | --- | --- |
| `entity` + `id` | `?entity=order&id=ord-12` | Open that order |
| `orderId` / `invoiceId` / `productId` | `?invoiceId=inv-3` | Open that record |
| `view` / `page` | `?view=fulfillment` | Go to a top-level page |
| `status` | `?view=orders&status=overdue` | Open orders filtered by status |
| `customer` (`customerId`, `account`) | `?customer=Contoso` | Filter orders by customer |
| `q` (`search`, `query`) | `?q=SO-1005` | Search the orders list |

Unknown or empty parameters leave the user on the dashboard.

## Getting started (new npm CLI)

> Requires Node.js LTS, Git, and a Power Platform environment with code apps enabled.

```bash
cd samples/OrderHub
npm install

# Initialize the code app (authenticates and generates power.config.json)
npx power-apps init --display-name "OrderHub"

# Run locally — open the "Local Play" URL printed in the terminal
npm run dev
```

To try deep linking locally, append parameters to the Local Play URL, e.g.
`...?view=fulfillment` or `...?entity=invoice&id=inv-3`.

## Build & publish

```bash
npm run build
npx power-apps push
```

`npx power-apps push` returns a Power Apps URL to run the published app.

## Testing

```bash
npm run lint        # eslint
npm test            # vitest unit tests (parseDeepLink)
npm run test:e2e    # playwright smoke tests (run `npx playwright install chromium` first)
```

- Unit tests cover the deep-link parser in `src/lib/parseDeepLink.test.ts`.
- `e2e/orderhub.spec.ts` builds + serves a static preview and checks navigation,
  deep linking, and the global search.
