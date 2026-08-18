"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const formularioVacio = {
  name: "",
  category: "Celulares",
  description: "",
  price: "",
  old_price: "",
  stock: "",
  badge: "",
  visible: true,
  featured: false,
  image_url: "",
};

export default function AdminPage() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeLogin, setMensajeLogin] = useState("");

  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [archivo, setArchivo] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    revisarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      setCargando(false);

      if (session?.user) {
        cargarProductos();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function revisarSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUsuario(session?.user ?? null);
    setCargando(false);

    if (session?.user) {
      cargarProductos();
    }
  }

  async function iniciarSesion(e) {
    e.preventDefault();
    setMensajeLogin("Ingresando...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensajeLogin("Email o contraseña incorrectos.");
      return;
    }

    setUsuario(data.user);
    setMensajeLogin("");
    cargarProductos();
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    setUsuario(null);
    setProductos([]);
  }

  async function cargarProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensaje("No se pudieron cargar los productos.");
      return;
    }

    setProductos(data || []);
  }

  function cambiarCampo(e) {
    const { name, value, type, checked } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioVacio);
    setArchivo(null);
    setEditandoId(null);
    setMensaje("");
  }

  async function subirImagen() {
    if (!archivo) {
      return formulario.image_url || "";
    }

    const extension = archivo.name.split(".").pop();
    const nombreSeguro = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("productos")
      .upload(nombreSeguro, archivo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error("No se pudo subir la imagen.");
    }

    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(nombreSeguro);

    return data.publicUrl;
  }

  async function guardarProducto(e) {
    e.preventDefault();

    if (!formulario.name.trim()) {
      setMensaje("Ingresá el nombre del producto.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const imageUrl = await subirImagen();

      const producto = {
        name: formulario.name.trim(),
        category: formulario.category,
        description: formulario.description.trim(),
        price:
          formulario.price === "" ? null : Number(formulario.price),
        old_price:
          formulario.old_price === ""
            ? null
            : Number(formulario.old_price),
        stock:
          formulario.stock === "" ? 0 : Number(formulario.stock),
        badge: formulario.badge.trim(),
        visible: formulario.visible,
        featured: formulario.featured,
        image_url: imageUrl,
      };

      if (editandoId) {
        const { error } = await supabase
          .from("productos")
          .update(producto)
          .eq("id", editandoId);

        if (error) throw error;

        setMensaje("Producto actualizado correctamente.");
      } else {
        const { error } = await supabase
          .from("productos")
          .insert(producto);

        if (error) throw error;

        setMensaje("Producto creado correctamente.");
      }

      limpiarFormulario();
      await cargarProductos();
    } catch (error) {
      console.error(error);
      setMensaje(
        error?.message || "Ocurrió un error al guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  function editarProducto(producto) {
    setEditandoId(producto.id);

    setFormulario({
      name: producto.name || "",
      category: producto.category || "Celulares",
      description: producto.description || "",
      price: producto.price ?? "",
      old_price: producto.old_price ?? "",
      stock: producto.stock ?? "",
      badge: producto.badge || "",
      visible: producto.visible ?? true,
      featured: producto.featured ?? false,
      image_url: producto.image_url || "",
    });

    setArchivo(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("No se pudo eliminar el producto.");
      return;
    }

    setMensaje("Producto eliminado.");
    cargarProductos();
  }

  async function cambiarVisible(producto) {
    const { error } = await supabase
      .from("productos")
      .update({
        visible: !producto.visible,
      })
      .eq("id", producto.id);

    if (!error) cargarProductos();
  }

  async function cambiarDestacado(producto) {
    const { error } = await supabase
      .from("productos")
      .update({
        featured: !producto.featured,
      })
      .eq("id", producto.id);

    if (!error) cargarProductos();
  }

  function formatearPrecio(precio) {
    if (precio === null || precio === undefined) {
      return "Sin precio";
    }

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(precio));
  }

  if (cargando) {
    return (
      <main style={styles.pagina}>
        <p style={{ color: "#fff" }}>Cargando...</p>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main style={styles.pagina}>
        <div style={styles.loginPanel}>
          <div style={styles.logo}>V</div>

          <p style={styles.subtitulo}>
            VALENTINO TECNOLOGÍA
          </p>

          <h1 style={styles.titulo}>
            Administración
          </h1>

          <p style={styles.texto}>
            Ingresá con tu usuario administrador
          </p>

          <form
            onSubmit={iniciarSesion}
            style={styles.formulario}
          >
            <label style={styles.label}>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            <label style={styles.label}>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={styles.input}
              required
            />

            <button
              style={styles.botonRojo}
              type="submit"
            >
              INGRESAR
            </button>

            {mensajeLogin && (
              <p style={styles.error}>
                {mensajeLogin}
              </p>
            )}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.admin}>
      <header style={styles.header}>
        <div style={styles.marca}>
          <div style={styles.logoPequeno}>
            V
          </div>

          <div>
            <strong style={styles.marcaTitulo}>
              VALENTINO
            </strong>

            <small style={styles.marcaSubtitulo}>
              ADMINISTRACIÓN
            </small>
          </div>
        </div>

        <div style={styles.usuario}>
          <span>{usuario.email}</span>

          <button
            style={styles.botonSecundario}
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={styles.contenedor}>
        <section style={styles.tarjeta}>
          <p style={styles.subtitulo}>
            GESTIÓN DE PRODUCTOS
          </p>

          <h1 style={styles.tituloAdmin}>
            {editandoId
              ? "Editar producto"
              : "Agregar producto"}
          </h1>

          <form
            onSubmit={guardarProducto}
            style={styles.formulario}
          >
            <div style={styles.gridDos}>
              <div>
                <label style={styles.label}>
                  Nombre
                </label>

                <input
                  name="name"
                  value={formulario.name}
                  onChange={cambiarCampo}
                  style={styles.input}
                  placeholder="Ej: Parlante Bluetooth"
                  required
                />
              </div>

              <div>
                <label style={styles.label}>
                  Categoría
                </label>

                <select
                  name="category"
                  value={formulario.category}
                  onChange={cambiarCampo}
                  style={styles.input}
                >
                  <option>Celulares</option>
                  <option>Parlantes</option>
                  <option>Auriculares</option>
                  <option>Accesorios</option>
                  <option>Gamer</option>
                  <option>Otros</option>
                </select>
              </div>
            </div>

            <div>
              <label style={styles.label}>
                Descripción
              </label>

              <textarea
                name="description"
                value={formulario.description}
                onChange={cambiarCampo}
                style={styles.textarea}
                placeholder="Descripción del producto"
              />
            </div>

            <div style={styles.gridTres}>
              <div>
                <label style={styles.label}>
                  Precio
                </label>

                <input
                  type="number"
                  name="price"
                  value={formulario.price}
                  onChange={cambiarCampo}
                  style={styles.input}
                  placeholder="50000"
                />
              </div>

              <div>
                <label style={styles.label}>
                  Precio anterior
                </label>

                <input
                  type="number"
                  name="old_price"
                  value={formulario.old_price}
                  onChange={cambiarCampo}
                  style={styles.input}
                  placeholder="65000"
                />
              </div>

              <div>
                <label style={styles.label}>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formulario.stock}
                  onChange={cambiarCampo}
                  style={styles.input}
                  placeholder="10"
                />
              </div>
            </div>

            <div style={styles.gridDos}>
              <div>
                <label style={styles.label}>
                  Etiqueta
                </label>

                <input
                  name="badge"
                  value={formulario.badge}
                  onChange={cambiarCampo}
                  style={styles.input}
                  placeholder="OFERTA"
                />
              </div>

              <div>
                <label style={styles.label}>
                  Foto del producto
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setArchivo(
                      e.target.files?.[0] || null
                    )
                  }
                  style={styles.inputArchivo}
                />
              </div>
            </div>

            {formulario.image_url && (
              <div>
                <p style={styles.label}>
                  Imagen actual
                </p>

                <img
                  src={formulario.image_url}
                  alt="Producto"
                  style={styles.preview}
                />
              </div>
            )}

            <div style={styles.checks}>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="visible"
                  checked={formulario.visible}
                  onChange={cambiarCampo}
                />
                Visible en la tienda
              </label>

              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formulario.featured}
                  onChange={cambiarCampo}
                />
                Producto destacado
              </label>
            </div>

            <div style={styles.acciones}>
              <button
                type="submit"
                style={styles.botonRojo}
                disabled={guardando}
              >
                {guardando
                  ? "GUARDANDO..."
                  : editandoId
                  ? "GUARDAR CAMBIOS"
                  : "AGREGAR PRODUCTO"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  style={styles.botonSecundario}
                  onClick={limpiarFormulario}
                >
                  CANCELAR
                </button>
              )}
            </div>

            {mensaje && (
              <p style={styles.mensaje}>
                {mensaje}
              </p>
            )}
          </form>
        </section>

        <section style={styles.tarjeta}>
          <div style={styles.encabezadoLista}>
            <div>
              <p style={styles.subtitulo}>
                CATÁLOGO
              </p>

              <h2 style={styles.tituloLista}>
                Productos
              </h2>
            </div>

            <div style={styles.contador}>
              {productos.length} productos
            </div>
          </div>

          <div style={styles.lista}>
            {productos.length === 0 ? (
              <p style={styles.texto}>
                No hay productos cargados.
              </p>
            ) : (
              productos.map((producto) => (
                <div
                  key={producto.id}
                  style={styles.productoFila}
                >
                  <div style={styles.productoImagenCaja}>
                    {producto.image_url ? (
                      <img
                        src={producto.image_url}
                        alt={producto.name}
                        style={styles.productoImagen}
                      />
                    ) : (
                      <span style={{ fontSize: 35 }}>
                        📦
                      </span>
                    )}
                  </div>

                  <div style={styles.productoInfo}>
                    <strong style={styles.productoNombre}>
                      {producto.name}
                    </strong>

                    <span style={styles.productoCategoria}>
                      {producto.category}
                    </span>

                    <span style={styles.productoPrecio}>
                      {formatearPrecio(
                        producto.price
                      )}
                    </span>

                    <span style={styles.productoStock}>
                      Stock: {producto.stock ?? 0}
                    </span>
                  </div>

                  <div style={styles.estado}>
                    <span
                      style={{
                        ...styles.badgeEstado,
                        background: producto.visible
                          ? "#163d25"
                          : "#3d1717",
                        color: producto.visible
                          ? "#74f39d"
                          : "#ff8686",
                      }}
                    >
                      {producto.visible
                        ? "VISIBLE"
                        : "OCULTO"}
                    </span>

                    {producto.featured && (
                      <span style={styles.destacado}>
                        ★ DESTACADO
                      </span>
                    )}
                  </div>

                  <div style={styles.botonesFila}>
                    <button
                      style={styles.botonMini}
                      onClick={() =>
                        editarProducto(producto)
                      }
                    >
                      Editar
                    </button>

                    <button
                      style={styles.botonMini}
                      onClick={() =>
                        cambiarVisible(producto)
                      }
                    >
                      {producto.visible
                        ? "Ocultar"
                        : "Mostrar"}
                    </button>

                    <button
                      style={styles.botonMini}
                      onClick={() =>
                        cambiarDestacado(producto)
                      }
                    >
                      {producto.featured
                        ? "Quitar destacado"
                        : "Destacar"}
                    </button>

                    <button
                      style={styles.botonEliminar}
                      onClick={() =>
                        eliminarProducto(producto.id)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const styles = {
  pagina: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, #4b1111 0%, #171717 35%, #080808 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "25px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  loginPanel: {
    width: "100%",
    maxWidth: "460px",
    background: "#151515",
    border: "1px solid #333",
    borderRadius: "22px",
    padding: "42px",
  },

  admin: {
    minHeight: "100vh",
    background: "#090909",
    color: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  header: {
    minHeight: "78px",
    borderBottom: "1px solid #262626",
    background: "#111",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 5%",
    gap: "20px",
    flexWrap: "wrap",
  },

  marca: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "58px",
    height: "58px",
    background: "#ff150b",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "900",
    marginBottom: "18px",
  },

  logoPequeno: {
    width: "45px",
    height: "45px",
    background: "#ff150b",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "900",
  },

  marcaTitulo: {
    display: "block",
    fontSize: "18px",
  },

  marcaSubtitulo: {
    color: "#888",
    letterSpacing: "2px",
  },

  usuario: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    color: "#bbb",
    fontSize: "14px",
  },

  contenedor: {
    width: "90%",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "40px 0 70px",
    display: "grid",
    gap: "28px",
  },

  tarjeta: {
    background: "#141414",
    border: "1px solid #2b2b2b",
    borderRadius: "20px",
    padding: "30px",
  },

  subtitulo: {
    color: "#ff2a20",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "3px",
    margin: "0 0 8px",
  },

  titulo: {
    color: "#fff",
    fontSize: "34px",
    margin: "0 0 10px",
  },

  tituloAdmin: {
    fontSize: "32px",
    margin: "0 0 25px",
  },

  tituloLista: {
    margin: 0,
    fontSize: "30px",
  },

  texto: {
    color: "#aaa",
  },

  formulario: {
    display: "grid",
    gap: "18px",
  },

  gridDos: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  gridTres: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },

  label: {
    display: "block",
    color: "#ddd",
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: "10px",
    border: "1px solid #383838",
    background: "#0d0d0d",
    color: "#fff",
    fontSize: "16px",
  },

  textarea: {
    width: "100%",
    minHeight: "110px",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: "10px",
    border: "1px solid #383838",
    background: "#0d0d0d",
    color: "#fff",
    fontSize: "16px",
    resize: "vertical",
  },

  inputArchivo: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    borderRadius: "10px",
    border: "1px solid #383838",
    background: "#0d0d0d",
    color: "#bbb",
  },

  checks: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
  },

  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#ddd",
  },

  acciones: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  botonRojo: {
    border: "none",
    borderRadius: "10px",
    background: "#ff160c",
    color: "#fff",
    padding: "14px 20px",
    fontWeight: "900",
    cursor: "pointer",
  },

  botonSecundario: {
    border: "1px solid #444",
    borderRadius: "9px",
    background: "#202020",
    color: "#fff",
    padding: "11px 16px",
    cursor: "pointer",
  },

  mensaje: {
    padding: "13px",
    background: "#222",
    borderRadius: "9px",
    color: "#ddd",
  },

  error: {
    color: "#ff7777",
    textAlign: "center",
  },

  preview: {
    width: "170px",
    height: "170px",
    objectFit: "contain",
    background: "#fff",
    borderRadius: "12px",
    padding: "8px",
  },

  encabezadoLista: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  contador: {
    padding: "10px 14px",
    borderRadius: "20px",
    background: "#222",
    color: "#aaa",
  },

  lista: {
    display: "grid",
    gap: "13px",
  },

  productoFila: {
    display: "grid",
    gridTemplateColumns:
      "90px minmax(180px,1fr) minmax(120px,auto) minmax(180px,auto)",
    alignItems: "center",
    gap: "18px",
    background: "#0f0f0f",
    border: "1px solid #292929",
    borderRadius: "14px",
    padding: "15px",
  },

  productoImagenCaja: {
    width: "80px",
    height: "80px",
    background: "#fff",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  productoImagen: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  productoInfo: {
    display: "grid",
    gap: "4px",
  },

  productoNombre: {
    fontSize: "18px",
  },

  productoCategoria: {
    color: "#888",
    fontSize: "13px",
  },

  productoPrecio: {
    color: "#fff",
    fontWeight: "800",
  },

  productoStock: {
    color: "#aaa",
    fontSize: "13px",
  },

  estado: {
    display: "grid",
    gap: "6px",
  },

  badgeEstado: {
    padding: "6px 9px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "900",
    textAlign: "center",
  },

  destacado: {
    color: "#ffcf4a",
    fontSize: "11px",
    fontWeight: "900",
    textAlign: "center",
  },

  botonesFila: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  botonMini: {
    background: "#252525",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "7px",
    padding: "8px 10px",
    cursor: "pointer",
  },

  botonEliminar: {
    background: "#451515",
    color: "#ff8a8a",
    border: "1px solid #6b2020",
    borderRadius: "7px",
    padding: "8px 10px",
    cursor: "pointer",
  },
};
