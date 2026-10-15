import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    obtenerMetricasDashboard,
    obtenerDepartamentos
} from "../../services/api";

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

    return (

        <div className="container-fluid">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="mb-1">
                        Dashboard Compras
                    </h2>

                    <span className="text-muted">
                        Resumen general del módulo de compras
                    </span>

                </div>

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate("/compras/nueva")
                    }
                >
                    <i className="bi bi-plus-circle me-2"></i>

                    Nueva requisición
                </button>

            </div>


            {/* ========================= */}
            {/* FILTROS */}
            {/* ========================= */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <div className="row g-3 align-items-end">

                        {/* MES */}

                        <div className="col-md-3">

                            <label className="form-label fw-semibold">
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
                                        {
                                            nombresMeses[
                                                mes - 1
                                            ]
                                        }
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* AÑO */}

                        <div className="col-md-3">

                            <label className="form-label fw-semibold">
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

                        <div className="col-md-4">

                            <label className="form-label fw-semibold">
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

                        <div className="col-md-2">

                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={limpiarFiltros}
                            >
                                <i className="bi bi-arrow-counterclockwise me-2"></i>

                                Limpiar
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* CARGANDO */}
            {/* ========================= */}

            {cargando && (

                <div className="text-center py-3">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                    </div>

                    <div className="mt-2 text-muted">
                        Actualizando dashboard...
                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* MÉTRICAS OPERATIVAS */}
            {/* ========================= */}

            <div className="row g-3 mb-4">

                {/* TOTAL */}

                <div className="col-xl-3 col-md-6">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Total requisiciones
                            </div>

                            <h2 className="mb-0">
                                {metricas.total}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* POR APROBAR */}

                <div className="col-xl-3 col-md-6">

                    <div
                        className="card shadow-sm border-warning h-100"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate(
                                "/compras/aprobaciones"
                            )
                        }
                    >

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Por aprobar
                            </div>

                            <h2 className="text-warning mb-0">
                                {
                                    metricas.pendientesAprobacion
                                }
                            </h2>

                            <small className="text-muted">
                                Ver aprobaciones
                            </small>

                        </div>

                    </div>

                </div>


                {/* POR COMPRAR */}

                <div className="col-xl-3 col-md-6">

                    <div
                        className="card shadow-sm border-primary h-100"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate(
                                "/compras/pendientes"
                            )
                        }
                    >

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Por comprar
                            </div>

                            <h2 className="text-primary mb-0">
                                {metricas.pendientesCompra}
                            </h2>

                            <small className="text-muted">
                                Ver órdenes pendientes
                            </small>

                        </div>

                    </div>

                </div>


                {/* POR RECIBIR */}

                <div className="col-xl-3 col-md-6">

                    <div
                        className="card shadow-sm border-info h-100"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate(
                                "/compras/recepciones"
                            )
                        }
                    >

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Por recibir
                            </div>

                            <h2 className="text-info mb-0">
                                {
                                    metricas.pendientesRecepcion
                                }
                            </h2>

                            <small className="text-muted">
                                Ver recepciones
                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* SEGUNDA FILA */}
            {/* ========================= */}

            <div className="row g-3 mb-4">

                {/* URGENTES */}

                <div className="col-xl-4 col-md-6">

                    <div className="card shadow-sm border-danger h-100">

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Urgentes
                            </div>

                            <h2 className="text-danger mb-0">
                                {metricas.urgentes}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* GASTO PERIODO */}

                <div className="col-xl-4 col-md-6">

                    <div className="card shadow-sm border-success h-100">

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Gasto del periodo
                            </div>

                            <h2 className="text-success mb-0">

                                {formatoMoneda(
                                    metricas.gastoMesActual
                                )}

                            </h2>

                        </div>

                    </div>

                </div>


                {/* ENTREGADAS */}

                <div className="col-xl-4 col-md-6">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <div className="text-muted mb-2">
                                Entregadas
                            </div>

                            <h2 className="mb-0">
                                {metricas.entregadas}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* SIGUIENTE ETAPA */}
            {/* ========================= */}

            <div className="row g-3">

                <div className="col-lg-6">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h5 className="fw-bold">
                                Gasto por departamento
                            </h5>

                            <p className="text-muted mb-0">
                                Aquí agregaremos la gráfica
                                de gasto por departamento.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="col-lg-6">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h5 className="fw-bold">
                                Gasto por razón social
                            </h5>

                            <p className="text-muted mb-0">
                                Aquí agregaremos la gráfica
                                de gasto por razón social.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DashboardCompras;