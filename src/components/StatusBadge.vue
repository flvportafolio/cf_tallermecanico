<script setup lang="ts">
import { statuses } from '../types'
import type { Status } from '../types'
defineProps<{ status: Status }>()
</script>
<template>
  <span class="badge" :class="statuses[status].tone">
    <span class="status-dot"></span>
    {{ statuses[status].label }}
  </span>
</template>
