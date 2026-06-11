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
| Drag & drop | [`@dnd-kit`](https://dndkit.com/) | Fulfillment board |
| Data / state | [TanStack Query](https://tanstack.com/query) + [TanStack Table](https://tanstack.com/table) | hooks + Products |

## Domain

Mirrors five planned Dataverse tables: **orders, order line items, products,
invoices, invoice line items**. Data is served from an in-memory mock
(`src/services/`) that is deliberately shaped like generated Dataverse services so
the mock can be swapped for real connectors later with minimal changes to the
TanStack Query hooks in `src/hooks/queries.ts`.

## Pages

- `/` — Dashboard (KPI cards + charts)
- `/orders` — Orders (virtualized, sortable, filterable grid)
- `/orders/:orderId` — Order detail (resizable master/detail split)
- `/fulfillment` — Drag-and-drop fulfillment board
- `/products` — Product catalog (TanStack Table)
- `/invoices` — Invoices list
- `/invoices/:invoiceId` — Invoice detail
- `/assistant` — Chat assistant

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
