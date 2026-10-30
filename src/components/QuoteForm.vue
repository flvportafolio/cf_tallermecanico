<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkshop } from '../stores/workshop'
import type { Order, QuoteItem } from '../types'
import { money } from '../types'
import AppModal from './AppModal.vue'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ order: Order }>()
const emit = defineEmits<{ close: [] }>()
const store = useWorkshop(),
  title = ref(''),
  items = ref<QuoteItem[]>([{ description: '', quantity: 1, price: 0 }])
const total = computed(() => items.value.reduce((s, i) => s + Number(i.quantity) * Number(i.price), 0))
function submit() {
  if (store.createQuote(props.order, title.value, items.value)) emit('close')
}
</script>
<template>
  <AppModal title="Nueva cotización" wide @close="emit('close')">
    <p class="muted modal-intro">{{ order.vehicle }} · {{ order.plate }}</p>
    <form @submit.prevent="submit">
      <label>
        Nombre del trabajo
        <input v-model="title" required maxlength="100" placeholder="Ej. Cambio de pastillas de freno" />
      </label>
      <div class="quote-lines">
        <div v-for="(item, index) in items" :key="index" class="quote-line">
          <label>
            Concepto
            <input
              v-model="item.description"
              required
              maxlength="160"
              placeholder="Repuesto o mano de obra"
            />
          </label>
          <label>
            Cant.
            <input v-model.number="item.quantity" required type="number" min="1" max="999" step="1" />
          </label>
          <label>
            Precio (Bs)
            <input v-model.number="item.price" required type="number" min="0.01" max="999999" step="0.01" />
          </label>
          <button
            class="icon-btn remove-item"
            type="button"
            :disabled="items.length === 1"
            :aria-label="`Eliminar concepto ${index + 1}`"
            @click="items.splice(index, 1)"
          >
            <AppIcon name="trash" :size="18" />
          </button>
        </div>
      </div>
      <button
        class="text-link add-line"
        type="button"
        @click="items.push({ description: '', quantity: 1, price: 0 })"
      >
        <AppIcon name="plus" :size="18" />
        Añadir concepto
      </button>
      <div class="quote-total">
        <span>Total a aprobar</span>
        <strong>{{ money(total) }}</strong>
      </div>
      <p class="notice">
        <AppIcon name="clock" :size="18" />
        La orden quedará en espera hasta que el cliente decida.
      </p>
      <div class="form-actions">
        <button class="btn secondary" type="button" @click="emit('close')">Cancelar</button>
        <button class="btn primary" type="submit">
          <AppIcon name="send" :size="18" />
          Crear cotización
        </button>
      </div>
    </form>
  </AppModal>
</template>
