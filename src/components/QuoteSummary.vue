<script setup lang="ts">
import type { Quote } from '../types'
import { money, dateTime } from '../types'
import { useWorkshop } from '../stores/workshop'
import AppIcon from './AppIcon.vue'
defineProps<{ quote: Quote; detailed?: boolean }>()
const store = useWorkshop()
</script>
<template>
  <article class="quote-summary">
    <div class="quote-summary-head">
      <span class="eyebrow">{{ quote.id }}</span>
      <span
        class="badge"
        :class="quote.status === 'approved' ? 'green' : quote.status === 'rejected' ? 'red' : 'amber'"
      >
        <span class="status-dot"></span>
        {{
          quote.status === 'approved' ? 'Aprobada' : quote.status === 'rejected' ? 'Rechazada' : 'Por aprobar'
        }}
      </span>
    </div>
    <h3>{{ quote.title }}</h3>
    <div v-if="detailed" class="quote-items">
      <div v-for="(item, i) in quote.items" :key="i">
        <span>
          {{ item.description }}
          <small>{{ item.quantity }} × {{ money(item.price) }}</small>
        </span>
        <strong>{{ money(item.quantity * item.price) }}</strong>
      </div>
    </div>
    <div class="quote-total">
      <span>{{ detailed ? 'Total del trabajo' : 'Total' }}</span>
      <strong>{{ money(store.total(quote)) }}</strong>
    </div>
    <div v-if="quote.decidedAt" class="approval-record" :class="{ rejected: quote.status === 'rejected' }">
      <AppIcon :name="quote.status === 'approved' ? 'shield' : 'file'" :size="22" />
      <div>
        <strong>{{ quote.status === 'approved' ? 'Aprobado' : 'Rechazado' }} por {{ quote.signer }}</strong>
        <span>{{ dateTime(quote.decidedAt) }} · {{ quote.id }}</span>
        <p v-if="quote.reason">{{ quote.reason }}</p>
      </div>
    </div>
  </article>
</template>
