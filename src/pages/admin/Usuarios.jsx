import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "react-data-table-component";
import estilosTabla, { paginacionEs } from "../../components/estilosTabla";
import {
  FaUsersCog,
  FaUserPlus,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaSearch,
  FaEdit,
  FaKey,
  FaSave,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaUserShield
} from "react-icons/fa";

const FILTROS_ESTADO = [
  { valor: "todos", texto: "Todos", icono: <FaUsers />, tono: "primary" },
  { valor: "activos", texto: "Activos", icono: <FaUserCheck />, tono: "success" },
  { valor: "inactivos", texto: "Inactivos", icono: <FaUserSlash />, tono: "danger" }
];

const iniciales = (u) =>
  `${(u?.nombre || "?").trim().charAt(0)}${(u?.apellidos || "").trim().charAt(0)}`.toUpperCase();

export default function Usuarios() {

  const [usuarios,setUsuarios] = useState([]);
  const [buscar,setBuscar] = useState("");
  const [filtroEstado,setFiltroEstado] = useState("todos");
  const [cargando,setCargando] = useState(true);

  const [modalPassword,setModalPassword] = useState(false);
  const [usuarioReset,setUsuarioReset] = useState(null);
  const [password,setPassword] = useState("");
  const [verPassword,setVerPassword] = useState(false);

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
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } finally {
      setCargando(false);
    }
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
    setVerPassword(false);
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

  const nuevoUsuario = ()=>{
    setUsuarioEditar(null)

    setForm({
      nombre:"",
      apellidos:"",
      email:"",
      departamento:"",
      rolOcaso:""
    })

    setModalUsuario(true)
  };

  const nombreDepartamento = (row)=>{
    const dep = departamentos.find(d=>d.id == row.departamento)
    return dep ? dep.nombre : row.departamento
  };

  const nombreRol = (row)=>{
    const rol = roles.find(r=>r.id === row.rolOcaso)
    return rol ? rol.nombre : row.rolOcaso
  };


  // =============================
  // Columnas tabla
  // =============================

  const columnas = [

    {
      name:"Nombre",
      selector:row=> row.nombre + " " + row.apellidos,
      cell:row=>(
        <div className="cliente-nombre">
          <span className={`cliente-avatar us-avatar ${row.activo ? "" : "us-avatar-inactivo"}`}>
            {iniciales(row)}
          </span>
          <span className="text-break">{`${row.nombre ?? ""} ${row.apellidos ?? ""}`.trim()}</span>
        </div>
      ),
      sortable:true,
      grow:2
    },

    {
      name:"Email",
      selector:row=>row.email,
      cell:row=>(
        <span className="us-email text-break">{row.email}</span>
      ),
      sortable:true,
      grow:2
    },

    {
      name:"Departamento",
      selector:row=> nombreDepartamento(row),
      cell:row=>{
        const dep = nombreDepartamento(row)
        return dep ? <span className="mr-categoria">{dep}</span> : <span className="text-muted">—</span>
      },
      sortable:true
    },

    {
      name:"Rol",
      selector:row=> nombreRol(row),
      cell:row=>{
        const rol = nombreRol(row)
        return rol ? (
          <span className="us-rol"><FaUserShield /> {rol}</span>
        ) : <span className="text-muted">—</span>
      },
      sortable:true
    },

    {
      name:"Estado",
      cell:row=>(
        <span className={`estatus-pastilla ${row.activo ? "estatus-activo" : "estatus-negado"}`}>
          <span className="estatus-punto" />
          {row.activo ? "Activo":"Inactivo"}
        </span>
      ),
      width:"120px"
    },

    {
      name: "Acciones",
      width: "150px",
      right: true,
      cell: (row) => (
        <div className="docs-acciones">

          <button
            className="btn btn-sm btn-outline-primary explorador-btn-icono"
            title="Editar usuario"
            aria-label="Editar usuario"
            onClick={() => editarUsuario(row)}
          >
            <FaEdit />
          </button>

          <button
            className={`btn btn-sm explorador-btn-icono ${row.activo ? "btn-outline-danger" : "btn-outline-success"}`}
            title={row.activo ? "Desactivar usuario" : "Activar usuario"}
            aria-label={row.activo ? "Desactivar usuario" : "Activar usuario"}
            onClick={() => cambiarEstado(row.id, row.activo)}
          >
            {row.activo ? <FaUserSlash /> : <FaUserCheck />}
          </button>

          <button
            className="btn btn-sm btn-outline-secondary explorador-btn-icono"
            title="Restablecer contraseña"
            aria-label="Restablecer contraseña"
            onClick={() => abrirReset(row)}
          >
            <FaKey />
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
  ).filter(u =>
    filtroEstado === "todos" ||
    (filtroEstado === "activos" ? u.activo : !u.activo)
  );

  const conteo = (valor)=>
    valor === "todos"
      ? usuarios.length
      : usuarios.filter(u => valor === "activos" ? u.activo : !u.activo).length;


  // =============================
  // Render
  // =============================

  return(

    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">

        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Administración</span>
          <h2 className="dash-titulo">Administración de usuarios</h2>
          <div className="dash-contexto">
            <span><FaUsersCog /> Cuentas de acceso, roles y departamentos</span>
          </div>
        </div>

        <button
          className="btn btn-light dash-btn-hero"
          onClick={nuevoUsuario}
        >
          <FaUserPlus />
          Nuevo usuario
        </button>

      </div>

      {/* ========================= */}
      {/* FILTRO POR ESTADO */}
      {/* ========================= */}

      <div className="row g-3 mb-4">
        {FILTROS_ESTADO.map((f)=>(
          <div className="col-12 col-sm-4" key={f.valor}>
            <button
              type="button"
              className={`filtro-kpi ${filtroEstado === f.valor ? "activo" : ""}`}
              onClick={()=>setFiltroEstado(f.valor)}
              aria-pressed={filtroEstado === f.valor}
            >
              <span className={`dash-kpi-icono dash-tono-${f.tono}`}>{f.icono}</span>
              <span className="filtro-kpi-texto">
                <span className="filtro-kpi-label">{f.texto}</span>
                <span className="filtro-kpi-valor">
                  {cargando ? "—" : conteo(f.valor).toLocaleString("es-MX")}
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* LISTADO */}
      {/* ========================= */}

      <div className="dash-panel p-0 overflow-hidden mb-4">

        <div className="listado-toolbar">

          <div className="explorador-buscar listado-buscar">
            <FaSearch />
            <input
              placeholder="Buscar por nombre o email..."
              value={buscar}
              onChange={(e)=>setBuscar(e.target.value)}
              aria-label="Buscar usuario"
            />
          </div>

          <span className="listado-contador">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{usuarios.length}</strong>
          </span>

        </div>

        <DataTable
          columns={columnas}
          data={filtrados}
          pagination
          paginationComponentOptions={paginacionEs}
          highlightOnHover
          responsive
          persistTableHead
          customStyles={estilosTabla}
          progressPending={cargando}
          progressComponent={
            <div className="dash-vacio">
              <div className="spinner-border text-primary" role="status" />
              <span>Cargando usuarios…</span>
            </div>
          }
          noDataComponent={
            <div className="dash-vacio">
              <FaUsers />
              <span>No hay usuarios para mostrar.</span>
            </div>
          }
        />

      </div>


      {/* MODAL PASSWORD */}

      {modalPassword && (

        <div
          className="modal show d-block rd-modal"
          onClick={(e)=> e.target === e.currentTarget && setModalPassword(false)}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content nc-form">

              <div className="modal-header rd-modal-header">
                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                  <span className="np-header-icono"><FaKey /></span>
                  <div style={{ minWidth: 0 }}>
                    <h5 className="modal-title">Restablecer contraseña</h5>
                    <div className="rd-modal-sub text-break">{usuarioReset?.email}</div>
                  </div>
                </div>
                <button
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={()=>setModalPassword(false)}
                />
              </div>

              <div className="modal-body">

                <label className="form-label">Nueva contraseña</label>

                <div className="nr-input-icono us-password">
                  <FaLock />
                  <input
                    type={verPassword ? "text" : "password"}
                    className="form-control"
                    autoComplete="new-password"
                    placeholder="Escriba la nueva contraseña"
                    value={password || ""}
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="us-ver"
                    onClick={()=>setVerPassword(!verPassword)}
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-outline-secondary np-btn"
                  onClick={()=>setModalPassword(false)}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary np-btn"
                  onClick={guardarPassword}
                >
                  <FaSave /> Guardar
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* MODAL CREAR / EDITAR */}

      {modalUsuario && (

        <div
          className="modal show d-block rd-modal"
          onClick={(e)=> e.target === e.currentTarget && setModalUsuario(false)}
        >

        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

        <div className="modal-content nc-form">

            <div className="modal-header rd-modal-header">
              <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                <span className="np-header-icono">{usuarioEditar ? <FaEdit /> : <FaUserPlus />}</span>
                <div style={{ minWidth: 0 }}>
                  <h5 className="modal-title">{usuarioEditar ? "Editar usuario" : "Nuevo usuario"}</h5>
                  <div className="rd-modal-sub text-truncate">
                    {usuarioEditar
                      ? usuarioEditar.email
                      : "Captura los datos de acceso del nuevo usuario"}
                  </div>
                </div>
              </div>
              <button
                className="btn-close"
                aria-label="Cerrar"
                onClick={()=>setModalUsuario(false)}
              />
            </div>

            <div className="modal-body">

            <h6 className="nc-seccion mt-0"><FaUser /> Datos personales</h6>

            <div className="row g-3">

            <div className="col-md-6">
                <label className="form-label">Nombre <span className="text-danger">*</span></label>
                <input
                className="form-control"
                value={form.nombre}
                onChange={(e)=>setForm({...form,nombre:e.target.value})}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label">Apellidos</label>
                <input
                className="form-control"
                value={form.apellidos}
                onChange={(e)=>setForm({...form,apellidos:e.target.value})}
                />
            </div>

            <div className="col-12">
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <div className="nr-input-icono">
                  <FaEnvelope />
                  <input
                  type="email"
                  className="form-control"
                  autoComplete="off"
                  placeholder="usuario@empresa.com"
                  value={form.email || ""}
                  onChange={(e)=>setForm({...form,email:e.target.value})}
                  />
                </div>
            </div>

            </div>

            <h6 className="nc-seccion"><FaLock /> Contraseña</h6>

            <div className="row g-3">

            <div className="col-md-6">
                <label className="form-label">
                  Contraseña {!usuarioEditar && <span className="text-danger">*</span>}
                </label>
                <input
                    type="password"
                    className="form-control"
                    autoComplete="new-password"
                    value={form.password || ""}
                    onChange={(e)=>setForm({...form,password:e.target.value})}
                />
                </div>

                <div className="col-md-6">
                <label className="form-label">
                  Confirmar contraseña {!usuarioEditar && <span className="text-danger">*</span>}
                </label>
                <input
                    type="password"
                    className={`form-control ${form.confirmPassword && form.password !== form.confirmPassword ? "is-invalid" : ""}`}
                    autoComplete="new-password"
                    value={form.confirmPassword || ""}
                    onChange={(e)=>setForm({...form,confirmPassword:e.target.value})}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <div className="invalid-feedback">Las contraseñas no coinciden.</div>
                )}
            </div>

            </div>

            <h6 className="nc-seccion"><FaBuilding /> Acceso</h6>

            <div className="row g-3">

            <div className="col-md-6">
                <label className="form-label">Departamento</label>

                <select
                    className="form-select"
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

            <div className="col-md-6">
                <label className="form-label">Rol</label>
                <select
                className="form-select"
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

            </div>

            <div className="modal-footer">

            <button
                className="btn btn-outline-secondary np-btn"
                onClick={()=>setModalUsuario(false)}
            >
                Cancelar
            </button>

            <button
                className="btn btn-primary np-btn"
                onClick={guardarUsuario}
            >
                <FaSave /> Guardar usuario
            </button>

            </div>

        </div>

        </div>

        </div>

        )}

    </div>

  );

}
