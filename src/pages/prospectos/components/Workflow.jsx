import "../../../styles/Workflow.css";

import {
  FaUserPlus,
  FaFileInvoiceDollar,
  FaHourglassHalf,
  FaAddressCard,
} from "react-icons/fa";

function Workflow({ estatusHistorial }) {
  const historial = Array.isArray(estatusHistorial) ? estatusHistorial : [];

  const ordenados = [...historial].sort((a, b) => a.idEstatus - b.idEstatus);

  const prospecto = ordenados.filter(
    (x) => x.idEstatus >= 1 && x.idEstatus <= 4,
  );

  const cotizacion = ordenados.filter(
    (x) => x.idEstatus >= 5 && x.idEstatus <= 9,
  );

  const intermedio = ordenados.filter(
    (x) => x.idEstatus >= 10 && x.idEstatus <= 11,
  );

  const altas = ordenados.filter((x) => x.idEstatus == 12);

  const obtenerFechas = (historial = []) => {
    if (historial.length === 0) {
      return {
        fechaInicio: null,
        fechaFinal: null,
      };
    }

    const ordenados = [...historial].sort((a, b) => a.idEstatus - b.idEstatus);

    return {
      fechaInicio: ordenados[0].fechaCambioEstatus,
      fechaFinal: ordenados[ordenados.length - 1].fechaCambioEstatus,
    };
  };

  const obtenerEstadoProspecto = (prospecto = []) => {
    if (prospecto.length === 0) {
      return null;
    }

    if (prospecto.some((x) => x.idEstatus === 4)) return "completado";

    if (prospecto.length > 0) return "actual";

    return "pendiente";
  };

  const obtenerEstadoCotizacion = (cotizacion = []) => {
    if (cotizacion.length === 0) {
      return null;
    }

    if (cotizacion.some((x) => x.idEstatus === 9)) return "completado";

    if (cotizacion.some((x) => x.idEstatus >= 5 && x.idEstatus <= 8))
      return "actual";

    return "pendiente";
  };

  const obtenerEstadoIntermedio = (intermedio = []) => {
    if (intermedio.length === 0) {
      return null;
    }

    if (intermedio.some((x) => x.idEstatus === 11)) return "completado";

    if (intermedio.some((x) => x.idEstatus === 10)) return "actual";

    return "pendiente";
  };

  const obtenerEstadoAltas = (altas = []) => {
    if (altas.length === 0) {
      return null;
    }

    if (altas.some((x) => x.idEstatus === 12)) return "actual";

    return "pendiente";
  };

  const fechasProspecto = obtenerFechas(prospecto);
  const fechasCotizacion = obtenerFechas(cotizacion);
  const fechasIntermedio = obtenerFechas(intermedio);
  const fechasAltas = obtenerFechas(altas);

  const estadoProspecto = obtenerEstadoProspecto(prospecto);
  const estadoCotizacion = obtenerEstadoCotizacion(cotizacion);
  const estadoIntermedio = obtenerEstadoIntermedio(intermedio);
  const estadoAltas = obtenerEstadoAltas(altas);

  const pasos = [
    {
      nombre: "Prospeccion",
      icono: <FaUserPlus size={20} />,
      ...fechasProspecto,
      estado: estadoProspecto,
    },
    {
      nombre: "Cotizacion",
      icono: <FaFileInvoiceDollar size={20} />,
      ...fechasCotizacion,
      estado: estadoCotizacion,
    },
    {
      nombre: "Intermedio",
      icono: <FaHourglassHalf size={20} />,
      ...fechasIntermedio,
      estado: estadoIntermedio,
    },
    {
      nombre: "Altas",
      icono: <FaAddressCard size={20} />,
      ...fechasAltas,
      estado: estadoAltas,
    },
  ];

  return (
    <div className="workflow-card">
      <div className="workflow">
        {pasos.map((paso, index) => (
          <div key={index} className="workflow-step">
            <div
              className="workflow-circle"
              style={{
                backgroundColor:
                  paso.estado === "completado"
                    ? "#198754"
                    : paso.estado === "actual"
                      ? "#ffc107"
                      : "#adb5bd",
              }}
            >
              {paso.icono}
            </div>

            <div className="workflow-title">{paso.nombre}</div>

            <div className="workflow-date">
              <span className="fw-bolder"> Fecha de Inicio </span> {""}{" "}
              {paso.fechaInicio
                ? new Date(paso.fechaInicio).toLocaleDateString("es-MX")
                : "--"}
            </div>

            <div className="workflow-date">
              <span className="fw-bolder"> Fecha final </span> {""}{" "}
              {paso.fechaFinal
                ? new Date(paso.fechaFinal).toLocaleDateString("es-MX")
                : "--"}
            </div>

            {paso.responsable && (
              <div className="workflow-user">{paso.responsable}</div>
            )}

            {paso.numero && (
              <div className="workflow-oc">OC: {paso.numero}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workflow;
