import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerOrdenesCompra } from "../../services/api";

function AdministrarOrdenesCompra() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [ordenes, setOrdenes] = useState([]);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        const { data } = await obtenerOrdenesCompra(id);
        setOrdenes(data);
    };

    return (
        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h3>Órdenes de Compra</h3>

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate(`/compras/ordenes-compra/${id}/nueva`)
                            }
                        >
                            Nueva Orden de Compra
                        </button>

                    </div>

                    {ordenes.length === 0 ? (

                        <div className="alert alert-info">
                            Esta requisición todavía no tiene órdenes de compra.
                        </div>

                    ) : (

                        <table className="table table-hover">

                            <thead>
                                <tr>
                                    <th>OC</th>
                                    <th>Proveedor</th>
                                    <th>Fecha</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {ordenes.map(x => (

                                    <tr key={x.id}>

                                        <td>{x.numeroOC}</td>
                                        <td>{x.nombreProveedor}</td>
                                        <td>{new Date(x.fecha).toLocaleDateString()}</td>

                                        <td>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Abrir
                                            </button>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>
    );
}

export default AdministrarOrdenesCompra;