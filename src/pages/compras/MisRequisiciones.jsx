import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

import { obtenerMisRequisiciones } from "../../services/api";

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
                return "badge bg-success";

            case "Lista para entregar":
                return "badge bg-success";

            case "Recepción parcial":
                return "badge bg-warning text-dark";

            case "Pendiente recepción":
                return "badge bg-info text-dark";

            case "Por comprar":
                return "badge bg-primary";

            case "Pendiente aprobación":
                return "badge bg-warning text-dark";

            case "Rechazada":
                return "badge bg-danger";

            case "Cancelada":
                return "badge bg-secondary";

            default:
                return "badge bg-secondary";
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


    // ==============================
    // COLUMNAS
    // ==============================

    const columnas = [

        {
            name: "REQ",
            selector: row => row.id,
            sortable: true,
            width: "100px"
        },

        {
            name: "Descripción",
            selector: row => row.descripcion,
            sortable: true,
            grow: 2
        },

        {
            name: "Categoría",
            selector: row => row.categoria,
            sortable: true
        },

        {
            name: "Fecha",
            selector: row =>
                new Date(row.fecha)
                    .toLocaleDateString("es-MX"),
            sortable: true
        },

        {
            name: "Total",
            selector: row => row.total,
            cell: row => (
                <strong>
                    {Number(row.total ?? 0)
                        .toLocaleString(
                            "es-MX",
                            {
                                style: "currency",
                                currency: "MXN"
                            }
                        )}
                </strong>
            ),
            sortable: true
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
                        {estadoActual}
                    </span>
                );
            }
        },

        {
            name: "Acciones",
            cell: row => (

                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                        navigate(
                            `/compras/detalle/${row.id}`
                        )
                    }
                >
                    Ver
                </button>

            ),
            width: "100px"
        }

    ];


    return (

        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h3 className="mb-1">
                                Mis Requisiciones
                            </h3>

                            <span className="text-muted">
                                Consulta y seguimiento de tus requisiciones
                            </span>

                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate("/compras/nueva")
                            }
                        >
                            Nueva requisición
                        </button>

                    </div>


                    {/* FILTROS */}

                    <div className="row g-3 mb-4">

                        <div className="col-md-8">

                            <label className="form-label">
                                Buscar
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="REQ, descripción o categoría..."
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-4">

                            <label className="form-label">
                                Estado
                            </label>

                            <select
                                className="form-select"
                                value={estado}
                                onChange={(e) =>
                                    setEstado(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="Todos">Todos</option>

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

                    </div>


                    <DataTable
                        columns={columnas}
                        data={requisicionesFiltradas}
                        progressPending={cargando}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[
                            10,
                            25,
                            50
                        ]}
                        highlightOnHover
                        striped
                        responsive
                        persistTableHead
                        noDataComponent="No tienes requisiciones registradas."
                    />

                </div>

            </div>

        </div>
    );
}