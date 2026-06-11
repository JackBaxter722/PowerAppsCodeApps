// Deep-link parsing.
//
// Power Apps passes arbitrary query parameters to a code app; they are read at
// runtime via getContext().app.queryParams (a Record<string, string>). This
// module turns that loosely-typed bag of parameters into a concrete in-app
// route + query string, so a link can drop the user straight onto a specific
// record or a filtered view.
//
// It is deliberately tolerant of a *variety* of parameter shapes:
//   - entity + id            ?entity=order&id=ord-12
//   - id-aliases             ?orderId=ord-12  /  ?invoiceId=inv-3  /  ?productId=prod-2
//   - named view             ?view=fulfillment
//   - filters only           ?status=overdue&customer=Contoso
// Keys are matched case-insensitively. Unknown / empty input returns null so the
// caller can stay on the default route.

export interface DeepLinkTarget {
  path: string
  search: string // includes leading '?' when non-empty
}

type EntityKind = 'order' | 'invoice' | 'product'

// Entity -> list route segment.
const ENTITY_ROUTE: Record<EntityKind, string> = {
  order: 'orders',
  invoice: 'invoices',
  product: 'products',
}

// Accepts singular/plural and a few synonyms for the `entity` param.
const ENTITY_ALIASES: Record<string, EntityKind> = {
  order: 'order',
  orders: 'order',
  salesorder: 'order',
  invoice: 'invoice',
  invoices: 'invoice',
  bill: 'invoice',
  product: 'product',
  products: 'product',
  item: 'product',
}

// Dedicated id-bearing params that imply both the entity and the record id.
const ID_PARAM_TO_ENTITY: Record<string, EntityKind> = {
  orderid: 'order',
  invoiceid: 'invoice',
  productid: 'product',
}

// Named top-level views.
const VIEW_ROUTES: Record<string, string> = {
  dashboard: '/',
  home: '/',
  orders: '/orders',
  order: '/orders',
  fulfillment: '/fulfillment',
  board: '/fulfillment',
  kanban: '/fulfillment',
  products: '/products',
  catalog: '/products',
  invoices: '/invoices',
  billing: '/invoices',
  assistant: '/assistant',
  chat: '/assistant',
  help: '/assistant',
}

// Filter params forwarded onto the destination route's query string. Aliases on
// the left are normalised to the canonical key on the right.
const FILTER_ALIASES: Record<string, string> = {
  status: 'status',
  state: 'status',
  customer: 'customer',
  customername: 'customer',
  customerid: 'customer',
  account: 'customer',
  product: 'product',
  productname: 'product',
  q: 'q',
  query: 'q',
  search: 'q',
  datefrom: 'dateFrom',
  from: 'dateFrom',
  dateto: 'dateTo',
  to: 'dateTo',
}

function lowerKeyLookup(params: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      map.set(key.toLowerCase(), value)
    }
  }
  return map
}

function buildFilterSearch(lookup: Map<string, string>): string {
  const search = new URLSearchParams()
  for (const [rawKey, value] of lookup) {
    const canonical = FILTER_ALIASES[rawKey]
    if (canonical && !search.has(canonical)) {
      search.set(canonical, value)
    }
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

export function parseDeepLink(
  params: Record<string, string> | undefined | null,
): DeepLinkTarget | null {
  if (!params) return null
  const lookup = lowerKeyLookup(params)
  if (lookup.size === 0) return null

  const filterSearch = buildFilterSearch(lookup)

  // 1. Dedicated id-bearing params (orderId / invoiceId / productId).
  for (const [idKey, entity] of Object.entries(ID_PARAM_TO_ENTITY)) {
    const id = lookup.get(idKey)
    if (id) {
      return { path: `/${ENTITY_ROUTE[entity]}/${id}`, search: '' }
    }
  }

  // 2. entity + id pair.
  const entityRaw = lookup.get('entity') ?? lookup.get('table')
  const entity = entityRaw ? ENTITY_ALIASES[entityRaw.toLowerCase()] : undefined
  const recordId = lookup.get('id') ?? lookup.get('recordid')
  if (entity && recordId) {
    return { path: `/${ENTITY_ROUTE[entity]}/${recordId}`, search: '' }
  }
  // entity without id -> the entity's list view, with any filters applied.
  if (entity) {
    return { path: `/${ENTITY_ROUTE[entity]}`, search: filterSearch }
  }

  // 3. Named view.
  const view = lookup.get('view') ?? lookup.get('page') ?? lookup.get('screen')
  if (view) {
    const route = VIEW_ROUTES[view.toLowerCase()]
    if (route) {
      return { path: route, search: filterSearch }
    }
  }

  // 4. Filters only -> default to the orders list with those filters applied.
  if (filterSearch) {
    return { path: '/orders', search: filterSearch }
  }

  return null
}
