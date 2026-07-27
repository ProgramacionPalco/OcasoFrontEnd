import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerDetalleRequisicion } from "../../services/api";
import GeneralTab from "./components/GeneralTab";
import ProductosTab from "./components/ProductosTab";
import AprobacionTab from "./components/AprobacionTab";
import Workflow from "./components/Workflow";

function DetalleRequisicion() {

    const { id } = useParams();
    const [detalle, setDetalle] = useState(null);
    const [tab, setTab] = useState("general");

    useEffect(() => {

        cargar();

    }, []);

    const cargar = async () => {
        try {
            const { data } =
                await obtenerDetalleRequisicion(id);
            setDetalle(data);
        }
        catch (error) {
            console.error(error);
        }
    };

    if (!detalle) {

        return (
            <div className="container-fluid py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-3">
                        Cargando requisición...
                    </p>
                </div>
            </div>
        );

    }

    return (

        <div className="container-fluid">

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <h2>

                        REQ-{detalle.general.id}

                    </h2>
                    <Workflow
                        detalle={detalle}
                    />

                    <h4 className="fw-bold">

                        {detalle.general.descripcion}

                    </h4>

                    <hr/>

                    <div className="row">

                        <div className="col-md-6">

                            <p>

                                <strong>Solicitante:</strong>

                                {detalle.general.solicitanteNombre}

                            </p>

                            <p>

                                <strong>Empresa:</strong>

                                {detalle.general.razonSocial}

                            </p>

                            <p>

                                <strong>Categoría:</strong>

                                {detalle.general.categoria}

                            </p>

                        </div>

                        <div className="col-md-6">

                            <p>

                                <strong>Estatus:</strong>

                                {detalle.general.estatus}

                            </p>

                            <p>

                                <strong>Total:</strong>

                                $

                                {Number(detalle.general.valorTotal)
                                    .toLocaleString("es-MX")}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

            <ul className="nav nav-tabs mb-4">

                <li className="nav-item">

                    <button
                        className={`nav-link ${tab==="general" ? "active" : ""}`}
                        onClick={() => setTab("general")}
                    >
                        General
                    </button>

                </li>

                <li className="nav-item">

                    <button
                        className={`nav-link ${tab==="productos" ? "active" : ""}`}
                        onClick={() => setTab("productos")}
                    >
                        Productos
                    </button>

                </li>

                <li className="nav-item">

                    <button
                        className={`nav-link ${tab==="documentos" ? "active" : ""}`}
                        onClick={() => setTab("documentos")}
                    >
                        Cotizaciones
                    </button>

                </li>

                <li className="nav-item">

                    <button
                        className={`nav-link ${tab === "aprobacion" ? "active" : ""}`}
                        onClick={() => setTab("aprobacion")}
                    >

                        Aprobación

                    </button>

                </li>

            </ul>
            {
                tab === "general" &&
                <GeneralTab detalle={detalle} />
            }
            {
                tab === "productos" &&
                <ProductosTab
                    productos={detalle.productos}
                />
            }
            {
                tab === "aprobacion" &&
                <AprobacionTab
                    aprobacion={detalle.aprobacion}
                />
            }

        </div>

    );

}

export default DetalleRequisicion;