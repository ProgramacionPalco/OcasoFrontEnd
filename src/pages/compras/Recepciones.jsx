import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { obtenerPendientesRecepcion } from "../../services/api";

function Recepciones() {

    const navigate = useNavigate();

    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {

        try {
            setLoading(true);

            const { data } = await obtenerPendientesRecepcion();

            setOrdenes(data);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };

    const ordenesFiltradas = ordenes.filter((x) => {

        const texto = busqueda.toLowerCase().trim();

        if (!texto)
            return true;

        return (
            String(x.numeroOC ?? "")
                .toLowerCase()
                .includes(texto) ||

            String(x.nombreProveedor ?? "")
                .toLowerCase()
                .includes(texto)
        );
    });

    const columnas = [
        {
            name: "OC",
            selector: row => row.numeroOC,
            sortable: true
        },
        {
            name: "Proveedor",
            selector: row => row.nombreProveedor,
            sortable: true
        },
        {
            name: "Fecha",
            selector: row =>
                new Date(row.fecha).toLocaleDateString("es-MX"),
            sortable: true
        },
        {
            name: "Estado",
            cell: row => (
                <span
                    className={
                        row.estatus === 2
                            ? "badge bg-warning text-dark"
                            : "badge bg-secondary"
                    }
                >
                    {row.estatus === 2
                        ? "Recepción parcial"
                        : "Pendiente"}
                </span>
            )
        },
        {
            name: "Acciones",
            cell: row => (
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                        navigate(
                            `/compras/orden-compra/detalle/${row.id}`
                        )
                    }
                >
                    Recibir
                </button>
            ),
            width: "130px"
        }
    ];

    return (
        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-body">

                    <h3 className="mb-4">
                        Recepciones
                    </h3>

                    <div className="row mb-4">

                        <div className="col-md-6">

                            <label className="form-label">
                                Buscar orden de compra
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="OC o proveedor..."
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(e.target.value)
                                }
                            />

                        </div>

                        <div className="col-md-6 d-flex align-items-end">

                            <span className="text-muted">
                                {ordenesFiltradas.length} pendientes de recepción
                            </span>

                        </div>

                    </div>

                    <DataTable
                        columns={columnas}
                        data={ordenesFiltradas}
                        progressPending={loading}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        persistTableHead
                        noDataComponent="No hay órdenes pendientes de recepción."
                    />

                </div>

            </div>

        </div>
    );
}

export default Recepciones;