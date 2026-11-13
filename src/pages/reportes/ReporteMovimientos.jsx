import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

import {
    FaSearch,
    FaFileAlt,
    FaUser,
    FaAddressBook,
    FaHistory,
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight
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
                return "dash-tono-success";

            case "cliente":
                return "dash-tono-primary";

            case "contacto":
                return "dash-tono-warning";

            default:
                return "dash-tono-secondary";

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

    const buscar = (e)=>{
        e?.preventDefault();
        setPage(1);
        cargarMovimientos();
    };

    const fechaCorta = (valor)=>
        valor
            ? new Date(valor).toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"numeric" })
            : "—";

    const horaCorta = (valor)=>
        valor
            ? new Date(valor).toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" })
            : "";

    const inicial = (texto)=> (texto || "?").trim().charAt(0).toUpperCase();

    const conteoTipo = (tipo)=> movimientos.filter((m)=> m.tipo === tipo).length;

    const KPIS = [
        { label:"Movimientos", valor:movimientos.length, pie:`Página ${page}`, icono:<FaHistory />, tono:"primary" },
        { label:"Documentos", valor:conteoTipo("documento"), pie:"Cargas y cambios", icono:<FaFileAlt />, tono:"success" },
        { label:"Clientes", valor:conteoTipo("cliente"), pie:"Altas y ediciones", icono:<FaUser />, tono:"info" },
        { label:"Contactos", valor:conteoTipo("contacto"), pie:"Altas y bajas", icono:<FaAddressBook />, tono:"warning" },
    ];

    return(

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">
                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Reportes</span>
                    <h2 className="dash-titulo">Reporte de movimientos</h2>
                    <div className="dash-contexto">
                        <span><FaHistory /> Bitácora de cambios en clientes, contactos y documentos</span>
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* INDICADORES */}
            {/* ========================= */}

            <div className="row g-3 mb-4">
                {KPIS.map((k)=>(
                    <div className="col-6 col-lg-3" key={k.label}>
                        <div className="dash-kpi h-100">
                            <div className="dash-kpi-top">
                                <span className="dash-kpi-label">{k.label}</span>
                                <span className={`dash-kpi-icono dash-tono-${k.tono}`}>{k.icono}</span>
                            </div>
                            <div className="dash-kpi-valor">
                                {loading ? "—" : k.valor.toLocaleString("es-MX")}
                            </div>
                            <div className="dash-kpi-pie">{k.pie}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ========================= */}
            {/* LISTADO */}
            {/* ========================= */}

            <div className="dash-panel p-0 overflow-hidden mb-4">

                {/* FILTROS */}

                <form className="mv-filtros" onSubmit={buscar}>

                    <div className="mv-filtro mv-filtro-buscar">
                        <label className="form-label">Buscar</label>
                        <div className="explorador-buscar">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Cliente, usuario o movimiento..."
                                value={busqueda}
                                onChange={(e)=>setBusqueda(e.target.value)}
                                aria-label="Buscar movimiento"
                            />
                        </div>
                    </div>

                    <div className="mv-filtro">
                        <label className="form-label">
                            <FaCalendarAlt /> Fecha inicio
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaInicio}
                            onChange={(e)=>setFechaInicio(e.target.value)}
                        />
                    </div>

                    <div className="mv-filtro">
                        <label className="form-label">
                            <FaCalendarAlt /> Fecha fin
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaFin}
                            onChange={(e)=>setFechaFin(e.target.value)}
                        />
                    </div>

                    <div className="mv-filtro mv-filtro-boton">
                        <button
                            type="submit"
                            className="btn btn-primary np-btn w-100"
                            disabled={loading}
                        >
                            {loading
                                ? <span className="spinner-border spinner-border-sm" role="status" />
                                : <FaSearch />}
                            Buscar
                        </button>
                    </div>

                </form>

                {loading ? (

                    <div className="dash-vacio">
                        <div className="spinner-border text-primary" role="status" />
                        <span>Cargando movimientos…</span>
                    </div>

                ) : movimientos.length === 0 ? (

                    <div className="dash-vacio">
                        <FaHistory />
                        <span>No se encontraron movimientos.</span>
                    </div>

                ) : (
                    <>
                        {/* TABLA (escritorio) */}

                        <div className="table-responsive d-none d-md-block">

                            <table className="table align-middle docs-tabla no-cards">

                                <thead>

                                    <tr>

                                        <th>Fecha</th>
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
                                                <div className="mv-fecha">
                                                    <span>{fechaCorta(m.fecha)}</span>
                                                    <small>{horaCorta(m.fecha)}</small>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="cliente-nombre">
                                                    <span className="cliente-avatar mv-avatar">{inicial(m.usuario)}</span>
                                                    <span className="text-nowrap">{m.usuario}</span>
                                                </div>
                                            </td>

                                            <td className="mv-cliente">
                                                {m.cliente || <span className="text-muted">—</span>}
                                            </td>

                                            <td>
                                                <span className={"mv-tipo " + badgeTipo(m.tipo)}>
                                                    {iconoTipo(m.tipo)}
                                                    {m.tipo}
                                                </span>
                                            </td>

                                            <td className="mv-texto">
                                                {m.texto}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                        {/* LÍNEA DE TIEMPO (celular) */}

                        <div className="d-md-none p-3">
                            <ul className="mv-timeline">
                                {movimientos.map((m)=>(
                                    <li key={m.id} className="mv-evento">
                                        <span className={"mv-evento-icono " + badgeTipo(m.tipo)}>
                                            {iconoTipo(m.tipo)}
                                        </span>
                                        <div className="mv-evento-cuerpo">
                                            <div className="mv-evento-top">
                                                <span className="fw-semibold">{m.usuario}</span>
                                                <span className="mv-evento-fecha">
                                                    {fechaCorta(m.fecha)} · {horaCorta(m.fecha)}
                                                </span>
                                            </div>
                                            {m.cliente && <div className="mv-evento-cliente">{m.cliente}</div>}
                                            <div className="mv-evento-texto">{m.texto}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {/* PAGINACIÓN */}

                <div className="rd-paginacion">

                    <span className="listado-contador">
                        <strong>{movimientos.length.toLocaleString("es-MX")}</strong> movimientos en esta página
                    </span>

                    <div className="d-flex align-items-center gap-2">

                        <button
                            className="btn btn-outline-secondary dash-btn-tabla"
                            disabled={page === 1}
                            onClick={()=>setPage(page - 1)}
                            aria-label="Página anterior"
                        >
                            <FaChevronLeft /> <span className="d-none d-sm-inline">Anterior</span>
                        </button>

                        <span className="rd-pagina">
                            Página {page}
                        </span>

                        <button
                            className="btn btn-outline-secondary dash-btn-tabla"
                            disabled={movimientos.length < pageSize}
                            onClick={()=>setPage(page + 1)}
                            aria-label="Página siguiente"
                        >
                            <span className="d-none d-sm-inline">Siguiente</span> <FaChevronRight />
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ReporteMovimientos;