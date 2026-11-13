import { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaUsers,
  FaFilter,
  FaSyncAlt,
  FaSearch,
  FaHandshake,
  FaChartLine,
  FaChartPie,
  FaUserTie,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
  FaHistory,
  FaInbox,
} from "react-icons/fa";
import { TextField, MenuItem } from "@mui/material";
import api from "../../services/api";
import { DataGrid } from "@mui/x-data-grid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Claves que devuelve la API en los datos anuales
const CLAVES_MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const PALETA = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#64748b", "#ec4899"];

const porcentaje = (parte, total) =>
  total > 0 ? Math.round((Number(parte || 0) / total) * 100) : 0;

// Estilo del DataGrid alineado al dashboard (funciona en modo claro y oscuro)
const estiloGrid = {
  border: 0,
  backgroundColor: "transparent",
  fontSize: 14,
  "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": {
    backgroundColor: "var(--bs-tertiary-bg)",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".03em",
    color: "var(--bs-secondary-color)",
  },
  "& .MuiDataGrid-cell": {
    borderColor: "var(--bs-border-color-translucent)",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "var(--bs-tertiary-bg)",
  },
  "& .MuiDataGrid-footerContainer": {
    borderColor: "var(--bs-border-color-translucent)",
  },
};

// Variación porcentual contra el mes anterior
function Delta({ valor }) {
  if (valor === null) return null;
  const sube = valor >= 0;
  return (
    <span className={`dash-delta ${sube ? "dash-delta-sube" : "dash-delta-baja"}`}>
      {sube ? <FaArrowUp /> : <FaArrowDown />}
      {Math.abs(valor)}%
    </span>
  );
}

