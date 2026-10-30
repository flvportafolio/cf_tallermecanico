<script setup lang="ts">
import type { Order } from '../types'
import { statuses } from '../types'
import { useWorkshop } from '../stores/workshop'
import AppIcon from './AppIcon.vue'
import CarIllustration from './CarIllustration.vue'
import StatusBadge from './StatusBadge.vue'
defineProps<{ order: Order }>()
const store = useWorkshop()
</script>
<template>
  <RouterLink :to="`/ordenes/${order.id}`" class="order-card surface">
    <div class="card-top">
      <span class="order-number">#{{ order.id.slice(3) }}</span>
      <StatusBadge :status="order.status" />
    </div>
    <div class="car-stage">
      <CarIllustration :color="order.color" />
      <span class="vehicle-ground"></span>
    </div>
    <div class="car-heading">
      <h3>{{ order.vehicle }}</h3>
      <span class="plate">{{ order.plate }}</span>
    </div>
    <p class="client-line">{{ store.customer(order.customerId).name }}</p>
    <p class="order-issue">{{ order.issue }}</p>
    <div class="progress-track">
      <span
        :style="{ width: `${statuses[order.status].progress}%` }"
        :class="statuses[order.status].tone"
      ></span>
    </div>
    <div class="card-bottom">
      <div class="person">
        <span class="avatar small" :class="store.mechanic(order.mechanicId).color">
          {{ store.mechanic(order.mechanicId).initials }}
        </span>
        <span>{{ store.mechanic(order.mechanicId).name.split(' ')[0] }}</span>
      </div>
      <span class="round-arrow"><AppIcon name="arrow" :size="17" /></span>
    </div>
  </RouterLink>
</template>
