import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
    FaSearch,
    FaUserSlash,
    FaArrowLeft,
    FaCheckCircle,
    FaEye,
    FaUserCheck,
} from "react-icons/fa";

function ClientesInactivos(){

    const [clientes,setClientes] = useState([]);
    const [loading,setLoading] = useState(true);
    const [busqueda,setBusqueda] = useState("");

    const navigate = useNavigate();

    const cargarClientes = async ()=>{

        try{

            const res = await api.get("/altas/clientes/inactivos");

            setClientes(res.data);

        }
        catch(error){

            console.error(error);

            Swal.fire({
                icon:"error",
                title:"Error",
                text:"No se pudieron cargar los clientes"
            });

        }
        finally{

            setLoading(false);

        }

    };

    const activarCliente = async (id)=>{

        const confirm = await Swal.fire({
            title:"Activar cliente",
            text:"¿Desea activar este cliente?",
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"Activar",
            cancelButtonText:"Cancelar"
        });

        if(!confirm.isConfirmed) return;

        try{

            await api.put(`/altas/clientes/${id}/activar`);

            Swal.fire({
                icon:"success",
                title:"Cliente activado"
            });

            cargarClientes();

        }
        catch(error){

            Swal.fire({
                icon:"error",
                title:"Error",
                text:"No se pudo activar el cliente"
            });

        }

    };

    useEffect(()=>{

        cargarClientes();

    },[]);

    const clientesFiltrados = clientes.filter(cliente => {
        const texto = busqueda.toLowerCase();

        return (
            cliente.razonSocial?.toLowerCase().includes(texto) ||
            cliente.rfc?.toLowerCase().includes(texto) ||
            cliente.ejecutivo?.toLowerCase().includes(texto)
        );

    });

    const formatoFecha = (valor) =>
        valor
            ? new Date(valor).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "—";

    const inicial = (texto) => (texto || "?").trim().charAt(0).toUpperCase();

    return(

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">
                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Clientes</span>
                    <h2 className="dash-titulo">Clientes inactivos</h2>
                    <div className="dash-contexto">
                        <span>
                            <FaUserSlash /> {clientes.length.toLocaleString("es-MX")}{" "}
                            {clientes.length === 1 ? "cliente inactivo" : "clientes inactivos"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn-light dash-btn-hero"
                    onClick={()=>navigate("/clientes")}
                >
                    <FaArrowLeft />
                    Clientes activos
                </button>
            </div>

            {/* ========================= */}
            {/* LISTADO */}
            {/* ========================= */}

            <div className="dash-panel p-0 overflow-hidden mb-4">

                <div className="listado-toolbar">

                    <div className="explorador-buscar listado-buscar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar cliente, RFC o ejecutivo..."
                            value={busqueda}
                            onChange={(e)=>setBusqueda(e.target.value)}
                            aria-label="Buscar cliente"
                        />
                    </div>

                    <span className="listado-contador">
                        Mostrando <strong>{clientesFiltrados.length.toLocaleString("es-MX")}</strong> de{" "}
                        <strong>{clientes.length.toLocaleString("es-MX")}</strong>
                    </span>

                </div>

                {loading ? (

                    <div className="dash-vacio">
                        <div className="spinner-border text-primary" role="status" />
                        <span>Cargando clientes…</span>
                    </div>

                ) : clientes.length === 0 ? (

                    <div className="dash-vacio ci-vacio-ok">
                        <FaCheckCircle />
                        <span>No hay clientes inactivos.</span>
                    </div>

                ) : clientesFiltrados.length === 0 ? (

                    <div className="dash-vacio">
                        <FaSearch />
                        <span>Ningún cliente coincide con la búsqueda.</span>
                    </div>

                ) : (
                    <>
                        {/* TABLA (escritorio) */}

                        <div className="table-responsive d-none d-md-block">
                            <table className="table align-middle docs-tabla no-cards">

                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>RFC</th>
                                        <th>Ejecutivo</th>
                                        <th>Fecha</th>
                                        <th>Estatus</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {clientesFiltrados.map(cliente=>(

                                        <tr key={cliente.id}>

                                            <td>
                                                <div className="cliente-nombre">
                                                    <span className="cliente-avatar ci-avatar">
                                                        {inicial(cliente.razonSocial)}
                                                    </span>
                                                    <span className="text-break">{cliente.razonSocial}</span>
                                                </div>
                                            </td>

                                            <td>
                                                {cliente.rfc
                                                    ? <span className="cliente-rfc">{cliente.rfc}</span>
                                                    : <span className="text-muted">—</span>}
                                            </td>

                                            <td>
                                                {cliente.ejecutivo || <span className="text-muted">Sin asignar</span>}
                                            </td>

                                            <td className="docs-fecha">
                                                {formatoFecha(cliente.fechaCreacion)}
                                            </td>

                                            <td>
                                                <span className="estatus-pastilla estatus-negado">
                                                    <span className="estatus-punto" />
                                                    Inactivo
                                                </span>
                                            </td>

                                            <td>

                                                <div className="docs-acciones">

                                                    <button
                                                        className="btn dash-btn-tabla dash-btn-suave"
                                                        onClick={()=>navigate(`/clientes/${cliente.id}`)}
                                                    >
                                                        <FaEye /> Ver detalle
                                                    </button>

                                                    <button
                                                        className="btn btn-success dash-btn-tabla"
                                                        onClick={()=>activarCliente(cliente.id)}
                                                    >
                                                        <FaUserCheck /> Activar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        </div>

                        {/* TARJETAS (celular) */}

                        <div className="d-md-none p-3">

                            {clientesFiltrados.map(cliente=>(

                                <div className="cliente-tarjeta ci-tarjeta" key={cliente.id}>

                                    <div className="d-flex align-items-start gap-3">
                                        <span className="cliente-avatar ci-avatar">
                                            {inicial(cliente.razonSocial)}
                                        </span>

                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div className="d-flex justify-content-between align-items-start gap-2">
                                                <div className="fw-semibold text-break">{cliente.razonSocial}</div>
                                                <span className="estatus-pastilla estatus-negado">Inactivo</span>
                                            </div>
                                            {cliente.rfc && (
                                                <span className="cliente-rfc d-inline-block mt-1">{cliente.rfc}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="prospecto-tarjeta-datos">
                                        <div>
                                            <small>Ejecutivo</small>
                                            <span>{cliente.ejecutivo || "Sin asignar"}</span>
                                        </div>
                                        <div>
                                            <small>Fecha</small>
                                            <span>{formatoFecha(cliente.fechaCreacion)}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn dash-btn-tabla dash-btn-suave flex-fill"
                                            onClick={()=>navigate(`/clientes/${cliente.id}`)}
                                        >
                                            <FaEye /> Ver detalle
                                        </button>

                                        <button
                                            className="btn btn-success dash-btn-tabla flex-fill"
                                            onClick={()=>activarCliente(cliente.id)}
                                        >
                                            <FaUserCheck /> Activar
                                        </button>
                                    </div>

                                </div>

                            ))}

                        </div>
                    </>
                )}

            </div>

        </div>

    );

}

export default ClientesInactivos;