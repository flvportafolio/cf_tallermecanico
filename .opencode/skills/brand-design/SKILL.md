---
name: Brand Design
description: Usa esta skill al crear o modificar UI de Don Ramiro (taller mecánico). Define la marca neumórfica: tokens de color/sombra, tipografía Manrope + DM Sans, forma, color semántico, componentes y reglas de interacción móvil. Obligatoria antes de tocar cualquier vista, componente o CSS.
---

# Marca · Don Ramiro

Sistema de diseño **neumórfico** para el taller de Don Ramiro. Fuente de verdad:
`DESIGN.md` y los tokens de `:root` en `src/style.css`. Si doc y código difieren,
manda el código; corrige la doc.

## Principio rector

Un taller cercano y profesional: verde profundo para identidad, superficies gris
neutro y relieves suaves que separan áreas interactivas. El relieve **no es
decoración**: distingue lo elevado (accionable) de lo hundido (entrada de datos).
Textos, badges y focos mantienen contraste **independiente** de las sombras.

## Tokens (no inventes valores nuevos)

Definidos en `:root` de `src/style.css`. Úsalos siempre; nunca colores hex sueltos.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#dedede` | Fondo del espacio de trabajo |
| `--surface` | `#e7e7e7` | Superficies elevadas (tarjetas, paneles) |
| `--field` | `#dcdcdc` | Campos y filtros hundidos |
| `--ink` | `#303030` | Texto principal |
| `--muted` | `#666666` | Texto secundario |
| `--green` | `#274f3e` | Acción principal e identidad |
| `--line` | `#cccccc` | Separadores |
| `--shadow` | `8px 8px 18px #b9b9b9, -8px -8px 18px #fafafa` | Elevación de tarjetas |
| `--shadow-small` | `4px 4px 9px #bdbdbd, -4px -4px 9px #f9f9f9` | Elevación de controles |
| `--shadow-hover` | `10px 10px 22px #b0b0b0, -8px -8px 20px #fafafa` | Tarjetas al pasar el cursor |
| `--inset` | `inset 4px 4px 8px #bebebe, inset -4px -4px 8px #f5f5f5` | Superficies hundidas |

Regla de sombras: son grises **sin matiz verde**. Si añades un estado elevado u
hundido nuevo, deriva de estas grises; no teñas la sombra con `--green`.

## Tipografía

- **Manrope** (variable): encabezados y cifras.
- **DM Sans** (variable): controles, lectura y cuerpo.
- Ambas se sirven localmente vía `@fontsource-variable/*`; **no** cargar Google Fonts.
- Escala de títulos 17–37 px según jerarquía y dispositivo.

## Forma y espacio

- Radios: tarjetas 14–23 px; botones 10–12 px.
- Intervalos de 4–8 px; márgenes mayores solo para separar tareas distintas.
- Buscador, selectores y barra de órdenes comparten etiqueta superior y altura de 50 px.

## Color semántico (siempre acompañado de texto)

| Significado | Color |
| --- | --- |
| Reparación / aprobación | verde |
| Decisión pendiente | ámbar |
| Diagnóstico | azul |
| Vehículo listo | menta |
| Rechazo | rojo suave |

Nunca comuniques estado solo con color: cada estado lleva etiqueta legible. Los
estados y sus etiquetas viven en el mapa `statuses` de `src/types.ts`; añade ahí
cualquier estado nuevo.

## Componentes reutilizables (úsolos, no los dupliques)

- `AppIcon`: iconos Lucide con grosor consistente (stroke 1.7).
- `StatusBadge`: badge semántico desde `statuses`.
- `OrderCard`: tarjeta completa clicable (vehículo, placa, cliente, estado, responsable).
- `AppModal`: diálogo con foco inicial, ciclo Tab, Escape y devolución de foco.
- `NewOrderModal`, `QuoteForm`: formularios con etiquetas visibles y validación.
- `QuoteSummary`: desglose y registro de decisión (taller y portal).
- Clases globales `.btn` (`.primary`/`.secondary`/`.danger`), `.surface`, `.avatar`,
  `.filter-tabs`, `.notice`, `.timeline`, `.badge`.

## Interacción móvil (contexto obligatorio)

Los mecánicos usan **celular con las manos sucias**. Esto gana sobre estética:

- Acciones primarias de trabajo y aprobación: **≥ 49 px** de altura.
- Separación clara entre **Aprobar** y **No aprobar** (evitar toques accidentales).
- Navegación lateral → panel desplegable con backdrop; tarjetas pulsables completas.
- Formularios con teclado numérico/teléfónico donde corresponde.
- Respetar `prefers-reduced-motion`; foco visible siempre (`outline` verde medio).

## Textos de interfaz

En español. Títulos que identifiquen pantalla o acción («Nueva orden», «Cotizaciones»,
«Novedades»); sin eslóganes ni subtítulos que repitan el encabezado. Indicadores con
etiqueta y cifra; avisos que confirmen en una frase. Conserva siempre detalle, importe
y autorización explícita al aprobar una cotización.

## Checklist antes de dar por hecha una UI

1. ¿Todos los colores/sombras salen de tokens (sin hex sueltos)?
2. ¿Cada estado lleva texto además de color?
3. ¿Las acciones primarias miden ≥ 49 px y hay separación entre opuestas?
4. ¿Se reutilizan `AppModal`, `StatusBadge`, `OrderCard`, `QuoteSummary` en vez de
   reimplementar?
5. ¿Todo pasa por el store de Pinia y las vistas calculan sus cifras del estado?
6. ¿Se ve bien en viewport de 390 px sin scroll horizontal?
