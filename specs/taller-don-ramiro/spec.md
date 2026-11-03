# Spec: Sistema de gestión para Taller Don Ramiro (frontend)

| Campo | Valor |
| --- | --- |
| Estado | Aprobada · implementada |
| Alcance | Solo frontend (SPA estática) |
| Stack | Vue 3 · Vue Router · Pinia · Vite · TypeScript estricto |
| Fuente de verdad de UI | `DESIGN.md` y skill `.opencode/skills/brand-design/` |
| Verificación | `tests/workshop.spec.ts` (Playwright, escritorio y celular) |

Esta spec es la fuente de verdad del producto. Toda cambio funcional se propone aquí
primero, se implementa después y se verifica contra los criterios de aceptación.

> **Spec derivada:** [`spec-ventas.md`](spec-ventas.md) define la pantalla de venta y
> cobro (cliente, tabla de ítems, glosa, hasta dos formas de pago), criterios
> CA-V1…CA-V5, implementada en `/ventas/nueva` y verificada con `tests/sales.spec.ts`.

---

## 1. Definición del problema

**Contexto.** Don Ramiro tiene un taller mecánico con cuatro mecánicos que trabajan
únicamente desde el celular, casi siempre con las manos sucias. No usan inventario
administrativo: el inventario ya se lleva en Excel y queda fuera de todo alcance.

**Problemas concretos que hoy le cuestan tiempo y dinero:**

1. **Llamadas de seguimiento.** Los clientes llaman varias veces al día a preguntar si su
   coche ya está listo. Cada llamada interrumpe el trabajo del taller y no hay forma de
   responderla sin detener lo que se está haciendo.
2. **Reparaciones adicionales estancadas.** Al revisar un coche aparecen reparaciones no
   previstas. El trabajo se detiene hasta que el cliente aprueba el costo por teléfono, y
   esa aprobación puede tardar días mientras el vehículo ocupa el espacio del taller.
3. **Disputas de aprobación.** El acuerdo verbal por teléfono no deja registro: a veces
   el cliente niega haber aprobado el costo y no existe evidencia que lo desmienta.

**Resultado.** El taller pierde horas de trabajo productivo atendiendo llamadas, los
vehículos se quedan parados esperando decisiones y las cotizaciones discutidas generan
confianza rota. Se necesita que el cliente conozca el estado de su coche sin llamar y
que las aprobaciones de cotización sean rápidas, explícitas y con registro.

## 2. Diseño de la solución

### 2.1 Idea central

Una SPA estática en el celular del mecánico que cumple dos roles con una sola base de
datos local:

- **Vista interna del taller** (panel privado): resumen, órdenes de trabajo, cotizaciones
  y clientes. El mecánico registra ingresos, avanza estados, cotiza y publica novedades.
- **Portal público del cliente** (`/seguimiento/:token`): enlace privado por vehículo,
  sin login, donde el cliente ve el estado, la bitácora y aprueba o rechaza cotizaciones.
  El shell privado se oculta y la vista monta su propio encabezado.

El estado del coche queda visible para el cliente en todo momento, lo que elimina las
llamadas de seguimiento; y la aprobación deja un registro firmado con nombre, fecha y
motivo, lo que elimina la disputa.

### 2.2 Flujo de negocio

```
recibido → diagnóstico → por aprobar (waiting) → reparación → listo → entregado
                ↑______________|  (rechazo de cotización)
```

- Crear una cotización mueve la orden a `por aprobar`.
- **Bloqueo:** mientras exista una cotización pendiente, la orden no puede avanzar a
  reparación, listo ni entregado (`changeStatus` lo rechaza en el store).
- Aprobar la cotización libera la orden hacia `reparación`; rechazarla la devuelve a
  `diagnóstico` y exige registrar el motivo.
- Toda decisión queda firmada: `signer`, `decidedAt`, `reason`.

### 2.3 Arquitectura

| Capa | Implementación | Archivo |
| --- | --- | --- |
| Enrutado | History mode (`createWebHistory`): URLs limpias sin `#`, con fallback del servidor a `index.html`; rutas con `meta.title` y `meta.public` | `src/router/index.ts` |
| Estado | Único store Pinia `workshop`: clientes, órdenes, cotizaciones, mecánicos, toasts; getters y acciones con las reglas del flujo | `src/stores/workshop.ts` |
| Contratos | Tipos `Status`, `Customer`, `Order`, `Quote`, mapa canónico `statuses` y formateadores `money`/`dateTime` (es-BO) | `src/types.ts` |
| Persistencia | `localStorage` clave `don-ramiro-workshop-v1`, con restauración validada y aviso si falla | `src/stores/workshop.ts` |
| UI | Componentes reutilizables accesibles (modal con focus-trap y Escape, badges, tarjetas, formulario de cotización) | `src/components/` |
| Visual | Sistema neumórfico por tokens CSS + tipografía Manrope (títulos) y DM Sans (texto/controles), servidas localmente | `src/style.css`, `src/responsive.css`, `DESIGN.md` |

