// Minimal client-side CSV export. Triggers a browser download of the given rows.

function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportCsv<T extends object>(
  filename: string,
  rows: T[],
  columns?: { key: keyof T; header: string }[],
): void {
  if (rows.length === 0) return

  const cols =
    columns ??
    (Object.keys(rows[0]) as (keyof T)[]).map((key) => ({
      key,
      header: String(key),
    }))

  const header = cols.map((c) => escapeCell(c.header)).join(',')
  const body = rows
    .map((row) => cols.map((c) => escapeCell(row[c.key])).join(','))
    .join('\n')
  const csv = `${header}\n${body}`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
