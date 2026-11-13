import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerOrdenesCompra } from "../../services/api";
import {
    FaFileInvoiceDollar,
    FaPlus,
    FaArrowLeft,
    FaExternalLinkAlt,
    FaClipboardList
} from "react-icons/fa";

const inicial = (texto) => (texto || "?").trim().charAt(0).toUpperCase();

const formatoFecha = (valor) =>
    valor
        ? new Date(valor).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "—";

function AdministrarOrdenesCompra() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        try {
            const { data } = await obtenerOrdenesCompra(id);
            setOrdenes(data);
        } finally {
            setCargando(false);
        }
    };

    const nuevaOrden = () =>
        navigate(`/compras/ordenes-compra/${id}/nueva`);

    return (
        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">

                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Compras</span>
                    <h2 className="dash-titulo">Órdenes de compra</h2>
                    <div className="dash-contexto">
                        <span><FaClipboardList /> Requisición REQ-{id}</span>
                        <span>
                            <FaFileInvoiceDollar /> {ordenes.length}{" "}
                            {ordenes.length === 1 ? "orden generada" : "órdenes generadas"}
                        </span>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <button
                        className="btn dash-btn-hero dash-btn-hero-sec"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                        Regresar
                    </button>

                    <button
                        className="btn btn-light dash-btn-hero"
                        onClick={nuevaOrden}
                    >
                        <FaPlus />
                        Nueva orden de compra
                    </button>
                </div>

            </div>

            {/* ========================= */}
            {/* LISTADO */}
            {/* ========================= */}

            <div className="dash-panel p-0 overflow-hidden mb-4">

                <div className="listado-toolbar">
                    <div>
                        <h5 className="dash-panel-titulo mb-0">Órdenes de la requisición</h5>
                        <span className="dash-panel-subtitulo">
                            Abra una orden para ver su detalle, productos y documentos
                        </span>
                    </div>
                </div>

                {cargando ? (

                    <div className="dash-vacio">
                        <div className="spinner-border text-primary" role="status" />
                        <span>Cargando órdenes…</span>
                    </div>

                ) : ordenes.length === 0 ? (

                    <div className="dash-vacio">
                        <FaFileInvoiceDollar />
                        <span>Esta requisición todavía no tiene órdenes de compra.</span>
                        <button
                            className="btn btn-primary np-btn mt-2"
                            onClick={nuevaOrden}
                        >
                            <FaPlus /> Crear la primera orden
                        </button>
                    </div>

                ) : (

                    <div className="table-responsive">
                    <table className="table align-middle docs-tabla tabla-cards">

                        <thead>
                            <tr>
                                <th>OC</th>
                                <th>Proveedor</th>
                                <th>Fecha</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>

                            {ordenes.map(x => (

                                <tr key={x.id}>

                                    <td>
                                        <span className="mr-folio">{x.numeroOC}</span>
                                    </td>

                                    <td>
                                        <div className="cliente-nombre">
                                            <span className="cliente-avatar">{inicial(x.nombreProveedor)}</span>
                                            <span className="text-break">
                                                {x.nombreProveedor || <span className="text-muted">Sin proveedor</span>}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="docs-fecha">{formatoFecha(x.fecha)}</td>

                                    <td>
                                        <div className="docs-acciones">
                                            <button
                                                className="btn dash-btn-tabla dash-btn-suave"
                                                onClick={() =>
                                                    navigate(
                                                        `/compras/orden-compra/detalle/${x.id}`
                                                    )
                                                }
                                            >
                                                <FaExternalLinkAlt /> Abrir
                                            </button>
                                        </div>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                    </div>

                )}

            </div>

        </div>
    );
}

export default AdministrarOrdenesCompra;
