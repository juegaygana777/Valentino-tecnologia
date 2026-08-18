import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ProductoPage({ params }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: producto, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .eq("visible", true)
    .single();

  if (error || !producto) {
    notFound();
  }

  const formatearPrecio = (precio) => {
    if (precio === null || precio === undefined) return "Consultar precio";

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(precio));
  };

  const mensaje = encodeURIComponent(
    `Hola, quiero consultar por ${producto.name}`
  );

  return (
    <main style={styles.pagina}>
      <div style={styles.contenedor}>

        <Link href="/" style={styles.volver}>
          ← VOLVER A LA TIENDA
        </Link>

        <div style={styles.ficha}>
          <div style={styles.imagenContenedor}>
            {producto.image_url ? (
              <img
                src={producto.image_url}
                alt={producto.name}
                style={styles.imagen}
              />
            ) : (
              <div style={styles.sinImagen}>📦</div>
            )}
          </div>

          <div style={styles.info}>
            {producto.badge && (
              <div style={styles.badge}>{producto.badge}</div>
            )}

            <div style={styles.categoria}>
              {producto.category}
            </div>

            <h1 style={styles.titulo}>{producto.name}</h1>

            <p style={styles.descripcion}>
              {producto.description || "Consultanos por más información sobre este producto."}
            </p>

            {producto.old_price && (
              <div style={styles.precioAnterior}>
                {formatearPrecio(producto.old_price)}
              </div>
            )}

            <div style={styles.precio}>
              {formatearPrecio(producto.price)}
            </div>

            <div style={styles.stock}>
              {Number(producto.stock) > 0
                ? `✓ Stock disponible: ${producto.stock}`
                : "Consultar disponibilidad"}
            </div>

            <a
              href={`https://wa.me/?text=${mensaje}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsapp}
            >
              CONSULTAR POR WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles = {
  pagina: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 85% 20%, #351010 0%, #151515 32%, #080808 70%)",
    color: "#fff",
    padding: "40px 20px",
  },

  contenedor: {
    maxWidth: "1150px",
    margin: "0 auto",
  },

  volver: {
    display: "inline-block",
    color: "#ff3b30",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "13px",
    marginBottom: "30px",
  },

  ficha: {
    display: "flex",
    flexWrap: "wrap",
    gap: "50px",
    background: "rgba(255,255,255,0.035)",
    border: "1px solid #333",
    borderRadius: "24px",
    padding: "35px",
  },

  imagenContenedor: {
    flex: "1 1 420px",
    minHeight: "450px",
    background: "#fff",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  imagen: {
    width: "100%",
    height: "100%",
    maxHeight: "550px",
    objectFit: "contain",
  },

  sinImagen: {
    fontSize: "100px",
  },

  info: {
    flex: "1 1 400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  badge: {
    display: "inline-block",
    alignSelf: "flex-start",
    background: "#ff1b0b",
    color: "#fff",
    padding: "7px 13px",
    borderRadius: "7px",
    fontWeight: "900",
    fontSize: "12px",
    marginBottom: "15px",
  },

  categoria: {
    color: "#ff3b30",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontSize: "13px",
  },

  titulo: {
    fontSize: "clamp(36px, 6vw, 64px)",
    lineHeight: "1",
    margin: "12px 0 20px",
  },

  descripcion: {
    color: "#ccc",
    fontSize: "17px",
    lineHeight: "1.6",
    marginBottom: "25px",
  },

  precioAnterior: {
    color: "#999",
    textDecoration: "line-through",
    fontSize: "20px",
  },

  precio: {
    fontSize: "38px",
    fontWeight: "900",
    margin: "5px 0 15px",
  },

  stock: {
    color: "#ddd",
    marginBottom: "28px",
    fontWeight: "700",
  },

  whatsapp: {
    display: "inline-block",
    alignSelf: "flex-start",
    background: "#ff1608",
    color: "#fff",
    textDecoration: "none",
    padding: "16px 25px",
    borderRadius: "10px",
    fontWeight: "900",
  },
};
