import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test, expect, type Page } from '@playwright/test'

/* Precios del catálogo hardcodeado en src/stores/sales.ts. */
const precios = { aceite: 220, filtroAceite: 70 }
const bob = (value: number) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 2 }).format(value)

function salesBlocks() {
  const style = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')
  const responsive = readFileSync(resolve(process.cwd(), 'src/responsive.css'), 'utf8')
  const grab = (css: string) => {
    const block = css.match(/\/\* Ventas[^\n]*\*\/([\s\S]*?)\/\* Fin ventas \*\//)
    if (!block) throw new Error('No se encontró la sección de estilos de ventas')
    return block[1]
  }
  return { base: grab(style), responsive: grab(responsive) }
}

function monto(page: Page, index: number) {
  return page.locator('.payment-row').nth(index - 1).locator('input[type="number"]')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/ventas/nueva')
})

test('CA-V1: cabecera completa; TC y vendedor bloqueados con valores derivados de la moneda', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Nueva venta.' })).toBeVisible()
  const cliente = page.getByLabel('Cliente', { exact: true })
  await expect(cliente).toHaveValue('')
  await cliente.selectOption('Andrea Mendoza')
  await expect(cliente).toHaveValue('c1')
  await expect(page.getByLabel('Fecha')).not.toHaveValue('')
  await page.getByLabel('Sucursal').selectOption('Norte')
  await page.getByLabel('Moneda').selectOption('Bs')
  await expect(page.getByLabel('TC tipo de cambio')).toHaveValue('1.00')
  await page.getByLabel('Moneda').selectOption('USD')
  await expect(page.getByLabel('TC tipo de cambio')).toHaveValue('6.96')
  await expect(page.getByLabel('TC tipo de cambio')).not.toBeEditable()
  await expect(page.getByLabel('Vendedor')).toHaveValue('Ramiro')
  await expect(page.getByLabel('Vendedor')).not.toBeEditable()
})

