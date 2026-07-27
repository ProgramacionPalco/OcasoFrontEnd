import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { obtenerPendientesCompra } from "../../services/api";

function PendientesCompra() {

    const navigate = useNavigate();

    const [requisiciones, setRequisiciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargar();
    }, []);

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
            selector: row => row.categoria
        },

        {
            name: "Fecha",
            selector: row =>
                new Date(row.fecha).toLocaleDateString("es-MX"),
            sortable: true
        },

        {
            name: "Total",
            selector: row =>
                "$" + Number(row.total).toLocaleString("es-MX")
        },

        {
            name: "",
            cell: row => (

                <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                        navigate(`/compras/orden-compra/${row.id}`)
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

                    <DataTable
                        columns={columnas}
                        data={requisiciones}
                        progressPending={loading}
                        pagination
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