import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
    FaPlus,
    FaSearch,
    FaEye,
    FaClipboardList,
    FaHourglassHalf,
    FaShoppingCart,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa";

import { obtenerMisRequisiciones } from "../../services/api";
import estilosTabla from "../../components/estilosTabla";

// Tarjetas de filtro rápido (usan el mismo filtro de estado del select)
const FILTROS_ESTADO = [
    { valor: "Todos", texto: "Todas", icono: <FaClipboardList />, tono: "primary" },
    { valor: "Pendiente aprobación", texto: "Por aprobar", icono: <FaHourglassHalf />, tono: "warning" },
    { valor: "Por comprar", texto: "Por comprar", icono: <FaShoppingCart />, tono: "purple" },
    { valor: "Pendiente recepción", texto: "En recepción", icono: <FaTruck />, tono: "info" },
    { valor: "Entregada", texto: "Entregadas", icono: <FaCheckCircle />, tono: "success" },
    { valor: "Rechazada", texto: "Rechazadas", icono: <FaTimesCircle />, tono: "danger" }
];

export default function MisRequisiciones() {

    const navigate = useNavigate();

    const [requisiciones, setRequisiciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("Todos");


    // ==============================
    // CARGAR
    // ==============================

    useEffect(() => {
        cargarRequisiciones();
    }, []);


    const cargarRequisiciones = async () => {

        try {

            setCargando(true);

            const { data } =
                await obtenerMisRequisiciones();

            setRequisiciones(data);

        } catch (error) {

            console.error(
                "Error cargando mis requisiciones:",
                error.response?.data || error
            );

        } finally {

            setCargando(false);

        }
    };


    // ==============================
    // OBTENER ESTADO
    // ==============================

    const obtenerEstado = (r) => {

        // 1. CANCELADA
        if (r.eliminado)
            return "Cancelada";

        // 2. RECHAZADA
        if (r.rechazados > 0)
            return "Rechazada";

        // 3. ENTREGADA
        if (r.entregado)
            return "Entregada";

        // 4. RECEPCIÓN COMPLETA, FALTA ENTREGAR
        if (r.estatusRecepcion === 3)
            return "Lista para entregar";

        // 5. RECEPCIÓN PARCIAL
        if (r.estatusRecepcion === 2)
            return "Recepción parcial";

        // 6. YA TIENE OC, PERO NO SE HA RECIBIDO
        if (r.tieneOrdenCompra)
            return "Pendiente recepción";

        // 7. APROBADA, FALTA GENERAR OC
        if (r.aprobados > 0)
            return "Por comprar";

        // 8. RECIÉN CREADA
        return "Pendiente aprobación";
    };

    // ==============================
    // COLOR ESTADO
    // ==============================

    const obtenerClaseEstado = (estado) => {

        switch (estado) {

            case "Entregada":
                return "estatus-pastilla dash-tono-success";

            case "Lista para entregar":
                return "estatus-pastilla dash-tono-success";

            case "Recepción parcial":
                return "estatus-pastilla dash-tono-warning";

            case "Pendiente recepción":
                return "estatus-pastilla dash-tono-info";

            case "Por comprar":
                return "estatus-pastilla dash-tono-purple";

            case "Pendiente aprobación":
                return "estatus-pastilla dash-tono-warning";

            case "Rechazada":
                return "estatus-pastilla dash-tono-danger";

            case "Cancelada":
                return "estatus-pastilla dash-tono-secondary";

            default:
                return "estatus-pastilla dash-tono-secondary";
        }
    };


    // ==============================
    // FILTRAR
    // ==============================

    const requisicionesFiltradas =
        requisiciones.filter((r) => {

            const texto =
                busqueda.toLowerCase().trim();

            const estadoActual =
                obtenerEstado(r);

            const coincideBusqueda =
                !texto ||
                String(r.id)
                    .includes(texto) ||
                String(r.descripcion ?? "")
                    .toLowerCase()
                    .includes(texto) ||
                String(r.categoria ?? "")
                    .toLowerCase()
                    .includes(texto);

            const coincideEstado =
                estado === "Todos" ||
                estadoActual === estado;

            return (
                coincideBusqueda &&
                coincideEstado
            );
        });

    const conteoEstado = (valor) =>
        valor === "Todos"
            ? requisiciones.length
            : requisiciones.filter((r) => obtenerEstado(r) === valor).length;

    const formatoMoneda = (valor) =>
        Number(valor ?? 0)
            .toLocaleString(
                "es-MX",
                {
                    style: "currency",
                    currency: "MXN"
                }
            );


    // ==============================
    // COLUMNAS
    // ==============================

    const columnas = [

        {
            name: "REQ",
            selector: row => row.id,
            cell: row => (
                <span className="mr-folio">REQ-{row.id}</span>
            ),
            sortable: true,
            width: "120px"
        },

        {
            name: "Descripción",
            selector: row => row.descripcion,
            cell: row => (
                <span className="mr-descripcion" title={row.descripcion}>
                    {row.descripcion || <span className="text-muted">Sin descripción</span>}
                </span>
            ),
            sortable: true,
            grow: 2
        },

        {
            name: "Categoría",
            selector: row => row.categoria,
            cell: row => (
                row.categoria
                    ? <span className="mr-categoria">{row.categoria}</span>
                    : <span className="text-muted">—</span>
            ),
            sortable: true
        },

        {
            name: "Fecha",
            selector: row => row.fecha,
            format: row =>
                new Date(row.fecha)
                    .toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }),
            sortable: true
        },

        {
            name: "Total",
            selector: row => row.total,
            cell: row => (
                <strong className="mr-total">
                    {formatoMoneda(row.total)}
                </strong>
            ),
            sortable: true,
            right: true
        },

        {
            name: "Estado",
            cell: row => {

                const estadoActual =
                    obtenerEstado(row);

                return (
                    <span
                        className={
                            obtenerClaseEstado(
                                estadoActual
                            )
                        }
                    >
                        <span className="estatus-punto" />
                        {estadoActual}
                    </span>
                );
            },
            minWidth: "190px"
        },

        {
            name: "Acciones",
            cell: row => (

                <button
                    className="btn dash-btn-tabla dash-btn-suave"
                    onClick={() =>
                        navigate(
                            `/compras/detalle/${row.id}`
                        )
                    }
                >
                    <FaEye /> Ver
                </button>

            ),
            width: "110px",
            right: true
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
                    <h2 className="dash-titulo">Mis requisiciones</h2>
                    <div className="dash-contexto">
                        <span>
                            <FaClipboardList /> Consulta y seguimiento de tus requisiciones
                        </span>
                    </div>
                </div>

                <button
                    className="btn btn-light dash-btn-hero"
                    onClick={() =>
                        navigate("/compras/nueva")
                    }
                >
                    <FaPlus />
                    Nueva requisición
                </button>

            </div>

            {/* ========================= */}
            {/* FILTRO RÁPIDO POR ESTADO */}
            {/* ========================= */}

            <div className="row g-3 mb-4">
                {FILTROS_ESTADO.map((f) => (
                    <div className="col-6 col-md-4 col-xl-2" key={f.valor}>
                        <button
                            type="button"
                            className={`filtro-kpi ${estado === f.valor ? "activo" : ""}`}
                            onClick={() => setEstado(f.valor)}
                            aria-pressed={estado === f.valor}
                        >
                            <span className={`dash-kpi-icono dash-tono-${f.tono}`}>{f.icono}</span>
                            <span className="filtro-kpi-texto">
                                <span className="filtro-kpi-label">{f.texto}</span>
                                <span className="filtro-kpi-valor">
                                    {cargando ? "—" : conteoEstado(f.valor).toLocaleString("es-MX")}
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

                    <div className="d-flex flex-wrap gap-2 flex-grow-1">

                        <div className="explorador-buscar listado-buscar">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="REQ, descripción o categoría..."
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(
                                        e.target.value
                                    )
                                }
                                aria-label="Buscar requisición"
                            />
                        </div>

                        <select
                            className="form-select listado-select"
                            value={estado}
                            onChange={(e) =>
                                setEstado(
                                    e.target.value
                                )
                            }
                            aria-label="Filtrar por estado"
                        >

                            <option value="Todos">Todos los estados</option>

                            <option value="Pendiente aprobación">
                                Pendiente aprobación
                            </option>

                            <option value="Por comprar">
                                Por comprar
                            </option>

                            <option value="Pendiente recepción">
                                Pendiente recepción
                            </option>

                            <option value="Recepción parcial">
                                Recepción parcial
                            </option>

                            <option value="Lista para entregar">
                                Lista para entregar
                            </option>

                            <option value="Entregada">
                                Entregada
                            </option>

                            <option value="Rechazada">
                                Rechazada
                            </option>

                            <option value="Cancelada">
                                Cancelada
                            </option>

                        </select>

                    </div>

                    <span className="listado-contador">
                        Mostrando <strong>{requisicionesFiltradas.length.toLocaleString("es-MX")}</strong> de{" "}
                        <strong>{requisiciones.length.toLocaleString("es-MX")}</strong>
                    </span>

                </div>

                <DataTable
                    columns={columnas}
                    data={requisicionesFiltradas}
                    progressPending={cargando}
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
                        50
                    ]}
                    paginationComponentOptions={{
                        rowsPerPageText: "Filas por página:",
                        rangeSeparatorText: "de"
                    }}
                    highlightOnHover
                    responsive
                    persistTableHead
                    customStyles={estilosTabla}
                    noDataComponent={
                        <div className="dash-vacio">
                            <FaClipboardList />
                            <span>
                                {requisiciones.length
                                    ? "Ninguna requisición coincide con los filtros."
                                    : "No tienes requisiciones registradas."}
                            </span>
                        </div>
                    }
                />

            </div>

        </div>
    );
}