**Fuera de alcance explícito:** backend, autenticación, inventario (se lleva en Excel),
envíos de WhatsApp/SMS, sincronización entre dispositivos y perfiles reales de acceso.

### 2.4 Decisiones de diseño clave

- **Celular primero, manos sucias:** acciones primarias ≥ 49 px, layout de una columna,
  sidebar convertido en panel desplegable bajo 760 px, sin scroll horizontal.
- **Registro explícito:** aprobar o rechazar siempre pasa por un diálogo que exige nombre
  y confirmación; el rechazo exige motivo. Nada se decide con un toque accidental.
- **Contraste propio de la neumorfía:** las sombras duales definen elevación y hundido;
  los textos y badges mantienen contraste independiente del fondo para legibilidad.

## 3. Criterios de aceptación verificables

Cada criterio es verificable con los tests E2E existentes (`npm run test:e2e`, proyectos
`desktop` 1440×1100 y `mobile` iPhone 13) más la inspección de los archivos indicados.

| # | Criterio | Verificación |
| --- | --- | --- |
| CA-1 | **Seguimiento sin llamadas.** Dado el enlace público `/seguimiento/:token`, el cliente ve el estado actual del vehículo, su bitácora y las cotizaciones pendientes sin iniciar sesión; el shell del taller no se muestra. Un token inválido muestra un estado de enlace no disponible. | Test `dashboard, navigation, filters and responsive layout` y `search, mechanic filter and unknown tracking link...`; ruta con `meta.public` en `src/router/index.ts`. |
| CA-2 | **Aprobación registrada e innegable.** Dada una cotización pendiente en el portal, al aprobarla el sistema exige nombre completo y confirmación; la decisión queda visible como «Aprobado por \<nombre\>», la orden avanza a *En reparación*, el botón de aprobar desaparece y el registro **persiste tras recargar** la página. | Test `client approval is explicit, recorded and persists after reload`; acción `decideQuote` en el store. |
| CA-3 | **Rechazo con motivo.** Dado un rechazo en el portal, el sistema registra firmante, fecha y motivo, el motivo queda visible en el registro de decisión y la orden vuelve a *En diagnóstico*. | Test `rejected quote records the reason and returns the vehicle to diagnosis`. |
| CA-4 | **Bloqueo de avance con cotización pendiente.** Mientras una orden tenga cotización pendiente, no se ofrece ni se ejecuta el avance a reparación, listo o entregado; la restricción se aplica en el store, no solo en la vista. | Test `new order, additional quote, customer approval and delivery work end to end` (verifica que el botón «Comenzar reparación» no existe tras cotizar); `changeStatus` en `src/stores/workshop.ts`. |
| CA-5 | **Uso real en celular con controles amplios.** En viewport móvil la navegación se abre como panel desplegable, los diálogos son operables por teclado (foco atrapado, Escape, devolución de foco) y ninguna pantalla presenta scroll horizontal; las acciones primarias miden ≥ 49 px. | Tests `navigation and dialogs support keyboard and mobile use` y el aserto `scrollWidth <= innerWidth` del primer test; variables de acción en `src/responsive.css`. |

## 4. Trazabilidad

| Criterio | Implementación | Test |
| --- | --- | --- |
| CA-1 | `src/views/TrackingView.vue`, `src/router/index.ts` (`meta.public`) | `workshop.spec.ts` tests 1 y 5 |
| CA-2 | `src/stores/workshop.ts` (`decideQuote`), `src/components/QuoteSummary.vue` | `workshop.spec.ts` test 2 |
| CA-3 | `src/stores/workshop.ts` (`decideQuote`), `src/components/QuoteForm.vue` | `workshop.spec.ts` test 3 |
| CA-4 | `src/stores/workshop.ts` (`changeStatus`, `createQuote`) | `workshop.spec.ts` test 4 |
| CA-5 | `src/responsive.css`, `src/components/AppModal.vue`, `src/App.vue` | `workshop.spec.ts` tests 1 y 6 |

## 5. Reglas de evolución

1. Un cambio funcional se escribe primero en esta spec (problema, diseño y criterios).
2. Los criterios de aceptación deben seguir siendo verificables por un test o una
   inspección de archivo explícita; si se propone uno nuevo, se agrega su test.
3. La UI usa obligatoriamente el sistema de marca descrito en `DESIGN.md` y en la skill
   `brand-design`; los tokens de `src/style.css` son la única fuente de color y sombra.
4. El inventario y el backend siguen fuera de alcance hasta que una nueva spec amplíe el
   problema.
