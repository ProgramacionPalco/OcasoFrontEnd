import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { verDocumentoRequisicion } from "../../../services/api";

function DocumentosTab({ documentos = [] }) {

    const [documentoUrl, setDocumentoUrl] = useState(null);
    const [nombreDocumento, setNombreDocumento] = useState("");

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

    if (documentos.length === 0) {

        return (

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="alert alert-info mb-0">

                        No hay documentos adjuntos
                        en esta requisición.

                    </div>

                </div>

            </div>

        );

    }


    return (

        <div className="card shadow-sm">

            <div className="card-body">

                <h5 className="fw-bold mb-3">

                    Cotizaciones / Documentos

                </h5>


                <div className="table-responsive">

                    <table className="table table-hover align-middle">

                        <thead className="table-light">

                            <tr>

                                <th>
                                    Archivo
                                </th>

                                <th>
                                    Comentario
                                </th>

                                <th>
                                    Fecha
                                </th>

                                <th>
                                    Usuario
                                </th>

                                <th className="text-center">
                                    Acción
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {documentos.map((doc) => (

                                <tr key={doc.id}>

                                    <td className="fw-semibold">

                                        {doc.nombreDocumento}

                                    </td>


                                    <td>

                                        {doc.comentario || "--"}

                                    </td>


                                    <td>

                                        {doc.fechaCarga
                                            ? new Date(
                                                doc.fechaCarga
                                            ).toLocaleDateString(
                                                "es-MX"
                                            )
                                            : "--"
                                        }

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

                            ))}

                        </tbody>

                    </table>

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
                                        style={{
                                            height: "80vh"
                                        }}
                                    >

                                        <iframe
                                            src={documentoUrl}
                                            title={nombreDocumento}
                                            width="100%"
                                            height="100%"
                                            style={{
                                                border: "none"
                                            }}
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default DocumentosTab;