<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from './components/AppIcon.vue'
import AppModal from './components/AppModal.vue'
import NewOrderModal from './components/NewOrderModal.vue'
import { useWorkshop } from './stores/workshop'
const route = useRoute(),
  router = useRouter(),
  store = useWorkshop()
const newOrder = ref(false),
  menu = ref(false),
  notifications = ref(false),
  help = ref(false),
  search = ref('')
const nav = [
  { to: '/', icon: 'dashboard', title: 'Resumen' },
  { to: '/ordenes', icon: 'orders', title: 'Órdenes de trabajo' },
  { to: '/cotizaciones', icon: 'file', title: 'Cotizaciones' },
  { to: '/clientes', icon: 'users', title: 'Clientes' },
] as const
const isPublic = computed(() => route.meta.public)
function closePanels(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    menu.value = false
    notifications.value = false
  }
}
function focusMain() {
  document.getElementById('main-content')?.focus()
}
onMounted(() => document.addEventListener('keydown', closePanels))
onBeforeUnmount(() => document.removeEventListener('keydown', closePanels))
watch(
  () => route.fullPath,
  () => {
    menu.value = false
    notifications.value = false
    document.title = `${String(route.meta.title || 'Taller')} · Don Ramiro`
  },
)
function searchOrders() {
  router.push({ path: '/ordenes', query: search.value.trim() ? { q: search.value.trim() } : {} })
  search.value = ''
}
</script>
<template>
  <div v-if="!isPublic" class="app-shell">
    <a href="#main-content" class="skip-link" @click.prevent="focusMain">Saltar al contenido</a>
    <button
      v-if="menu"
      class="sidebar-backdrop"
      aria-label="Cerrar navegación"
      @click="menu = false"
    ></button>
    <aside class="sidebar" :class="{ open: menu }">
      <RouterLink to="/" class="brand">
        <span class="brand-mark"><AppIcon name="wrench" :size="25" /></span>
        <span>
          don ramiro
          <span class="brand-subtitle">TALLER MECÁNICO</span>
        </span>
      </RouterLink>
      <div class="workspace">
        <span class="workspace-avatar">DR</span>
        <div>
          <strong>Taller Don Ramiro</strong>
          <span>La Paz, Bolivia</span>
        </div>
        <span class="online-dot"></span>
      </div>
      <nav class="main-nav" aria-label="Navegación principal">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :class="{ active: item.to === '/' ? route.path === '/' : route.path.startsWith(item.to) }"
        >
          <AppIcon :name="item.icon" />
          <span>{{ item.title }}</span>
          <span v-if="item.to === '/cotizaciones' && store.pendingQuotes.length" class="nav-count">
            {{ store.pendingQuotes.length }}
          </span>
        </RouterLink>
      </nav>
      <div class="sidebar-bottom">
        <RouterLink :to="`/seguimiento/${store.orders[0]?.token || 'demo-1048'}`" class="help-link">
          <AppIcon name="external" :size="19" />
          Ver portal del cliente
          <AppIcon name="up" :size="16" />
        </RouterLink>
        <button class="help-link" @click="help = true">
          <AppIcon name="help" :size="19" />
          Guía rápida
          <AppIcon name="up" :size="16" />
        </button>
        <div class="user-profile">
          <span class="avatar user-avatar">DR</span>
          <div>
            <strong>Don Ramiro</strong>
            <span>Administrador</span>
          </div>
          <span class="online-dot"></span>
        </div>
      </div>
    </aside>
    <div class="main-shell">
      <header class="topbar">
        <div class="breadcrumb">
          <button class="icon-btn mobile-menu" aria-label="Abrir navegación" @click="menu = true">
            <AppIcon name="menu" />
          </button>
          <span>Mi taller</span>
          <AppIcon name="chevron" :size="14" />
          <strong>{{ route.meta.title }}</strong>
        </div>
        <div class="topbar-actions">
          <form
            class="global-search"
            role="search"
            aria-label="Buscar en el taller"
            @submit.prevent="searchOrders"
          >
            <AppIcon name="search" :size="18" />
            <input
              v-model="search"
              aria-label="Buscar un vehículo o cliente"
              placeholder="Buscar en mi taller..."
              enterkeyhint="search"
            />
          </form>
          <div class="notifications-wrap">
            <button
              class="icon-btn notification-btn"
              aria-label="Ver notificaciones"
              :aria-expanded="notifications"
              @click="notifications = !notifications"
            >
              <AppIcon name="bell" />
              <i v-if="store.pendingQuotes.length"></i>
            </button>
            <div v-if="notifications" class="notification-popover surface">
              <h3>Cotizaciones pendientes</h3>
              <RouterLink v-for="q in store.pendingQuotes" :key="q.id" :to="`/ordenes/${q.orderId}`">
                <span class="icon-tile amber"><AppIcon name="clock" :size="18" /></span>
                <span>
                  <strong>{{ q.title }}</strong>
                  <small>{{ q.id }} · Pendiente de aprobación</small>
                </span>
              </RouterLink>
              <p v-if="!store.pendingQuotes.length" class="muted">Sin cotizaciones pendientes.</p>
            </div>
          </div>
          <span class="topbar-divider"></span>
          <span class="avatar top-avatar">DR</span>
        </div>
      </header>
      <main id="main-content" tabindex="-1">
        <div v-if="store.storageError" role="alert" class="notice">
          No se pudieron guardar los cambios en este navegador. Mantén esta pestaña abierta.
        </div>
        <RouterView @new-order="newOrder = true" />
      </main>
      <footer class="app-footer">
        <span>
          Don Ramiro
          <span class="footer-dot">·</span>
          Demo local
        </span>
      </footer>
    </div>
    <NewOrderModal v-if="newOrder" @close="newOrder = false" />
    <AppModal v-if="help" title="Guía rápida" @close="help = false">
      <div class="help-steps">
        <div>
          <span>01</span>
          <section>
            <h3>Crea una orden</h3>
            <p>Crea una orden y elige al mecánico responsable.</p>
          </section>
        </div>
        <div>
          <span>02</span>
          <section>
            <h3>Actualiza y comparte</h3>
            <p>Desde la orden, actualiza el estado y copia el enlace de seguimiento.</p>
          </section>
        </div>
        <div>
          <span>03</span>
          <section>
            <h3>Solicita aprobación</h3>
            <p>Crea una cotización. El cliente la aprueba o rechaza desde su portal.</p>
          </section>
        </div>
      </div>
      <p class="notice">
        Demo local: los datos se guardan en este navegador, sin sincronización entre dispositivos.
      </p>
      <button class="btn primary full-width" @click="help = false">Entendido</button>
    </AppModal>
  </div>
  <RouterView v-else />
  <Transition name="toast">
    <div v-if="store.toast" class="toast-message" role="status">
      <AppIcon name="success" :size="20" />
      <span>{{ store.toast }}</span>
      <button aria-label="Cerrar aviso" @click="store.toast = ''">
        <AppIcon name="close" :size="16" />
      </button>
    </div>
  </Transition>
</template>
