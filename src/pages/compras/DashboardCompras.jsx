import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
    FaPlus,
    FaUndo,
    FaFileInvoiceDollar,
    FaWallet,
    FaClipboardList,
    FaCheckCircle,
    FaUserCheck,
    FaShoppingCart,
    FaTruck,
    FaBoxOpen,
    FaChevronRight,
    FaExclamationTriangle,
    FaBan,
    FaChartPie,
    FaBuilding,
    FaSyncAlt,
    FaFilter
} from "react-icons/fa";

import {
    obtenerMetricasDashboard,
    obtenerDepartamentos
} from "../../services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

// Porcentaje seguro (evita división entre cero)
const porcentaje = (parte, total) =>
    total > 0 ? Math.round((Number(parte || 0) / total) * 100) : 0;

function DashboardCompras() {

    const navigate = useNavigate();

    // ==============================
    // FILTROS
    // ==============================

    const [filtroMes, setFiltroMes] = useState("Todos");
    const [filtroAnio, setFiltroAnio] = useState("Todos");
    const [idDepartamento, setIdDepartamento] = useState("");

    // ==============================
    // CATÁLOGOS
    // ==============================

    const [departamentos, setDepartamentos] = useState([]);

    // ==============================
    // MÉTRICAS
    // ==============================

    const [metricas, setMetricas] = useState({
        total: 0,
        pendientes: 0,
        urgentes: 0,
        aprobadas: 0,
        conOrdenCompra: 0,
        entregadas: 0,
        canceladas: 0,

        pendientesAprobacion: 0,
        pendientesCompra: 0,
        pendientesRecepcion: 0,

        gastoTotal: 0,
        gastoMesActual: 0
    });

    const [cargando, setCargando] = useState(false);

    // ==============================
    // AÑOS
    // ==============================

    const anios = [
        2026,
        2025,
        2024,
        2023
    ];

    // ==============================
    // MESES
    // ==============================

    const meses = [
        1, 2, 3, 4, 5, 6,
        7, 8, 9, 10, 11, 12
    ];

    const nombresMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    // ==============================
    // CARGAR DEPARTAMENTOS
    // ==============================

    const cargarDepartamentos = async () => {

        try {

            const { data } = await obtenerDepartamentos();

            setDepartamentos(data);

        } catch (error) {

            console.error(
                "Error al cargar departamentos:",
                error
            );

        }

    };

    // ==============================
    // CARGAR MÉTRICAS
    // ==============================

    const cargarMetricas = async () => {

        try {

            setCargando(true);

            const params = {
                mes:
                    filtroMes === "Todos"
                        ? null
                        : Number(filtroMes),

                anio:
                    filtroAnio === "Todos"
                        ? null
                        : Number(filtroAnio),

                idDepartamento:
                    idDepartamento === ""
                        ? null
                        : Number(idDepartamento)
            };

            const data =
                await obtenerMetricasDashboard(params);

            setMetricas(data);

        } catch (error) {

            console.error(
                "Error al cargar métricas:",
                error
            );

        } finally {

            setCargando(false);

        }

    };

    // ==============================
    // CARGA INICIAL
    // ==============================

    useEffect(() => {

        cargarDepartamentos();

    }, []);

    // ==============================
    // ACTUALIZAR POR FILTROS
    // ==============================

    useEffect(() => {

        cargarMetricas();

    }, [
        filtroMes,
        filtroAnio,
        idDepartamento
    ]);

    // ==============================
    // FORMATO MONEDA
    // ==============================

    const formatoMoneda = (cantidad) => {

        return Number(cantidad ?? 0)
            .toLocaleString(
                "es-MX",
                {
                    style: "currency",
                    currency: "MXN"
                }
            );

    };

    // ==============================
    // LIMPIAR FILTROS
    // ==============================

    const limpiarFiltros = () => {

        setFiltroMes("Todos");
        setFiltroAnio("Todos");
        setIdDepartamento("");

    };

    // ==============================
    // INDICADORES DERIVADOS
    // ==============================

    const total = Number(metricas.total || 0);

    const tasaCumplimiento = porcentaje(metricas.entregadas, total);
    const tasaCancelacion = porcentaje(metricas.canceladas, total);
    const tasaUrgentes = porcentaje(metricas.urgentes, total);
    const tasaConOrden = porcentaje(metricas.conOrdenCompra, total);

    const periodoTexto = [
        filtroMes === "Todos" ? "Todos los meses" : nombresMeses[Number(filtroMes) - 1],
        filtroAnio === "Todos" ? "todos los años" : filtroAnio
    ].join(" · ");

    const departamentoTexto =
        idDepartamento === ""
            ? "Todos los departamentos"
            : departamentos.find(d => String(d.id) === String(idDepartamento))?.descripcion
              ?? "Departamento";

    const hayFiltros =
        filtroMes !== "Todos" || filtroAnio !== "Todos" || idDepartamento !== "";

    // Etapas del flujo de compra
    const etapas = [
        {
            clave: "aprobacion",
            titulo: "Por aprobar",
            valor: metricas.pendientesAprobacion,
            icono: <FaUserCheck />,
            tono: "warning",
            enlace: "/compras/aprobaciones",
            accion: "Ver aprobaciones"
        },
        {
            clave: "compra",
            titulo: "Por comprar",
            valor: metricas.pendientesCompra,
            icono: <FaShoppingCart />,
            tono: "primary",
            enlace: "/compras/pendientes",
            accion: "Ver órdenes pendientes"
        },
        {
            clave: "recepcion",
            titulo: "Por recibir",
            valor: metricas.pendientesRecepcion,
            icono: <FaTruck />,
            tono: "info",
            enlace: "/compras/recepciones",
            accion: "Ver recepciones"
        },
        {
            clave: "entregadas",
            titulo: "Entregadas",
            valor: metricas.entregadas,
            icono: <FaBoxOpen />,
            tono: "success"
        }
    ];

    const enProceso =
        Number(metricas.pendientesAprobacion || 0) +
        Number(metricas.pendientesCompra || 0) +
        Number(metricas.pendientesRecepcion || 0);

    // Gráfica de estatus
    const estatus = [
        { etiqueta: "Pendientes", valor: metricas.pendientes, color: "#f59e0b" },
        { etiqueta: "Aprobadas", valor: metricas.aprobadas, color: "#3b82f6" },
        { etiqueta: "Con orden de compra", valor: metricas.conOrdenCompra, color: "#8b5cf6" },
        { etiqueta: "Entregadas", valor: metricas.entregadas, color: "#10b981" },
        { etiqueta: "Canceladas", valor: metricas.canceladas, color: "#ef4444" }
    ];

    const totalEstatus = estatus.reduce((s, e) => s + Number(e.valor || 0), 0);

    const datosEstatus = {
        labels: estatus.map(e => e.etiqueta),
        datasets: [
            {
                data: estatus.map(e => Number(e.valor || 0)),
                backgroundColor: estatus.map(e => e.color),
                borderWidth: 0,
                hoverOffset: 6
            }
        ]
    };

    const opcionesEstatus = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) =>
                        ` ${ctx.label}: ${ctx.parsed} (${porcentaje(ctx.parsed, totalEstatus)}%)`
                }
            }
        }
    };

    return (

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">

                <div className="dash-hero-texto">

                    <span className="dash-eyebrow">Módulo de compras</span>

                    <h2 className="dash-titulo">Dashboard de Compras</h2>

                    <div className="dash-contexto">
                        <span><FaFilter /> {periodoTexto}</span>
                        <span><FaBuilding /> {departamentoTexto}</span>
                        {cargando && (
                            <span className="dash-actualizando">
                                <FaSyncAlt className="dash-girando" /> Actualizando…
                            </span>
                        )}
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
            {/* FILTROS */}
            {/* ========================= */}

            <div className="dash-filtros mb-4">

                <div className="row g-3 align-items-end">

                    {/* MES */}

                    <div className="col-6 col-md-3">

                        <label className="dash-label">
                            Mes
                        </label>

                        <select
                            className="form-select"
                            value={filtroMes}
                            onChange={(e) =>
                                setFiltroMes(
                                    e.target.value
                                )
                            }
                        >

                            <option value="Todos">
                                Todos
                            </option>

                            {meses.map(mes => (

                                <option
                                    key={mes}
                                    value={mes}
                                >
                                    {nombresMeses[mes - 1]}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* AÑO */}

                    <div className="col-6 col-md-3">

                        <label className="dash-label">
                            Año
                        </label>

                        <select
                            className="form-select"
                            value={filtroAnio}
                            onChange={(e) =>
                                setFiltroAnio(
                                    e.target.value
                                )
                            }
                        >

                            <option value="Todos">
                                Todos
                            </option>

                            {anios.map(anio => (

                                <option
                                    key={anio}
                                    value={anio}
                                >
                                    {anio}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* DEPARTAMENTO */}

                    <div className="col-12 col-md-4">

                        <label className="dash-label">
                            Departamento
                        </label>

                        <select
                            className="form-select"
                            value={idDepartamento}
                            onChange={(e) =>
                                setIdDepartamento(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Todos
                            </option>

                            {departamentos.map(dep => (

                                <option
                                    key={dep.id}
                                    value={dep.id}
                                >
                                    {dep.descripcion}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* LIMPIAR */}

                    <div className="col-12 col-md-2">

                        <button
                            className="btn btn-outline-secondary w-100 dash-btn"
                            onClick={limpiarFiltros}
                            disabled={!hayFiltros}
                        >
                            <FaUndo />
                            Limpiar
                        </button>

                    </div>

                </div>

            </div>


            <div className={cargando ? "dash-cargando" : ""}>

                {/* ========================= */}
                {/* KPIs PRINCIPALES */}
                {/* ========================= */}

                <div className="row g-3 mb-4">

                    {/* GASTO DEL PERIODO (destacado) */}

                    <div className="col-12 col-md-6 col-xl-3">

                        <div className="dash-kpi dash-kpi-destacado h-100">

                            <div className="dash-kpi-top">
                                <span className="dash-kpi-label">Gasto del periodo</span>
                                <span className="dash-kpi-icono"><FaFileInvoiceDollar /></span>
                            </div>

                            <div className="dash-kpi-valor dash-kpi-valor-dinero">
                                {formatoMoneda(metricas.gastoMesActual)}
                            </div>

                            <div className="dash-kpi-pie">
                                {periodoTexto}
                            </div>

                        </div>

                    </div>

                    {/* GASTO ACUMULADO */}

                    <div className="col-12 col-md-6 col-xl-3">

                        <div className="dash-kpi h-100">

                            <div className="dash-kpi-top">
                                <span className="dash-kpi-label">Gasto acumulado</span>
                                <span className="dash-kpi-icono dash-tono-success"><FaWallet /></span>
                            </div>

                            <div className="dash-kpi-valor dash-kpi-valor-dinero">
                                {formatoMoneda(metricas.gastoTotal)}
                            </div>

                            <div className="dash-kpi-pie">
                                Total ejercido en requisiciones
                            </div>

                        </div>

                    </div>

                    {/* TOTAL REQUISICIONES */}

                    <div className="col-6 col-xl-3">

                        <div className="dash-kpi h-100">

                            <div className="dash-kpi-top">
                                <span className="dash-kpi-label">Requisiciones</span>
                                <span className="dash-kpi-icono dash-tono-primary"><FaClipboardList /></span>
                            </div>

                            <div className="dash-kpi-valor">
                                {total.toLocaleString("es-MX")}
                            </div>

                            <div className="dash-kpi-pie">
                                <strong>{enProceso.toLocaleString("es-MX")}</strong> en proceso
                            </div>

                        </div>

                    </div>

                    {/* CUMPLIMIENTO */}

                    <div className="col-6 col-xl-3">

                        <div className="dash-kpi h-100">

                            <div className="dash-kpi-top">
                                <span className="dash-kpi-label">Cumplimiento</span>
                                <span className="dash-kpi-icono dash-tono-success"><FaCheckCircle /></span>
                            </div>

                            <div className="dash-kpi-valor">
                                {tasaCumplimiento}<small>%</small>
                            </div>

                            <div className="dash-barra">
                                <div
                                    className="dash-barra-relleno dash-bg-success"
                                    style={{ width: `${tasaCumplimiento}%` }}
                                />
                            </div>

                            <div className="dash-kpi-pie">
                                {Number(metricas.entregadas || 0).toLocaleString("es-MX")} entregadas de {total.toLocaleString("es-MX")}
                            </div>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* FLUJO DE COMPRA */}
                {/* ========================= */}

                <div className="dash-panel mb-4">

                    <div className="dash-panel-header">
                        <div>
                            <h5 className="dash-panel-titulo">Flujo de requisiciones</h5>
                            <span className="dash-panel-subtitulo">
                                Dónde se encuentran hoy las requisiciones dentro del proceso de compra
                            </span>
                        </div>
                    </div>

                    <div className="dash-flujo">

                        {etapas.map((etapa, i) => {

                            const pct = porcentaje(etapa.valor, total);
                            const clicable = Boolean(etapa.enlace);

                            return (
                                <div key={etapa.clave} className="dash-flujo-item">

                                    <div
                                        className={`dash-etapa dash-etapa-${etapa.tono} ${clicable ? "dash-clicable" : ""}`}
                                        role={clicable ? "button" : undefined}
                                        tabIndex={clicable ? 0 : undefined}
                                        onClick={clicable ? () => navigate(etapa.enlace) : undefined}
                                        onKeyDown={
                                            clicable
                                                ? (e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        navigate(etapa.enlace);
                                                    }
                                                }
                                                : undefined
                                        }
                                    >

                                        <div className="dash-etapa-top">
                                            <span className={`dash-etapa-icono dash-tono-${etapa.tono}`}>
                                                {etapa.icono}
                                            </span>
                                            <span className="dash-etapa-paso">Etapa {i + 1}</span>
                                        </div>

                                        <div className="dash-etapa-titulo">{etapa.titulo}</div>

                                        <div className="dash-etapa-valor">
                                            {Number(etapa.valor || 0).toLocaleString("es-MX")}
                                        </div>

                                        <div className="dash-barra">
                                            <div
                                                className={`dash-barra-relleno dash-bg-${etapa.tono}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>

                                        <div className="dash-etapa-pie">
                                            <span>{pct}% del total</span>
                                            {clicable && (
                                                <span className="dash-etapa-link">
                                                    {etapa.accion} <FaChevronRight />
                                                </span>
                                            )}
                                        </div>

                                    </div>

                                    {i < etapas.length - 1 && (
                                        <div className="dash-flujo-flecha" aria-hidden="true">
                                            <FaChevronRight />
                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>

                </div>


                {/* ========================= */}
                {/* ESTATUS + INDICADORES */}
                {/* ========================= */}

                <div className="row g-3 mb-4">

                    {/* DISTRIBUCIÓN POR ESTATUS */}

                    <div className="col-12 col-lg-7">

                        <div className="dash-panel h-100">

                            <div className="dash-panel-header">
                                <div>
                                    <h5 className="dash-panel-titulo">Distribución por estatus</h5>
                                    <span className="dash-panel-subtitulo">
                                        Composición de las requisiciones del periodo
                                    </span>
                                </div>
                            </div>

                            {totalEstatus === 0 ? (

                                <div className="dash-vacio">
                                    <FaChartPie />
                                    <span>Sin requisiciones en el periodo seleccionado</span>
                                </div>

                            ) : (

                                <div className="dash-dona-layout">

                                    <div className="dash-dona">
                                        <Doughnut data={datosEstatus} options={opcionesEstatus} />
                                        <div className="dash-dona-centro">
                                            <div className="dash-dona-valor">
                                                {totalEstatus.toLocaleString("es-MX")}
                                            </div>
                                            <div className="dash-dona-label">requisiciones</div>
                                        </div>
                                    </div>

                                    <ul className="dash-leyenda">
                                        {estatus.map(e => (
                                            <li key={e.etiqueta}>
                                                <span
                                                    className="dash-leyenda-punto"
                                                    style={{ background: e.color }}
                                                />
                                                <span className="dash-leyenda-texto">{e.etiqueta}</span>
                                                <span className="dash-leyenda-valor">
                                                    {Number(e.valor || 0).toLocaleString("es-MX")}
                                                </span>
                                                <span className="dash-leyenda-pct">
                                                    {porcentaje(e.valor, totalEstatus)}%
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                </div>

                            )}

                        </div>

                    </div>

                    {/* INDICADORES DE ATENCIÓN */}

                    <div className="col-12 col-lg-5">

                        <div className="dash-panel h-100">

                            <div className="dash-panel-header">
                                <div>
                                    <h5 className="dash-panel-titulo">Indicadores de atención</h5>
                                    <span className="dash-panel-subtitulo">
                                        Proporción respecto al total de requisiciones
                                    </span>
                                </div>
                            </div>

                            <div className="dash-indicadores">

                                <div className="dash-indicador">
                                    <span className="dash-indicador-icono dash-tono-danger">
                                        <FaExclamationTriangle />
                                    </span>
                                    <div className="dash-indicador-cuerpo">
                                        <div className="dash-indicador-fila">
                                            <span>Urgentes</span>
                                            <strong>{Number(metricas.urgentes || 0).toLocaleString("es-MX")}</strong>
                                        </div>
                                        <div className="dash-barra">
                                            <div className="dash-barra-relleno dash-bg-danger" style={{ width: `${tasaUrgentes}%` }} />
                                        </div>
                                        <small>{tasaUrgentes}% del total</small>
                                    </div>
                                </div>

                                <div className="dash-indicador">
                                    <span className="dash-indicador-icono dash-tono-purple">
                                        <FaFileInvoiceDollar />
                                    </span>
                                    <div className="dash-indicador-cuerpo">
                                        <div className="dash-indicador-fila">
                                            <span>Con orden de compra</span>
                                            <strong>{Number(metricas.conOrdenCompra || 0).toLocaleString("es-MX")}</strong>
                                        </div>
                                        <div className="dash-barra">
                                            <div className="dash-barra-relleno dash-bg-purple" style={{ width: `${tasaConOrden}%` }} />
                                        </div>
                                        <small>{tasaConOrden}% del total</small>
                                    </div>
                                </div>

                                <div className="dash-indicador">
                                    <span className="dash-indicador-icono dash-tono-secondary">
                                        <FaBan />
                                    </span>
                                    <div className="dash-indicador-cuerpo">
                                        <div className="dash-indicador-fila">
                                            <span>Canceladas</span>
                                            <strong>{Number(metricas.canceladas || 0).toLocaleString("es-MX")}</strong>
                                        </div>
                                        <div className="dash-barra">
                                            <div className="dash-barra-relleno dash-bg-secondary" style={{ width: `${tasaCancelacion}%` }} />
                                        </div>
                                        <small>{tasaCancelacion}% del total</small>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* SIGUIENTE ETAPA */}
                {/* ========================= */}

                <div className="row g-3">

                    <div className="col-12 col-lg-6">

                        <div className="dash-panel h-100">

                            <div className="dash-panel-header">
                                <div>
                                    <h5 className="dash-panel-titulo">Gasto por departamento</h5>
                                    <span className="dash-panel-subtitulo">
                                        Comparativo de gasto entre departamentos
                                    </span>
                                </div>
                                <span className="dash-chip">Próximamente</span>
                            </div>

                            <div className="dash-vacio">
                                <FaBuilding />
                                <span>Esta gráfica estará disponible próximamente.</span>
                            </div>

                        </div>

                    </div>


                    <div className="col-12 col-lg-6">

                        <div className="dash-panel h-100">

                            <div className="dash-panel-header">
                                <div>
                                    <h5 className="dash-panel-titulo">Gasto por razón social</h5>
                                    <span className="dash-panel-subtitulo">
                                        Distribución del gasto por empresa del grupo
                                    </span>
                                </div>
                                <span className="dash-chip">Próximamente</span>
                            </div>

                            <div className="dash-vacio">
                                <FaChartPie />
                                <span>Esta gráfica estará disponible próximamente.</span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DashboardCompras;
