import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";

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

    const columns=[
    {
        header:"Nombre",
        field:"nombre"
    },

    {
        field:"correo"
    },

    {
        header:"Acciones",
        render:(row)=>(
            <>
                <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={()=>editarEjecutivo(row)}
                >
                    Editar
                </button>

                <button
                    className="btn btn-sm btn-danger"
                    onClick={()=>eliminarEjecutivo(row.id)}
                >
                    Eliminar
                </button>
            </>
        )
    }

    ];

    return(

        <div className="container-fluid">

            <h2 className="mb-4">Catálogo de Ejecutivos</h2>

            {/* FORMULARIO */}

            <div className="card p-3 mb-4">

                <h5>Nuevo Ejecutivo</h5>

                <input
                    className="form-control mb-2"
                    placeholder="Nombre"
                    value={nuevo.nombre}
                    onChange={(e)=>setNuevo({...nuevo,nombre:e.target.value})}
                />

                <input
                    className="form-control mb-2"
                    placeholder="Correo"
                    value={nuevo.correo}
                    onChange={(e)=>setNuevo({...nuevo,correo:e.target.value})}
                />

                <button
                    className="btn btn-primary"
                    onClick={guardarEjecutivo}
                >
                    Guardar
                </button>

            </div>

            {/* TABLA */}
            <div className="card p-3">
                <DataTable
                    data={ejecutivos}
                    columns={columns}
                />
            </div>

            {/*Modal edición*/}
            {editando && (
                <div className="modal show d-block">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>Editar Ejecutivo</h5>
                                <button
                                    className="btn-close"
                                    onClick={()=>setEditando(null)}
                                />
                            </div>
                            <div className="modal-body">
                                <input
                                    className="form-control mb-2"
                                    value={editando.nombre}
                                    onChange={(e)=>
                                        setEditando({...editando,nombre:e.target.value})
                                    }
                                />
                                <input
                                    className="form-control"
                                    value={editando.correo}
                                    onChange={(e)=>
                                        setEditando({...editando,correo:e.target.value})
                                    }
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={()=>setEditando(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={guardarEdicion}
                                >
                                    Guardar
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