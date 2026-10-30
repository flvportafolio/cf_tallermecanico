<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkshop } from '../stores/workshop'
import { statuses } from '../types'
import AppIcon from '../components/AppIcon.vue'
import OrderCard from '../components/OrderCard.vue'
const store = useWorkshop(),
  route = useRoute()
defineEmits<{ newOrder: [] }>()
const query = ref(String(route.query.q || '')),
  status = ref('all'),
  mechanic = ref(String(route.query.mechanic || 'all'))
watch(
  () => route.query,
  (q) => {
    query.value = String(q.q || '')
    mechanic.value = String(q.mechanic || 'all')
  },
)
const orders = computed(() =>
  store.orders.filter(
    (o) =>
      (status.value === 'all' || status.value === o.status) &&
      (mechanic.value === 'all' || mechanic.value === o.mechanicId) &&
      `${o.id} ${o.vehicle} ${o.plate} ${store.customer(o.customerId).name}`
        .toLowerCase()
        .includes(query.value.toLowerCase()),
  ),
)
function clearFilters() {
  query.value = ''
  status.value = 'all'
  mechanic.value = 'all'
}
</script>
<template>
  <div class="page-heading">
    <div>
      <!-- prettier-ignore -->
      <h1>Órdenes de trabajo<span class="heading-dot">.</span></h1>
    </div>
    <button class="btn primary" @click="$emit('newOrder')">
      <AppIcon name="plus" />
      Nueva orden
    </button>
  </div>
  <div class="filter-bar orders-filters surface">
    <label class="filter-search">
      <span>Buscar</span>
      <span class="input-with-icon">
        <AppIcon name="search" />
        <input v-model="query" aria-label="Buscar órdenes" placeholder="Placa, vehículo o cliente" />
      </span>
    </label>
    <label class="filter-select">
      <span>Estado</span>
      <select v-model="status" aria-label="Filtrar por estado">
        <option value="all">Todos los estados</option>
        <option v-for="(s, key) in statuses" :key="key" :value="key">{{ s.label }}</option>
      </select>
    </label>
    <label class="filter-select">
      <span>Responsable</span>
      <select v-model="mechanic" aria-label="Filtrar por mecánico">
        <option value="all">Todo el equipo</option>
        <option v-for="m in store.mechanics" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </label>
  </div>
  <div class="results-heading">
    <span>{{ orders.length }} órdenes encontradas</span>
    <span class="muted">Las más recientes primero</span>
  </div>
  <div class="orders-grid all-orders">
    <OrderCard v-for="order in orders" :key="order.id" :order="order" />
  </div>
  <div v-if="!orders.length" class="empty-state surface">
    <AppIcon name="search" :size="36" />
    <h2>No encontramos esas órdenes</h2>
    <p>Prueba con otra placa, nombre o filtro.</p>
    <button class="btn secondary" @click="clearFilters">Limpiar filtros</button>
  </div>
</template>
