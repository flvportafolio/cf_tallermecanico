<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkshop } from '../stores/workshop'
import type { Customer } from '../types'
import AppIcon from '../components/AppIcon.vue'
import AppModal from '../components/AppModal.vue'
import StatusBadge from '../components/StatusBadge.vue'
const store = useWorkshop(),
  query = ref(''),
  selected = ref<Customer>()
const customers = computed(() =>
  store.customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(query.value.toLowerCase())),
)
const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
</script>
<template>
  <div class="page-heading">
    <div>
      <!-- prettier-ignore -->
      <h1>Clientes<span class="heading-dot">.</span></h1>
    </div>
    <span class="date-pill">
      <AppIcon name="users" :size="18" />
      {{ store.customers.length }} clientes
    </span>
  </div>
  <div class="filter-bar surface">
    <label class="input-with-icon">
      <AppIcon name="search" />
      <input v-model="query" aria-label="Buscar clientes" placeholder="Buscar por nombre o celular..." />
    </label>
    <p class="muted">Los clientes se registran al crear una orden.</p>
  </div>
  <div class="customers-grid">
    <button v-for="(c, index) in customers" :key="c.id" class="surface customer-card" @click="selected = c">
      <div class="customer-card-top">
        <span class="avatar large" :class="['sage', 'sand', 'blue', 'rose'][index % 4]">
          {{ initials(c.name) }}
        </span>
        <AppIcon name="up" :size="20" />
      </div>
      <h2>{{ c.name }}</h2>
      <p>
        <AppIcon name="phone" :size="15" />
        {{ c.phone }}
      </p>
      <div class="customer-vehicles">
        <span>{{ store.orders.filter((o) => o.customerId === c.id).length }} órdenes</span>
        <span>
          {{ store.activeOrders.filter((o) => o.customerId === c.id).length }} en el taller
          <AppIcon name="car" :size="16" />
        </span>
      </div>
    </button>
  </div>
  <div v-if="!customers.length" class="empty-state surface">
    <AppIcon name="users" :size="36" />
    <h2>No encontramos ese cliente</h2>
    <p>Intenta con otro nombre o número de celular.</p>
  </div>
  <AppModal v-if="selected" :title="selected.name" @close="selected = undefined">
    <a :href="`tel:${selected.phone}`" class="contact-phone">
      <AppIcon name="phone" :size="18" />
      {{ selected.phone }}
    </a>
    <h3 class="customer-history-title">Historial de vehículos</h3>
    <RouterLink
      v-for="o in store.orders.filter((o) => o.customerId === selected?.id)"
      :key="o.id"
      :to="`/ordenes/${o.id}`"
      class="customer-order"
    >
      <span>
        <strong>{{ o.vehicle }}</strong>
        <small>{{ o.plate }} · {{ o.id }}</small>
      </span>
      <StatusBadge :status="o.status" />
      <AppIcon name="chevron" :size="17" />
    </RouterLink>
  </AppModal>
</template>
