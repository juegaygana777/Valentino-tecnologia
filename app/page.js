import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;
export default async function Home() {
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: productos = [], error } = await supabase
  .from("productos")
  .select("*")
  .eq("visible", true)
  .order("featured", { ascending: false })
  .order("created_at", { ascending: false });

const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined) return "Consultar precio";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio));
};
  const categorias = [
    { nombre: "Celulares", icono: "📱" },
    { nombre: "Parlantes", icono: "🔊" },
    { nombre: "Auriculares", icono: "🎧" },
    { nombre: "Accesorios", icono: "🔌" },
    { nombre: "Gamer", icono: "🎮" },
    { nombre: "Ofertas", icono: "🔥" },
  ];

    
  return (
    <main>
      <div className="topbar">
        <span>🚚 Envíos a todo el país</span>
        <span>🏪 Retiro en nuestro local</span>
        <span>💬 Atención personalizada</span>
      </div>

      <header className="header">
        <div className="logo">
          <span className="logoV">V</span>
          <div>
            <strong>VALENTINO</strong>
            <small>TECNOLOGÍA</small>
          </div>
        </div>

        <div className="search">
          <input placeholder="Buscar productos..." />
          <button>Buscar</button>
        </div>

        <button className="cart">🛒 Carrito</button>
      </header>

      <nav className="nav">
        <a href="#">Inicio</a>
        <a href="#categorias">Categorías</a>
        <a href="#productos">Productos</a>
        <a href="#ofertas">Ofertas</a>
        <a href="#servicio">Servicio técnico</a>
      </nav>

      <section className="hero">
        <div className="heroText">
          <span className="tag">TECNOLOGÍA · CALIDAD · CONFIANZA</span>

          <h1>
            TODO LO QUE BUSCÁS
            <br />
            <span>EN UN SOLO LUGAR</span>
          </h1>

          <p>
            Celulares, parlantes, auriculares, accesorios y mucho más.
            Comprá online y elegí envío o retiro en nuestro local.
          </p>

          <div className="beneficios">
            <span>✓ Productos seleccionados</span>
            <span>✓ Compra segura</span>
            <span>✓ Atención personalizada</span>
          </div>

          <a href="#productos" className="botonPrincipal">
            VER PRODUCTOS
          </a>
        </div>

        <div className="heroVisual">
          <div className="granV">V</div>
          <span className="device uno">📱</span>
          <span className="device dos">🎧</span>
          <span className="device tres">🔊</span>
        </div>
      </section>

      <section className="ventajas">
        <div>
          <strong>🚚 Envíos</strong>
          <span>A todo el país</span>
        </div>

        <div>
          <strong>🛡️ Compra segura</strong>
          <span>Productos seleccionados</span>
        </div>

        <div>
          <strong>🏪 Retiro en local</strong>
          <span>Rápido y simple</span>
        </div>

        <div>
          <strong>💳 Medios de pago</strong>
          <span>Varias opciones</span>
        </div>
      </section>

      <section className="seccion" id="categorias">
        <p className="subtitulo">EXPLORÁ NUESTRA TIENDA</p>
        <h2>Categorías</h2>

        <div className="categorias">
          {categorias.map((categoria) => (
            <div className="categoria" key={categoria.nombre}>
              <span>{categoria.icono}</span>
              <strong>{categoria.nombre}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="seccion productosSeccion" id="productos">
        <p className="subtitulo">SELECCIÓN VALENTINO</p>
        <h2>Productos destacados</h2>

        <div className="productos">
  {productos.length === 0 ? (
    <p>No hay productos disponibles por el momento.</p>
  ) : (
    productos.map((producto) => (
      <div className="producto" key={producto.id}>
        <div className="productoImagen">
          {producto.image_url ? (
            <img
              src={producto.image_url}
              alt={producto.name}
              style={{
                width: "100%",
                height: "230px",
                objectFit: "contain",
                padding: "20px",
              }}
            />
          ) : (
            <span style={{ fontSize: "80px" }}>
              {producto.category === "Celulares"
                ? "📱"
                : producto.category === "Parlantes"
                ? "🔊"
                : producto.category === "Auriculares"
                ? "🎧"
                : producto.category === "Gamer"
                ? "🎮"
                : "🔌"}
            </span>
          )}
        </div>

        {producto.badge && <small>{producto.badge}</small>}

        <h3>{producto.name}</h3>

        <p>{producto.description}</p>

        {producto.old_price && (
          <span
            style={{
              textDecoration: "line-through",
              color: "#777",
              marginLeft: "20px",
              display: "block",
              marginTop: "12px",
            }}
          >
            {formatearPrecio(producto.old_price)}
          </span>
        )}

        <strong className="precio">
          {formatearPrecio(producto.price)}
        </strong>

        <p style={{ marginTop: "8px" }}>
          {producto.stock > 0
            ? `Stock disponible: ${producto.stock}`
            : "Sin stock"}
        </p>

        <a href={`/producto/${producto.id}`} className="botonProducto">
  VER PRODUCTO
</a>
      </div>
    ))
  )}
</div>          
      </section>

      <section className="servicio" id="servicio">
        <div className="servicioIcono">🛠️</div>

        <div>
          <p className="subtitulo">SERVICIO TÉCNICO</p>
          <h2>Reparamos. Solucionamos. Te acompañamos.</h2>
          <p>
            Servicio técnico especializado en celulares, notebooks y
            computadoras.
          </p>
          <button>CONSULTAR</button>
        </div>
      </section>

      <footer>
        <div className="logo">
          <span className="logoV">V</span>
          <div>
            <strong>VALENTINO</strong>
            <small>TECNOLOGÍA</small>
          </div>
        </div>

        <p>Tu tienda de tecnología.</p>
        <p>© 2026 Valentino Tecnología</p>
      </footer>
    </main>
  );
}
