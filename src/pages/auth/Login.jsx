import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../../assets/Ocaso 2.0.png";

//import logo from "../../assets/logo-palco.png";
import buque from "../../assets/buque.jpg";

function Login() {


const [userName,setUserName] = useState("");
const [password,setPassword] = useState("");
const [error,setError] = useState("");
const [loading,setLoading] = useState(false);

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

return(
    <div className="login-container">
        {/* IMAGEN IZQUIERDA */}
        <div
            className="login-image"
            style={{backgroundImage:`url(${buque})`}}
        >
            <div className="brand-overlay">
                <h1>OCASO</h1>
                  <p>
                  Gestión centralizada de clientes,
                  operaciones y procesos empresariales
                  </p>
            </div>
        </div>
        {/* LOGIN */}
        <div className="login-form-container">
            <div className="login-card">
                <div className="text-center mb-4">
                    <img
                        src={logo}
                        alt="Ocaso"
                        style={{width:"200px"}}
                    />
                </div>
                <h2>Iniciar sesión</h2>
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}
                <input
                    type="email"
                    placeholder="Correo"
                    value={userName}
                    onChange={(e)=>setUserName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
                <button
                  className="login-btn"
                  onClick={iniciarSesion}
                  disabled={loading}
                  >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </button>
                <span className="login-footer">
                    © Grupo Palco
                </span>
            </div>
        </div>
    </div>
);

}

export default Login;
