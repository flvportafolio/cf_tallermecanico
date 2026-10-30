<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkshop } from '../stores/workshop'
import { dateTime, statuses } from '../types'
import type { Status } from '../types'
import AppIcon from '../components/AppIcon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import CarIllustration from '../components/CarIllustration.vue'
import QuoteForm from '../components/QuoteForm.vue'
import QuoteSummary from '../components/QuoteSummary.vue'
import AppModal from '../components/AppModal.vue'
import NotFoundView from './NotFoundView.vue'
const route = useRoute(),
  store = useWorkshop()
const order = computed(() => store.orders.find((o) => o.id === route.params.id))
const quotes = computed(() => store.quotes.filter((q) => q.orderId === order.value?.id))
const quoteForm = ref(false),
  share = ref(false),
  note = ref('')
const trackingLink = computed(
  () => `${location.origin}${location.pathname}#/seguimiento/${order.value?.token}`,
)
const nextStatus = computed<Status | undefined>(
  () =>
    (
      ({ received: 'diagnosis', diagnosis: 'repair', repair: 'ready', ready: 'delivered' }) as Partial<
        Record<Status, Status>
      >
    )[order.value?.status || 'received'],
)
const actionLabel = computed(
  () =>
    ({
      diagnosis: 'Iniciar diagnóstico',
      repair: 'Comenzar reparación',
      ready: 'Marcar como listo',
      delivered: 'Confirmar entrega',
    })[nextStatus.value as 'diagnosis' | 'repair' | 'ready' | 'delivered'],
)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(trackingLink.value)
    store.notify('Enlace de seguimiento copiado.')
  } catch {
    store.notify('Selecciona el enlace y cópialo para compartirlo.')
  }
}
function publishNote() {
  if (order.value && note.value.trim()) {
    store.addNote(order.value, note.value)
    note.value = ''
  }
}
</script>
<template>
  <template v-if="order">
    <RouterLink to="/ordenes" class="back-link">
      <AppIcon name="back" :size="17" />
      Volver a las órdenes
    </RouterLink>
    <div class="page-heading detail-heading">
      <div>
        <span class="eyebrow">ORDEN {{ order.id }}</span>
        <!-- prettier-ignore -->
        <h1>{{ order.vehicle }}<span class="heading-dot">.</span></h1>
        <p>
          {{ order.plate }}
          <span class="footer-dot">·</span>
          {{ store.customer(order.customerId).name }}
        </p>
      </div>
      <button class="btn secondary" @click="share = true">
        <AppIcon name="link" :size="18" />
        Compartir seguimiento
      </button>
    </div>
    <div class="detail-grid">
      <div class="detail-main">
        <section class="surface detail-section">
          <div class="section-title">
            <h2>Estado del vehículo</h2>
            <StatusBadge :status="order.status" />
          </div>
          <div class="status-steps">
            <div
              v-for="(s, key) in statuses"
              :key="key"
              :class="{ current: order.status === key, done: statuses[order.status].progress > s.progress }"
            >
              <span>
                <AppIcon v-if="statuses[order.status].progress > s.progress" name="check" :size="16" />
                <AppIcon
                  v-else
                  :name="
                    key === 'waiting'
                      ? 'clock'
                      : key === 'ready' || key === 'delivered'
                        ? 'checks'
                        : key === 'repair'
                          ? 'wrench'
                          : 'car'
                  "
                  :size="17"
                />
              </span>
              <small>{{ s.short }}</small>
            </div>
          </div>
          <div v-if="order.status === 'waiting'" class="notice">
            <AppIcon name="clock" />
            Reparación en pausa: el cliente debe resolver la cotización.
          </div>
          <div v-else-if="order.status === 'delivered'" class="success-notice">
            <AppIcon name="checks" />
            Vehículo entregado.
          </div>
          <button
            v-else-if="nextStatus"
            class="btn primary status-action"
            @click="store.changeStatus(order, nextStatus!)"
          >
            <AppIcon name="check" />
            {{ actionLabel }}
          </button>
        </section>
        <section class="surface detail-section">
          <div class="section-title">
            <div>
              <h2>Cotizaciones</h2>
            </div>
            <button
              v-if="!['delivered', 'ready'].includes(order.status)"
              class="btn secondary compact-btn"
              @click="quoteForm = true"
            >
              <AppIcon name="plus" :size="17" />
              Cotizar
            </button>
          </div>
          <QuoteSummary v-for="q in quotes" :key="q.id" :quote="q" detailed />
          <div v-if="!quotes.length" class="empty-inline">
            <AppIcon name="file" />
            <p>Sin cotizaciones adicionales.</p>
          </div>
        </section>
        <section class="surface detail-section">
          <div class="section-title">
            <div>
              <h2>Novedades</h2>
              <p>Visibles para el cliente.</p>
            </div>
          </div>
          <form v-if="order.status !== 'delivered'" class="note-form" @submit.prevent="publishNote">
            <label class="sr-only" for="order-note">Novedad para el cliente</label>
            <textarea
              id="order-note"
              v-model="note"
              required
              maxlength="500"
              rows="2"
              placeholder="Ej. Cambio de aceite completado."
            />
            <button class="btn primary" :disabled="!note.trim()">
              <AppIcon name="send" :size="17" />
              Publicar novedad
            </button>
          </form>
          <div class="timeline">
            <div v-for="entry in [...order.activities].reverse()" :key="entry.id" class="timeline-item">
              <span class="timeline-dot"></span>
              <div>
                <span class="timeline-date">{{ dateTime(entry.date) }}</span>
                <h3>{{ entry.title }}</h3>
                <p>{{ entry.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <aside class="detail-aside">
        <section class="surface vehicle-summary">
          <CarIllustration :color="order.color" />
          <h2>{{ order.vehicle }}</h2>
          <span class="plate">{{ order.plate }}</span>
          <dl>
            <div>
              <dt>Año</dt>
              <dd>{{ order.year }}</dd>
            </div>
            <div>
              <dt>Ingreso</dt>
              <dd>{{ dateTime(order.createdAt) }}</dd>
            </div>
            <div>
              <dt>Entrega estimada</dt>
              <dd>{{ order.expectedAt || 'Por confirmar' }}</dd>
            </div>
          </dl>
          <div class="issue-box">
            <span class="eyebrow">MOTIVO DE INGRESO</span>
            <p>{{ order.issue }}</p>
          </div>
        </section>
        <section class="surface detail-section">
          <h2>Responsable y cliente</h2>
          <div class="team-member">
            <span class="avatar" :class="store.mechanic(order.mechanicId).color">
              {{ store.mechanic(order.mechanicId).initials }}
            </span>
            <div>
              <strong>{{ store.mechanic(order.mechanicId).name }}</strong>
              <span>Mecánico responsable</span>
            </div>
          </div>
          <hr />
          <div class="contact-details">
            <span class="eyebrow">CLIENTE</span>
            <h3>{{ store.customer(order.customerId).name }}</h3>
            <a :href="`tel:${store.customer(order.customerId).phone}`">
              <AppIcon name="phone" :size="16" />
              {{ store.customer(order.customerId).phone }}
            </a>
          </div>
          <RouterLink :to="`/seguimiento/${order.token}`" class="btn secondary full-width">
            Ver portal del cliente
            <AppIcon name="external" :size="17" />
          </RouterLink>
        </section>
      </aside>
    </div>
    <QuoteForm v-if="quoteForm" :order="order" @close="quoteForm = false" />
    <AppModal v-if="share" title="Compartir seguimiento" @close="share = false">
      <p class="modal-intro muted">Para {{ store.customer(order.customerId).name }} · {{ order.plate }}</p>
      <label>
        Enlace de seguimiento
        <input :value="trackingLink" readonly @focus="($event.target as HTMLInputElement).select()" />
      </label>
      <p class="notice">Demo local: este enlace no sincroniza datos entre dispositivos.</p>
      <div class="form-actions">
        <RouterLink :to="`/seguimiento/${order.token}`" class="btn secondary">
          Abrir portal
          <AppIcon name="external" :size="16" />
        </RouterLink>
        <button class="btn primary" @click="copyLink">
          <AppIcon name="copy" :size="17" />
          Copiar enlace
        </button>
      </div>
    </AppModal>
  </template>
  <NotFoundView v-else />
</template>
