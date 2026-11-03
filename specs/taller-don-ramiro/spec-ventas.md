# Spec: Ventas — captura y cobro (Taller Don Ramiro)

| Campo | Valor |
| --- | --- |
| Estado | Aprobada · implementada |
| Alcance | Solo frontend, lógica **hardcodeada en memoria** (sin backend, sin persistencia) |
| Predecesora | [`spec.md`](spec.md) (sistema base) · [`personas.md`](personas.md) (ICP y perfiles) |
| Ruta prevista | `/ventas/nueva` + entrada en el menú lateral |
| Verificación prevista | Tests E2E en `tests/sales.spec.ts` (CA-V1…CA-V5) |

---

## 1. Definición del problema

El sistema base cubre el seguimiento y la aprobación de reparaciones, pero **el cobro
sigue siendo informal**: no hay registro de qué se cobró, a quién, con qué medio de pago
ni en qué fecha. En un taller que ya opera por montos aprobados en el portal, el último
paso del flujo —recibir el dinero— queda fuera de sistema:

- Los pagos en efectivo, QR o tarjeta no dejan rastro estructurado; si al dueño le
  preguntan qué cobró el martes, depende de su memoria o del cuaderno.
- Cuando un trabajo mezcla reparación y productos (filtros, pastillas), el cobro se
  anota a mano y no hay forma de reconstruir el detalle.
- No existe comprobante básico que el cliente pueda conservar ni que el taller pueda
  consultar después.

Se necesita una pantalla de venta **sencilla** que registre el cobro con cabecera
completa, detalle de ítems con total calculado y hasta dos formas de pago, sin tocar el
control de inventario (sigue en Excel).

## 2. Diseño de la solución

### 2.1 Idea central

Una única pantalla de captura: **cabecera → tabla de ítems → glosa → bloque de cobro**.
La venta se calcula en memoria, valida contra las reglas y al confirmar muestra una
confirmación; no persiste (se resetea el formulario). El catálogo de productos y
servicios es una lista hardcodeada; los clientes se eligen desde los existentes en el
store `workshop`.

### 2.2 Evaluación UI/UX: estilo POS vs. normal

| Criterio | Estilo POS (clásico) | Estilo normal (factura/formulario) |
| --- | --- | --- |
| Cabecera de 6 campos (cliente, fecha, moneda, TC, sucursal, vendedor) | Los oculta o reduce, pero el usuario la exige | Encaja de forma natural |
| Tabla con columnas nro / ítem / cant. / precio / subtotal | No existe (usa grilla de botones de producto) | Es su modelo por excelencia |
| Glosa | Rara vez presente | Campo estándar |
| Velocidad con manos sucias | **Excelente**: botones grandes, flujo lineal | Depende del diseño |
| Coherencia con la app actual (neumorfía, `NewOrderModal`, `QuoteForm`) | Aporta un patrón nuevo a mantener | **Reutiliza** tokens y patrones ya construidos |
| Catálogo sin inventario real | La grilla exige mantener stock/precios visibles | Un combo que agrega filas basta |

**Decisión: predominio *normal* con bloque de cobro estilo POS.**
Se adopta el esquema de factura (cabecera + tabla de líneas + glosa) porque es lo que el
requisito describe y mantiene la coherencia visual con la app; pero el **bloque de pago
se diseña con espíritu POS**: total grande y siempre visible, métodos de pago como botones
segmentados de ≥ 49 px, una sola columna de confirmación y cero tecleo innecesario fuera
de montos y cantidades.

### 2.3 Flujo

```
Elegir cliente → fecha/moneda/sucursal (TC y vendedor bloqueados)
      → agregar ítems (catálogo) → cantidades/precios → glosa
      → elegir 1 o 2 formas de pago → suma = total → Registrar venta
                                                        ↓
                                            confirmación + reset del formulario
```

### 2.4 Campos de la pantalla

**Cabecera (los marcados ⛔ son bloqueados: `readonly`/`disabled`, sin edición):**

