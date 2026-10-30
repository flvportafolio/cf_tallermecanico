<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkshop } from '../stores/workshop'
import AppModal from './AppModal.vue'
import AppIcon from './AppIcon.vue'
const emit = defineEmits<{ close: [] }>()
const store = useWorkshop(),
  router = useRouter()
const form = reactive({
  name: '',
  phone: '',
  vehicle: '',
  plate: '',
  year: '2021',
  issue: '',
  mechanicId: 'm1',
  expectedAt: '',
})
function submit() {
  const order = store.createOrder(form)
  emit('close')
  router.push(`/ordenes/${order.id}`)
}
</script>
<template>
  <AppModal title="Nueva orden" wide @close="emit('close')">
    <form @submit.prevent="submit">
      <div class="form-grid">
        <label>
          Nombre del cliente
          <input
            v-model="form.name"
            required
            maxlength="80"
            placeholder="Ej. Andrea Mendoza"
            autocomplete="name"
          />
        </label>
        <label>
          Celular
          <input
            v-model="form.phone"
            required
            type="tel"
            pattern="[+0-9 ()-]{7,20}"
            placeholder="Ej. 70123456"
            autocomplete="tel"
          />
        </label>
        <label>
          Marca y modelo
          <input v-model="form.vehicle" required maxlength="60" placeholder="Ej. Toyota Corolla" />
        </label>
        <label>
          Placa
          <input v-model="form.plate" required maxlength="15" placeholder="Ej. 4825 KLP" class="uppercase" />
        </label>
        <label>
          Año
          <input v-model="form.year" required type="number" min="1950" max="2035" />
        </label>
        <label>
          Mecánico responsable
          <select v-model="form.mechanicId">
            <option v-for="m in store.mechanics" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </label>
        <label class="span-2">
          Motivo de ingreso
          <textarea
            v-model="form.issue"
            required
            maxlength="600"
            rows="3"
            placeholder="¿Qué necesita este vehículo?"
          />
        </label>
        <label class="span-2">
          Entrega estimada
          <span class="muted">(opcional)</span>
          <input v-model="form.expectedAt" type="date" />
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn secondary" @click="emit('close')">Cancelar</button>
        <button class="btn primary" type="submit">
          <AppIcon name="plus" />
          Crear orden
        </button>
      </div>
    </form>
  </AppModal>
</template>
