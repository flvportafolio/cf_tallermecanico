# Sistema de diseño · Don Ramiro

## Dirección visual

Un taller cercano y profesional. Verde profundo para la identidad, superficies gris neutro y relieves suaves para distinguir áreas interactivas. El efecto neomórfico se concentra en tarjetas, botones y campos; los textos, etiquetas de estado y focos conservan contraste independiente de las sombras.

## Fundamentos

Los tokens principales están en `:root` de `src/style.css`.

| Token            | Función                                  |
| ---------------- | ---------------------------------------- |
| `--bg`           | Fondo del espacio de trabajo             |
| `--surface`      | Superficies elevadas                     |
| `--field`        | Fondo de campos y filtros hundidos       |
| `--ink`          | Texto principal                          |
| `--muted`        | Texto secundario                         |
| `--green`        | Acción principal e identidad             |
| `--line`         | Separadores y agrupaciones               |
| `--shadow`       | Elevación de tarjetas                    |
| `--shadow-small` | Elevación de controles                   |
| `--shadow-hover` | Elevación de tarjetas al pasar el cursor |
| `--inset`        | Superficies hundidas: campos y filtros   |

**Tipografía:** Manrope para encabezados y cifras; DM Sans para controles y lectura. Ambas son variables y se sirven localmente, sin depender de Google Fonts. Escala principal de títulos de 17 a 37 px, según jerarquía y dispositivo.

**Forma y espacio:** tarjetas de 14–23 px de radio; botones de 10–12 px; distribución basada en intervalos de 4–8 px, con márgenes mayores para separar tareas.

**Relieve:** fondo gris neutro `#dedede`, superficies `#e7e7e7` y campos `#dcdcdc`. Las sombras y luces usan grises sin matiz verde para distinguir tarjetas elevadas de controles hundidos. En la barra de órdenes, buscador y selectores comparten etiquetas superiores y una altura de 50 px.

**Color semántico:** verde para reparación y aprobación; ámbar para decisiones pendientes; azul para diagnóstico; menta para vehículos listos; rojo suave para rechazo. Todos los estados incluyen texto, además de color.

## Componentes

- `AppIcon`: conjunto centralizado de iconos Lucide con grosor consistente.
- `StatusBadge`: etiqueta semántica basada en el mapa de estados de `types.ts`.
- `OrderCard`: unidad clicable completa con vehículo, placa, cliente, estado y responsable.
- `AppModal`: diálogo con foco inicial, ciclo de teclado, Escape y devolución del foco al cerrar.
- `NewOrderModal` y `QuoteForm`: formularios con etiquetas visibles, campos nativos y validación.
- `QuoteSummary`: desglose y registro de la decisión reutilizado en el taller y el portal.
- Clases `.btn`, `.surface`, `.avatar`, `.filter-tabs`, `.notice` y `.timeline` para mantener consistencia entre vistas.

## Interacción móvil

La navegación lateral se convierte en un panel desplegable. Las tarjetas completas son pulsables. Las acciones principales de trabajo y aprobación tienen al menos 49 px de altura, con separación entre aprobar y rechazar. Los formularios usan el teclado telefónico y numérico cuando corresponde. Se respeta `prefers-reduced-motion` y se marca el foco visible.

## Textos de interfaz

Usa títulos que identifiquen la pantalla o la acción: «Nueva orden», «Cotizaciones», «Novedades». Evita eslóganes y subtítulos que repitan el encabezado. Los indicadores muestran etiqueta y cifra; los avisos confirman el resultado en una frase. Reserva las explicaciones para bloqueos, límites de la demo y decisiones del cliente. Conserva siempre el detalle, el importe y la autorización explícita al aprobar una cotización. La ayuda general permanece en «Guía rápida».

## Extensión

Añade los estados en `types.ts` y conserva etiquetas explícitas. Reutiliza `QuoteSummary` para mostrar el mismo importe y conceptos en todas las vistas. Toda mutación pasa por Pinia; las vistas calculan sus contadores a partir del estado, sin cifras duplicadas. No presentes una acción como finalizada si el store no pudo ejecutarla.
