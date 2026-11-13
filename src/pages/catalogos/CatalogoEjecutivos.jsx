import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import {
    FaUserTie,
    FaUserPlus,
    FaUser,
    FaEnvelope,
    FaEdit,
    FaTrashAlt,
    FaSave
} from "react-icons/fa";

function CatalogoEjecutivos() {

    const [ejecutivos,setEjecutivos] = useState([]);
    const [editando,setEditando] = useState(null);

    const [nuevo,setNuevo] = useState({
        nombre:"",
        correo:""
    });

    const obtenerEjecutivos = async ()=>{
        try{
            const res = await api.get("/catalogos/ejecutivos");
            setEjecutivos(res.data);
        }catch(error){
            console.error("Error cargando ejecutivos",error);
        }
    };

    useEffect(()=>{
        obtenerEjecutivos();
    },[]);

    const guardarEjecutivo = async ()=>{
        try{
            await api.post("/catalogos/ejecutivos",nuevo);
            setNuevo({
                nombre:"",
                correo:""
            });
            obtenerEjecutivos();
        }catch{
            alert("Error al guardar ejecutivo");
        }
    };

    const cambiarEstatus = async (id)=>{
        await api.put(`/catalogos/ejecutivos/${id}/estatus`);
        obtenerEjecutivos();
    };

    const editarEjecutivo = (row)=>{
        setEditando({
            id:row.id,
            nombre:row.nombre,
            correo:row.correo
        });
    };

    const guardarEdicion = async ()=>{
        console.log(editando);
        try{
            await api.put("/catalogos/ejecutivos",editando);
            setEditando(null);
            obtenerEjecutivos();
        }catch{
            alert("Error al actualizar ejecutivo");
        }
    };

    const eliminarEjecutivo = async (id)=>{
        if(!window.confirm("¿Eliminar ejecutivo?")) return;
        try{
            await api.delete(`/catalogos/ejecutivo/${id}`);
            obtenerEjecutivos();
        }catch{
            alert("Error al eliminar");
        }
    };

    const inicial = (texto)=> (texto || "?").trim().charAt(0).toUpperCase();

    const columns=[
    {
        header:"Nombre",
        render:(row)=>(
            <div className="cliente-nombre">
                <span className="cliente-avatar">{inicial(row.nombre)}</span>
                <span className="text-break">{row.nombre}</span>
            </div>
        )
    },

    {
        header:"Correo",
        render:(row)=>(
            row.correo ? (
                <a className="contacto-dato" href={`mailto:${row.correo}`}>
                    <FaEnvelope />
                    <span className="text-break">{row.correo}</span>
                </a>
            ) : (
                <span className="text-muted">—</span>
            )
        )
    },

    {
        header:"Acciones",
        align:"end",
        render:(row)=>(
            <div className="docs-acciones">
                <button
                    className="btn btn-sm btn-outline-primary explorador-btn-icono"
                    title="Editar"
                    aria-label="Editar ejecutivo"
                    onClick={()=>editarEjecutivo(row)}
                >
                    <FaEdit />
                </button>

                <button
                    className="btn btn-sm btn-outline-danger explorador-btn-icono"
                    title="Eliminar"
                    aria-label="Eliminar ejecutivo"
                    onClick={()=>eliminarEjecutivo(row.id)}
                >
                    <FaTrashAlt />
                </button>
            </div>
        )
    }

    ];

    return(

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">
                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Catálogos</span>
                    <h2 className="dash-titulo">Catálogo de ejecutivos</h2>
                    <div className="dash-contexto">
                        <span>
                            <FaUserTie /> {ejecutivos.length.toLocaleString("es-MX")}{" "}
                            {ejecutivos.length === 1 ? "ejecutivo registrado" : "ejecutivos registrados"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">

                {/* ========================= */}
                {/* FORMULARIO */}
                {/* ========================= */}

                <div className="col-12 col-xl-4">
                    <div className="dash-panel nc-form p-0 overflow-hidden cd-form">

                        <div className="nc-form-header">
                            <span className="nc-form-icono"><FaUserPlus /></span>
                            <div>
                                <h3 className="nc-form-titulo">Nuevo ejecutivo</h3>
                                <div className="nc-form-sub">Agrega un ejecutivo al catálogo</div>
                            </div>
                        </div>

                        <div className="nc-form-cuerpo">

                            <label className="form-label">Nombre</label>
                            <div className="nr-input-icono mb-3">
                                <FaUser />
                                <input
                                    className="form-control"
                                    placeholder="Nombre completo"
                                    value={nuevo.nombre}
                                    onChange={(e)=>setNuevo({...nuevo,nombre:e.target.value})}
                                />
                            </div>

                            <label className="form-label">Correo</label>
                            <div className="nr-input-icono">
                                <FaEnvelope />
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="correo@empresa.com"
                                    value={nuevo.correo}
                                    onChange={(e)=>setNuevo({...nuevo,correo:e.target.value})}
                                />
                            </div>

                        </div>

                        <div className="nc-pie justify-content-end">
                            <button
                                className="btn btn-primary np-btn"
                                onClick={guardarEjecutivo}
                            >
                                <FaSave /> Guardar
                            </button>
                        </div>

                    </div>
                </div>

                {/* ========================= */}
                {/* LISTADO */}
                {/* ========================= */}

                <div className="col-12 col-xl-8">
                    <div className="dash-panel p-0 overflow-hidden">
                        <DataTable
                            data={ejecutivos}
                            columns={columns}
                            placeholder="Buscar ejecutivo o correo..."
                            vacio="No hay ejecutivos registrados."
                        />
                    </div>
                </div>

            </div>

            {/*Modal edición*/}
            {editando && (
                <div
                    className="modal show d-block rd-modal"
                    onClick={(e)=> e.target === e.currentTarget && setEditando(null)}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content nc-form">
                            <div className="modal-header rd-modal-header">
                                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                                    <span className="np-header-icono"><FaEdit /></span>
                                    <div style={{ minWidth: 0 }}>
                                        <h5 className="modal-title">Editar ejecutivo</h5>
                                        <div className="rd-modal-sub text-truncate">{editando.nombre}</div>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={()=>setEditando(null)}
                                />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Nombre</label>
                                <div className="nr-input-icono mb-3">
                                    <FaUser />
                                    <input
                                        className="form-control"
                                        value={editando.nombre}
                                        onChange={(e)=>
                                            setEditando({...editando,nombre:e.target.value})
                                        }
                                    />
                                </div>
                                <label className="form-label">Correo</label>
                                <div className="nr-input-icono">
                                    <FaEnvelope />
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={editando.correo}
                                        onChange={(e)=>
                                            setEditando({...editando,correo:e.target.value})
                                        }
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-secondary np-btn"
                                    onClick={()=>setEditando(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary np-btn"
                                    onClick={guardarEdicion}
                                >
                                    <FaSave /> Guardar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                )}
        </div>
    );
}

export default CatalogoEjecutivos;