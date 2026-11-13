import { useState } from "react";
import axios from "axios";
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaSave } from "react-icons/fa";

export default function NuevoUsuario() {

  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "Usuario"
  });

  const guardar = async () => {

    try {

      await axios.post("/api/usuarios", usuario);

      alert("Usuario creado");

    } catch {

      alert("Error al crear usuario");

    }

  };

  return (

    <div className="container-fluid dash">

      <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Administración</span>
          <h2 className="dash-titulo">Nuevo usuario</h2>
          <div className="dash-contexto">
            <span><FaUserPlus /> Alta de una cuenta de acceso</span>
          </div>
        </div>
      </div>

      <div className="dash-panel nc-form p-0 overflow-hidden mb-4 nu-panel">

        <div className="nc-form-header">
          <span className="nc-form-icono"><FaUserPlus /></span>
          <div>
            <h3 className="nc-form-titulo">Datos del usuario</h3>
            <div className="nc-form-sub">Nombre, correo y contraseña de acceso</div>
          </div>
        </div>

        <div className="nc-form-cuerpo">

          <label className="form-label">Nombre</label>
          <div className="nr-input-icono mb-3">
            <FaUser />
            <input
              className="form-control"
              placeholder="Nombre"
              onChange={(e) =>
                setUsuario({ ...usuario, nombre: e.target.value })
              }
            />
          </div>

          <label className="form-label">Email</label>
          <div className="nr-input-icono mb-3">
            <FaEnvelope />
            <input
              type="email"
              className="form-control"
              placeholder="usuario@empresa.com"
              onChange={(e) =>
                setUsuario({ ...usuario, email: e.target.value })
              }
            />
          </div>

          <label className="form-label">Contraseña</label>
          <div className="nr-input-icono">
            <FaLock />
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              placeholder="Contraseña"
              onChange={(e) =>
                setUsuario({ ...usuario, password: e.target.value })
              }
            />
          </div>

        </div>

        <div className="nc-pie justify-content-end">
          <button className="btn btn-primary np-btn" onClick={guardar}>
            <FaSave /> Guardar
          </button>
        </div>

      </div>

    </div>

  );
}
