# SaborUPC · mfe-carrito

**Equipo:** Pedidos · **Dueño:** Luis · **Puerto local:** 8082 · **Tecnología:** JavaScript puro
**Versión:** 1.1.0

Guarda los platos agregados, calcula el total y confirma pedidos. Al confirmar publica
`pedido:confirmado` y vacía el carrito, para que `mfe-pedidos` pueda seguir el pedido.

## Contrato

| Aspecto | Detalle |
|---|---|
| Montaje | `window.renderCarrito(idContenedor)` / `window.unmountCarrito(idContenedor)` |
| Escucha | `carrito:agregar` |
| Publica | `carrito:actualizado` v1.0 · `pedido:confirmado` v1.0 |
| Precarga | Sí, el contenedor lo precarga para no perder `carrito:agregar` |

| Evento | detail |
|---|---|
| `carrito:agregar` (consume) | v1.1 `{ version, id, nombre, precio, categoria }` · v1.0 `{ id, nombre, precio }` |
| `carrito:actualizado` | `{ cantidad, total }` |
| `pedido:confirmado` | `{ version: '1.0', id, items: [{ id, nombre, precio, cantidad }], total, fecha }` |

### Compatibilidad hacia atrás

El carrito aplica la regla del contrato: **el consumidor ignora los campos que no conoce.**
`normalizarPlato()` extrae solo `id`, `nombre` y `precio`, así que:

- `carrito:agregar` v1.0 (`{ id, nombre, precio }`) funciona igual que v1.1.
- La `categoria` se guarda y se muestra solo si viene.
- Un `detail` incompleto o nulo se descarta sin romper nada.

Esto permite que el catálogo se actualice a v1.1 sin desplegar el carrito.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `carrito.js` | El micro frontend completo (IIFE, sin dependencias) |
| `index.html` | Modo independiente: simula `carrito:agregar` v1.0 y v1.1 |
| `contrato.html` | Prueba de contrato automática (✓/✗ en pantalla y `console.assert`) |

## Cómo ejecutar

```bash
python -m http.server 8082
```

- http://localhost:8082 → modo independiente (botones para simular v1.0, v1.1 y un detail inválido)
- http://localhost:8082/contrato.html → prueba de contrato

## Prueba de contrato

`contrato.html` corre **sin el contenedor** y verifica:

1. `window.renderCarrito` / `window.unmountCarrito` existen y son funciones.
2. `renderCarrito(id)` genera contenido y `unmountCarrito(id)` lo deja vacío.
3. `carrito:agregar` funciona con v1.0 y con v1.1, y conviven en la misma lista.
4. Un `detail` inválido se ignora sin cambiar el total.
5. `carrito:actualizado` publica `{ cantidad, total }` y queda en `{ 0, 0 }` tras confirmar.
6. `pedido:confirmado` publica exactamente la estructura del contrato, con `total` igual a la
   suma de los items y `fecha` válida.

## Estilos

Consume `http://localhost:8085/tokens.css` (el del equipo Plataforma) con respaldo en cada
variable: `var(--sabor-color-primario, #0b4f8a)`. Si el 8085 no está arriba, el micro frontend
igual se ve bien. Los colores que no tienen token en el contrato (borde de tabla, fondo del
encabezado) quedan fijos a propósito.
