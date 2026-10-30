<script setup lang="ts">
import AppIcon from '../components/AppIcon.vue'
</script>
<template>
  <div class="empty-state surface not-found">
    <AppIcon name="car" :size="48" />
    <h1>No encontramos esta página</h1>
    <p>Comprueba el enlace o vuelve al resumen del taller.</p>
    <RouterLink class="btn primary" to="/">
      Volver al taller
      <AppIcon name="arrow" />
    </RouterLink>
  </div>
</template>
