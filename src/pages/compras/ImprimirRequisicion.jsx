
import { useParams } from "react-router-dom";
import { FaPrint } from "react-icons/fa";

export default function ImprimirRequisicion() {
    const { id } = useParams();

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    Requisición #{id}
                </h4>

                <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                >
                    <FaPrint className="me-2" />
                    Imprimir
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <h5>Formato de requisición</h5>
                    <p>
                        Requisición número: <strong>{id}</strong>
                    </p>
                </div>
            </div>

            <style>{`
                @media print {
                    .btn {
                        display: none !important;
                    }

                    .card {
                        border: none !important;
                        box-shadow: none !important;
                    }

                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                }
            `}</style>

        </div>
    );
}
