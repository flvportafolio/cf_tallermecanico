# Don Ramiro · Tu taller, conectado

Frontend de gestión de un taller mecánico, diseñado para trabajar desde el celular y mantener al cliente informado sin llamadas. Interfaz neomórfica en español, con tipografía local, diseño adaptable y controles amplios.

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

## Organización

- `src/stores/workshop.ts`: datos de ejemplo, estado, persistencia y reglas del flujo.
- `src/views/`: resumen, órdenes, cotizaciones, clientes y seguimiento.
- `src/components/`: controles reutilizables, formularios, cotizaciones y tarjetas.
- `src/style.css` y `src/responsive.css`: sistema visual y adaptación a celulares.
- `src/types.ts`: contratos tipados, estados y formatos.
- `tests/workshop.spec.ts`: recorridos funcionales de extremo a extremo.
