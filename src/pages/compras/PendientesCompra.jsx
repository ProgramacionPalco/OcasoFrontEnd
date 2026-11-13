import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { obtenerRequisicionesOrdenCompra,  generarExcelRequisicion } from "../../services/api";
import estilosTabla, { paginacionEs } from "../../components/estilosTabla";
import {
    FaEye,
    FaFileExcel,
    FaClipboardList,
    FaListUl,
    FaSearch,
    FaTimes,
    FaShoppingCart,
    FaHourglassHalf,
    FaSyncAlt,
    FaCheckCircle
} from "react-icons/fa";

const FILTROS = [
    { valor: "por-generar", texto: "Por generar", desc: "Aprobadas sin orden de compra", icono: <FaHourglassHalf />, tono: "warning" },
    { valor: "proceso", texto: "En proceso", desc: "Órdenes de compra en curso", icono: <FaSyncAlt />, tono: "info" },
    { valor: "completadas", texto: "Completadas", desc: "Órdenes de compra concluidas", icono: <FaCheckCircle />, tono: "success" }
];

function PendientesCompra() {

    const navigate = useNavigate();

    const [requisiciones, setRequisiciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("por-generar");

    useEffect(() => {
        cargar();
    }, [filtroEstado]);


    // ==========================================
    // CARGAR REQUISICIONES
    // ==========================================
    const cargar = async () => {
        try {
            setLoading(true);
            const { data } =
                await obtenerRequisicionesOrdenCompra(filtroEstado);
            setRequisiciones(data);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };

    // ==========================================
    // EXPORTAR A EXCEL
    // ==========================================
    const descargarExcel = async (id) => {
        try {
            const response = await generarExcelRequisicion(id);

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.download = `Requisicion_${id}.xlsx`;

            document.body.appendChild(enlace);
            enlace.click();

            enlace.remove();
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error("Error al generar Excel:", error);
            alert("No fue posible generar el Excel de la requisición.");
        }
    };


    // ==========================================
    // FILTRO DE BÚSQUEDA
    // ==========================================
    const requisicionesFiltradas = requisiciones.filter((r) => {

        const texto = busqueda
            .toLowerCase()
            .trim();

        if (!texto)
            return true;

        return (
            String(r.id ?? "")
                .includes(texto) ||

            (r.solicitante ?? "")
                .toLowerCase()
                .includes(texto) ||

            (r.empresa ?? "")
                .toLowerCase()
                .includes(texto) ||

            (r.categoria ?? "")
                .toLowerCase()
                .includes(texto) ||

            (r.descripcion ?? "")
                .toLowerCase()
                .includes(texto)
        );

    });


    const inicial = (texto) => (texto || "?").trim().charAt(0).toUpperCase();

    const filtroActual = FILTROS.find(f => f.valor === filtroEstado);

    // ==========================================
    // COLUMNAS
    // ==========================================
    const columnas = [

        {
            name: "REQ",
            selector: row => row.id,
            cell: row => <span className="mr-folio">REQ-{row.id}</span>,
            sortable: true,
            width: "110px"
        },

        {
            name: "Empresa",
            selector: row => row.empresa,
            cell: row => (
                <div className="cliente-nombre">
                    <span className="cliente-avatar">{inicial(row.empresa)}</span>
                    <span className="pc-texto">{row.empresa}</span>
                </div>
            ),
            sortable: true,
            grow: 2,
            minWidth: "200px"
        },

        {
            name: "Solicitante",
            selector: row => row.solicitante,
            cell: row => <span className="pc-texto">{row.solicitante}</span>,
            sortable: true,
            grow: 1.5,
            minWidth: "150px"
        },

        {
            name: "Categoría",
            selector: row => row.categoria,
            cell: row => (
                row.categoria
                    ? <span className="mr-categoria">{row.categoria}</span>
                    : <span className="text-muted">—</span>
            ),
            sortable: true,
            minWidth: "130px"
        },

        {
            name: "Fecha",
            selector: row => row.fecha,
            cell: row => (
                <span className="docs-fecha">
                    {new Date(row.fecha).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })}
                </span>
            ),
            sortable: true,
            width: "120px"
        },

        {
            name: "Total",
            selector: row => Number(row.total),
            cell: row => (
                <span className="mr-total fw-semibold">
                    ${Number(row.total).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </span>
            ),
            sortable: true,
            right: true,
            width: "140px"
        },

        {
            name: "Acciones",
            cell: row => (
                <div className="docs-acciones">

                    {/* ADMINISTRAR ORDEN DE COMPRA / VER ÓRDENES (acción principal) */}
                    {filtroEstado === "por-generar" ? (
                        <button
                            className="btn btn-success dash-btn-tabla"
                            title="Administrar orden de compra"
                            onClick={() =>
                                navigate(`/compras/orden-compra/${row.id}`)
                            }
                        >
                            <FaClipboardList /> Administrar OC
                        </button>
                    ) : (
                        <button
                            className="btn dash-btn-tabla dash-btn-suave"
                            title="Ver órdenes de compra"
                            onClick={() =>
                                navigate(`/compras/orden-compra/${row.id}`)
                            }
                        >
                            <FaListUl /> Ver órdenes
                        </button>
                    )}

                    {/* VER REQUISICIÓN COMPLETA */}
                    <button
                        className="btn btn-sm btn-outline-primary explorador-btn-icono"
                        title="Ver requisición"
                        aria-label="Ver requisición"
                        onClick={() =>
                            navigate(`/compras/detalle/${row.id}`)
                        }
                    >
                        <FaEye />
                    </button>

                    {/* EXCEL */}
                    <button
                        className="btn btn-sm btn-outline-success explorador-btn-icono"
                        title="Descargar requisición en Excel"
                        aria-label="Descargar requisición en Excel"
                        onClick={() => descargarExcel(row.id)}
                    >
                        <FaFileExcel />
                    </button>

                </div>
            ),
            width: "240px",
            right: true,
            ignoreRowClick: true
        }

    ];


    return (

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">
                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Compras</span>
                    <h2 className="dash-titulo">Órdenes de compra</h2>
                    <div className="dash-contexto">
                        <span>
                            <FaShoppingCart /> Requisiciones aprobadas listas para gestionar su orden de compra
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* FILTRO POR ESTADO */}
            {/* ========================= */}

            <div className="row g-3 mb-4">
                {FILTROS.map(f => (
                    <div className="col-12 col-md-4" key={f.valor}>
                        <button
                            type="button"
                            className={`filtro-kpi ${filtroEstado === f.valor ? "activo" : ""}`}
                            onClick={() => setFiltroEstado(f.valor)}
                            aria-pressed={filtroEstado === f.valor}
                        >
                            <span className={`dash-kpi-icono dash-tono-${f.tono}`}>{f.icono}</span>
                            <span className="filtro-kpi-texto">
                                <span className="filtro-kpi-label">{f.texto}</span>
                                <span className="pc-filtro-desc">{f.desc}</span>
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
                            type="text"
                            placeholder="REQ, solicitante, empresa, categoría..."
                            value={busqueda}
                            onChange={(e) =>
                                setBusqueda(e.target.value)
                            }
                            aria-label="Buscar requisición"
                        />
                        {busqueda && (
                            <button
                                type="button"
                                className="pc-limpiar"
                                title="Limpiar búsqueda"
                                aria-label="Limpiar búsqueda"
                                onClick={() =>
                                    setBusqueda("")
                                }
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <span className="listado-contador">
                        {filtroActual?.texto}: mostrando{" "}
                        <strong>{requisicionesFiltradas.length}</strong>
                        {" "}de{" "}
                        <strong>{requisiciones.length}</strong>
                    </span>

                </div>

                <DataTable
                    columns={columnas}
                    data={requisicionesFiltradas}
                    customStyles={estilosTabla}
                    progressPending={loading}
                    progressComponent={
                        <div className="dash-vacio">
                            <div className="spinner-border text-primary" role="status" />
                            <span>Cargando requisiciones…</span>
                        </div>
                    }
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[
                        10,
                        25,
                        50,
                        100
                    ]}
                    paginationComponentOptions={paginacionEs}
                    noDataComponent={
                        <div className="dash-vacio">
                            <FaClipboardList />
                            <span>No se encontraron requisiciones.</span>
                        </div>
                    }
                    highlightOnHover
                    responsive
                    persistTableHead
                />

            </div>

        </div>

    );

}

export default PendientesCompra;