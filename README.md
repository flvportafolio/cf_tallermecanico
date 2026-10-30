# Don Ramiro · Tu taller, conectado

Frontend de gestión de un taller mecánico, diseñado para trabajar desde el celular y mantener al cliente informado sin llamadas. Interfaz neomórfica en español, con tipografía local, diseño adaptable y controles amplios.

El proyecto se desarrolla con **Spec Driven Development**: la especificación define el problema, la solución y los criterios de aceptación verificables; el código la implementa y los tests E2E la verifican. La fuente de verdad está en [`specs/taller-don-ramiro/spec.md`](specs/taller-don-ramiro/spec.md).

## Ejecutar

Requiere Node.js 22.12+ (verificado con Node 24).

```sh
npm install
npm run dev
```

Abre la dirección que indique Vite. Para compilar y previsualizar:

```sh
npm run build
npm run preview
```

## Stack

Vue 3 con Composition API, TypeScript estricto, Vue Router, Pinia y Vite. Iconos Lucide, fuentes Manrope y DM Sans alojadas en el proyecto. Las rutas usan hash para permitir alojamiento estático sin configuración de redirecciones.

## Flujo disponible

- Resumen con indicadores calculados, filtros, cotizaciones pendientes y carga de los cuatro mecánicos.
- Registro de órdenes, clientes, vehículo, motivo de ingreso, mecánico y fecha estimada.
- Estados: recibido, diagnóstico, por aprobar, reparación, listo y entregado.
- Bitácora de novedades visible para el cliente.
- Cotizaciones con varios conceptos, cantidades y precios en bolivianos.
- Portal de seguimiento por enlace individual, con aprobación o rechazo explícito, nombre, detalle, importe y fecha.
- Bloqueo del avance mientras existan cotizaciones pendientes.
- Clientes con búsqueda e historial, búsqueda de órdenes y filtro por responsable.
- Persistencia local, avisos, estados vacíos y manejo de enlaces inválidos.

Para probar la experiencia del cliente, abre una orden y selecciona **Ver portal del cliente**. También puedes visitar `/#/seguimiento/demo-1047`, que incluye una cotización pendiente.

## Alcance de la demo

Es exclusivamente frontend. Los datos iniciales son ficticios. Pinia guarda los cambios en `localStorage`, bajo la clave `don-ramiro-workshop-v1`. Para reiniciar la demo, elimina esa clave desde las herramientas del navegador y recarga.

No incluye backend, autenticación, inventario, envíos de WhatsApp/SMS ni sincronización entre dispositivos o pestañas abiertas. Los enlaces permiten recorrer la demo en este navegador; una instalación real debe resolver el vehículo y sus datos desde un servidor. Las aprobaciones locales demuestran el flujo y no constituyen un registro resistente a modificaciones: para producción se necesitan autorización por token, fecha del servidor y un historial inmutable de la cotización aceptada. Los perfiles de administrador/mecánico y cliente son vistas de demostración, no límites de acceso.

## Verificación

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas cubren escritorio y celular: navegación, filtros, ausencia de desbordamiento, creación y entrega de órdenes, publicación de novedades, aprobación/rechazo, persistencia y enlaces inválidos. Las capturas se guardan en `artifacts/`.

## Spec Driven Development

El flujo de trabajo es spec-first:

1. Toda change funcional se escribe primero en `specs/taller-don-ramiro/spec.md` (problema, diseño y criterios de aceptación).
2. Se implementa el código que satisface la spec sin salirse de ella.
3. Se verifica contra los criterios CA-1…CA-5 con `npm run test:e2e`.
4. Los cambios de UI respetan la marca de `DESIGN.md` y la skill `brand-design` (`.opencode/skills/brand-design/SKILL.md`), que OpenCode carga automáticamente al tocar vistas, componentes o CSS.

Fuera de alcance hasta que una nueva spec lo decida: backend, autenticación, inventario (ya en Excel), WhatsApp/SMS y sincronización entre dispositivos.

## Organización

- `specs/taller-don-ramiro/spec.md`: definición del problema, diseño de la solución y criterios de aceptación verificables (CA-1…CA-5) con trazabilidad a código y tests.
- `.opencode/skills/brand-design/SKILL.md`: skill de la marca neumórfica (tokens, tipografía, componentes, interacción móvil).
- `DESIGN.md`: documentación del sistema de diseño.
- `src/stores/workshop.ts`: datos de ejemplo, estado, persistencia y reglas del flujo.
- `src/views/`: resumen, órdenes, cotizaciones, clientes y seguimiento.
- `src/components/`: controles reutilizables, formularios, cotizaciones y tarjetas.
- `src/style.css` y `src/responsive.css`: sistema visual y adaptación a celulares.
- `src/types.ts`: contratos tipados, estados y formatos.
- `tests/workshop.spec.ts`: recorridos funcionales de extremo a extremo que verifican la spec.
