import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaExclamationCircle,
    FaUsers,
    FaChartLine,
    FaShoppingCart,
    FaShieldAlt,
    FaArrowRight
} from "react-icons/fa";
import "./login.css";
import logo from "../../assets/Ocaso 2.0.png";

//import logo from "../../assets/logo-palco.png";

// Fondo decorativo vectorial: rutas y nodos (nítido en cualquier resolución)
function FondoRutas() {
    return (
        <svg
            className="login-arte"
            viewBox="0 0 800 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="ruta-oro" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffcc33" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffcc33" stopOpacity=".9" />
                    <stop offset="100%" stopColor="#ffcc33" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ruta-azul" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#60a5fa" stopOpacity=".7" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="nodo-brillo">
                    <stop offset="0%" stopColor="#ffcc33" stopOpacity=".9" />
                    <stop offset="100%" stopColor="#ffcc33" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Arcos de fondo (tenues) */}
            <g fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1">
                <circle cx="620" cy="260" r="180" />
                <circle cx="620" cy="260" r="260" />
                <circle cx="620" cy="260" r="340" />
                <circle cx="620" cy="260" r="420" />
            </g>

            {/* Rutas */}
            <g fill="none" strokeLinecap="round">
                <path className="login-ruta" d="M-40 640 C 160 520, 300 600, 430 470 S 700 300, 860 330" stroke="url(#ruta-oro)" strokeWidth="2" />
                <path className="login-ruta login-ruta-2" d="M-40 760 C 200 700, 380 760, 520 620 S 760 520, 860 560" stroke="url(#ruta-azul)" strokeWidth="1.5" />
                <path className="login-ruta login-ruta-3" d="M80 -20 C 140 160, 260 220, 330 330 S 420 560, 560 640" stroke="url(#ruta-azul)" strokeWidth="1.2" />
                <path className="login-ruta login-ruta-4" d="M300 -20 C 380 120, 520 140, 620 260 S 720 420, 860 460" stroke="url(#ruta-oro)" strokeWidth="1.2" />
            </g>

            {/* Nodos */}
            <g>
                {[
                    [430, 470, 5], [620, 260, 6], [330, 330, 4], [520, 620, 4],
                    [160, 560, 3], [720, 420, 3], [250, 190, 3]
                ].map(([x, y, r], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r={r * 5} fill="url(#nodo-brillo)" opacity=".35" className="login-nodo-halo" style={{ animationDelay: `${i * .6}s` }} />
                        <circle cx={x} cy={y} r={r} fill="#ffcc33" />
                        <circle cx={x} cy={y} r={r + 4} fill="none" stroke="rgba(255,204,51,.35)" />
                    </g>
                ))}
            </g>
        </svg>
    );
}

const MODULOS = [
    { icono: <FaUsers />, texto: "Clientes" },
    { icono: <FaChartLine />, texto: "Ventas" },
    { icono: <FaShoppingCart />, texto: "Compras" },
    { icono: <FaShieldAlt />, texto: "Calidad" }
];

function Login() {


const [userName,setUserName] = useState("");
const [password,setPassword] = useState("");
const [error,setError] = useState("");
const [loading,setLoading] = useState(false);
const [verPassword,setVerPassword] = useState(false);

const navigate = useNavigate();

const iniciarSesion = async () => {

setLoading(true);

try{

const res = await api.post("/auth/login",{
userName:userName,
password:password
});

localStorage.setItem("token",res.data.token);

setTimeout(()=>{
navigate("/dashboard");
},600);

}catch(error){

const mensaje =
    error?.response?.data?.message ||
    error?.response?.data ||
    "Credenciales incorrectas";

setError(mensaje);
setLoading(false);

}

};

// Permite iniciar sesión con Enter
const enviar = (e) => {
    e.preventDefault();
    if (!loading) iniciarSesion();
};

return(
    <div className="login-page">

        {/* ========================= */}
        {/* PANEL DE MARCA (IZQUIERDA) */}
        {/* ========================= */}
        <aside className="login-hero">
            <div className="login-hero-malla" />
            <FondoRutas />
            <div className="login-hero-capa" />

            <div className="login-hero-contenido">

                <img src={logo} alt="Ocaso" className="login-hero-logo" />

                <div className="login-hero-texto">
                    <span className="login-hero-eyebrow">Plataforma empresarial</span>
                    <h1>
                        Gestión centralizada de clientes,
                        operaciones y procesos empresariales
                    </h1>

                    <ul className="login-modulos">
                        {MODULOS.map(m => (
                            <li key={m.texto}>
                                {m.icono}
                                {m.texto}
                            </li>
                        ))}
                    </ul>
                </div>

                <span className="login-hero-pie">
                    © {new Date().getFullYear()} Grupo Palco
                </span>

            </div>
        </aside>

        {/* ========================= */}
        {/* FORMULARIO (DERECHA) */}
        {/* ========================= */}
        <main className="login-panel">

            <form className="login-form" onSubmit={enviar} noValidate>

                {/* Logo visible solo en celular */}
                <img src={logo} alt="Ocaso" className="login-logo-movil" />

                <div className="login-encabezado">
                    <h2>Bienvenido</h2>
                    <p>Ingresa con tu cuenta corporativa para continuar</p>
                </div>

                {error && (
                    <div className="login-error" role="alert">
                        <FaExclamationCircle />
                        <span>{String(error)}</span>
                    </div>
                )}

                <label className="login-label" htmlFor="login-correo">
                    Correo electrónico
                </label>
                <div className="login-campo">
                    <FaEnvelope className="login-campo-icono" />
                    <input
                        id="login-correo"
                        type="email"
                        placeholder="usuario@empresa.com"
                        autoComplete="username"
                        autoFocus
                        value={userName}
                        onChange={(e)=>setUserName(e.target.value)}
                    />
                </div>

                <label className="login-label" htmlFor="login-password">
                    Contraseña
                </label>
                <div className="login-campo">
                    <FaLock className="login-campo-icono" />
                    <input
                        id="login-password"
                        type={verPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="login-ver"
                        onClick={() => setVerPassword(v => !v)}
                        title={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {verPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                  >
                  {loading ? (
                      <>
                          <span className="login-spinner" />
                          Ingresando...
                      </>
                  ) : (
                      <>
                          Iniciar sesión
                          <FaArrowRight />
                      </>
                  )}
                </button>

                <div className="login-seguro">
                    <FaShieldAlt />
                    Conexión segura · Acceso exclusivo para personal autorizado
                </div>

                <span className="login-footer">
                    © {new Date().getFullYear()} Grupo Palco
                </span>

            </form>

        </main>
    </div>
);

}

export default Login;
