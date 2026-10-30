<script setup lang="ts">
defineProps<{ color?: string }>()
</script>
<template>
  <svg viewBox="0 0 280 120" fill="none" aria-hidden="true" class="car-illustration">
    <ellipse cx="142" cy="99" rx="117" ry="9" fill="#2c433a" opacity=".09" />
    <path
      d="M25 69 36 54 82 45 106 22Q111 17 124 17H178Q189 17 199 29L219 49 247 56Q258 59 259 69L260 84 246 91H38L23 83Z"
      :fill="color || '#bac8b9'"
    />
    <path d="m91 45 22-23h27v25Zm55-23h31q8 0 14 8l15 18-60-1Z" fill="#3e514d" />
    <path d="m117 25-17 18h37V25Zm33 0v19l47 1-10-13q-6-7-12-7Z" fill="#758a85" />
    <path d="m122 25-17 18h9l19-18Zm36 0-7 8v10h5l17-18Z" fill="#a6b7af" opacity=".65" />
    <path
      d="m25 69 57-11 130-2 43 10M141 50v32m67-31 7 30"
      stroke="#324d41"
      stroke-opacity=".2"
      stroke-width="1.5"
    />
    <path d="m29 63 26-4-5 10-24 3Zm203 0 22 5v7l-17-2Z" fill="#fbf8e9" />
    <path d="m254 65 5 3v11h-5Z" fill="#ae5d4e" />
    <rect x="150" y="54" width="13" height="3" rx="1.5" fill="#53675b" />
    <path d="M43 86a25 25 0 0 1 50 0m111 0a25 25 0 0 1 50 0" fill="#6a7b70" />
    <circle cx="68" cy="86" r="20" fill="#31413b" />
    <circle cx="68" cy="86" r="12" fill="#b9c1b9" />
    <circle cx="68" cy="86" r="7" fill="#6f8075" />
    <circle cx="68" cy="86" r="3" fill="#cbd3cb" />
    <circle cx="228" cy="86" r="20" fill="#31413b" />
    <circle cx="228" cy="86" r="12" fill="#b9c1b9" />
    <circle cx="228" cy="86" r="7" fill="#6f8075" />
    <circle cx="228" cy="86" r="3" fill="#cbd3cb" />
    <path d="M94 88h108" stroke="#718575" stroke-width="4" />
  </svg>
</template>
