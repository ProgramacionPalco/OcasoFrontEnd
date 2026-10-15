import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { obtenerPendientesCompra } from "../../services/api";

function PendientesCompra() {

    const navigate = useNavigate();

    const [requisiciones, setRequisiciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        cargar();
    }, []);


    // ==========================================
    // CARGAR REQUISICIONES
    // ==========================================
    const cargar = async () => {

        try {

            const { data } = await obtenerPendientesCompra();

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


    // ==========================================
    // COLUMNAS
    // ==========================================
    const columnas = [

        {
            name: "REQ",
            selector: row => row.id,
            sortable: true,
            width: "100px"
        },

        {
            name: "Empresa",
            selector: row => row.empresa,
            sortable: true
        },

        {
            name: "Solicitante",
            selector: row => row.solicitante,
            sortable: true
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
            selector: row =>
                "$" +
                Number(row.total)
                    .toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }),
            sortable: true
        },

        {
            name: "",
            cell: row => (

                <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                        navigate(
                            `/compras/orden-compra/${row.id}`
                        )
                    }
                >
                    Administrar OC
                </button>

            ),
            width: "170px"
        }

    ];


    return (

        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-body">

                    <h3 className="mb-4">
                        Pendientes de compra
                    </h3>


                    {/* BUSCADOR */}
                    <div className="row mb-4">

                        <div className="col-md-6">

                            <label className="form-label">
                                Buscar requisición
                            </label>

                            <div className="input-group">

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="REQ, solicitante, empresa, categoría..."
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                />

                                {busqueda && (

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            setBusqueda("")
                                        }
                                    >
                                        Limpiar
                                    </button>

                                )}

                            </div>

                        </div>


                        <div className="col-md-6 d-flex align-items-end">

                            <div className="text-muted pb-2">

                                Mostrando{" "}

                                <strong>
                                    {requisicionesFiltradas.length}
                                </strong>

                                {" "}de{" "}

                                <strong>
                                    {requisiciones.length}
                                </strong>

                                {" "}requisiciones

                            </div>

                        </div>

                    </div>


                    {/* TABLA */}
                    <DataTable
                        columns={columnas}
                        data={requisicionesFiltradas}
                        progressPending={loading}
                        progressComponent={
                            <div className="py-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                />
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
                        noDataComponent={
                            <div className="py-4 text-muted">
                                No se encontraron requisiciones.
                            </div>
                        }
                        highlightOnHover
                        striped
                        responsive
                        persistTableHead
                    />

                </div>

            </div>

        </div>

    );

}

export default PendientesCompra;