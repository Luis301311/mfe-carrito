# SaborUPC 2.0 — mfe-carrito

**Dueño:** Luis · Equipo Pedidos
**Puerto:** 8082 · **Tecnología:** JavaScript puro · **Versión:** [verificar VERSION en carrito.js]

Micro frontend del carrito: guarda los platos agregados, muestra cantidades y total, permite quitar platos y confirmar el pedido.

## Cómo ejecutarlo

```bash
python -m http.server 8082
```

- `http://localhost:8082/` → modo independiente, con botones para simular eventos.
- `http://localhost:8082/contrato.html` → prueba de contrato automática.

## Contrato de montaje

| Función | Descripción |
|---|---|
| `window.renderCarrito(idContenedor)` | Monta el carrito. |
| `window.unmountCarrito(idContenedor)` | Desmonta y limpia. |

El contenedor lo **precarga** (`precargar: true`) para que escuche `carrito:agregar` aunque el usuario esté en el catálogo.

## Eventos

| Evento | Rol | Versión | detail |
|---|---|---|---|
| `carrito:agregar` | Escucha | 1.0 y 1.1 | `{ id, nombre, precio }` (+ `version`, `categoria` en 1.1) |
| `carrito:actualizado` | Publica | 1.0 | `{ cantidad, total }` |
| `pedido:confirmado` | Publica | 1.0 | `{ version: '1.0', id, items: [{ id, nombre, precio, cantidad }], total, fecha }` |

**Compatibilidad hacia atrás:** el carrito acepta `carrito:agregar` en versión 1.0 y 1.1. Ignora los campos que no conoce, así que cuando el catálogo agregó `categoria` no hubo que cambiar nada aquí.

Al confirmar el pedido, publica `pedido:confirmado`, vacía el carrito y publica `carrito:actualizado` con cantidad 0.

## Dependencias

| Dependencia | Origen |
|---|---|
| `tokens.css` | design-system (:8085), con valores de respaldo |

## Prueba de contrato (`contrato.html`)

Verifica sin el contenedor: que existan `renderCarrito` y `unmountCarrito`, que al montar aparezca contenido, que funcione con `carrito:agregar` v1.0 y v1.1, y que `carrito:actualizado` y `pedido:confirmado` cumplan su estructura.

## Aislamiento de estilos

Todas las clases usan el prefijo `car-`.
