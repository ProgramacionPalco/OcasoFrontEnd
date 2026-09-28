import { useParams } from "react-router-dom";

function DetalleOrdenCompra() {

    const { idOrdenCompra } = useParams();

    return (
        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-body">

                    <h3>
                        Detalle Orden de Compra
                    </h3>

                    <p>
                        ID Orden: {idOrdenCompra}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default DetalleOrdenCompra;