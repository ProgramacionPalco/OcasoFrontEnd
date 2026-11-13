import { jwtDecode } from "jwt-decode";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaBars, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import { useTema } from "../context/ThemeContext";

function Header({ setMobileOpen }) {

    const navigate = useNavigate();

    const { tema, toggleTema } = useTema();

    const token = localStorage.getItem("token");

    let usuario = "Usuario";

    if (token) {
        try {

            const decoded = jwtDecode(token);

            usuario =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
                "Usuario";

        } catch (error) {

            console.error("Error leyendo token", error);

            localStorage.removeItem("token");

            navigate("/login");

        }
    }

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };

    const fecha = new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    return (

        <div className="header">
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
            >
                <FaBars />
            </button>

            <div className="header-left">
                <h5 className="text-truncate">Sistema Ocaso</h5>
            </div>

            <div className="header-right">

                <span className="fecha">{fecha}</span>

                <button
                    type="button"
                    className="theme-toggle"
                    onClick={toggleTema}
                    title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {tema === "dark" ? <FaSun /> : <FaMoon />}
                </button>

                <FaBell className="icono-header" />

                <div className="usuario">
                    <FaUserCircle />
                    <span>{usuario}</span>
                </div>

                <button
                    className="btn btn-sm btn-outline-danger ms-3 d-inline-flex align-items-center gap-1"
                    onClick={logout}
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                >
                    <FaSignOutAlt />
                    <span className="d-none d-sm-inline">Cerrar sesión</span>
                </button>

            </div>

        </div>

    );

}

export default Header;