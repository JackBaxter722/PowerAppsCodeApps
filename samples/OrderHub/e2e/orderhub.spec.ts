import { expect, test } from '@playwright/test'

test('loads the dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'OrderHub' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('navigates to Orders and shows its toolbar', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation').getByText('Orders', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'New order' }),
  ).toBeVisible()
})

test('deep links a named view via query params', async ({ page }) => {
  await page.goto('/?view=fulfillment')
  await expect(
    page.getByRole('heading', { name: 'Fulfillment board' }),
  ).toBeVisible()
})

test('deep links straight to an order record', async ({ page }) => {
  await page.goto('/?entity=order&id=ord-1')
  await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible()
  // Breadcrumb back to the orders list is present on the detail page.
  await expect(page.getByLabel('Breadcrumb')).toBeVisible()
})

test('global typeahead search finds an order', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Global search').fill('SO-1000')
  await page.getByRole('option', { name: /SO-1000/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible()
})
