<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useSales } from '../stores/sales'
import { useWorkshop } from '../stores/workshop'
import type { PaymentMethod, SaleItem } from '../types'
import { paymentOptions, round2, saleMoney } from '../types'

const sales = useSales(),
  workshop = useWorkshop(),
  picked = ref('')
const money = (value: number) => saleMoney(value, sales.currency)
/* Indicador del encabezado: «1 ítem» vs «2 ítems». */
const itemsLabel = computed(() => (sales.items.length === 1 ? 'ítem' : 'ítems'))
function pickItem(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  if (!id) return
  sales.addItem(id)
  picked.value = ''
}
function setQuantity(item: SaleItem, event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  item.quantity = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1
}
function setPrice(item: SaleItem, event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  item.price = Number.isFinite(raw) && raw > 0 ? raw : 0
}
function setAmount(payment: PaymentMethod, event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  payment.amount = Number.isFinite(raw) && raw >= 0 ? round2(raw) : 0
}
/* Al confirmar el campo (blur/Enter) el valor visible se reconcilia con el estado:
   corrige el repintado cuando el estado ya tenía ese mismo valor (p. ej. «0» → 1). */
function commitInput(event: Event, value: string) {
  ;(event.target as HTMLInputElement).value = value
}
function register() {
  sales.registerSale()
}
</script>
<template>
  <div class="page-heading">
    <div>
      <!-- prettier-ignore -->
      <h1>Nueva venta<span class="heading-dot">.</span></h1>
    </div>
    <span class="date-pill">
      <AppIcon name="sales" :size="18" />
      {{ sales.items.length }} {{ itemsLabel }}
    </span>
  </div>
  <div class="sales-layout">
    <form id="sale-form" class="sale-main" @submit.prevent="register">
      <section class="surface sale-card">
        <h2>Cabecera</h2>
        <div class="sale-header-grid">
          <label>
            Cliente
            <select v-model="sales.customerId" required aria-label="Cliente">
              <option value="" disabled>Elegir cliente</option>
              <option v-for="c in workshop.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </label>
          <label>
            N.° de venta
            <input :value="sales.number" readonly aria-label="N.° de venta" />
          </label>
          <label>
            Fecha
            <input v-model="sales.date" type="date" required />
          </label>
          <label>
            Moneda
            <select v-model="sales.currency" aria-label="Moneda">
              <option value="Bs">Bs</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label>
            TC (tipo de cambio)
            <input :value="sales.tc.toFixed(2)" readonly aria-label="TC tipo de cambio" />
          </label>
          <label>
            Sucursal
            <select v-model="sales.branch" aria-label="Sucursal">
              <option v-for="b in sales.branches" :key="b" :value="b">{{ b }}</option>
            </select>
          </label>
          <label>
            Vendedor
            <input :value="sales.seller" readonly aria-label="Vendedor" />
          </label>
        </div>
      </section>
      <section class="surface sale-card">
        <h2>Ítems</h2>
        <label class="sale-picker">
          Agregar producto o servicio
          <select :value="picked" aria-label="Agregar producto o servicio" @change="pickItem">
            <option value="" disabled>Elegir del catálogo…</option>
            <optgroup label="Servicios">
              <option v-for="item in sales.catalog.filter((c) => c.kind === 'service')" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </optgroup>
            <optgroup label="Productos">
              <option v-for="item in sales.catalog.filter((c) => c.kind === 'product')" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </optgroup>
          </select>
        </label>
        <table v-if="sales.items.length" class="sale-table">
          <thead>
            <tr>
              <th scope="col" class="col-nro">Nro.</th>
              <th scope="col" class="col-item">Ítem</th>
              <th scope="col" class="col-qty">Cant.</th>
              <th scope="col" class="col-price">Precio unit.</th>
              <th scope="col" class="col-sub">Subtotal</th>
              <th scope="col" class="col-remove"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in sales.items" :key="index">
              <td data-label="Nro." class="col-nro">{{ index + 1 }}</td>
              <td data-label="Ítem" class="col-item">
                <strong>{{ item.name }}</strong>
                <span class="badge neutral">{{ sales.kindOf(item.catalogId) }}</span>
              </td>
              <td data-label="Cant." class="col-qty">
                <input
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  inputmode="numeric"
                  :value="item.quantity"
                  :aria-label="`Cantidad ${index + 1}`"
                  @input="setQuantity(item, $event)"
                  @change="commitInput($event, String(item.quantity))"
                />
              </td>
              <td data-label="Precio unit." class="col-price">
                <input
                  type="number"
                  min="0.01"
                  max="999999"
                  step="0.01"
                  inputmode="decimal"
                  :value="item.price"
                  :aria-label="`Precio unitario ${index + 1}`"
                  @input="setPrice(item, $event)"
                  @change="commitInput($event, String(item.price))"
                />
              </td>
              <td data-label="Subtotal" class="col-sub">{{ money(item.quantity * item.price) }}</td>
              <td class="col-remove">
                <button
                  class="icon-btn"
                  type="button"
                  :aria-label="`Quitar ítem ${index + 1}`"
                  @click="sales.removeItem(index)"
                >
                  <AppIcon name="trash" :size="17" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-inline">
          <AppIcon name="plus" :size="16" />
          Agrega productos o servicios
        </p>
        <div v-if="sales.items.length" class="quote-total">
          <span>Total de ítems</span>
          <strong data-testid="sale-items-total">{{ money(sales.total) }}</strong>
        </div>
      </section>
      <section class="surface sale-card">
        <label class="sale-glosa">
          Glosa
          <textarea
            v-model="sales.note"
            rows="3"
            maxlength="400"
            placeholder="Detalle del cobro, referencia del trabajo, notas…"
          ></textarea>
        </label>
      </section>
    </form>
    <aside class="sale-payment surface">
      <h2>Cobro</h2>
      <div class="sale-total-box">
        <p class="sale-total-label">Total</p>
        <p class="sale-total-value" data-testid="sale-total">{{ money(sales.total) }}</p>
        <!-- prettier-ignore -->
        <p class="sale-total-coin">Moneda {{ sales.currency }} · TC {{ sales.tc.toFixed(2) }}</p>
      </div>
      <div v-for="(payment, index) in sales.payments" :key="index" class="payment-row" :class="{ 'payment-qr-row': payment.id === 'qr' }">
        <div class="payment-methods" role="group" :aria-label="`Método de pago ${index + 1}`">
          <button
            v-for="option in paymentOptions"
            :key="option.id"
            type="button"
            :class="{ selected: payment.id === option.id }"
            :aria-pressed="payment.id === option.id"
            @click="sales.setPaymentKind(index, option.id)"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="payment-row-line">
          <label>
            Monto
            <input
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              :value="payment.amount || ''"
              :aria-label="`Monto ${index + 1}`"
              @input="setAmount(payment, $event)"
              @change="commitInput($event, String(payment.amount || ''))"
            />
          </label>
          <button
            class="icon-btn"
            type="button"
            :aria-label="`Quitar forma de pago ${index + 1}`"
            @click="sales.removePayment(index)"
          >
            <AppIcon name="trash" :size="17" />
          </button>
        </div>
        <p v-if="payment.id === 'qr'" class="payment-qr-demo">
          <AppIcon name="link" :size="15" />
          QR de demostración · ref. 1234 5678 9012
        </p>
      </div>
      <button v-if="sales.payments.length < 2" class="text-link sale-add-payment" type="button" @click="sales.addPayment()">
        <AppIcon name="plus" :size="17" />
        Otra forma de pago
      </button>
      <p v-else class="muted payment-max">Máximo dos formas de pago.</p>
      <hr />
      <ul class="sale-checks" aria-live="polite">
        <li v-for="issue in sales.checks" :key="issue">
          <AppIcon name="alert" :size="16" />
          {{ issue }}
        </li>
        <li v-if="!sales.checks.length" class="ok">
          <AppIcon name="success" :size="16" />
          La suma de los pagos cuadra con el total.
        </li>
      </ul>
      <button
        class="btn primary full-width sale-submit"
        type="submit"
        form="sale-form"
        :disabled="!sales.canRegister"
      >
        <AppIcon name="check" :size="18" />
        Registrar venta
      </button>
    </aside>
  </div>
</template>
