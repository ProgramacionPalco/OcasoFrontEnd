import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";

import { obtenerPendientesAprobacion } from "../../services/api";

function Aprobaciones() {

    const navigate = useNavigate();

    const [requisiciones, setRequisiciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {

        try {

            setCargando(true);

            const { data } =
                await obtenerPendientesAprobacion();

            setRequisiciones(data);

        } catch (error) {

            console.error(error);

        } finally {

            setCargando(false);

        }
    };

    const requisicionesFiltradas = requisiciones.filter(r => {

        const texto = busqueda.toLowerCase();

        return (
            r.id.toString().includes(texto) ||
            (r.solicitante || "").toLowerCase().includes(texto) ||
            (r.empresa || "").toLowerCase().includes(texto) ||
            (r.descripcion || "").toLowerCase().includes(texto)
        );

    });

    const revisar = (id) => {

        navigate(`/compras/aprobaciones/${id}`);

    };

    return (

        <div className="container-fluid">

            {/* ENCABEZADO */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Aprobaciones
                    </h2>

                    <span className="text-muted">
                        Requisiciones pendientes de aprobación
                    </span>
                </div>

                <span className="badge bg-warning text-dark fs-6">

                    {requisiciones.length} pendientes

                </span>

            </div>


            {/* BUSCADOR */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <label className="form-label fw-bold">
                        Buscar requisición
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Folio, solicitante, empresa o descripción..."
                        value={busqueda}
                        onChange={(e) =>
                            setBusqueda(e.target.value)
                        }
                    />

                </div>

            </div>


            {/* CONTENIDO */}

            <div className="card shadow-sm border-0">

                <div className="card-body">

                    {cargando ? (

                        <div className="text-center py-5">

                            <div className="spinner-border text-primary" />

                            <p className="mt-3">
                                Cargando requisiciones...
                            </p>

                        </div>

                    ) : requisicionesFiltradas.length === 0 ? (

                        <div className="alert alert-success mb-0">

                            No hay requisiciones pendientes de aprobación.

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-light">

                                    <tr>
                                        <th>Requisición</th>
                                        <th>Solicitante</th>
                                        <th>Empresa</th>
                                        <th>Descripción</th>
                                        <th>Fecha</th>
                                        <th className="text-end">
                                            Total
                                        </th>
                                        <th className="text-center">
                                            Acción
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {requisicionesFiltradas.map(r => (

                                        <tr key={r.id}>

                                            <td className="fw-bold">

                                                REQ-{r.id}

                                            </td>

                                            <td>
                                                {r.solicitante}
                                            </td>

                                            <td>
                                                {r.empresa}
                                            </td>

                                            <td>
                                                {r.descripcion}
                                            </td>

                                            <td>

                                                {new Date(r.fecha)
                                                    .toLocaleDateString("es-MX")}

                                            </td>

                                            <td className="text-end fw-bold">

                                                {Number(r.total)
                                                    .toLocaleString(
                                                        "es-MX",
                                                        {
                                                            style: "currency",
                                                            currency: "MXN"
                                                        }
                                                    )}

                                            </td>

                                            <td className="text-center">

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() =>
                                                        revisar(r.id)
                                                    }
                                                >
                                                    <FaEye className="me-1" />

                                                    Revisar
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}

export default Aprobaciones;