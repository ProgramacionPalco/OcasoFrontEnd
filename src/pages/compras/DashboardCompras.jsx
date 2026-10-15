import { useEffect, useState } from "react";
import { obtenerDashboardRequisiciones, obtenerMetricasDashboard } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
        FaEye,
        FaEdit,
        FaFilePdf,
        FaPaperclip
    } from "react-icons/fa";    

function DashboardCompras() {

    const [requisiciones, setRequisiciones] = useState([]);
    const [filtroBusqueda, setFiltroBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    const [filtroEmpresa, setFiltroEmpresa] = useState("Todas");
    const [filtroMes, setFiltroMes] = useState("Todos");
    const [filtroAnio, setFiltroAnio] = useState("Todos");
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);
    

    useEffect(() => {
        cargarMetricas();
        cargar();

    }, []);

    const empresas = [
        "Todas",
        ...new Set(requisiciones.map(x => x.razonSocial))
    ];

    const anios = [
        ...new Set(
            requisiciones.map(r =>
                new Date(r.fechaRequisicion).getFullYear()
            )
        )
    ].sort((a, b) => b - a);

    const meses = [
        ...new Set(
            requisiciones.map(r =>
                new Date(r.fechaRequisicion).getMonth() + 1
            )
        )
    ].sort((a, b) => a - b);

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

    const cargarMetricas = async () => {

        try {

            const data = await obtenerMetricasDashboard();

            setMetricas(data);

        } catch (error) {

            console.error(error);

        }

    };

    const cargar = async () => {
        try {
            const { data } = await obtenerDashboardRequisiciones();
            setRequisiciones(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        }
    };

    const [metricas, setMetricas] = useState({
        total: 0,
        pendientes: 0,
        urgentes: 0,
        aprobadas: 0,
        conOrdenCompra: 0,
        entregadas: 0,
        canceladas: 0
    });

    const obtenerEstado = (r) => {

        // Cancelada / eliminada
        if (r.eliminado === 1) {
            return {
                texto: "Cancelada",
                color: "danger"
            };
        }

        // Rechazada
        if (r.estatusAprobacion === 3) {
            return {
                texto: "Rechazada",
                color: "danger"
            };
        }

        // Entregada
        if (r.entregado === 1) {
            return {
                texto: "Entregada",
                color: "secondary"
            };
        }

        // Aprobada y ya tiene Orden de Compra
        if (
            r.estatusAprobacion === 2 &&
            r.oc
        ) {
            return {
                texto: "Con O.C.",
                color: "primary"
            };
        }

        // Aprobada
        if (r.estatusAprobacion === 2) {
            return {
                texto: "Aprobada",
                color: "success"
            };
        }

        // Pendiente de aprobación
        return {
            texto: "Pendiente",
            color: "warning"
        };
    };

    const requisicionesFiltradas = requisiciones.filter(r => {

        const estado = obtenerEstado(r);

        const coincideBusqueda =
            r.descripcion.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
            r.solicitanteNombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
            r.id.toString().includes(filtroBusqueda);

        // Estado
        let coincideEstado = true;

        if (filtroEstado !== "Todos") {

            switch (filtroEstado) {

                case "Urgente":
                    coincideEstado = r.idEstatus === 1;
                    break;

                case "No urgente":
                    coincideEstado = r.idEstatus === 2;
                    break;

                default:
                    coincideEstado = estado.texto === filtroEstado;
                    break;
            }

        }

        // Empresa
        const coincideEmpresa =
            filtroEmpresa === "Todas" ||
            r.razonSocial === filtroEmpresa;

        // Mes
        const coincideMes =
            filtroMes === "Todos" ||
            (new Date(r.fechaRequisicion).getMonth() + 1) === Number(filtroMes);

        // Año
        const coincideAnio =
            filtroAnio === "Todos" ||
            new Date(r.fechaRequisicion).getFullYear() === Number(filtroAnio);

        return (
            coincideBusqueda &&
            coincideEstado &&
            coincideEmpresa &&
            coincideMes &&
            coincideAnio
        );

    });

    const verRequisicion = (id) => {
        navigate(`/compras/detalle/${id}`);
    };

    const editarRequisicion = (id) => {
        console.log("Editar", id);
    };

    const generarPdf = (id) => {
        console.log("PDF", id);
    };

    const verDocumentos = (id) => {
        console.log("Documentos", id);
    };




    return (

        <div className="container-fluid">

            <h2>Dashboard Compras</h2>

            <p>Total: {total}</p>
            {/****/}
            <div className="mt-4 d-flex justify-content-end gap-2 flex-wrap">

                <button
                    className="btn btn-outline-primary btn-sm"
                >
                    <i className="bi bi-eye"></i>
                </button>

                <button
                    className="btn btn-outline-warning btn-sm"
                >
                    <i className="bi bi-pencil"></i>
                </button>

                <button
                    className="btn btn-outline-success btn-sm"
                >
                    <i className="bi bi-file-earmark-pdf"></i>
                </button>

                <button
                    className="btn btn-outline-info btn-sm"
                >
                    <i className="bi bi-paperclip"></i>
                </button>

            </div>
            {/**/}
            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <div className="row g-3 align-items-end">

                        <div className="col-lg-4">

                            <label className="form-label">
                                Buscar
                            </label>

                            <input
                                className="form-control"
                                placeholder="Folio, solicitante o descripción..."
                                value={filtroBusqueda}
                                onChange={(e)=>setFiltroBusqueda(e.target.value)}
                            />

                        </div>

                        <div className="col-lg-2">

                            <label className="form-label">
                                Estado
                            </label>

                            <select
                                className="form-select"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Urgente">Urgente</option>
                                <option value="No urgente">No urgente</option>
                                <option value="Aprobada">Aprobada</option>
                                <option value="Rechazada">Rechazada</option>
                                <option value="Con O.C.">Con O.C.</option>
                                <option value="Entregada">Entregada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>

                        </div>

                        <div className="col-lg-2">

                            <label className="form-label">
                                Empresa
                            </label>

                            <select
                                className="form-select"
                                value={filtroEmpresa}
                                onChange={(e) => setFiltroEmpresa(e.target.value)}
                            >
                                {empresas.map(emp => (
                                    <option key={emp} value={emp}>
                                        {emp}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="col-lg-2">

                            <label className="form-label">
                                Mes
                            </label>

                           <select
                                className="form-select"
                                value={filtroMes}
                                onChange={(e) => setFiltroMes(e.target.value)}
                            >
                                <option value="Todos">Todos</option>

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
                        <div className="col-lg-2">
                            <label className="form-label">
                                Año
                            </label>
                            <select
                                className="form-select"
                                value={filtroAnio}
                                onChange={(e) => setFiltroAnio(e.target.value)}
                            >
                                <option value="Todos">Todos</option>

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

                        <div className="col-lg-2">

                            <button
                                className="btn btn-primary w-100"
                                onClick={() => navigate("/compras/nueva")}
                            >
                                <i className="bi bi-plus-circle me-2"></i>

                                Nueva
                            </button>

                        </div>

                    </div>

                </div>

            </div>

            {/* Cards metricos */}
            <div className="row g-3 mb-4">

                <div className="col-md-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body text-center">
                            <h6>Total</h6>
                            <h2>{metricas.total}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-warning shadow-sm">
                        <div className="card-body text-center">
                            <h6>Pendientes</h6>
                            <h2 className="text-warning">
                                {metricas.pendientes}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-success shadow-sm">
                        <div className="card-body text-center">
                            <h6>Aprobadas</h6>
                            <h2 className="text-success">
                                {metricas.aprobadas}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-danger shadow-sm">
                        <div className="card-body text-center">
                            <h6>Urgentes</h6>
                            <h2 className="text-danger">
                                {metricas.urgentes}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            <div className="row g-4">

                {
                    requisicionesFiltradas.map((r) => {

                    const estado = obtenerEstado(r);

                    return (

                        <div
                            key={r.id}
                            className="col-12"
                        >

                            <div className="card requisicion-card shadow-sm border-0">

                                <div className="card-body">

                                    <div className="row align-items-center">

                                        <div className="col-lg-8">

                                            <h5 className="fw-bold text-uppercase mb-3">

                                                {r.descripcion}

                                            </h5>

                                            <div className="mb-2">

                                                <i className="bi bi-person-fill me-2"></i>

                                                <strong>

                                                    {r.solicitanteNombre}

                                                </strong>

                                                <span className="text-muted">

                                                    {" "}
                                                    {`(REQ-${r.id})`}
                                                </span>

                                            </div>

                                            <div className="mb-2">

                                                <i className="bi bi-calendar-event me-2"></i>

                                                {
                                                    new Date(r.fechaRequisicion)
                                                        .toLocaleDateString(
                                                            "es-MX",
                                                            {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric"
                                                            }
                                                        )
                                                }

                                            </div>

                                            <div className="d-flex justify-content-end gap-2 mt-3">

                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => verRequisicion(r.id)}
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => editarRequisicion(r.id)}
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => generarPdf(r.id)}
                                                >
                                                    <FaFilePdf />
                                                </button>

                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => verDocumentos(r.id)}
                                                >
                                                    <FaPaperclip />
                                                </button>

                                            </div>

                                            <div className="mb-2">

                                                <i className="bi bi-building me-2"></i>

                                                {r.razonSocial}

                                            </div>

                                            <div>

                                                <i className="bi bi-cart me-2"></i>

                                                {r.categoria}

                                            </div>

                                        </div>

                                        <div
                                            className="
                                            col-lg-4
                                            text-lg-end
                                            mt-4
                                            mt-lg-0
                                            "
                                        >
                                            <span className={`badge bg-${estado.color} fs-6`}>

                                                {estado.texto}

                                            </span>

                                            <h3
                                                className="
                                                mt-4
                                                text-success
                                                fw-bold
                                                "
                                            >

                                                $

                                                {
                                                    Number(r.valorTotal)
                                                        .toLocaleString(
                                                            "es-MX",
                                                            {
                                                                minimumFractionDigits:2
                                                            }
                                                        )
                                                }

                                            </h3>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    );
                })
            } 
            </div>

        </div>

    );

}


export default DashboardCompras;