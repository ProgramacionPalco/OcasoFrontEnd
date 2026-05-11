import { useState } from "react";
import axios from "axios";

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

    } catch (error) {

      alert("Error al crear usuario");

    }

  };

  return (

    <div className="container">

      <h2>Nuevo usuario</h2>

      <input
        placeholder="Nombre"
        onChange={(e) =>
          setUsuario({ ...usuario, nombre: e.target.value })
        }
      />

      <input
        placeholder="Email"
        onChange={(e) =>
          setUsuario({ ...usuario, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setUsuario({ ...usuario, password: e.target.value })
        }
      />

      <button onClick={guardar}>
        Guardar
      </button>

    </div>

  );
}