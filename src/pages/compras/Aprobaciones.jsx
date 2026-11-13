
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaSearch, FaClock } from "react-icons/fa";
import "./aprobaciones.css";

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
            const { data } = await obtenerPendientesAprobacion();
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

    // Indicador de antigüedad
    const obtenerEstadoDias = (dias) => {
        if (dias >= 180) {
            return {
                clase: "bg-danger",
                texto: "Vencida"
            };
        }

        if (dias >= 150) {
            return {
                clase: "bg-danger",
                texto: "Crítico"
            };
        }

        if (dias >= 120) {
            return {
                clase: "bg-warning text-dark",
                texto: "Advertencia"
            };
        }

        return {
            clase: "bg-success",
            texto: "En tiempo"
        };
    };

    return (
        <div className="container-fluid aprobaciones">

            {/* ENCABEZADO */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Aprobaciones</h2>
                    <span className="text-muted small">
                        Requisiciones pendientes de aprobación
                    </span>
                </div>

                <span className="contador-pendientes">
                    <FaClock />
                    <strong>{requisiciones.length}</strong>
                    pendientes
                </span>
            </div>

            <div className="card shadow-sm border-0">

                {/* BUSCADOR */}
                <div className="card-header bg-body border-bottom py-3">
                    <div className="row g-2 align-items-center">

                        <div className="col-12 col-md-7 col-lg-6">
                            <div className="input-group">
                                <span className="input-group-text bg-body">
                                    <FaSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por folio, solicitante, empresa o descripción..."
                                    aria-label="Buscar requisición"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-5 col-lg-6 text-md-end small text-muted">
                            Mostrando <strong>{requisicionesFiltradas.length}</strong> de{" "}
                            <strong>{requisiciones.length}</strong>
                        </div>

                    </div>
                </div>

                <div className="card-body p-0 tabla-card-body">

                    {cargando ? (

                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                            <p className="mt-3">
                                Cargando requisiciones...
                            </p>
                        </div>

                    ) : requisicionesFiltradas.length === 0 ? (

                        <div className="text-center text-muted py-5 px-3">
                            {busqueda
                                ? "No se encontraron requisiciones con esa búsqueda."
                                : "No hay requisiciones pendientes de aprobación."}
                        </div>

                    ) : (

                        <div className="table-responsive">
                            <table className="table table-hover align-middle tabla-aprobaciones">

                                <thead>
                                    <tr>
                                        <th>Folio</th>
                                        <th>Solicitante</th>
                                        <th>Descripción</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Antigüedad</th>
                                        <th className="text-end">Total</th>
                                        <th className="text-end">Acción</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {requisicionesFiltradas.map(r => {

                                        const dias = Number(r.diasTranscurridos || 0);
                                        const estado = obtenerEstadoDias(dias);

                                        return (
                                            <tr key={r.id}>

                                                <td>
                                                    <span className="folio">REQ-{r.id}</span>
                                                </td>

                                                <td>
                                                    <div>
                                                        <div className="persona">{r.solicitante}</div>
                                                        <div className="empresa">{r.empresa}</div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="descripcion" title={r.descripcion}>
                                                        {r.descripcion}
                                                    </div>
                                                </td>

                                                <td className="celda-fecha">
                                                    {new Date(r.fecha).toLocaleDateString("es-MX")}
                                                </td>

                                                <td className="text-center">
                                                    <div className="antiguedad">
                                                        <span className={`badge ${estado.clase}`}>
                                                            {dias} días
                                                        </span>
                                                        <small>{estado.texto}</small>
                                                    </div>
                                                </td>

                                                <td className="text-end celda-total">
                                                    {Number(r.total).toLocaleString(
                                                        "es-MX",
                                                        {
                                                            style: "currency",
                                                            currency: "MXN"
                                                        }
                                                    )}
                                                </td>

                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-revisar"
                                                        onClick={() => revisar(r.id)}
                                                    >
                                                        <FaEye />
                                                        Revisar
                                                    </button>
                                                </td>

                                            </tr>
                                        );
                                    })}
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
