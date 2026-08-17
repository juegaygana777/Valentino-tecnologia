"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    revisarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function revisarSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUsuario(session?.user ?? null);
    setCargando(false);
  }

  async function iniciarSesion(e) {
    e.preventDefault();

    setMensaje("Ingresando...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensaje("Email o contraseña incorrectos.");
      return;
    }

    setUsuario(data.user);
    setMensaje("");
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  if (cargando) {
    return (
      <main style={styles.pagina}>
        <p style={{ color: "white" }}>Cargando...</p>
      </main>
    );
  }

  if (usuario) {
    return (
      <main style={styles.pagina}>
        <div style={styles.panel}>
          <div style={styles.logo}>V</div>

          <p style={styles.subtitulo}>VALENTINO TECNOLOGÍA</p>

          <h1 style={styles.titulo}>Panel de administración</h1>

          <div style={styles.exito}>
            ✓ Sesión iniciada correctamente
          </div>

          <p style={styles.email}>
            {usuario.email}
          </p>

          <p style={styles.texto}>
            El acceso privado ya está funcionando.
          </p>

          <button
            style={styles.boton}
            onClick={cerrarSesion}
          >
            CERRAR SESIÓN
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.pagina}>
      <div style={styles.panel}>
        <div style={styles.logo}>V</div>

        <p style={styles.subtitulo}>VALENTINO TECNOLOGÍA</p>

        <h1 style={styles.titulo}>Administración</h1>

        <p style={styles.texto}>
          Ingresá con tu usuario administrador
        </p>

        <form
          onSubmit={iniciarSesion}
          style={styles.formulario}
        >
          <label style={styles.label}>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            style={styles.input}
          />

          <label style={styles.label}>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.boton}
          >
            INGRESAR
          </button>

          {mensaje && (
            <p style={styles.mensaje}>
              {mensaje}
            </p>
          )}
        </form>
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

  panel: {
    width: "100%",
    maxWidth: "460px",
    background: "#151515",
    border: "1px solid #333",
    borderRadius: "22px",
    padding: "42px",
    boxShadow: "0 25px 80px rgba(0,0,0,.55)",
  },

  logo: {
    width: "58px",
    height: "58px",
    background: "#ff1208",
    borderRadius: "15px",
    color: "#fff",
    fontWeight: "900",
    fontSize: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },

  subtitulo: {
    color: "#ff2a20",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "3px",
    marginBottom: "8px",
  },

  titulo: {
    color: "#fff",
    fontSize: "34px",
    margin: "0 0 10px 0",
  },

  texto: {
    color: "#aaa",
    marginBottom: "28px",
  },

  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  label: {
    color: "#ddd",
    fontSize: "14px",
    fontWeight: "700",
    marginTop: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 16px",
    borderRadius: "10px",
    border: "1px solid #3b3b3b",
    background: "#0d0d0d",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
  },

  boton: {
    marginTop: "14px",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#ff160c",
    color: "#fff",
    fontWeight: "900",
    cursor: "pointer",
    fontSize: "14px",
  },

  mensaje: {
    color: "#ff6961",
    textAlign: "center",
    fontSize: "14px",
  },

  exito: {
    background: "#123d24",
    color: "#6ef19b",
    padding: "14px",
    borderRadius: "10px",
    margin: "25px 0 15px",
    fontWeight: "700",
  },

  email: {
    color: "#fff",
    fontWeight: "700",
  },
};
