<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkshop } from '../stores/workshop'
import AppIcon from '../components/AppIcon.vue'
import QuoteSummary from '../components/QuoteSummary.vue'
const store = useWorkshop(),
  filter = ref('pending')
const tabs = [
  { id: 'pending', label: 'Por aprobar' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'rejected', label: 'Rechazadas' },
  { id: 'all', label: 'Todas' },
]
const quotes = computed(() => store.quotes.filter((q) => filter.value === 'all' || q.status === filter.value))
</script>
<template>
  <div class="page-heading">
    <div>
      <!-- prettier-ignore -->
      <h1>Cotizaciones<span class="heading-dot">.</span></h1>
    </div>
    <RouterLink to="/ordenes" class="btn primary">
      <AppIcon name="plus" />
      Cotizar desde una orden
    </RouterLink>
  </div>
  <div class="filter-tabs quotes-tabs" role="group" aria-label="Estado de cotizaciones">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="{ selected: filter === tab.id }"
      :aria-pressed="filter === tab.id"
      @click="filter = tab.id"
    >
      {{ tab.label }}
      <span>{{ store.quotes.filter((q) => tab.id === 'all' || q.status === tab.id).length }}</span>
    </button>
  </div>
  <div class="quote-grid">
    <article v-for="q in quotes" :key="q.id" class="surface quote-page-card">
      <div class="quote-vehicle">
        <span class="icon-tile neutral"><AppIcon name="car" /></span>
        <div>
          <h3>{{ store.orders.find((o) => o.id === q.orderId)?.vehicle }}</h3>
          <p>
            {{ store.customer(store.orders.find((o) => o.id === q.orderId)!.customerId).name }} ·
            {{ q.orderId }}
          </p>
        </div>
      </div>
      <QuoteSummary :quote="q" detailed />
      <RouterLink :to="`/ordenes/${q.orderId}`" class="btn secondary full-width">
        Ver orden
        <AppIcon name="arrow" :size="17" />
      </RouterLink>
    </article>
  </div>
  <div v-if="!quotes.length" class="empty-state surface">
    <AppIcon name="file" :size="36" />
    <h2>No hay cotizaciones en este estado</h2>
  </div>
</template>
