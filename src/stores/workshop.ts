import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Activity, Customer, Mechanic, Order, Quote, QuoteItem, Status } from '../types'
import { statuses } from '../types'

const stamp = () => new Date().toISOString()
const uid = () => crypto.randomUUID()
const activity = (title: string, description: string): Activity => ({
  id: uid(),
  date: stamp(),
  title,
  description,
})
const mechanics: Mechanic[] = [
  { id: 'm1', name: 'Miguel Flores', initials: 'MF', color: 'sage', specialty: 'Motor y diagnóstico' },
  { id: 'm2', name: 'Carlos Rojas', initials: 'CR', color: 'sand', specialty: 'Frenos y suspensión' },
  { id: 'm3', name: 'José Mamani', initials: 'JM', color: 'blue', specialty: 'Electricidad automotriz' },
  { id: 'm4', name: 'Luis Vargas', initials: 'LV', color: 'rose', specialty: 'Mantenimiento general' },
]
const seedCustomers: Customer[] = [
  { id: 'c1', name: 'Andrea Mendoza', phone: '70123456' },
  { id: 'c2', name: 'Roberto Salinas', phone: '71234567' },
  { id: 'c3', name: 'Lucía Fernández', phone: '72345678' },
  { id: 'c4', name: 'Diego Vargas', phone: '73456789' },
  { id: 'c5', name: 'María Quispe', phone: '74567890' },
  { id: 'c6', name: 'Fernando López', phone: '75678901' },
]
function initialData() {
  const now = stamp()
  const seeds: [string, string, string, string, string, Status, string, string][] = [
    [
      '1048',
      'c1',
      'Toyota Corolla',
      '4825 KLP',
      'm1',
      'repair',
      'Cambio de aceite y revisión de frenos',
      '#b9c8b8',
    ],
    ['1047', 'c2', 'Suzuki Swift', '3912 FXT', 'm2', 'waiting', 'Ruido en frenos delanteros', '#d9b1a0'],
    ['1046', 'c3', 'Kia Sportage', '5278 BNR', 'm3', 'diagnosis', 'Testigo de motor encendido', '#b6c6d2'],
    ['1045', 'c4', 'Nissan Kicks', '6142 HDS', 'm4', 'ready', 'Mantenimiento de 40.000 km', '#d6ceb7'],
    [
      '1044',
      'c5',
      'Hyundai Tucson',
      '2381 JRT',
      'm1',
      'waiting',
      'Revisión de suspensión y amortiguadores',
      '#bac5cc',
    ],
    [
      '1043',
      'c6',
      'Toyota Hilux',
      '3509 PXA',
      'm4',
      'repair',
      'Servicio preventivo y cambio de filtros',
      '#c3bba7',
    ],
    ['1042', 'c2', 'Suzuki Vitara', '1938 ABC', 'm2', 'delivered', 'Alineación y balanceo', '#c7ccbd'],
  ]
  const orders: Order[] = seeds.map(([id, customerId, vehicle, plate, mechanicId, status, issue, color]) => ({
    id: `OT-${id}`,
    token: `demo-${id}`,
    customerId,
    vehicle,
    plate,
    mechanicId,
    status,
    issue,
    color,
    year: '2021',
    createdAt: now,
    expectedAt: '',
    activities: [
      { id: uid(), date: now, title: 'Vehículo recibido', description: issue },
      ...(status !== 'received'
        ? [
            {
              id: uid(),
              date: now,
              title: statuses[status].label,
              description: 'El equipo actualizó el estado de tu vehículo.',
            },
          ]
        : []),
    ],
  }))
  const quotes: Quote[] = [
    {
      id: 'COT-024',
      orderId: 'OT-1047',
      title: 'Cambio de pastillas de freno',
      status: 'pending',
      createdAt: now,
      items: [
        { description: 'Juego de pastillas delanteras', quantity: 1, price: 380 },
        { description: 'Mano de obra e inspección', quantity: 1, price: 120 },
      ],
    },
    {
      id: 'COT-023',
      orderId: 'OT-1044',
      title: 'Reemplazo de amortiguadores',
      status: 'pending',
      createdAt: now,
      items: [
        { description: 'Amortiguadores delanteros', quantity: 2, price: 420 },
        { description: 'Instalación y alineación', quantity: 1, price: 180 },
      ],
    },
    {
      id: 'COT-022',
      orderId: 'OT-1048',
      title: 'Mantenimiento preventivo',
      status: 'approved',
      createdAt: now,
      decidedAt: now,
      signer: 'Andrea Mendoza',
      items: [{ description: 'Aceite, filtro y mano de obra', quantity: 1, price: 350 }],
    },
  ]
  return { customers: seedCustomers, orders, quotes }
}
const storageKey = 'don-ramiro-workshop-v1'
function restore() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const data = JSON.parse(raw)
      if (
        Array.isArray(data.customers) &&
        Array.isArray(data.orders) &&
        Array.isArray(data.quotes) &&
        data.orders.every((o: Order) => o.id && o.status in statuses && Array.isArray(o.activities))
      )
        return data as ReturnType<typeof initialData>
    }
  } catch {
    /* A fresh demo remains usable when browser storage is unavailable. */
  }
  return initialData()
}
export const useWorkshop = defineStore('workshop', () => {
  const data = restore()
  const customers = ref<Customer[]>(data.customers)
  const orders = ref<Order[]>(data.orders)
  const quotes = ref<Quote[]>(data.quotes)
  const toast = ref('')
  const storageError = ref(false)
  let toastTimer: ReturnType<typeof setTimeout>
  const activeOrders = computed(() => orders.value.filter((o) => o.status !== 'delivered'))
  const pendingQuotes = computed(() => quotes.value.filter((q) => q.status === 'pending'))
  watch(
    [customers, orders, quotes],
    () => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ customers: customers.value, orders: orders.value, quotes: quotes.value }),
        )
        storageError.value = false
      } catch {
        storageError.value = true
      }
    },
    { deep: true },
  )
  function notify(message: string) {
    toast.value = message
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.value = ''
    }, 4500)
  }
  const customer = (id: string) => customers.value.find((c) => c.id === id)!
  const mechanic = (id: string) => mechanics.find((m) => m.id === id)!
  const total = (q: Quote) => q.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  function createOrder(input: {
    name: string
    phone: string
    vehicle: string
    plate: string
    year: string
    issue: string
    mechanicId: string
    expectedAt: string
  }) {
    let client = customers.value.find(
      (c) => c.phone === input.phone.trim() && c.name.toLowerCase() === input.name.trim().toLowerCase(),
    )
    if (!client) {
      client = { id: uid(), name: input.name.trim(), phone: input.phone.trim() }
      customers.value.push(client)
    }
    const id = `OT-${Math.max(1048, ...orders.value.map((o) => Number(o.id.split('-')[1]))) + 1}`
    const order: Order = {
      id,
      token: uid(),
      customerId: client.id,
      vehicle: input.vehicle.trim(),
      plate: input.plate.trim().toUpperCase(),
      year: input.year,
      issue: input.issue.trim(),
      mechanicId: input.mechanicId,
      expectedAt: input.expectedAt,
      color: '#bbc8b9',
      createdAt: stamp(),
      status: 'received',
      activities: [activity('Vehículo recibido', input.issue.trim())],
    }
    orders.value.unshift(order)
    notify('Orden creada.')
    return order
  }
  function changeStatus(order: Order, status: Status) {
    if (status === order.status) return
    if (
      quotes.value.some((q) => q.orderId === order.id && q.status === 'pending') &&
      ['repair', 'ready', 'delivered'].includes(status)
    ) {
      notify('La cotización debe resolverse antes de continuar.')
      return
    }
    order.status = status
    order.activities.push(
      activity(statuses[status].label, `Actualizado por ${mechanic(order.mechanicId).name}.`),
    )
    notify('Estado actualizado.')
  }
  function addNote(order: Order, note: string) {
    if (!note.trim()) return
    order.activities.push(activity('Novedad del taller', note.trim()))
    notify('Novedad publicada.')
  }
  function createQuote(order: Order, title: string, items: QuoteItem[]) {
    if (
      !items.length ||
      items.some(
        (i) =>
          !i.description.trim() ||
          !Number.isFinite(i.quantity) ||
          i.quantity < 1 ||
          !Number.isFinite(i.price) ||
          i.price <= 0,
      )
    )
      return false
    const id = `COT-${String(Math.max(24, ...quotes.value.map((q) => Number(q.id.split('-')[1]))) + 1).padStart(3, '0')}`
    quotes.value.unshift({
      id,
      orderId: order.id,
      title: title.trim(),
      items: items.map((i) => ({ ...i, description: i.description.trim() })),
      status: 'pending',
      createdAt: stamp(),
    })
    order.status = 'waiting'
    order.activities.push(activity('Cotización pendiente de aprobación', title.trim()))
    notify('Cotización disponible en el portal del cliente.')
    return true
  }
  function decideQuote(quote: Quote, decision: 'approved' | 'rejected', signer: string, reason = '') {
    if (quote.status !== 'pending' || !signer.trim()) return
    quote.status = decision
    quote.signer = signer.trim()
    quote.decidedAt = stamp()
    quote.reason = reason.trim()
    const order = orders.value.find((o) => o.id === quote.orderId)!
    order.activities.push(
      activity(
        decision === 'approved' ? 'Cotización aprobada' : 'Cotización rechazada',
        `${quote.id} · ${quote.signer}${reason.trim() ? ` · ${reason.trim()}` : ''}`,
      ),
    )
    if (!quotes.value.some((q) => q.orderId === order.id && q.status === 'pending'))
      order.status = quotes.value.some((q) => q.orderId === order.id && q.status === 'rejected')
        ? 'diagnosis'
        : 'repair'
    notify(decision === 'approved' ? 'Aprobación registrada.' : 'Rechazo registrado.')
  }
  return {
    customers,
    orders,
    quotes,
    mechanics,
    activeOrders,
    pendingQuotes,
    toast,
    storageError,
    customer,
    mechanic,
    total,
    notify,
    createOrder,
    changeStatus,
    addNote,
    createQuote,
    decideQuote,
  }
})
