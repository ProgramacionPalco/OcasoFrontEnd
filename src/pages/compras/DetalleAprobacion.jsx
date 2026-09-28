import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    obtenerRequisicion,
    verDocumentoRequisicion,
    aprobarRequisicion
} from "../../services/api";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaArrowLeft
} from "react-icons/fa";


function DetalleAprobacion() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [procesando, setProcesando] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [observaciones, setObservaciones] = useState("");
    const [documentoUrl, setDocumentoUrl] = useState(null);
    const [nombreDocumento, setNombreDocumento] = useState("");

    useEffect(() => {
        cargar();
    }, [id]);

    const cargar = async () => {

        try {

            setCargando(true);

            const { data } = await obtenerRequisicion(id);

            setDetalle(data);

        } catch (error) {

            console.error(error);

        } finally {

            setCargando(false);

        }
    };

    const aprobar = async () => {

        if (procesando)
            return;

        try {

            setProcesando(true);

            await aprobarRequisicion({
                idRequisicion: Number(id),
                aprobada: true,
                observaciones: observaciones
            });

            alert("Requisición aprobada correctamente.");

            navigate("/compras/aprobaciones");

        }
        catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "No fue posible aprobar la requisición."
            );

        }
        finally {

            setProcesando(false);

        }
    };

    if (cargando) {

        return (
            <div className="container-fluid py-5 text-center">

                <div className="spinner-border text-primary" />

                <p className="mt-3">
                    Cargando requisición...
                </p>

            </div>
        );
    }

    if (!detalle) {

        return (
            <div className="container-fluid">

                <div className="alert alert-danger">
                    No se encontró la requisición.
                </div>

            </div>
        );
    }

    const requisicion = detalle.requisicion;
    const productos = detalle.detalles || [];
    const documentos = detalle.documentos || [];

    const verDocumento = async (doc) => {

        try {

            const response =
                await verDocumentoRequisicion(doc.id);

            const blob = new Blob(
                [response.data],
                {
                    type: response.headers["content-type"]
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            setDocumentoUrl(url);
            setNombreDocumento(doc.nombreDocumento);

        }
        catch (error) {

            console.error(error);

            alert("No fue posible abrir el documento.");

        }
    };

    return (

        <div className="container-fluid">

            {/* ENCABEZADO */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="mb-1">
                        REQ-{requisicion.id}
                    </h2>

                    <span className="text-muted">
                        Revisión de requisición
                    </span>

                </div>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                        navigate("/compras/aprobaciones")
                    }
                >
                    <FaArrowLeft className="me-2" />
                    Regresar
                </button>

            </div>


            {/* INFORMACIÓN GENERAL */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header">
                    <strong>Información general</strong>
                </div>

                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-md-6">

                            <small className="text-muted">
                                Solicitante
                            </small>

                            <div className="fw-bold">
                                {requisicion.solicitanteNombre}
                            </div>

                        </div>

                        <div className="col-md-6">

                            <small className="text-muted">
                                Empresa
                            </small>

                            <div className="fw-bold">
                                {requisicion.razonSocial}
                            </div>

                        </div>

                        <div className="col-md-6">

                            <small className="text-muted">
                                Categoría
                            </small>

                            <div>
                                {requisicion.categoria}
                            </div>

                        </div>

                        <div className="col-md-6">

                            <small className="text-muted">
                                Fecha
                            </small>

                            <div>
                                {new Date(
                                    requisicion.fechaRequisicion
                                ).toLocaleDateString("es-MX")}
                            </div>

                        </div>

                        <div className="col-12">

                            <small className="text-muted">
                                Descripción
                            </small>

                            <div>
                                {requisicion.descripcion}
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* PRODUCTOS */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header">
                    <strong>Productos / Servicios</strong>
                </div>

                <div className="card-body">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">

                                <tr>
                                    <th>Concepto</th>
                                    <th className="text-center">
                                        Cantidad
                                    </th>
                                    <th className="text-end">
                                        Precio
                                    </th>
                                    <th className="text-end">
                                        Total
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {productos.map(p => (

                                    <tr key={p.id}>

                                        <td>{p.concepto}</td>

                                        <td className="text-center">
                                            {p.cantidad}
                                        </td>

                                        <td className="text-end">

                                            {Number(p.precioUnitario)
                                                .toLocaleString(
                                                    "es-MX",
                                                    {
                                                        style: "currency",
                                                        currency: "MXN"
                                                    }
                                                )}

                                        </td>

                                        <td className="text-end fw-bold">

                                            {Number(p.total)
                                                .toLocaleString(
                                                    "es-MX",
                                                    {
                                                        style: "currency",
                                                        currency: "MXN"
                                                    }
                                                )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            {/* DOCUMENTOS */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header">
                    <strong>
                        Cotizaciones / Documentos
                    </strong>
                </div>

                <div className="card-body">

                    {documentos.length === 0 ? (

                        <div className="text-muted">
                            No hay documentos cargados.
                        </div>

                    ) : (

                        documentos.map(doc => (

                            <div
                                key={doc.id}
                                className="
                                    d-flex
                                    justify-content-between
                                    align-items-center
                                    border-bottom
                                    py-3
                                "
                            >

                                <div>

                                    <strong>
                                        {doc.nombreDocumento}
                                    </strong>

                                    <div className="text-muted small">
                                        {doc.comentario || "Sin comentario"}
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => verDocumento(doc)}
                                >
                                    Ver documento
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

            {/* APROBACIÓN */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header">
                    <strong>Decisión</strong>
                </div>

                <div className="card-body">

                    <label className="form-label fw-bold">
                        Observaciones
                    </label>

                    <textarea
                        className="form-control mb-4"
                        rows="3"
                        placeholder="Comentarios u observaciones..."
                        value={observaciones}
                        onChange={(e) =>
                            setObservaciones(e.target.value)
                        }
                    />

                    <div className="d-flex justify-content-end gap-2">

                        <button
                            type="button"
                            className="btn btn-outline-danger"
                        >
                            <FaTimesCircle className="me-2" />
                            Rechazar
                        </button>

                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={aprobar}
                            disabled={procesando}
                        >
                            {procesando ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                    />
                                    Aprobando...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="me-2" />
                                    Aprobar
                                </>
                            )}
                        </button>

                    </div>

                </div>

            </div>

            {documentoUrl && (

                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,.5)"
                    }}
                >

                    <div className="modal-dialog modal-xl modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    {nombreDocumento}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {

                                        window.URL.revokeObjectURL(documentoUrl);

                                        setDocumentoUrl(null);
                                        setNombreDocumento("");

                                    }}
                                />

                            </div>

                            <div
                                className="modal-body p-0"
                                style={{ height: "80vh" }}
                            >

                                <iframe
                                    src={documentoUrl}
                                    title={nombreDocumento}
                                    width="100%"
                                    height="100%"
                                    style={{ border: "none" }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}

export default DetalleAprobacion;