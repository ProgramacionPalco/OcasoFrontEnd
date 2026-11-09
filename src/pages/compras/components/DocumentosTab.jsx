
import { useState } from "react";
import { FaEye, FaUpload } from "react-icons/fa";
import {
    verDocumentoRequisicion,
    agregarDocumentoRequisicion
} from "../../../services/api";

function DocumentosTab({
    documentos = [],
    idRequisicion,
    onDocumentoSubido
}) {
    const [documentoUrl, setDocumentoUrl] = useState(null);
    const [nombreDocumento, setNombreDocumento] = useState("");

    const [archivo, setArchivo] = useState(null);
    const [comentario, setComentario] = useState("");
    const [subiendo, setSubiendo] = useState(false);

    const verDocumento = async (doc) => {
        try {
            const response = await verDocumentoRequisicion(doc.id);

            const blob = new Blob(
                [response.data],
                { type: response.headers["content-type"] }
            );

            const url = window.URL.createObjectURL(blob);

            setDocumentoUrl(url);
            setNombreDocumento(doc.nombreDocumento);
        } catch (error) {
            console.error(error);
            alert("No fue posible abrir el documento.");
        }
    };

    const subirDocumento = async () => {
        if (!archivo) {
            alert("Selecciona un archivo.");
            return;
        }

        try {
            setSubiendo(true);

            await agregarDocumentoRequisicion(
                idRequisicion,
                archivo,
                comentario
            );

            alert("Cotización cargada correctamente.");

            setArchivo(null);
            setComentario("");

            document.getElementById("archivoCotizacion").value = "";

            await onDocumentoSubido();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "No fue posible subir la cotización."
            );
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">

                <h5 className="fw-bold mb-3">
                    Cotizaciones / Documentos
                </h5>

                {/* CARGAR COTIZACIÓN */}
                <div className="border rounded p-3 mb-4">

                    <h6 className="fw-bold mb-3">
                        Subir nueva cotización
                    </h6>

                    <div className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">
                                Archivo
                            </label>

                            <input
                                id="archivoCotizacion"
                                type="file"
                                className="form-control"
                                accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    setArchivo(e.target.files[0] || null)
                                }
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Comentario
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ej. Cotización proveedor ABC"
                                value={comentario}
                                onChange={(e) =>
                                    setComentario(e.target.value)
                                }
                            />
                        </div>

                        <div className="col-12 text-end">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={subirDocumento}
                                disabled={subiendo || !archivo}
                            >
                                <FaUpload className="me-2" />

                                {subiendo
                                    ? "Subiendo..."
                                    : "Subir cotización"}
                            </button>
                        </div>

                    </div>
                </div>

                {/* DOCUMENTOS EXISTENTES */}
                <div className="table-responsive">

                    <table className="table table-hover align-middle">

                        <thead className="table-light">
                            <tr>
                                <th>Archivo</th>
                                <th>Comentario</th>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th className="text-center">Acción</th>
                            </tr>
                        </thead>

                        <tbody>

                            {documentos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        No hay documentos adjuntos.
                                    </td>
                                </tr>
                            ) : (
                                documentos.map((doc) => (
                                    <tr key={doc.id}>

                                        <td className="fw-semibold">
                                            {doc.nombreDocumento}
                                        </td>

                                        <td>
                                            {doc.comentario || "--"}
                                        </td>

                                        <td>
                                            {doc.fechaCarga
                                                ? new Date(doc.fechaCarga)
                                                    .toLocaleDateString("es-MX")
                                                : "--"}
                                        </td>

                                        <td>
                                            {doc.usuario || "--"}
                                        </td>

                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => verDocumento(doc)}
                                            >
                                                <FaEye className="me-1" />
                                                Ver
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>
                </div>

                {/* VISOR */}
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
        </div>
    );
}

export default DocumentosTab;
