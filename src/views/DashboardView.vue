<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkshop } from '../stores/workshop'
import { money } from '../types'
import AppIcon from '../components/AppIcon.vue'
import OrderCard from '../components/OrderCard.vue'
const store = useWorkshop()
defineEmits<{ newOrder: [] }>()
const filter = ref('all')
const tabs = computed(() => [
  { id: 'all', label: 'Todos', count: store.activeOrders.length },
  {
    id: 'repair',
    label: 'En reparación',
    count: store.activeOrders.filter((o) => o.status === 'repair').length,
  },
  {
    id: 'waiting',
    label: 'Por aprobar',
    count: store.activeOrders.filter((o) => o.status === 'waiting').length,
  },
  { id: 'ready', label: 'Listos', count: store.activeOrders.filter((o) => o.status === 'ready').length },
])
const visibleOrders = computed(() =>
  store.activeOrders.filter((o) => filter.value === 'all' || o.status === filter.value).slice(0, 6),
)
const today = new Intl.DateTimeFormat('es-BO', {
  day: 'numeric',
  month: 'long',
  timeZone: 'America/La_Paz',
}).format(new Date())
const metrics = computed(() => [
  {
    label: 'Vehículos en el taller',
    value: store.activeOrders.length,
    icon: 'car' as const,
    tone: 'sage',
    filter: 'all',
  },
  {
    label: 'En reparación',
    value: store.orders.filter((o) => o.status === 'repair').length,
    icon: 'wrench' as const,
    tone: 'blue',
    filter: 'repair',
  },
  {
    label: 'Esperando aprobación',
    value: store.pendingQuotes.length,
    icon: 'clock' as const,
    tone: 'sand',
    filter: 'waiting',
  },
  {
    label: 'Listos para entregar',
    value: store.orders.filter((o) => o.status === 'ready').length,
    icon: 'checks' as const,
    tone: 'sage',
    filter: 'ready',
  },
])
</script>
<template>
  <div class="page-heading">
    <div>
      <!-- prettier-ignore -->
      <h1>Resumen del taller<span class="heading-dot">.</span></h1>
    </div>
    <div class="heading-actions">
      <span class="date-pill">
        <AppIcon name="calendar" :size="17" />
        {{ today }}
      </span>
      <button class="btn primary" @click="$emit('newOrder')">
        <AppIcon name="plus" :size="19" />
        Nueva orden
      </button>
    </div>
  </div>
  <section class="metrics-grid" aria-label="Resumen del taller">
    <button
      v-for="metric in metrics"
      :key="metric.label"
      class="metric-card surface"
      @click="filter = metric.filter"
    >
      <div class="metric-top">
        <span>{{ metric.label }}</span>
        <span class="icon-tile" :class="metric.tone"><AppIcon :name="metric.icon" :size="21" /></span>
      </div>
      <div class="metric-value">
        {{ String(metric.value).padStart(2, '0') }}
        <span
          v-if="metric.filter !== 'waiting'"
          class="metric-sparkline"
          :class="metric.tone"
          aria-hidden="true"
        >
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </span>
      </div>
    </button>
  </section>
  <div class="dashboard-columns">
    <section class="workshop-section">
      <div class="section-title">
        <div>
          <h2>
            Órdenes activas
            <span class="count-circle">{{ store.activeOrders.length }}</span>
          </h2>
        </div>
        <RouterLink to="/ordenes" class="text-link">
          Ver todas
          <AppIcon name="arrow" :size="16" />
        </RouterLink>
      </div>
      <div class="filter-tabs" role="group" aria-label="Filtrar órdenes">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ selected: filter === tab.id }"
          :aria-pressed="filter === tab.id"
          @click="filter = tab.id"
        >
          {{ tab.label }}
          <span>{{ tab.count }}</span>
        </button>
      </div>
      <div class="orders-grid">
        <OrderCard v-for="order in visibleOrders" :key="order.id" :order="order" />
      </div>
      <div v-if="!visibleOrders.length" class="empty-state surface">
        <AppIcon name="checks" :size="36" />
        <h3>No hay vehículos en este estado</h3>
        <button class="btn secondary" @click="filter = 'all'">Ver todos los vehículos</button>
      </div>
    </section>
    <aside class="dashboard-aside">
      <section class="pending-panel surface">
        <div class="section-title compact">
          <div class="inline-heading">
            <span class="icon-tile sand"><AppIcon name="clock" :size="19" /></span>
            <h2>Por aprobar</h2>
          </div>
          <span class="count-circle amber">{{ store.pendingQuotes.length }}</span>
        </div>
        <RouterLink
          v-for="q in store.pendingQuotes.slice(0, 3)"
          :key="q.id"
          :to="`/ordenes/${q.orderId}`"
          class="pending-item"
        >
          <div class="pending-title">
            <strong>{{ store.orders.find((o) => o.id === q.orderId)?.vehicle }}</strong>
            <AppIcon name="up" :size="17" />
          </div>
          <p>{{ q.title }}</p>
          <div>
            <strong class="quote-amount">{{ money(store.total(q)) }}</strong>
          </div>
        </RouterLink>
        <p v-if="!store.pendingQuotes.length" class="empty-inline">
          <AppIcon name="checks" />
          Sin cotizaciones pendientes.
        </p>
        <RouterLink to="/cotizaciones" class="panel-bottom-link">
          Ver cotizaciones
          <AppIcon name="arrow" :size="17" />
        </RouterLink>
      </section>
      <section class="team-panel surface">
        <div class="section-title compact">
          <h2>Equipo</h2>
          <span class="team-online">
            <span></span>
            {{ store.mechanics.length }} mecánicos
          </span>
        </div>
        <div v-for="m in store.mechanics" :key="m.id" class="team-member">
          <span class="avatar" :class="m.color">{{ m.initials }}</span>
          <div>
            <strong>{{ m.name }}</strong>
            <span>{{ m.specialty }}</span>
          </div>
          <RouterLink
            :to="{ path: '/ordenes', query: { mechanic: m.id } }"
            class="team-work-count"
            :aria-label="`Ver órdenes de ${m.name}`"
          >
            {{ store.activeOrders.filter((o) => o.mechanicId === m.id).length }}
            <AppIcon name="car" :size="13" />
          </RouterLink>
        </div>
      </section>
    </aside>
  </div>
</template>
