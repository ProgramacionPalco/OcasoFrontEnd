import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "react-data-table-component";

export default function Usuarios() {

  const [usuarios,setUsuarios] = useState([]);
  const [buscar,setBuscar] = useState("");

  const [modalPassword,setModalPassword] = useState(false);
  const [usuarioReset,setUsuarioReset] = useState(null);
  const [password,setPassword] = useState("");

  const [modalUsuario,setModalUsuario] = useState(false)
  const [usuarioEditar,setUsuarioEditar] = useState(null)

  const [departamentos,setDepartamentos] = useState([])
  const [roles,setRoles] = useState([])

    const [form,setForm] = useState({
    nombre:"",
    apellidos:"",
    email:"",
    departamento:"",
    rolOcaso:"",
    password:"",
    confirmPassword:""
    })

  // =============================
  // Cargar usuarios
  // =============================

  const cargarUsuarios = async () => {
    const res = await api.get("/usuarios");
    setUsuarios(res.data);
  };

  // =============================
  // Cargar catálogos
  // =============================

  const cargarCatalogos = async ()=>{

    const dep = await api.get("/catalogos/departamentos")
    const rol = await api.get("/catalogos/roles")
    //console.log("DEPARTAMENTOS", dep.data)
    setDepartamentos(dep.data)
    setRoles(rol.data)

  }

  useEffect(()=>{
    cargarUsuarios();
    cargarCatalogos()
  },[]);


  // =============================
  // Activar / Desactivar
  // =============================

  const cambiarEstado = async (id,activo)=>{

    await api.put(`/usuarios/estado/${id}?activo=${!activo}`);

    cargarUsuarios();

  };


  // =============================
  // Editar usuario
  // =============================

  const editarUsuario = (usuario)=>{

    setUsuarioEditar(usuario)

    setForm({
      nombre:usuario.nombre || "",
      apellidos:usuario.apellidos || "",
      email:usuario.email || "",
      departamento:usuario.departamento || "",
      rolOcaso:usuario.rolOcaso || ""
    })

    setModalUsuario(true)

  }


const guardarUsuario = async ()=>{

  if(!form.nombre || !form.email){
    alert("Nombre y email son obligatorios")
    return
  }

  if(!usuarioEditar){

    if(!form.password){
      alert("Debe ingresar una contraseña")
      return
    }

    if(form.password !== form.confirmPassword){
      alert("Las contraseñas no coinciden")
      return
    }

  }

  if(usuarioEditar){

    await api.put(`/usuarios/${usuarioEditar.id}`,form)

  }else{

    await api.post("/usuarios",form)

  }

  setModalUsuario(false)
  cargarUsuarios()

}


  // =============================
  // Reset password
  // =============================

  const abrirReset = (user)=>{

    setUsuarioReset(user);
    setPassword("");
    setModalPassword(true);

  };

  const guardarPassword = async ()=>{

    await api.put("/usuarios/reset-password",{
      userId:usuarioReset.id,
      newPassword:password
    });

    setModalPassword(false);
    setPassword("");

    alert("Password actualizado");

  };


  // =============================
  // Columnas tabla
  // =============================

  const columnas = [

    {
      name:"Nombre",
      selector:row=> row.nombre + " " + row.apellidos,
      sortable:true,
      grow:2
    },

    {
      name:"Email",
      selector:row=>row.email,
      sortable:true,
      grow:2
    },

    {
      name:"Departamento",
      selector:row=>{
        const dep = departamentos.find(d=>d.id == row.departamento)
        return dep ? dep.nombre : row.departamento
      }
    },

    {
      name:"Rol",
      selector:row=>{
        const rol = roles.find(r=>r.id === row.rolOcaso)
        return rol ? rol.nombre : row.rolOcaso
      }
    },

    {
      name:"Estado",
      cell:row=>(
        <span
          style={{
            color: row.activo ? "#28a745" : "#dc3545",
            fontWeight:"600"
          }}
        >
          {row.activo ? "Activo":"Inactivo"}
        </span>
      )
    },

    {
      name: "Acciones",
      width: "220px",
      cell: (row) => (
        <div className="acciones-container">

          <button
            className="btn btn-warning"
            onClick={() => editarUsuario(row)}
          >
            ✏️
          </button>

          <button
            className={row.activo ? "btn btn-danger" : "btn btn-success"}
            onClick={() => cambiarEstado(row.id, row.activo)}
          >
            {row.activo ? "⛔" : "✅"}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => abrirReset(row)}
          >
            🔑
          </button>

        </div>
      )
    }

  ];


  // =============================
  // Filtro búsqueda
  // =============================

  const filtrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscar.toLowerCase())
  );


  // =============================
  // Render
  // =============================

  return(

    <div className="admin-container">

      <div className="admin-header">

        <h2 className="admin-title">Administración de usuarios</h2>

        <button
          className="btn btn-primary"
          onClick={()=>{
            setUsuarioEditar(null)

            setForm({
              nombre:"",
              apellidos:"",
              email:"",
              departamento:"",
              rolOcaso:""
            })

            setModalUsuario(true)
          }}
        >
          + Nuevo Usuario
        </button>

      </div>

      <input
        className="search-input"
        placeholder="Buscar usuario..."
        value={buscar}
        onChange={(e)=>setBuscar(e.target.value)}
      />

      <div style={{marginTop:20}}>

        <DataTable
          columns={columnas}
          data={filtrados}
          pagination
          highlightOnHover
          striped
        />

      </div>


      {/* MODAL PASSWORD */}

      {modalPassword && (

        <div className="modal-overlay">

          <div className="modal-box">

            <h3>Resetear contraseña</h3>

            <p>{usuarioReset?.email}</p>

            <input
              type="password"
              autoComplete="new-password"
              placeholder="Nueva contraseña"
              value={password || ""}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <div style={{marginTop:15,display:"flex",gap:10}}>

              <button
                className="btn btn-primary"
                onClick={guardarPassword}
              >
                Guardar
              </button>

              <button
                className="btn"
                onClick={()=>setModalPassword(false)}
              >
                Cancelar
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MODAL CREAR / EDITAR */}

      {modalUsuario && (

        <div className="modal-overlay">

        <div className="modal-box modal-usuario">

            <div className="modal-header">
            <h2>{usuarioEditar ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            </div>

            <div className="form-grid">

            <div className="form-group">
                <label>Nombre</label>
                <input
                value={form.nombre}
                onChange={(e)=>setForm({...form,nombre:e.target.value})}
                />
            </div>

            <div className="form-group">
                <label>Apellidos</label>
                <input
                value={form.apellidos}
                onChange={(e)=>setForm({...form,apellidos:e.target.value})}
                />
            </div>

            <div className="form-group full">
                <label>Email</label>
                <input
                type="email"
                autoComplete="off"
                value={form.email || ""}
                onChange={(e)=>setForm({...form,email:e.target.value})}
                />
            </div>

            <div className="form-group">
                <label>Contraseña</label>
                <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password || ""}
                    onChange={(e)=>setForm({...form,password:e.target.value})}
                />
                </div>

                <div className="form-group">
                <label>Confirmar contraseña</label>
                <input
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword || ""}
                    onChange={(e)=>setForm({...form,confirmPassword:e.target.value})}
                />
            </div>

            <div className="form-group">
                <label>Departamento</label>

                <select
                    value={form.departamento}
                    onChange={(e)=>setForm({...form,departamento:e.target.value})}
                >

                    <option value="">Seleccione</option>

                    {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.nombre}
                    </option>
                    ))}

                </select>
            </div>

            <div className="form-group">
                <label>Rol</label>
                <select
                value={form.rolOcaso}
                onChange={(e)=>setForm({...form,rolOcaso:parseInt(e.target.value)})}
                >
                <option value="">Seleccione</option>

                {roles.map(r=>(
                    <option key={r.id} value={r.id}>
                    {r.nombre}
                    </option>
                ))}

                </select>
            </div>

            </div>

            <div className="modal-footer">

            <button
                className="btn btn-primary"
                onClick={guardarUsuario}
            >
                Guardar Usuario
            </button>

            <button
                className="btn btn-secondary"
                onClick={()=>setModalUsuario(false)}
            >
                Cancelar
            </button>

            </div>

        </div>

        </div>

        )}

    </div>

  );

}