| Campo | Tipo | Comportamiento |
| --- | --- | --- |
| N.° de venta ⛔ | texto | Autogenerado correlativo (`VTA-0001`…) |
| Cliente | combo | Obligatorio; opciones desde `store.customers` + estado vacío inicial |
| Fecha | date | Seleccionable, por defecto hoy |
| Moneda | combo | `Bs` / `USD` |
| TC (tipo de cambio) ⛔ | número | Calculado de la moneda: `1.00` si Bs, `6.96` si USD (hardcodeado) |
| Sucursal | combo | Seleccionable; opciones hardcodeadas (p. ej. `Central`, `Norte`) |
| Vendedor ⛔ | texto | Fijo del perfil de la sesión (`Ramiro`) |

**Detalle de ítems** (tabla):

| Columna | Regla |
| --- | --- |
| Nro. | Correlativo de fila (1, 2, 3…) |
| Ítem | Nombre de producto o servicio; se elige en un combo que **agrega una fila** con cantidad 1 y su precio del catálogo |
| Cantidad | Editable, entero ≥ 1 |
| Precio unitario | Editable, número > 0 (permite precio acordado) |
| Subtotal | Calculado: `cantidad × precio unitario` (solo lectura) |
| (Quitar) | Elimina la fila |

- **Total = suma de todos los subtotales**, mostrado al pie del bloque de resumen y
  recalculado en vivo ante cualquier cambio de fila.
- Estado vacío: «Agrega productos o servicios».

**Glosa:** textarea opcional (detalle del cobro, referencia del trabajo, notas).

**Otros campos que se consideran necesarios:**

- Combo de **búsqueda/agregación de ítems** con catálogo hardcodeado (servicios de
  taller: cambio de aceite, revisión de frenos, alineación…; productos: filtro de aceite,
  pastillas de freno…). **No controla stock.**
- **Bloque de cobro:** método de pago (segmentado de 4 opciones) + monto; botón «+ otra
  forma de pago» habilitado solo si hay menos de 2; acción para quitar un método.
- **Validación visible** y botón «Registrar venta» deshabilitado hasta que pase.
- **Confirmación** al registrar (toast + reset), patrón ya usado en la app.

### 2.5 Formas de pago (máximo 2)

| Método | Campo adicional | Nota |
| --- | --- | --- |
| Efectivo | monto | — |
| Pago por QR | monto | Muestra referencia/QR estático hardcodeado (demo) |
| Tarjeta de débito | monto | — |
| Gift card | monto | — |

**Reglas (hardcodeadas, en memoria):**

1. Se admite **1 o 2** métodos; nunca 3 (el botón de agregar se oculta/deshabilita).
2. Cada monto debe ser un número > 0.
3. **La suma de los montos debe ser exactamente igual al total** de la tabla.
4. El botón «Registrar venta» solo se habilita con: cliente elegido, ≥ 1 fila, montos
   válidos y suma exacta.
5. Al registrar: confirmación y reseteo; **sin persistencia** (ni localStorage ni
   backend).

### 2.6 Arquitectura prevista

| Capa | Implementación prevista | Archivo |
| --- | --- | --- |
| Ruta | `/ventas/nueva`, `meta.title: 'Nueva venta'` (sin `public`) | `src/router/index.ts` |
| Menú | Entrada «Ventas» en el array `nav` | `src/App.vue` |
| Estado | Store Pinia `sales` con catálogo, correlativo y venta en curso | `src/stores/sales.ts` |
| Contratos | Tipos `SaleItem`, `Sale`, `PaymentMethod` + helpers de total | `src/types.ts` |
| UI | Vista + componentes reutilizando `AppModal`, `AppIcon`, tokens existentes | `src/views/SalesView.vue`, `src/components/` |
| Marca | Obedece la skill `brand-design` (tokens, ≥ 49 px, sin hex sueltos) | `.opencode/skills/brand-design/` |

### 2.7 Decisiones de diseño clave

- **Sencillez por encima de todo:** sin impuestos, descuentos ni totales en texto; el
  total es literalmente la suma de las filas, como se definió.
- **Campos bloqueados visibles, no ocultos:** TC y vendedor se muestran con su valor
  para que el operador entienda de dónde sale el monto.
