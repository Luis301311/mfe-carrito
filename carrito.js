// Micro frontend: CARRITO  (equipo "Pedidos")
// Contrato: window.renderCarrito(idContenedor) / window.unmountCarrito(idContenedor)
// Escucha:  'carrito:agregar'      v1.1 { version, id, nombre, precio, categoria }
//                                  v1.0 { id, nombre, precio }            <- sigue funcionando
// Publica:  'carrito:actualizado'  v1.0 { cantidad, total }
//           'pedido:confirmado'    v1.0 { version, id, items, total, fecha }
(function () {
  const VERSION = '1.1.0';
  const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  // Estilos con respaldo: si tokens.css (puerto 8085) no está cargado, se usan estos valores.
  const CSS = `
    .car-titulo { color: var(--sabor-color-primario, #0b4f8a); margin: 0 0 4px; }
    .car-version { font-size: 12px; color: var(--sabor-color-texto, #5b6573); }
    .car-tabla { width: 100%; border-collapse: collapse; margin: var(--sabor-espacio-m, 16px) 0; background: var(--sabor-color-fondo, #ffffff); }
    .car-tabla th, .car-tabla td { padding: var(--sabor-espacio-s, 10px); border-bottom: 1px solid #e3e7ec; text-align: left; }
    /* El contrato no define un token para el fondo suave de encabezado: queda fijo. */
    .car-tabla th { background: #eef2f6; color: var(--sabor-color-primario, #0b4f8a); }
    .car-quitar { background: none; border: 1px solid var(--sabor-color-error, #c0392b); color: var(--sabor-color-error, #c0392b); border-radius: var(--sabor-radio, 4px); cursor: pointer; padding: 4px 8px; }
    .car-total { font-size: 20px; font-weight: bold; text-align: right; }
    .car-confirmar { background: var(--sabor-color-acento, #1b7a3e); color: var(--sabor-color-fondo, #ffffff); border: 0; padding: var(--sabor-espacio-s, 10px) var(--sabor-espacio-m, 18px); border-radius: var(--sabor-radio, 4px); cursor: pointer; float: right; margin-top: var(--sabor-espacio-s, 12px); font-family: var(--sabor-fuente, inherit); font-size: 15px; }
    .car-confirmar:hover { background: var(--sabor-color-primario, #0b4f8a); }
    .car-vacio { color: var(--sabor-color-texto, #5b6573); }
    .car-exito { background: var(--sabor-color-fondo, #eaf6ea); color: var(--sabor-color-acento, #1b7a3e); border-left: 4px solid var(--sabor-color-acento, #1b7a3e); padding: var(--sabor-espacio-s, 12px); border-radius: var(--sabor-radio, 4px); }
    .car-categoria { font-size: 11px; text-transform: uppercase; color: var(--sabor-color-secundario, #3e9f3a); display: block; }
  `;

  // ---- Estado propio del micro frontend (vive mientras el script esté cargado)
  const items = [];          // [{ id, nombre, precio, cantidad, categoria }]
  let idMontado = null;      // si está en pantalla, dónde
  let mensaje = '';
  let ultimoPedido = null;   // { id, fecha } del último pedido confirmado
  let secuenciaPedido = 0;

  function asegurarEstilos() {
    if (document.getElementById('car-estilos')) return;
    const s = document.createElement('style');
    s.id = 'car-estilos';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function total() {
    return items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  }

  function publicarEstado() {
    const cantidad = items.reduce((acc, it) => acc + it.cantidad, 0);
    window.dispatchEvent(new CustomEvent('carrito:actualizado', {
      detail: { cantidad: cantidad, total: total() }
    }));
  }

  // ---- Compatibilidad hacia atrás: normalizamos lo que llega de carrito:agregar.
  // v1.0 -> { id, nombre, precio }
  // v1.1 -> { version, id, nombre, precio, categoria }
  // El carrito SOLO usa id, nombre y precio; si no vienen, descarta el plato.
  function normalizarPlato(detalle) {
    if (!detalle || typeof detalle !== 'object') return null;
    if (detalle.id === undefined || detalle.nombre === undefined || detalle.precio === undefined) return null;
    return {
      id: detalle.id,
      nombre: String(detalle.nombre),
      precio: Number(detalle.precio),
      categoria: detalle.categoria !== undefined ? String(detalle.categoria) : null
    };
  }

  // El carrito escucha desde que se carga su script (por eso el contenedor lo precarga)
  window.addEventListener('carrito:agregar', function (e) {
    const plato = normalizarPlato(e.detail);
    if (!plato) return;
    const existente = items.find(it => it.id === plato.id);
    if (existente) {
      existente.cantidad += 1;
      if (!existente.categoria) existente.categoria = plato.categoria;
    } else {
      items.push({ id: plato.id, nombre: plato.nombre, precio: plato.precio, cantidad: 1, categoria: plato.categoria });
    }
    mensaje = '';
    publicarEstado();
    if (idMontado) pintar();
  });

  function pintar() {
    const raiz = document.getElementById(idMontado);
    let html = `<h2 class="car-titulo">Tu carrito</h2>
                <span class="car-version">mfe-carrito v${VERSION}</span>`;
    if (mensaje) html += `<p class="car-exito">${mensaje}</p>`;
    if (items.length === 0) {
      html += '<p class="car-vacio">El carrito está vacío. Agrega platos desde el catálogo.</p>';
    } else {
      html += `<table class="car-tabla">
        <tr><th>Plato</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
        ${items.map(it => `<tr>
            <td>${escapar(it.nombre)}${it.categoria ? `<span class="car-categoria">${escapar(it.categoria)}</span>` : ''}</td>
            <td>${it.cantidad}</td>
            <td>${pesos.format(it.precio * it.cantidad)}</td>
            <td><button class="car-quitar" data-id="${escapar(it.id)}">Quitar</button></td>
          </tr>`).join('')}
      </table>
      <div class="car-total">Total: ${pesos.format(total())}</div>
      <button class="car-confirmar">Confirmar pedido</button>`;
    }
    raiz.innerHTML = html;
  }

  function escapar(valor) {
    return String(valor).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function confirmarPedido() {
    if (items.length === 0) return;

    // Copia de los platos para el contrato (id, nombre, precio, cantidad)
    const itemsPedido = items.map(function (it) {
      return { id: it.id, nombre: it.nombre, precio: it.precio, cantidad: it.cantidad };
    });
    const monto = total();
    secuenciaPedido += 1;
    const pedido = {
      version: '1.0',
      id: secuenciaPedido,
      items: itemsPedido,
      total: monto,
      fecha: new Date().toISOString()
    };

    // Vaciamos ANTES de publicar para que quien escuche ya vea el carrito vacío
    items.length = 0;
    ultimoPedido = pedido;
    mensaje = `Pedido #${pedido.id} confirmado por ${pesos.format(monto)}. Míralo en Pedidos.`;
    publicarEstado();

    // Contrato pedido:confirmado v1.0 -> lo escucha mfe-pedidos
    window.dispatchEvent(new CustomEvent('pedido:confirmado', { detail: pedido }));

    if (idMontado) pintar();
  }

  function alHacerClic(e) {
    if (e.target.matches('.car-quitar')) {
      const i = items.findIndex(it => String(it.id) === String(e.target.dataset.id));
      if (i >= 0) items.splice(i, 1);
      mensaje = '';
      publicarEstado();
      pintar();
    } else if (e.target.matches('.car-confirmar')) {
      confirmarPedido();
    }
  }

  window.renderCarrito = function (idContenedor) {
    asegurarEstilos();
    const raiz = document.getElementById(idContenedor);
    if (!raiz) return;
    raiz.removeEventListener('click', alHacerClic);
    raiz.addEventListener('click', alHacerClic);
    idMontado = idContenedor;
    pintar();
  };

  window.unmountCarrito = function (idContenedor) {
    const raiz = document.getElementById(idContenedor);
    if (raiz) {
      raiz.removeEventListener('click', alHacerClic);
      raiz.innerHTML = '';
    }
    idMontado = null;
    mensaje = '';
  };

  // Solo para la prueba de contrato: permite leer el estado sin tocar el DOM.
  window.__carritoInterno = function () {
    return { version: VERSION, items: items.slice(), total: total(), ultimoPedido: ultimoPedido };
  };
})();
