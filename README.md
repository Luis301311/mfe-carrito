# SaborUPC · mfe-carrito

**Equipo:** Pedidos · **Dueño:** Luis · **Puerto local:** 8082 · **Tecnología:** JavaScript puro

Guarda los platos agregados, calcula el total y confirma pedidos.

## Contrato

- `window.renderCarrito(idContenedor)` / `window.unmountCarrito(idContenedor)`
- Escucha: `carrito:agregar`
- Publica: `carrito:actualizado`, `pedido:confirmado`
- Se **precarga** desde el contenedor para no perder eventos.

## Cómo ejecutar

```bash
python -m http.server 8082
```

- http://localhost:8082 → modo independiente
- http://localhost:8082/contrato.html → prueba de contrato
