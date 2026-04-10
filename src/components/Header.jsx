import { jwtDecode } from "jwt-decode";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Header() {

    const navigate = useNavigate();

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

            <div className="header-left">
                <h5>Sistema Ocaso</h5>
            </div>

            <div className="header-right">

                <span className="fecha">{fecha}</span>

                <FaBell className="icono-header" />

                <div className="usuario">
                    <FaUserCircle />
                    <span>{usuario}</span>
                </div>

                <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={logout}
                >
                    Cerrar sesión
                </button>

            </div>

        </div>

    );

}

export default Header;