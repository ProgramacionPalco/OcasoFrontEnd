import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaEye, FaPrint } from "react-icons/fa";

import {
    obtenerControlRequisiciones,
    obtenerDepartamentos
} from "../../services/api";

function ControlRequisiciones() {

    const navigate = useNavigate();

    const [requisiciones, setRequisiciones] = useState([]);
    const [cargando, setCargando] = useState(false);

    const [pagina, setPagina] = useState(1);
    const [tamanoPagina, setTamanoPagina] = useState(20);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const anioActual = new Date().getFullYear();

    const [anio, setAnio] = useState(anioActual);
    const anios = Array.from(
        { length: anioActual - 2022 + 1 },
        (_, i) => anioActual - i
    );
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");

    const [departamentos, setDepartamentos] = useState([]);
    const [idDepartamento, setIdDepartamento] = useState("");
    const [mes, setMes] = useState("");


    useEffect(() => {
        cargarRequisiciones();
    }, [
        pagina,
        tamanoPagina,
        anio,
        mes,
        busqueda,
        estado,
        idDepartamento
    ]);

    useEffect(() => {

        const cargarDepartamentos = async () => {
            try {

                const response = await obtenerDepartamentos();

                setDepartamentos(response.data);

            } catch (error) {

                console.error(
                    "Error cargando departamentos:",
                    error
                );
            }
        };

        cargarDepartamentos();

    }, []);
    
    const imprimirRequisicion = (id) => {
        window.open(
            `/compras/requisicion/${id}/imprimir`,
            "_blank"
        );
    };

    const cargarRequisiciones = async () => {

        try {

            setCargando(true);

            const response = await obtenerControlRequisiciones(
                pagina,
                tamanoPagina,
                {
                    anio,
                    busqueda,
                    estado,

                    mes:
                        mes === ""
                            ? null
                            : Number(mes),

                    idDepartamento:
                        idDepartamento === ""
                            ? null
                            : Number(idDepartamento)
                }
            );

            setRequisiciones(response.data.datos ?? []);

            setTotalRegistros(
                response.data.totalRegistros ?? 0
            );

        }
        catch (error) {

            console.error(
                "Error al cargar requisiciones:",
                error
            );

        }
        finally {

            setCargando(false);

        }
    };


    const obtenerEstado = (r) => {

        if (r.eliminado)
            return "Cancelada";

        if (r.rechazados > 0)
            return "Rechazada";

        if (r.entregado)
            return "Entregada";

        if (r.estatusRecepcion === 3)
            return "Lista para entregar";

        if (r.estatusRecepcion === 2)
            return "Recepción parcial";

        if (r.tieneOrdenCompra)
            return "Pendiente recepción";

        if (r.aprobados > 0)
            return "Por comprar";

        return "Pendiente aprobación";
    };

    const obtenerClaseEstado = (estado) => {

        switch (estado) {

            case "Entregada":
                return "bg-success";

            case "Lista para entregar":
                return "bg-primary";

            case "Recepción parcial":
                return "bg-warning text-dark";

            case "Pendiente recepción":
                return "bg-info text-dark";

            case "Por comprar":
                return "bg-warning text-dark";

            case "Rechazada":
                return "bg-danger";

            case "Cancelada":
                return "bg-secondary";

            case "Pendiente aprobación":
                return "bg-secondary";

            default:
                return "bg-secondary";
        }
    };


    const columns = [
        {
            name: "REQ",
            selector: row => row.id,
            width: "90px"
        },
        {
            name: "Solicitante",
            selector: row => row.solicitante,
            sortable: true
        },
        {
            name: "Fecha",
            selector: row =>
                new Date(row.fecha).toLocaleDateString("es-MX"),
            width: "120px"
        },
        {
            name: "Categoría",
            selector: row => row.categoria
        },
        {
            name: "Total",
            selector: row =>
                Number(row.total ?? 0).toLocaleString(
                    "es-MX",
                    {
                        style: "currency",
                        currency: "MXN"
                    }
                )
        },
        {
            name: "Estado",
            cell: row => {

                const estadoActual = obtenerEstado(row);

                return (
                    <span
                        className={`badge ${obtenerClaseEstado(estadoActual)}`}
                    >
                        {estadoActual}
                    </span>
                );
            }
        },
        {
            name: "Acciones",
            cell: row => (
                <div className="d-flex gap-2">

                    <button
                        className="btn btn-sm btn-outline-primary"
                        title="Ver requisición"
                        onClick={() =>
                            navigate(`/compras/detalle/${row.id}`)
                        }
                    >
                        <FaEye />
                    </button>

                    <button
                        className="btn btn-sm btn-outline-secondary"
                        title="Imprimir requisición"
                        onClick={() =>
                            imprimirRequisicion(row.id)
                        }
                    >
                        <FaPrint />
                    </button>

                </div>
            ),
            ignoreRowClick: true,
            width: "130px"
        }
    ];


    return (
        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-header">
                    <h3 className="mb-0">
                        Control de requisiciones
                    </h3>
                </div>

                <div className="card-body">

                    <div className="row mb-3">

                        <div className="col-md-3">

                            <label className="form-label fw-bold">
                                Año
                            </label>

                            <select
                                className="form-select"
                                value={anio}
                                onChange={(e) => {
                                    setAnio(Number(e.target.value));
                                    setPagina(1);
                                }}
                            >
                                {anios.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="col-md-2">

                        <label className="form-label fw-bold">
                            Mes
                        </label>

                        <select
                            className="form-select"
                            value={mes}
                            onChange={(e) => {
                                setMes(e.target.value);
                                setPagina(1);
                            }}
                        >
                            <option value="">Todos</option>
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>

                    </div>

                        <div className="col-md-3">

                            <label className="form-label fw-bold">
                                Estado
                            </label>

                            <select
                                className="form-select"
                                value={estado}
                                onChange={(e) => {
                                    setEstado(e.target.value);
                                    setPagina(1);
                                }}
                            >
                                <option value="">Todos</option>

                                <option value="pendiente-aprobacion">
                                    Pendiente aprobación
                                </option>

                                <option value="por-comprar">
                                    Por comprar
                                </option>

                                <option value="pendiente-recepcion">
                                    Pendiente recepción
                                </option>

                                <option value="recepcion-parcial">
                                    Recepción parcial
                                </option>

                                <option value="lista-entregar">
                                    Lista para entregar
                                </option>

                                <option value="entregada">
                                    Entregada
                                </option>

                                <option value="rechazada">
                                    Rechazada
                                </option>

                                <option value="cancelada">
                                    Cancelada
                                </option>

                            </select>

                        </div>

                        
                        <div className="col-md-4">

                            <label className="form-label fw-bold">
                                Buscar
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="REQ, solicitante o descripción..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPagina(1);
                                }}
                            />

                        </div>

                        <div className="col-md-3">

                            <label className="form-label fw-bold">
                                Departamento
                            </label>

                            <select
                                className="form-select"
                                value={idDepartamento}
                                onChange={(e) => {
                                    setIdDepartamento(e.target.value);
                                    setPagina(1);
                                }}
                            >
                                <option value="">
                                    Todos
                                </option>

                                {departamentos.map((d) => (
                                    <option
                                        key={d.id}
                                        value={d.id}
                                    >
                                        {d.descripcion}
                                    </option>
                                ))}

                            </select>

                        </div>

                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">

                        <small className="text-muted">
                            {totalRegistros.toLocaleString("es-MX")} requisiciones encontradas
                        </small>

                    </div>            

                    <DataTable
                        columns={columns}
                        data={requisiciones}

                        progressPending={cargando}

                        pagination
                        paginationServer
                        paginationTotalRows={totalRegistros}
                        paginationPerPage={tamanoPagina}

                        paginationRowsPerPageOptions={[
                            10,
                            20,
                            50,
                            100
                        ]}

                        onChangePage={(page) => {
                            setPagina(page);
                        }}

                        onChangeRowsPerPage={(nuevoTamano) => {
                            setTamanoPagina(nuevoTamano);
                            setPagina(1);
                        }}

                        highlightOnHover
                        responsive
                        striped
                    />

                </div>

            </div>

        </div>
    );
}

export default ControlRequisiciones;