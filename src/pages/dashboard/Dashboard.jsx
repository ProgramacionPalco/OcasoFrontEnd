import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  FaUsers,
  FaUserCheck,
  FaUserEdit,
  FaFlagUsa,
  FaHandshake,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaFileAlt,
  FaChevronRight,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../services/api";
import usePermiso from "../../hooks/usePermiso";

ChartJS.register(ArcElement, Tooltip, Legend);

const porcentaje = (parte, total) =>
  total > 0 ? Math.round((Number(parte || 0) / total) * 100) : 0;

const formatoNumero = (n) => Number(n || 0).toLocaleString("es-MX");

// Los campos del reporte de vencimientos pueden variar; se toma el primero disponible
const campo = (obj, ...claves) => {
  for (const c of claves) {
    if (obj?.[c] !== undefined && obj?.[c] !== null && obj?.[c] !== "") return obj[c];
  }
  return null;
};

const diasPara = (fecha) => {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return Math.round((f - hoy) / 86400000);
};

function Dashboard() {

  const navigate = useNavigate();
  const permisoClientes = usePermiso("/clientes");
  const permisoReporte = usePermiso("/reportes/clientes-documentos");

  const [data, setData] = useState(null);
  const [docsPorVencer,setDocsPorVencer] = useState([]);
  const [alertas,setAlertas] = useState(null);

  const obtenerDashboard = async () => {
    try {
      const res = await api.get("/altas/clientes/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    }
  };

  const cargarAlertas = async () => {
    try {
      const res = await api.get("/reportes/documentos-por-vencer");
      setDocsPorVencer(res.data || []);
    } catch (error) {
      console.error("Error cargando alertas documentos", error);
    }
  };

  const cargarResumenAlertas = async () => {
    try{
      const res = await api.get("/reportes/alertas-documentos");
      setAlertas(res.data);
    }
    catch(err){
      console.error("Error cargando resumen alertas",err);
    }
  }

  useEffect(() => {
    obtenerDashboard();
    cargarAlertas();
    cargarResumenAlertas();
  }, []);

  if (!data) {
    return (
      <div className="dash">
        <div className="dash-panel">
          <div className="dash-vacio">
            <div className="spinner-border text-primary" role="status" />
            <span>Cargando dashboard…</span>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // INDICADORES DERIVADOS
  // ==============================

  const total = Number(data.totalClientes || 0);
  const pctActivos = porcentaje(data.activos, total);
  const pctBorradores = porcentaje(data.borradores, total);
  const pctUsa = porcentaje(data.usa, total);
  const pctCorresponsalia = porcentaje(data.corresponsalia, total);

  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const irA = (ruta, permitido) =>
    permitido
      ? {
          role: "button",
          tabIndex: 0,
          onClick: () => navigate(ruta),
          onKeyDown: (e) => e.key === "Enter" && navigate(ruta),
        }
      : {};

  // Salud documental
  const documentos = alertas
    ? [
        { etiqueta: "Vigentes", valor: Number(alertas.vigentes || 0), color: "#10b981", tono: "success" },
        { etiqueta: "Por vencer (30 días)", valor: Number(alertas.porVencer || 0), color: "#f59e0b", tono: "warning" },
        { etiqueta: "Vencidos", valor: Number(alertas.vencidos || 0), color: "#ef4444", tono: "danger" },
      ]
    : [];

  const totalDocs = documentos.reduce((s, d) => s + d.valor, 0);
  const pctVigencia = porcentaje(alertas?.vigentes, totalDocs);

  const datosDocs = {
    labels: documentos.map((d) => d.etiqueta),
    datasets: [
      {
        data: documentos.map((d) => d.valor),
        backgroundColor: documentos.map((d) => d.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const opcionesDocs = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed} (${porcentaje(ctx.parsed, totalDocs)}%)`,
        },
      },
    },
  };

  // Próximos vencimientos (ordenados por fecha)
  const proximos = [...docsPorVencer]
    .map((d, i) => ({
      clave: campo(d, "id", "idDocumento") ?? i,
      documento: campo(d, "documento", "nombreDocumento", "tipoDocumento", "descripcion", "nombre") ?? "Documento",
      cliente: campo(d, "cliente", "razonSocial", "nombreCliente", "empresa"),
      fecha: campo(d, "fechaVencimiento", "vencimiento", "fecha"),
    }))
    .sort((a, b) => new Date(a.fecha || 8.64e15) - new Date(b.fecha || 8.64e15));

  return (
    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Ocaso ERP</span>
          <h2 className="dash-titulo">Panel general</h2>
          <div className="dash-contexto">
            <span className="text-capitalize"><FaCalendarAlt /> {fechaHoy}</span>
            <span><FaUsers /> {formatoNumero(total)} clientes</span>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* AVISO DE VENCIMIENTOS */}
      {/* ========================= */}

      {docsPorVencer.length > 0 && (
        <div
          className={`dash-aviso mb-4 ${permisoReporte.puedeVer ? "dash-clicable" : ""}`}
          {...irA("/reportes/clientes-documentos", permisoReporte.puedeVer)}
        >
          <span className="dash-aviso-icono"><FaExclamationTriangle /></span>
          <div className="dash-aviso-texto">
            <strong>{formatoNumero(docsPorVencer.length)} documentos vencerán en los próximos 30 días</strong>
            <span>Revisa y solicita la actualización a los clientes antes de su vencimiento.</span>
          </div>
          {permisoReporte.puedeVer && (
            <span className="dash-kpi-link dash-aviso-link">
              Ver reporte <FaChevronRight />
            </span>
          )}
        </div>
      )}

      {/* ========================= */}
      {/* KPIs DE CARTERA */}
      {/* ========================= */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-6 col-xl-3">
          <div
            className={`dash-kpi dash-kpi-destacado dash-kpi-azul h-100 ${permisoClientes.puedeVer ? "dash-clicable" : ""}`}
            {...irA("/clientes", permisoClientes.puedeVer)}
          >
            <div className="dash-kpi-top">
              <span className="dash-kpi-label">Total de clientes</span>
              <span className="dash-kpi-icono"><FaUsers /></span>
            </div>
            <div className="dash-kpi-valor">{formatoNumero(total)}</div>
            <div className="dash-kpi-pie">
              Cartera registrada
              {permisoClientes.puedeVer && (
                <span className="dash-kpi-link">Ver clientes <FaChevronRight /></span>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="dash-kpi h-100">
            <div className="dash-kpi-top">
              <span className="dash-kpi-label">Clientes activos</span>
              <span className="dash-kpi-icono dash-tono-success"><FaUserCheck /></span>
            </div>
            <div className="dash-kpi-valor">
              {formatoNumero(data.activos)}
              <span className="dash-delta dash-delta-sube">{pctActivos}%</span>
            </div>
            <div className="dash-barra">
              <div className="dash-barra-relleno dash-bg-success" style={{ width: `${pctActivos}%` }} />
            </div>
            <div className="dash-kpi-pie">Con alta completa</div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="dash-kpi h-100">
            <div className="dash-kpi-top">
              <span className="dash-kpi-label">Borradores</span>
              <span className="dash-kpi-icono dash-tono-warning"><FaUserEdit /></span>
            </div>
            <div className="dash-kpi-valor">
              {formatoNumero(data.borradores)}
              <small>{pctBorradores}%</small>
            </div>
            <div className="dash-barra">
              <div className="dash-barra-relleno dash-bg-warning" style={{ width: `${pctBorradores}%` }} />
            </div>
            <div className="dash-kpi-pie">Alta pendiente de completar</div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="dash-kpi h-100">
            <div className="dash-kpi-top">
              <span className="dash-kpi-label">Vigencia documental</span>
              <span className="dash-kpi-icono dash-tono-primary"><FaShieldAlt /></span>
            </div>
            <div className="dash-kpi-valor">
              {alertas ? <>{pctVigencia}<small>%</small></> : "—"}
            </div>
            <div className="dash-barra">
              <div className="dash-barra-relleno dash-bg-primary" style={{ width: `${pctVigencia}%` }} />
            </div>
            <div className="dash-kpi-pie">
              {alertas ? `${formatoNumero(alertas.vigentes)} de ${formatoNumero(totalDocs)} documentos` : "Sin información"}
            </div>
          </div>
        </div>

      </div>

      {/* ========================= */}
      {/* DOCUMENTOS + SEGMENTOS */}
      {/* ========================= */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-lg-7">
          <div className="dash-panel h-100">
            <div className="dash-panel-header">
              <div>
                <h5 className="dash-panel-titulo">Salud documental</h5>
                <span className="dash-panel-subtitulo">Estado de los documentos de los clientes</span>
              </div>
            </div>

            {!alertas || totalDocs === 0 ? (
              <div className="dash-vacio">
                <FaFileAlt />
                <span>Sin información de documentos</span>
              </div>
            ) : (
              <div className="dash-dona-layout">
                <div className="dash-dona">
                  <Doughnut data={datosDocs} options={opcionesDocs} />
                  <div className="dash-dona-centro">
                    <div className="dash-dona-valor">{formatoNumero(totalDocs)}</div>
                    <div className="dash-dona-label">documentos</div>
                  </div>
                </div>

                <ul className="dash-leyenda">
                  {documentos.map((d) => (
                    <li key={d.etiqueta}>
                      <span className="dash-leyenda-punto" style={{ background: d.color }} />
                      <span className="dash-leyenda-texto">{d.etiqueta}</span>
                      <span className="dash-leyenda-valor">{formatoNumero(d.valor)}</span>
                      <span className="dash-leyenda-pct">{porcentaje(d.valor, totalDocs)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="dash-panel h-100">
            <div className="dash-panel-header">
              <div>
                <h5 className="dash-panel-titulo">Segmentos de clientes</h5>
                <span className="dash-panel-subtitulo">Proporción respecto al total de la cartera</span>
              </div>
            </div>

            <div className="dash-indicadores">

              <div className="dash-indicador">
                <span className="dash-indicador-icono dash-tono-primary"><FaFlagUsa /></span>
                <div className="dash-indicador-cuerpo">
                  <div className="dash-indicador-fila">
                    <span>Clientes USA</span>
                    <strong>{formatoNumero(data.usa)}</strong>
                  </div>
                  <div className="dash-barra">
                    <div className="dash-barra-relleno dash-bg-primary" style={{ width: `${pctUsa}%` }} />
                  </div>
                  <small>{pctUsa}% del total</small>
                </div>
              </div>

              <div className="dash-indicador">
                <span className="dash-indicador-icono dash-tono-info"><FaHandshake /></span>
                <div className="dash-indicador-cuerpo">
                  <div className="dash-indicador-fila">
                    <span>Corresponsalía</span>
                    <strong>{formatoNumero(data.corresponsalia)}</strong>
                  </div>
                  <div className="dash-barra">
                    <div className="dash-barra-relleno dash-bg-info" style={{ width: `${pctCorresponsalia}%` }} />
                  </div>
                  <small>{pctCorresponsalia}% del total</small>
                </div>
              </div>

              <div className="dash-indicador">
                <span className="dash-indicador-icono dash-tono-success"><FaUserCheck /></span>
                <div className="dash-indicador-cuerpo">
                  <div className="dash-indicador-fila">
                    <span>Activos</span>
                    <strong>{formatoNumero(data.activos)}</strong>
                  </div>
                  <div className="dash-barra">
                    <div className="dash-barra-relleno dash-bg-success" style={{ width: `${pctActivos}%` }} />
                  </div>
                  <small>{pctActivos}% del total</small>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ========================= */}
      {/* PRÓXIMOS VENCIMIENTOS */}
      {/* ========================= */}

      <div className="dash-panel">
        <div className="dash-panel-header">
          <div>
            <h5 className="dash-panel-titulo">Próximos vencimientos</h5>
            <span className="dash-panel-subtitulo">Documentos que vencen en los próximos 30 días</span>
          </div>
          {proximos.length > 0 && (
            <span className="dash-chip">{formatoNumero(proximos.length)}</span>
          )}
        </div>

        {proximos.length === 0 ? (
          <div className="dash-vacio">
            <FaCheckCircle />
            <span>No hay documentos por vencer en los próximos 30 días</span>
          </div>
        ) : (
          <>
            <ul className="dash-lista">
              {proximos.slice(0, 8).map((d) => {
                const dias = diasPara(d.fecha);
                const tono = dias === null ? "secondary" : dias <= 7 ? "danger" : dias <= 15 ? "warning" : "info";
                return (
                  <li key={d.clave} className="dash-lista-item">
                    <span className={`dash-indicador-icono dash-tono-${tono}`}><FaFileAlt /></span>
                    <div className="dash-lista-cuerpo">
                      <div className="dash-lista-titulo">{d.documento}</div>
                      {d.cliente && <div className="dash-lista-sub">{d.cliente}</div>}
                    </div>
                    <div className="dash-lista-fin">
                      {d.fecha && (
                        <div className="dash-lista-fecha">
                          {new Date(d.fecha).toLocaleDateString("es-MX")}
                        </div>
                      )}
                      {dias !== null && (
                        <span className={`dash-dias dash-tono-${tono}`}>
                          {dias < 0 ? "Vencido" : dias === 0 ? "Hoy" : `${dias} días`}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {(proximos.length > 8 || permisoReporte.puedeVer) && (
              <div className="dash-lista-footer">
                {proximos.length > 8 && <span>+{formatoNumero(proximos.length - 8)} documentos más</span>}
                {permisoReporte.puedeVer && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm dash-btn-tabla"
                    onClick={() => navigate("/reportes/clientes-documentos")}
                  >
                    Ver reporte completo <FaChevronRight />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
