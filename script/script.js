const listaPerfumes = document.getElementById("lista-perfumes");
const carritoContenedor = document.getElementById("carrito");
const totalSpan = document.getElementById("total");
const formPedido = document.getElementById("formPedido");

let carrito = [];

const inputNombre = document.getElementById("nombre");
const inputTelefono = document.getElementById("telefono");
const inputDireccion = document.getElementById("direccion");

fetch("data/productos.json")
  .then((res) => res.json())
  .then((productos) => {
    console.log("productos desde json:", productos);

    productos.forEach(producto => {
      const div = document.createElement("div");
      div.classList.add("perfume");
      div.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" />
        <h2>${producto.nombre}</h2>
        <p>${producto.descripcion}</p>
        <p><strong>$${producto.precio}</strong></p>
        <form class="form-producto">
          <label for="cantidad-${producto.id}">Cantidad:</label>
          <input type="number" id="cantidad-${producto.id}" name="cantidad" min="1" value="1" required>
          <button type="submit">Agregar al carrito</button>
        </form>
      `;

      const form = div.querySelector(".form-producto");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const cantidad = parseInt(form.querySelector("input").value);
        agregarAlCarrito(producto, cantidad);
        form.reset();
      });

      listaPerfumes.appendChild(div);
    });
  })
  .catch((error) => {
    console.error("Error al cargar productos.json:", error);
  });

const carritoGuardado = localStorage.getItem("carrito");
if (carritoGuardado) {
  carrito = JSON.parse(carritoGuardado);
  actualizarCarrito();
}

inputNombre.value = localStorage.getItem("form_nombre") || "";
inputTelefono.value = localStorage.getItem("form_telefono") || "";
inputDireccion.value = localStorage.getItem("form_direccion") || "";

[inputNombre, inputTelefono, inputDireccion].forEach(input => {
  input.addEventListener("input", () => {
    localStorage.setItem(`form_${input.id}`, input.value.trim());
  });
});

function agregarAlCarrito(producto, cantidad) {
  const existente = carrito.find(p => p.id === producto.id);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }
  actualizarCarrito();
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter(item => item.id !== idProducto);
  actualizarCarrito();
}

function actualizarCarrito() {
  carritoContenedor.innerHTML = "";
  let total = 0;

  carrito.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item-carrito");

    div.innerHTML = `
      <span>${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}</span>
      <button class="btn-eliminar" data-id="${item.id}">Eliminar</button>
    `;

    carritoContenedor.appendChild(div);
    total += item.precio * item.cantidad;

    div.querySelector(".btn-eliminar").addEventListener("click", () => {
      eliminarDelCarrito(item.id);
    });
  });

  totalSpan.textContent = `Total: $${total}`;
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

formPedido.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const direccion = inputDireccion.value.trim();

  if (carrito.length === 0) {
    carritoContenedor.innerHTML = "<p style='color:red;'>Agrega al menos un producto al carrito.</p>";
    return;
  }

  if (!nombre || !telefono || !direccion) {
    carritoContenedor.innerHTML = "<p style='color:red;'>Por favor, completa todos los datos del cliente.</p>";
    return;
  }

  const resumen = {
    cliente: { nombre, telefono, direccion },
    pedido: carrito,
  };

  console.log("Pedido confirmado:", resumen);

  formPedido.reset();
  carrito = [];
  actualizarCarrito();

  localStorage.removeItem("carrito");
  localStorage.removeItem("form_nombre");
  localStorage.removeItem("form_telefono");
  localStorage.removeItem("form_direccion");

  carritoContenedor.innerHTML = "<p style='color:green;'>¡Pedido realizado con éxito!</p>";
});
