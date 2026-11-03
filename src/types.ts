export type Status = 'received' | 'diagnosis' | 'waiting' | 'repair' | 'ready' | 'delivered'
export interface Customer {
  id: string
  name: string
  phone: string
}
export interface Mechanic {
  id: string
  name: string
  initials: string
  color: string
  specialty: string
}
export interface Activity {
  id: string
  date: string
  title: string
  description: string
}
export interface Order {
  id: string
  token: string
  customerId: string
  vehicle: string
  plate: string
  year: string
  color: string
  issue: string
  mechanicId: string
  status: Status
  createdAt: string
  expectedAt: string
  activities: Activity[]
}
export interface QuoteItem {
  description: string
  quantity: number
  price: number
}
export interface Quote {
  id: string
  orderId: string
  title: string
  items: QuoteItem[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  decidedAt?: string
  signer?: string
  reason?: string
}
export const statuses: Record<Status, { label: string; short: string; tone: string; progress: number }> = {
  received: { label: 'Recibido', short: 'Recepción', tone: 'neutral', progress: 10 },
  diagnosis: { label: 'En diagnóstico', short: 'Diagnóstico', tone: 'blue', progress: 25 },
  waiting: { label: 'Por aprobar', short: 'Aprobación', tone: 'amber', progress: 40 },
  repair: { label: 'En reparación', short: 'Reparación', tone: 'green', progress: 65 },
  ready: { label: 'Listo para entregar', short: 'Listo', tone: 'mint', progress: 100 },
  delivered: { label: 'Entregado', short: 'Entregado', tone: 'neutral', progress: 100 },
}
export const money = (value: number) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 2 }).format(
    value,
  )
export const dateTime = (date: string) =>
  new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/La_Paz',
  }).format(new Date(date))

export type SaleCurrency = 'Bs' | 'USD'
export type PaymentKind = 'cash' | 'qr' | 'debit' | 'gift'
export interface CatalogItem {
  id: string
  name: string
  price: number
  kind: 'service' | 'product'
}
export interface SaleItem {
  catalogId: string
  name: string
  quantity: number
  price: number
}
export interface PaymentMethod {
  id: PaymentKind
  label: string
  amount: number
}
export interface Sale {
  number: string
  customerId: string
  date: string
  currency: SaleCurrency
  tc: number
  branch: string
  seller: string
  note: string
  items: SaleItem[]
  payments: PaymentMethod[]
  total: number
}
export const paymentOptions: { id: PaymentKind; label: string }[] = [
  { id: 'cash', label: 'Efectivo' },
  { id: 'qr', label: 'Pago por QR' },
  { id: 'debit', label: 'Tarjeta de débito' },
  { id: 'gift', label: 'Gift card' },
]
export const paymentLabel = (kind: PaymentKind) => paymentOptions.find((option) => option.id === kind)!.label
export const makePayment = (kind: PaymentKind): PaymentMethod => ({ id: kind, label: paymentLabel(kind), amount: 0 })
export const saleTc: Record<SaleCurrency, number> = { Bs: 1.0, USD: 6.96 }
export const branches: string[] = ['Central', 'Norte']
export const seller = 'Ramiro'
export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export const saleTotal = (items: SaleItem[]) =>
  items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0)
export const salePaid = (payments: PaymentMethod[]) =>
  payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
export const saleMoney = (value: number, saleCurrency: SaleCurrency) =>
  new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: saleCurrency === 'Bs' ? 'BOB' : 'USD',
    maximumFractionDigits: 2,
  }).format(value)
