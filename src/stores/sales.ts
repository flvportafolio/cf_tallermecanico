import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogItem, PaymentKind, PaymentMethod, SaleCurrency, SaleItem } from '../types'
import { branches, makePayment, paymentLabel, round2, saleMoney, salePaid, saleTotal, saleTc, seller } from '../types'
import { useWorkshop } from './workshop'

/* Catálogo de demostración: no controla stock ni descuenta unidades. */
const catalog: CatalogItem[] = [
  { id: 'svc-aceite', kind: 'service', name: 'Cambio de aceite y filtro', price: 220 },
  { id: 'svc-frenos', kind: 'service', name: 'Revisión de frenos', price: 180 },
  { id: 'svc-alineacion', kind: 'service', name: 'Alineación y balanceo', price: 150 },
  { id: 'svc-diagnostico', kind: 'service', name: 'Diagnóstico computarizado', price: 120 },
  { id: 'svc-mantenimiento', kind: 'service', name: 'Mantenimiento de 40.000 km', price: 480 },
  { id: 'prod-filtro-aceite', kind: 'product', name: 'Filtro de aceite', price: 70 },
  { id: 'prod-filtro-aire', kind: 'product', name: 'Filtro de aire', price: 55 },
  { id: 'prod-pastillas', kind: 'product', name: 'Pastillas de freno (juego)', price: 380 },
  { id: 'prod-aceite', kind: 'product', name: 'Aceite sintético 5W-30', price: 280 },
  { id: 'prod-bateria', kind: 'product', name: 'Batería 12V 70Ah', price: 620 },
]
const today = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/* Venta en curso, en memoria: al registrar se resetea y no persiste nada. */
export const useSales = defineStore('sales', () => {
  const workshop = useWorkshop()
  const nextNumber = ref(1)
  const customerId = ref('')
  const date = ref(today())
  const currency = ref<SaleCurrency>('Bs')
  const branch = ref(branches[0])
  const note = ref('')
  const items = ref<SaleItem[]>([])
  const payments = ref<PaymentMethod[]>([makePayment('cash')])

  const number = computed(() => `VTA-${String(nextNumber.value).padStart(4, '0')}`)
  const tc = computed(() => saleTc[currency.value])
  const total = computed(() => round2(saleTotal(items.value)))
  const paid = computed(() => round2(salePaid(payments.value)))
  const checks = computed(() => {
    const issues: string[] = []
    if (!customerId.value) issues.push('Elige un cliente.')
    if (!items.value.length) issues.push('Agrega al menos un producto o servicio.')
    if (items.value.some((item) => !(Number(item.quantity) >= 1)))
      issues.push('Cada cantidad debe ser mayor o igual a 1.')
    if (items.value.some((item) => !(Number(item.price) > 0)))
      issues.push('Cada precio unitario debe ser mayor a cero.')
    if (payments.value.some((payment) => !(Number(payment.amount) > 0)))
      issues.push('Cada forma de pago necesita un monto mayor a cero.')
    if (round2(paid.value) !== round2(total.value))
      issues.push(
        `La suma de los pagos (${saleMoney(paid.value, currency.value)}) debe ser igual al total (${saleMoney(
          total.value,
          currency.value,
        )}).`,
      )
    return issues
  })
  const canRegister = computed(() => checks.value.length === 0)
  const kindOf = (catalogId: string): 'Servicio' | 'Producto' =>
    catalog.find((item) => item.id === catalogId)?.kind === 'service' ? 'Servicio' : 'Producto'

  function addItem(catalogItemId: string) {
    const found = catalog.find((item) => item.id === catalogItemId)
    if (!found) return
    items.value.push({ catalogId: found.id, name: found.name, quantity: 1, price: found.price })
  }
  function removeItem(index: number) {
    items.value.splice(index, 1)
  }
  function addPayment(kind: PaymentKind = 'cash') {
    if (payments.value.length >= 2) return
    payments.value.push(makePayment(kind))
  }
  function removePayment(index: number) {
    payments.value.splice(index, 1)
  }
  /* El método se cambia en el store para que id y label queden sincronizados. */
  function setPaymentKind(index: number, kind: PaymentKind) {
    const payment = payments.value[index]
    if (!payment) return
    payment.id = kind
    payment.label = paymentLabel(kind)
  }
  function reset() {
    customerId.value = ''
    date.value = today()
    currency.value = 'Bs'
    branch.value = branches[0]
    note.value = ''
    items.value = []
    payments.value = [makePayment('cash')]
  }
  function registerSale(): boolean {
    if (!canRegister.value) return false
    /* La venta no se guarda: la pantalla se resetea y el correlativo avanza. */
    nextNumber.value += 1
    reset()
    workshop.notify('Venta registrada.')
    return true
  }

  return {
    catalog,
    branches,
    seller,
    customerId,
    date,
    currency,
    branch,
    note,
    items,
    payments,
    number,
    tc,
    total,
    paid,
    checks,
    canRegister,
    kindOf,
    addItem,
    removeItem,
    addPayment,
    removePayment,
    setPaymentKind,
    registerSale,
  }
})