- **Cobro sin fricción:** el bloque de pago es lo último que se toca; los métodos son
  botones grandes, no un select.
- **Móvil primero:** en pantalla chica la tabla se adapta sin scroll horizontal y el
  total permanece visible junto al botón de confirmación.

## 3. Criterios de aceptación verificables

Verificación prevista con Playwright (`tests/sales.spec.ts`), proyectos `desktop` y
`mobile`, más inspección de archivo.

| # | Criterio | Verificación |
| --- | --- | --- |
| CA-V1 | **Cabecera completa y campos bloqueados.** El cliente se elige desde un combo (obligatorio); fecha y sucursal son seleccionables; **TC y vendedor aparecen bloqueados** (no editables) con valores derivados (`1.00`/`6.96` según moneda; vendedor fijo); la moneda se cambia entre Bs y USD. | Test E2E: cambiar moneda actualiza TC, intento de edición de TC/vendedor no altera su valor. |
| CA-V2 | **Tabla de ítems y total.** La tabla muestra las columnas **nro, ítem, cantidad, precio unitario y subtotal**; cada subtotal es `cantidad × precio unitario`; **el total es la suma exacta de todos los subtotales** y se recalcula en vivo al editar cantidades, precios, agregar o quitar filas. | Test E2E: editar cantidad → subtotal y total correctos; quitar fila → total se reduce. |
| CA-V3 | **Glosa y campos complementarios.** Existe campo **glosa** escribible; el N.° de venta es correlativo y bloqueado; el combo de ítems agrega filas desde un catálogo de productos/servicios con estado vacío inicial. | Test E2E: escribir glosa, verificar `VTA-000x` bloqueado, agregar ítem del catálogo. |
| CA-V4 | **Hasta dos formas de pago con validación.** Se pueden elegir efectivo, QR, tarjeta de débito o gift card; se admite **1 o 2 métodos** y no se permite un tercero; la suma de montos debe ser **igual al total** para habilitar «Registrar venta»; al registrar se muestra confirmación y el formulario se resetea. | Test E2E: suma incorrecta → botón deshabilitado; corregir → habilita y registra; intento de 3.er método bloqueado. |
| CA-V5 | **UI sencilla usable en celular.** En viewport móvil (390 px) no hay scroll horizontal, las acciones de cobro miden ≥ 49 px, el total es visible sin hacer scroll y la pantalla sigue la marca neumórfica (sin colores fuera de tokens). | Test E2E con asertos `scrollWidth <= innerWidth`; inspección de tokens y medidas. |

## 4. Trazabilidad (prevista)

| Criterio | Implementación | Test |
| --- | --- | --- |
| CA-V1 | `SalesView.vue` (cabecera), `stores/sales.ts` (TC y vendedor) | `sales.spec.ts` |
| CA-V2 | Tabla de ítems, helpers de subtotal/total | `sales.spec.ts` |
| CA-V3 | Combo de catálogo, campo glosa, correlativo | `sales.spec.ts` |
| CA-V4 | Bloque de cobro y validación en el store | `sales.spec.ts` |
| CA-V5 | `responsive.css` (sección ventas) + `brand-design` | `sales.spec.ts` (proyecto mobile) |

## 5. Fuera de alcance y reglas de evolución

**Fuera de alcance explícito:**

- **Control de inventario y stock** (sigue en Excel): el catálogo es estático y no
  descuenta unidades.
- Impuestos (IVA), descuentos, notas de crédito, anulaciones y devoluciones.
- Listado/historial de ventas y cierre de caja.
- Persistencia real, backend, impresión de comprobantes y envío al cliente.
- Integración automática con cotizaciones aprobadas (un trabajo aprobado se cobra
  capturando su detalle manualmente).

**Reglas de evolución:**

1. Todo cambio funcional de esta pantalla se escribe primero aquí, con su criterio
   verificable (CA-V…), antes de implementar.
2. La UI usa obligatoriamente la skill `brand-design` y los tokens existentes; nada de
   hex sueltos ni estilos paralelos.
3. Si en el futuro se requiere persistencia, IVA o listado de ventas, se abre una spec
   nueva que amplíe el problema; esta spec no se edita en silencio.