function DashboardVentas() {
  /* formularios */
  const [filtro, setFiltro] = useState({
    Mes: "",
    Año: "",
  });
  const [clientes, setClientes] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [clientesAnuales, setClientesAnuales] = useState([]);
  const [prospectosAnuales, setProspectosAnuales] = useState([]);
  const [estatusHistorial, setEstatusHistorial] = useState([]);

  /* variables */
  const [modalClientes, setModalClientes] = useState(false);
  const [modalProspectos, setModalProspectos] = useState(false);
  const [modalProspectosHistorial, setModalProspectosHistorial] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());

  // Periodo que se está mostrando (se actualiza al presionar "Filtrar")
  const [periodo, setPeriodo] = useState({
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
  });
  const [filtrando, setFiltrando] = useState(false);

  // Los datos anuales se consultan una vez, con el año actual
  const [anioAnual] = useState(new Date().getFullYear());

  const años = Array.from(
    { length: new Date().getFullYear() - 2025 + 1 },
    (_, i) => 2025 + i,
  );

  const ObtenerVentasPorMes = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerVentasPorMes",
        payload,
      );
      setClientes(res.data);
    } catch (error) {
      console.error("Error cargando ventas", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

  const ObtenerProspectosPorMes = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerProspectosPorMes",
        payload,
      );
      setProspectos(res.data);
    } catch (error) {
      console.error("Error cargando prospectos", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

  const ObtenerClientesAnuales = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerClientesAnuales",
        payload,
      );
      setClientesAnuales(res.data);
    } catch (error) {
      console.error("Error cargando ventas anuales", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

  const ObtenerProspectosAnuales = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerProspectosAnuales",
        payload,
      );
      setProspectosAnuales(res.data);
    } catch (error) {
      console.error("Error cargando prospectos anuales", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

   const obtenerEstatusHistorial = async (id) => {
    try {
      const res = await api.post(
        `/dashboardVentas/obtenerEstatusHistorialDashboard/?idProspecto=${id}`,
      );

      setEstatusHistorial(res.data);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Error API:", error.response?.data);
      console.error("Errors:", error.response?.data?.errors);
    }
  };

  useEffect(() => {
    ObtenerVentasPorMes();
    ObtenerProspectosPorMes();
    ObtenerClientesAnuales();
    ObtenerProspectosAnuales();
  }, []);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 991);
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  const formatearFecha = (value) =>
    value
      ? new Date(value).toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : "Sin fecha";

  const abrirHistorial = async (id) => {
    await obtenerEstatusHistorial(id);
    setModalProspectosHistorial(true);
  };

  const filtrar = async () => {
    setFiltrando(true);
    try {
      await ObtenerVentasPorMes();
      await ObtenerProspectosPorMes();
      setPeriodo({ mes, año });
    } finally {
      setFiltrando(false);
    }
  };

  const columnsClientes = [
    { field: "id", headerName: "id", width: 60, minWidth: 50 },
    {
      field: "fecha",
      headerName: "Fecha registro",
      width: 140,
      minWidth: 120,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          : "",
    },
    {
      field: "razonSocial",
      headerName: "Razon Social",
      flex: 1,
      minWidth: 200,
    },
    { field: "rfc", headerName: "Rfc", width: 140, minWidth: 120 },
  ];

  const columnsProspectos = [
    { field: "id", headerName: "id", width: 60, minWidth: 50 },
    {
      field: "fechaRegistro",
      headerName: "Fecha registro",
      width: 140,
      minWidth: 120,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          : "",
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200,
    },
    { field: "ejecutivo", headerName: "Ejecutivo", width: 160, minWidth: 150 },
    { field: "estatus", headerName: "Estatus", width: 160, minWidth: 150 },
  ];

  const columnsProspectosDetalles = [
    { field: "id", headerName: "Folio", width: 80, minWidth: 70 },
    {
      field: "fechaRegistro",
      headerName: "Fecha registro",
      width: 150,
      minWidth: 130,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          : "",
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <span className="fw-semibold text-truncate">{params.value}</span>
      ),
    },
    { field: "ejecutivo", headerName: "Ejecutivo", width: 180, minWidth: 150 },
    {
      field: "estatus",
      headerName: "Estatus",
      width: 170,
      minWidth: 150,
      renderCell: (params) =>
        params.value ? (
          <span className="dash-estatus">{params.value}</span>
        ) : (
          "—"
        ),
    },
    {
      field: "historial",
      headerName: "Historial",
      width: 150,
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm dash-btn-tabla"
          onClick={() => abrirHistorial(params.row.id)}
        >
          <FaHistory /> Historial
        </button>
      ),
    },
  ];

  // ==============================
  // INDICADORES DERIVADOS
  // ==============================

  const nombreMes = (m) => NOMBRES_MESES[Number(m) - 1] ?? "Todos los meses";
  const periodoTexto = `${nombreMes(periodo.mes)} ${periodo.año}`;

  const serieClientes = CLAVES_MESES.map((k) => Number(clientesAnuales?.[k] ?? 0));
  const serieProspectos = CLAVES_MESES.map((k) => Number(prospectosAnuales?.[k] ?? 0));

  const totalClientesAnual = serieClientes.reduce((a, b) => a + b, 0);
  const totalProspectosAnual = serieProspectos.reduce((a, b) => a + b, 0);

  // Comparativo contra el mes anterior (solo si el periodo es del año de los datos anuales)
  const comparativo = (serie) => {
    const m = Number(periodo.mes);
    if (periodo.año !== anioAnual || !m || m < 2) return null;
    const actual = serie[m - 1];
    const anterior = serie[m - 2];
    if (!anterior) return null;
    return Math.round(((actual - anterior) / anterior) * 100);
  };

  const deltaClientes = comparativo(serieClientes);
  const deltaProspectos = comparativo(serieProspectos);

  // Agrupar prospectos del mes por un campo
  const agrupar = (lista, campo, vacio) => {
    const mapa = {};
    lista.forEach((p) => {
      const clave = p[campo] || vacio;
      mapa[clave] = (mapa[clave] || 0) + 1;
    });
    return Object.entries(mapa)
      .map(([etiqueta, valor]) => ({ etiqueta, valor }))
      .sort((a, b) => b.valor - a.valor);
  };

  const porEstatus = agrupar(prospectos, "estatus", "Sin estatus");
  const porEjecutivo = agrupar(prospectos, "ejecutivo", "Sin asignar");
  const maxEjecutivo = porEjecutivo[0]?.valor || 0;

  // Gráfica comparativa anual
  const datosAnuales = {
    labels: NOMBRES_MESES.map((m) => m.slice(0, 3)),
    datasets: [
      {
        label: "Prospectos",
        data: serieProspectos,
        backgroundColor: "#3b82f6",
        borderRadius: 6,
        maxBarThickness: 18,
      },
      {
        label: "Clientes",
        data: serieClientes,
        backgroundColor: "#10b981",
        borderRadius: 6,
        maxBarThickness: 18,
      },
    ],
  };

  const opcionesAnuales = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { usePointStyle: true, pointStyle: "rectRounded", boxWidth: 10 },
      },
      tooltip: {
        callbacks: {
          title: (items) => NOMBRES_MESES[items[0].dataIndex],
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  // Dona de estatus
  const datosEstatus = {
    labels: porEstatus.map((e) => e.etiqueta),
    datasets: [
      {
        data: porEstatus.map((e) => e.valor),
        backgroundColor: porEstatus.map((_, i) => PALETA[i % PALETA.length]),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const opcionesEstatus = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.label}: ${ctx.parsed} (${porcentaje(ctx.parsed, prospectos.length)}%)`,
        },
      },
    },
  };

  return (
    <>
      <div className="container-fluid dash">

        {/* ========================= */}
        {/* ENCABEZADO */}
        {/* ========================= */}

        <div className="dash-hero mb-4">
          <div className="dash-hero-texto">
            <span className="dash-eyebrow">Módulo de ventas</span>
            <h2 className="dash-titulo">Dashboard de Ventas</h2>
            <div className="dash-contexto">
              <span><FaFilter /> {periodoTexto}</span>
              <span><FaChartLine /> Tendencia {anioAnual}</span>
              {filtrando && (
                <span className="dash-actualizando">
                  <FaSyncAlt className="dash-girando" /> Actualizando…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* FILTROS */}
        {/* ========================= */}

        <div className="dash-filtros mb-4">
          <div className="row g-3 align-items-end">

            <div className="col-6 col-md-4 col-lg-3">
              <label className="dash-label">Mes</label>
              <TextField
                select
                fullWidth
                size="small"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              >
                <MenuItem value="">Seleccione mes</MenuItem>
                {NOMBRES_MESES.map((nombre, i) => (
                  <MenuItem key={nombre} value={i + 1}>
                    {nombre}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="col-6 col-md-4 col-lg-2">
              <label className="dash-label">Año</label>
              <TextField
                select
                fullWidth
                size="small"
                value={año}
                onChange={(e) => setAño(Number(e.target.value))}
              >
                {años.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="col-12 col-md-4 col-lg-2">
              <button
                type="button"
                className="btn btn-primary w-100 dash-btn"
                onClick={filtrar}
                disabled={filtrando}
              >
                <FaSearch />
                Filtrar
              </button>
            </div>

          </div>
        </div>

        <div className={filtrando ? "dash-cargando" : ""}>

          {/* ========================= */}
          {/* KPIs */}
          {/* ========================= */}

          <div className="row g-3 mb-4">

            {/* CLIENTES NUEVOS (destacado) */}
            <div className="col-12 col-md-6 col-xl-3">
              <div
                className="dash-kpi dash-kpi-destacado dash-clicable h-100"
                role="button"
                tabIndex={0}
                onClick={() => setModalClientes(true)}
                onKeyDown={(e) => e.key === "Enter" && setModalClientes(true)}
              >
                <div className="dash-kpi-top">
                  <span className="dash-kpi-label">Clientes nuevos</span>
                  <span className="dash-kpi-icono"><FaUserPlus /></span>
                </div>
                <div className="dash-kpi-valor">
                  {clientes.length.toLocaleString("es-MX")}
                  <Delta valor={deltaClientes} />
                </div>
                <div className="dash-kpi-pie">
                  {periodoTexto}{deltaClientes !== null && " · vs mes anterior"}
                  <span className="dash-kpi-link">Ver detalle <FaChevronRight /></span>
                </div>
              </div>
            </div>

            {/* PROSPECTOS */}
            <div className="col-12 col-md-6 col-xl-3">
              <div
                className="dash-kpi dash-clicable h-100"
                role="button"
                tabIndex={0}
                onClick={() => setModalProspectos(true)}
                onKeyDown={(e) => e.key === "Enter" && setModalProspectos(true)}
              >
                <div className="dash-kpi-top">
                  <span className="dash-kpi-label">Prospectos registrados</span>
                  <span className="dash-kpi-icono dash-tono-primary"><FaUsers /></span>
                </div>
                <div className="dash-kpi-valor">
                  {prospectos.length.toLocaleString("es-MX")}
                  <Delta valor={deltaProspectos} />
                </div>
                <div className="dash-kpi-pie">
                  {periodoTexto}{deltaProspectos !== null && " · vs mes anterior"}
                  <span className="dash-kpi-link dash-kpi-link-primario">Ver detalle <FaChevronRight /></span>
                </div>
              </div>
            </div>

            {/* ACUMULADO ANUAL */}
            <div className="col-6 col-xl-3">
              <div className="dash-kpi h-100">
                <div className="dash-kpi-top">
                  <span className="dash-kpi-label">Clientes {anioAnual}</span>
                  <span className="dash-kpi-icono dash-tono-success"><FaHandshake /></span>
                </div>
                <div className="dash-kpi-valor">
                  {totalClientesAnual.toLocaleString("es-MX")}
                </div>
                <div className="dash-kpi-pie">Registrados en el año</div>
              </div>
            </div>

            {/* PROSPECTOS DEL AÑO */}
            <div className="col-6 col-xl-3">
              <div className="dash-kpi h-100">
                <div className="dash-kpi-top">
                  <span className="dash-kpi-label">Prospectos {anioAnual}</span>
                  <span className="dash-kpi-icono dash-tono-primary"><FaUsers /></span>
                </div>
                <div className="dash-kpi-valor">
                  {totalProspectosAnual.toLocaleString("es-MX")}
                </div>
                <div className="dash-kpi-pie">Registrados en el año</div>
              </div>
            </div>

          </div>

          {/* ========================= */}
          {/* TENDENCIA ANUAL */}
          {/* ========================= */}

          <div className="dash-panel mb-4">
            <div className="dash-panel-header">
              <div>
                <h5 className="dash-panel-titulo">Prospectos vs clientes {anioAnual}</h5>
                <span className="dash-panel-subtitulo">
                  Registros mensuales a lo largo del año
                </span>
              </div>
            </div>
            <div className="dash-grafica">
              <Bar data={datosAnuales} options={opcionesAnuales} />
            </div>
          </div>

          {/* ========================= */}
          {/* ESTATUS + EJECUTIVOS */}
          {/* ========================= */}

          <div className="row g-3 mb-4">

            <div className="col-12 col-lg-7">
              <div className="dash-panel h-100">
                <div className="dash-panel-header">
                  <div>
                    <h5 className="dash-panel-titulo">Prospectos por estatus</h5>
                    <span className="dash-panel-subtitulo">{periodoTexto}</span>
                  </div>
                </div>

                {porEstatus.length === 0 ? (
                  <div className="dash-vacio">
                    <FaChartPie />
                    <span>Sin prospectos en el periodo seleccionado</span>
                  </div>
                ) : (
                  <div className="dash-dona-layout">
                    <div className="dash-dona">
                      <Doughnut data={datosEstatus} options={opcionesEstatus} />
                      <div className="dash-dona-centro">
                        <div className="dash-dona-valor">
                          {prospectos.length.toLocaleString("es-MX")}
                        </div>
                        <div className="dash-dona-label">prospectos</div>
                      </div>
                    </div>

                    <ul className="dash-leyenda">
                      {porEstatus.map((e, i) => (
                        <li key={e.etiqueta}>
                          <span
                            className="dash-leyenda-punto"
                            style={{ background: PALETA[i % PALETA.length] }}
                          />
                          <span className="dash-leyenda-texto" title={e.etiqueta}>{e.etiqueta}</span>
                          <span className="dash-leyenda-valor">{e.valor}</span>
                          <span className="dash-leyenda-pct">
                            {porcentaje(e.valor, prospectos.length)}%
                          </span>
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
                    <h5 className="dash-panel-titulo">Prospectos por ejecutivo</h5>
                    <span className="dash-panel-subtitulo">{periodoTexto}</span>
                  </div>
                </div>

                {porEjecutivo.length === 0 ? (
                  <div className="dash-vacio">
                    <FaUserTie />
                    <span>Sin prospectos en el periodo seleccionado</span>
                  </div>
                ) : (
                  <div className="dash-ranking">
                    {porEjecutivo.slice(0, 6).map((e, i) => (
                      <div key={e.etiqueta} className="dash-ranking-item">
                        <span className={`dash-ranking-pos ${i === 0 ? "dash-ranking-top" : ""}`}>
                          {i + 1}
                        </span>
                        <div className="dash-indicador-cuerpo">
                          <div className="dash-indicador-fila">
                            <span className="text-truncate" title={e.etiqueta}>{e.etiqueta}</span>
                            <strong>{e.valor}</strong>
                          </div>
                          <div className="dash-barra">
                            <div
                              className="dash-barra-relleno dash-bg-primary"
                              style={{ width: `${porcentaje(e.valor, maxEjecutivo)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {porEjecutivo.length > 6 && (
                      <small className="text-muted">
                        +{porEjecutivo.length - 6} ejecutivos más
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ========================= */}
          {/* PROSPECTOS DEL MES */}
          {/* ========================= */}

          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h5 className="dash-panel-titulo">Prospectos del mes</h5>
                <span className="dash-panel-subtitulo">
                  {prospectos.length} registros · {periodoTexto}
                </span>
              </div>
            </div>

            {!isMobile ? (
              <div className="dash-tabla" style={{ width: "100%", overflowX: "auto" }}>
                <DataGrid
                  rows={prospectos}
                  columns={columnsProspectosDetalles}
                  autoHeight
                  rowHeight={52}
                  pageSizeOptions={[5, 10, 25, 50]}
                  disableRowSelectionOnClick
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
                  localeText={{ noRowsLabel: "Sin prospectos en el periodo" }}
                  sx={estiloGrid}
                />
              </div>
            ) : prospectos.length === 0 ? (
              <div className="dash-vacio">
                <FaInbox />
                <span>Sin prospectos en el periodo</span>
              </div>
            ) : (
              /* CARDS PARA MÓVIL */
              <div className="row g-2">
                {prospectos.map((prospecto) => (
                  <div className="col-12" key={prospecto.id}>
                    <div className="dash-item-movil">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div style={{ minWidth: 0 }}>
                          <div className="fw-bold text-break">{prospecto.nombre}</div>
                          <small className="text-muted">#{prospecto.id}</small>
                        </div>

                        {prospecto.estatus && (
                          <span className="dash-estatus">{prospecto.estatus}</span>
                        )}
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Ejecutivo</small>
                          <small className="fw-medium">
                            {prospecto.ejecutivo || "Sin asignar"}
                          </small>
                        </div>

                        <div className="col-6">
                          <small className="text-muted d-block">
                            Fecha registro
                          </small>
                          <small>{formatearFecha(prospecto.fechaRegistro)}</small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm w-100 dash-btn-tabla"
                        onClick={() => abrirHistorial(prospecto.id)}
                      >
                        <FaHistory /> Historial prospección
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL CLIENTES */}
      {modalClientes && (
        <div className="modal-overlay">
          <div className="modal-box-prospectos modal-prospectos">
            <div className="modal-header">
              <h2>Nuevos clientes registrados</h2>
            </div>

            {!isMobile ? (
            <div className="form-grid-prospectos">
              <DataGrid
                rows={clientes}
                columns={columnsClientes}
                density="compact"
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                sx={estiloGrid}
              />
            </div>
            ) : (
              /* CARDS PARA MÓVIL */
              <div className="row g-3" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {clientes.map((cliente) => (
                  <div className="col-12" key={cliente.id}>
                    <div className="card shadow-sm border-0 rounded-3">
                      <div className="card-body">
                        <h6 className="fw-bold mb-1 text-break">{cliente.razonSocial}</h6>
                        <small className="text-muted">#{cliente.id}</small>

                        <hr />

                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted d-block">RFC</small>
                            <small className="fw-medium text-break">{cliente.rfc}</small>
                          </div>

                          <div className="col-6">
                            <small className="text-muted d-block">
                              Fecha registro
                            </small>
                            <small>{formatearFecha(cliente.fecha)}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="my-3">
              <div className="row justify-content-end">
                <div className="col-md-2 col-6">
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      setModalClientes(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROSPECTOS */}
      {modalProspectos && (
        <div className="modal-overlay">
          <div className="modal-box-prospectos modal-prospectos">
            <div className="modal-header">
              <h2>Nuevos prospectos registrados</h2>
            </div>

            {!isMobile ? (
            <div className="form-grid-prospectos">
              <DataGrid
                rows={prospectos}
                columns={columnsProspectos}
                density="compact"
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                sx={estiloGrid}
              />
            </div>
            ) : (
              /* CARDS PARA MÓVIL */
              <div className="row g-3" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {prospectos.map((prospecto) => (
                  <div className="col-12" key={prospecto.id}>
                    <div className="card shadow-sm border-0 rounded-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div style={{ minWidth: 0 }}>
                            <h6 className="fw-bold mb-1 text-break">{prospecto.nombre}</h6>
                            <small className="text-muted">#{prospecto.id}</small>
                          </div>

                          <span className="badge bg-primary">
                            {prospecto.estatus}
                          </span>
                        </div>

                        <hr />

                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted d-block">Ejecutivo</small>
                            <small className="fw-medium">
                              {prospecto.ejecutivo || "Sin asignar"}
                            </small>
                          </div>

                          <div className="col-6">
                            <small className="text-muted d-block">
                              Fecha registro
                            </small>
                            <small>{formatearFecha(prospecto.fechaRegistro)}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="my-3">
              <div className="row justify-content-end">
                <div className="col-md-2 col-6">
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      setModalProspectos(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*MODAL PROSPECTOS HISTORIAL */}
      {modalProspectosHistorial && (
         <div className="modal-overlay">
          <div className="modal-box-prospectos modal-prospectos">
            <div className="modal-header">
              <h2>Historial prospecto</h2>
            </div>

            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {estatusHistorial.length === 0 ? (
                <div className="alert alert-light text-center m-0">
                  Sin historial registrado
                </div>
              ) : (
                <ul className="list-unstyled m-0 ps-3 border-start border-2 border-primary">
                  {[...estatusHistorial]
                    .sort(
                      (a, b) =>
                        new Date(a.fechaCambioEstatus) -
                        new Date(b.fechaCambioEstatus),
                    )
                    .map((h) => (
                      <li key={h.id} className="position-relative mb-3">
                        <span
                          className="position-absolute bg-primary rounded-circle"
                          style={{
                            width: 12,
                            height: 12,
                            left: -23,
                            top: 16,
                          }}
                        ></span>

                        <div className="card shadow-sm">
                          <div className="card-body p-3">
                            <div className="d-flex flex-column flex-md-row justify-content-between gap-1 mb-2">
                              <div>
                                <span className="badge bg-primary me-2">
                                  {h.descripcionEstatus || "Sin estatus"}
                                </span>
                                {h.descripcionSubEstatus && (
                                  <span className="badge bg-secondary">
                                    {h.descripcionSubEstatus}
                                  </span>
                                )}
                              </div>
                              <small className="text-muted">
                                {h.fechaCambioEstatus
                                  ? new Date(
                                      h.fechaCambioEstatus,
                                    ).toLocaleString("es-MX", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })
                                  : "--"}
                              </small>
                            </div>

                            {h.comentarios?.length > 0 ? (
                              <div className="d-flex flex-column gap-2">
                                {h.comentarios.map((c, i) => (
                                  <div
                                    key={c.id ?? i}
                                    className="bg-body-tertiary rounded p-2 small"
                                  >
                                    <div className="text-break">
                                      {c.comentario}
                                    </div>
                                    {c.fechaComentario && (
                                      <div className="text-muted mt-1">
                                        {new Date(
                                          c.fechaComentario,
                                        ).toLocaleString("es-MX", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: false,
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <small className="text-muted fst-italic">
                                Sin comentarios
                              </small>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="my-3">
              <div className="row justify-content-end">
                <div className="col-md-2 col-6">
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      setModalProspectosHistorial(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardVentas;
