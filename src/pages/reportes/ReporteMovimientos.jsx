import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

import {
    FaSearch,
    FaFileAlt,
    FaUser,
    FaAddressBook
} from "react-icons/fa";

function ReporteMovimientos(){

    const [movimientos,setMovimientos] = useState([]);
    const [loading,setLoading] = useState(false);
    const [busqueda,setBusqueda] = useState("");
    const [fechaInicio,setFechaInicio] = useState("");
    const [fechaFin,setFechaFin] = useState("");
    const [page,setPage] = useState(1);
    const [pageSize] = useState(50);

    const cargarMovimientos = async ()=>{

        try{

            setLoading(true);

            const res = await api.get(
                "/altas/clientes/reportes/movimientos",
                {
                    params:{
                        fechaInicio,
                        fechaFin,
                        busqueda,
                        page,
                        pageSize
                    }
                }
            );

            setMovimientos(res.data);

        }
        catch(error){

            console.error(error);

            Swal.fire({
                icon:"error",
                title:"Error",
                text:"No se pudieron cargar los movimientos"
            });

        }
        finally{

            setLoading(false);

        }

    };

    useEffect(()=>{

        cargarMovimientos();

    },[page]);
    {/**
    const movimientosFiltrados = movimientos.filter((m) => {

        const texto = busqueda.toLowerCase();

        return(

            m.cliente?.toLowerCase().includes(texto) ||
            m.usuario?.toLowerCase().includes(texto) ||
            m.tipo?.toLowerCase().includes(texto) ||
            m.texto?.toLowerCase().includes(texto)

        );

    });
    **/}
    const badgeTipo = (tipo)=>{

        switch(tipo){

            case "documento":
                return "bg-success";

            case "cliente":
                return "bg-primary";

            case "contacto":
                return "bg-warning text-dark";

            default:
                return "bg-secondary";

        }

    };

    const iconoTipo = (tipo)=>{

        switch(tipo){

            case "documento":
                return <FaFileAlt />;

            case "cliente":
                return <FaUser />;

            case "contacto":
                return <FaAddressBook />;

            default:
                return <FaFileAlt />;

        }

    };

    return(

        <div className="container-fluid">

            <div className="card shadow-sm border-0">

                <div className="card-body">

                    {/* HEADER */}

                    <div className="row align-items-center mb-4">

                        <div className="col-md-4">

                            <div className="input-group shadow-sm">

                                <span className="input-group-text bg-white">
                                    <FaSearch />
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar cliente, usuario o movimiento..."
                                    value={busqueda}
                                    onChange={(e)=>setBusqueda(e.target.value)}
                                />

                            </div>

                        </div>

                        <div className="col-md-4 text-center">

                            <h3 className="fw-bold mb-0">
                                Reporte de Movimientos
                            </h3>

                        </div>

                        <div className="col-md-4 text-end">

                            <span className="badge bg-dark fs-6 px-3 py-2">
                                {movimientos.length} movimientos
                            </span>

                        </div>

                    </div>

                    {/* FILTROS */}

                    <div className="row mb-4">

                        <div className="col-md-3">

                            <label className="form-label">
                                Fecha inicio
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={fechaInicio}
                                onChange={(e)=>setFechaInicio(e.target.value)}
                            />

                        </div>

                        <div className="col-md-3">

                            <label className="form-label">
                                Fecha fin
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={fechaFin}
                                onChange={(e)=>setFechaFin(e.target.value)}
                            />

                        </div>

                        <div className="col-md-2 d-flex align-items-end">

                            <button
                                className="btn btn-primary w-100"
                                onClick={()=>{
                                    setPage(1);
                                    cargarMovimientos();
                                }}
                            >
                                Buscar
                            </button>

                        </div>

                    </div>

                    {/* TABLA */}

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-dark">

                                <tr>

                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Usuario</th>
                                    <th>Cliente</th>
                                    <th>Tipo</th>
                                    <th>Movimiento</th>

                                </tr>

                            </thead>

                            <tbody>
                                {movimientos.map((m) => (

                                    <tr key={m.id}>

                                        <td>
                                            {
                                                new Date(m.fecha)
                                                    .toLocaleDateString()
                                            }
                                        </td>

                                        <td>
                                            {
                                                new Date(m.fecha)
                                                    .toLocaleTimeString()
                                            }
                                        </td>

                                        <td>
                                            <strong>
                                                {m.usuario}
                                            </strong>
                                        </td>

                                        <td>
                                            {m.cliente}
                                        </td>

                                        <td>
                                            <span className={"badge " + badgeTipo(m.tipo)}>

                                                <span className="me-1">
                                                    {iconoTipo(m.tipo)}
                                                </span>

                                                {m.tipo}

                                            </span>

                                        </td>

                                        <td>
                                            {m.texto}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>
                        <div className="d-flex justify-content-center mt-4 gap-2">

                            <button
                                className="btn btn-outline-secondary"
                                disabled={page === 1}
                                onClick={()=>setPage(page - 1)}
                            >
                                Anterior
                            </button>

                            <span className="d-flex align-items-center px-3">
                                Página {page}
                            </span>

                            <button
                                className="btn btn-outline-secondary"
                                disabled={movimientos.length < pageSize}
                                onClick={()=>setPage(page + 1)}
                            >
                                Siguiente
                            </button>

                        </div>

                    </div>

                    {!loading && movimientos.length === 0 && (

                        <div className="alert alert-warning mt-3 mb-0">
                            No se encontraron movimientos.
                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default ReporteMovimientos;