test('CA-V2: la tabla muestra nro/ítem/cant/precio/subtotal y el total recalcula en vivo', async ({ page }, testInfo) => {
  await page.getByLabel('Agregar producto o servicio').selectOption({ label: 'Cambio de aceite y filtro' })
  await page.getByLabel('Agregar producto o servicio').selectOption({ label: 'Filtro de aceite' })
  const filas = page.locator('.sale-table tbody tr')
  await expect(filas).toHaveCount(2)
  if (testInfo.project.name === 'mobile') {
    /* En pantallas pequeñas las cabeceras pasan a etiquetas por celda. */
    for (const header of ['Nro.', 'Ítem', 'Cant.', 'Precio unit.', 'Subtotal']) {
      await expect(page.locator(`.sale-table tbody td[data-label="${header}"]`).first()).toHaveAttribute(
        'data-label',
        header,
      )
    }
  } else {
    for (const header of ['Nro.', 'Ítem', 'Cant.', 'Precio unit.', 'Subtotal']) {
      await expect(page.locator('.sale-table thead').getByText(header, { exact: true })).toBeVisible()
    }
  }
  await expect(page.getByTestId('sale-total')).toHaveText(bob(precios.aceite + precios.filtroAceite))
  await page.getByLabel('Cantidad 1').fill('2')
  await expect(page.locator('.sale-table tbody td.col-sub').first()).toHaveText(bob(precios.aceite * 2))
  await expect(page.getByTestId('sale-total')).toHaveText(bob(precios.aceite * 2 + precios.filtroAceite))
  await page.getByLabel('Precio unitario 2').fill('100')
  await expect(page.getByTestId('sale-total')).toHaveText(bob(precios.aceite * 2 + 100))
  await page.getByLabel('Quitar ítem 1').click()
  await expect(filas).toHaveCount(1)
  await expect(page.getByTestId('sale-total')).toHaveText(bob(100))
  /* En pantallas pequeñas la tabla sigue sin scroll horizontal. */
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('CA-V3: glosa escribible, correlativo bloqueado y catálogo agrega filas con estado vacío', async ({ page }) => {
  await expect(page.getByText('Agrega productos o servicios', { exact: true })).toBeVisible()
  await expect(page.getByLabel('N.° de venta')).toHaveValue('VTA-0001')
  await expect(page.getByLabel('N.° de venta')).not.toBeEditable()
  await page.getByLabel('Glosa').fill('Cobro del servicio de mantenimiento; ref. trabajo OT-1048.')
  await expect(page.getByLabel('Glosa')).toHaveValue('Cobro del servicio de mantenimiento; ref. trabajo OT-1048.')
  await page.getByLabel('Agregar producto o servicio').selectOption({ label: 'Filtro de aire' })
  await expect(page.locator('.sale-table tbody tr')).toHaveCount(1)
  await expect(page.locator('.sale-table tbody .col-item strong').first()).toHaveText('Filtro de aire')
})

test('CA-V4: hasta dos formas de pago, suma exacta obligatoria y confirmación', async ({ page }) => {
  const registrar = page.getByRole('button', { name: 'Registrar venta' })
  await expect(registrar).toBeDisabled()
  await page.getByLabel('Cliente', { exact: true }).selectOption('Andrea Mendoza')
  await page.getByLabel('Agregar producto o servicio').selectOption({ label: 'Cambio de aceite y filtro' })
  await page.getByLabel('Agregar producto o servicio').selectOption({ label: 'Filtro de aceite' })
  /* Sin montos el botón sigue bloqueado y la validación es visible. */
  await expect(registrar).toBeDisabled()
  await expect(page.locator('.sale-checks')).toContainText('Cada forma de pago necesita un monto mayor a cero.')
  await monto(page, 1).fill(String(precios.aceite))
  await expect(page.locator('.sale-checks')).toContainText(
    `La suma de los pagos (${bob(precios.aceite)}) debe ser igual al total (${bob(
      precios.aceite + precios.filtroAceite,
    )}).`,
  )
  await expect(registrar).toBeDisabled()
  /* Segunda forma de pago: QR con su referencia de demostración. */
  await page.getByRole('button', { name: 'Otra forma de pago' }).click()
  await page.getByRole('group', { name: 'Método de pago 2' }).getByRole('button', { name: 'Pago por QR' }).click()
  await expect(page.getByText('QR de demostración · ref. 1234 5678 9012')).toBeVisible()
  /* No se permite un tercer método: el botón desaparece y se avisa el máximo. */
  await expect(page.getByRole('button', { name: 'Otra forma de pago' })).toHaveCount(0)
  await expect(page.getByText('Máximo dos formas de pago.', { exact: true })).toBeVisible()
  await expect(page.locator('.payment-row')).toHaveCount(2)
  /* Suma exacta habilita el registro. */
  await monto(page, 2).fill(String(precios.filtroAceite - 1))
  await expect(registrar).toBeDisabled()
  await monto(page, 2).fill(String(precios.filtroAceite))
  await expect(page.locator('.sale-checks')).toContainText('La suma de los pagos cuadra con el total.')
  await expect(registrar).toBeEnabled()
  await registrar.click()
  await expect(page.getByText('Venta registrada.', { exact: true })).toBeVisible()
  /* El formulario se resetea y el correlativo avanza. */
  await expect(page.getByLabel('Cliente', { exact: true })).toHaveValue('')
  await expect(page.getByText('Agrega productos o servicios', { exact: true })).toBeVisible()
  await expect(page.getByTestId('sale-total')).toHaveText(bob(0))
  await expect(page.getByLabel('N.° de venta')).toHaveValue('VTA-0002')
  await expect(page.locator('.sale-checks')).toContainText('Elige un cliente.')
})

test('CA-V5: usable en celular, acciones amplias y estilo de marca sin colores sueltos', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile') {
    await page.goto('/')
    await page.getByRole('button', { name: 'Abrir navegación' }).click()
    await page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: 'Ventas', exact: true })
      .click()
    await expect(page).toHaveURL(/ventas\/nueva/)
  }
  await expect(page.getByRole('heading', { name: 'Nueva venta.' })).toBeVisible()
  await page.getByLabel('Cliente', { exact: true }).selectOption('Roberto Salinas')
  await page.getByLabel('Agregar producto o servicio').selectOption({ label: 'Cambio de aceite y filtro' })
  await monto(page, 1).fill(String(precios.aceite))
  /* Sin scroll horizontal en ningún punto de la pantalla. */
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  /* El total y la acción de cobro se ven al final del flujo sin más scroll. */
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.getByTestId('sale-total')).toBeInViewport()
  await expect(page.locator('.sale-submit')).toBeVisible()
  /* Medidas mínimas de las acciones de cobro (≥ 49 px). */
  for (const locator of [page.getByRole('button', { name: 'Efectivo' }), page.locator('.sale-submit')]) {
    const box = await locator.first().boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(49)
  }
  /* La UI de ventas solo usa tokens (sin hex sueltos) en sus estilos. */
  const blocks = salesBlocks()
  for (const block of [blocks.base, blocks.responsive]) {
    expect(block).toMatch(/var\(--/)
    expect(block.trim()).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  }
  expect(blocks.base).toMatch(/\.payment-methods button \{[\s\S]*?min-height: 49px/)
})
