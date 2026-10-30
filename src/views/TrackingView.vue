<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkshop } from '../stores/workshop'
import { statuses, dateTime, money } from '../types'
import type { Quote } from '../types'
import AppIcon from '../components/AppIcon.vue'
import CarIllustration from '../components/CarIllustration.vue'
import StatusBadge from '../components/StatusBadge.vue'
import QuoteSummary from '../components/QuoteSummary.vue'
import AppModal from '../components/AppModal.vue'
const store = useWorkshop(),
  route = useRoute()
const order = computed(() => store.orders.find((o) => o.token === route.params.token))
const quotes = computed(() => store.quotes.filter((q) => q.orderId === order.value?.id))
const decision = ref<{ quote: Quote; status: 'approved' | 'rejected' }>(),
  name = ref(''),
  consent = ref(false),
  reason = ref('')
const explanations = {
  received: 'Pendiente de revisión.',
  diagnosis: 'Estamos identificando qué necesita reparación.',
  waiting: 'La reparación está en pausa. Revisa la cotización.',
  repair: 'Estamos realizando los trabajos aprobados.',
  ready: 'Coordina la recogida con el taller.',
  delivered: 'Consulta aquí el historial de tu vehículo.',
}
function openDecision(quote: Quote, status: 'approved' | 'rejected') {
  name.value = ''
  consent.value = false
  reason.value = ''
  decision.value = { quote, status }
}
function submitDecision() {
  if (!decision.value || !consent.value || !name.value.trim()) return
  store.decideQuote(decision.value.quote, decision.value.status, name.value, reason.value)
  decision.value = undefined
}
</script>
<template>
  <div class="tracking-page">
    <header class="tracking-header">
      <RouterLink to="/" class="brand">
        <span class="brand-mark"><AppIcon name="wrench" :size="24" /></span>
        <span>
          don ramiro
          <span class="brand-subtitle">TALLER MECÁNICO</span>
        </span>
      </RouterLink>
      <span class="tracking-header-label">
        <AppIcon name="shield" :size="17" />
        Portal del cliente
      </span>
    </header>
    <main v-if="order" class="tracking-content">
      <div class="tracking-welcome">
        <!-- prettier-ignore -->
        <h1>Hola, {{ store.customer(order.customerId).name.split(' ')[0] }}<span class="heading-dot">.</span></h1>
      </div>
      <section class="surface tracking-vehicle">
        <div>
          <span class="eyebrow">{{ order.id }}</span>
          <h2>{{ order.vehicle }}</h2>
          <span class="plate">{{ order.plate }}</span>
        </div>
        <CarIllustration :color="order.color" />
      </section>
      <section class="surface tracking-status">
        <div class="section-title">
          <h2>Estado del vehículo</h2>
          <StatusBadge :status="order.status" />
        </div>
        <div class="tracking-progress">
          <span :style="{ width: `${statuses[order.status].progress}%` }"></span>
        </div>
        <p class="tracking-explanation">{{ explanations[order.status] }}</p>
        <div class="tracking-meta">
          <span class="avatar small" :class="store.mechanic(order.mechanicId).color">
            {{ store.mechanic(order.mechanicId).initials }}
          </span>
          <div>
            <strong>{{ store.mechanic(order.mechanicId).name }}</strong>
            <span>Mecánico responsable</span>
          </div>
          <AppIcon name="wrench" :size="22" />
        </div>
        <div class="estimated-date">
          <AppIcon name="calendar" :size="17" />
          <span>
            Entrega estimada:
            <strong>{{ order.expectedAt || 'Por confirmar' }}</strong>
          </span>
        </div>
      </section>
      <section v-if="quotes.length" class="tracking-quotes">
        <div class="section-title">
          <div>
            <h2>Cotizaciones</h2>
          </div>
          <AppIcon name="file" :size="22" />
        </div>
        <article v-for="q in quotes" :key="q.id" class="surface tracking-quote-card">
          <QuoteSummary :quote="q" detailed />
          <template v-if="q.status === 'pending'">
            <p class="approval-explanation">Este trabajo requiere tu aprobación.</p>
            <div class="decision-actions">
              <button class="btn primary" @click="openDecision(q, 'approved')">
                <AppIcon name="check" />
                Aprobar {{ money(store.total(q)) }}
              </button>
              <button class="btn secondary" @click="openDecision(q, 'rejected')">No aprobar</button>
            </div>
          </template>
        </article>
      </section>
      <section class="surface tracking-history">
        <div class="section-title">
          <h2>Novedades</h2>
          <AppIcon name="activity" :size="21" />
        </div>
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
      <p class="demo-note">Demo local · Datos guardados solo en este navegador.</p>
      <RouterLink :to="`/ordenes/${order.id}`" class="back-link demo-back">
        <AppIcon name="back" :size="16" />
        Volver a la vista del taller
      </RouterLink>
    </main>
    <main v-else class="tracking-content">
      <div class="empty-state surface">
        <AppIcon name="link" :size="42" />
        <h1>Este enlace no está disponible</h1>
        <p>Revisa el enlace de seguimiento que te compartió el taller.</p>
        <RouterLink to="/" class="btn secondary">Ir al taller</RouterLink>
      </div>
    </main>
    <footer class="tracking-footer">
      <span>DON RAMIRO · LA PAZ</span>
    </footer>
    <AppModal
      v-if="decision"
      :title="decision.status === 'approved' ? 'Aprobar cotización' : 'Rechazar cotización'"
      @close="decision = undefined"
    >
      <form @submit.prevent="submitDecision">
        <div class="decision-summary">
          <span>{{ decision.quote.title }}</span>
          <strong>{{ money(store.total(decision.quote)) }}</strong>
        </div>
        <label>
          Tu nombre completo
          <input
            v-model="name"
            required
            minlength="3"
            maxlength="100"
            autocomplete="name"
            placeholder="Escribe tu nombre y apellido"
          />
        </label>
        <label v-if="decision.status === 'rejected'" class="reason-field">
          Cuéntanos el motivo
          <span class="muted">(opcional)</span>
          <textarea v-model="reason" rows="3" maxlength="400" placeholder="Ej. Prefiero otra alternativa." />
        </label>
        <label class="checkbox-label">
          <input v-model="consent" type="checkbox" required />
          <span>
            {{
              decision.status === 'approved'
                ? `He revisado el detalle y autorizo este trabajo por ${money(store.total(decision.quote))}.`
                : 'Confirmo que no autorizo este trabajo adicional.'
            }}
          </span>
        </label>
        <p class="muted small-text">
          <AppIcon name="shield" :size="16" />
          Se registrarán tu nombre, decisión, importe y fecha.
        </p>
        <div class="form-actions">
          <button type="button" class="btn secondary" @click="decision = undefined">Volver</button>
          <button
            type="submit"
            class="btn"
            :class="decision.status === 'approved' ? 'primary' : 'danger'"
            :disabled="!consent || name.trim().length < 3"
          >
            {{ decision.status === 'approved' ? 'Confirmar aprobación' : 'Confirmar rechazo' }}
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>
