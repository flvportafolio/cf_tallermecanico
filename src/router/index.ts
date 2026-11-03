import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OrdersView from '../views/OrdersView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import QuotesView from '../views/QuotesView.vue'
import CustomersView from '../views/CustomersView.vue'
import SalesView from '../views/SalesView.vue'
import TrackingView from '../views/TrackingView.vue'
import NotFoundView from '../views/NotFoundView.vue'
export default createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: DashboardView, meta: { title: 'Resumen' } },
    { path: '/ordenes', component: OrdersView, meta: { title: 'Órdenes de trabajo' } },
    { path: '/ordenes/:id', component: OrderDetailView, meta: { title: 'Detalle de orden' } },
    { path: '/cotizaciones', component: QuotesView, meta: { title: 'Cotizaciones' } },
    { path: '/clientes', component: CustomersView, meta: { title: 'Clientes' } },
    { path: '/ventas/nueva', component: SalesView, meta: { title: 'Nueva venta' } },
    { path: '/seguimiento/:token', component: TrackingView, meta: { title: 'Tu vehículo', public: true } },
    { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Página no encontrada' } },
  ],
})
