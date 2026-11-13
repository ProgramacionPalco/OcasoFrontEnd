import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FaFileExcel,
  FaSearch,
  FaUsers,
  FaChartPie,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaUserTie,
  FaFolderOpen,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

/* Tono según el porcentaje de cumplimiento */
const tonoCumplimiento = (valor) => {
  const v = Number(valor) || 0;
  if (v >= 80) return "success";
  if (v >= 50) return "warning";
  return "danger";
};

/* Pastilla y texto según el estado del documento */
const ESTADOS_DOC = {
  OK: { clase: "estatus-activo", texto: "Entregado" },
  FALTANTE: { clase: "estatus-negado", texto: "Faltante" },
  VENCIDO: { clase: "estatus-borrador", texto: "Vencido" },
};

const inicial = (texto) => (texto || "?").trim().charAt(0).toUpperCase();

function BarraCumplimiento({ valor }) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  const tono = tonoCumplimiento(v);
  return (
    <div className="rd-cumplimiento">
      <div className="dash-barra flex-grow-1 mt-0">
        <div className={`dash-barra-relleno dash-bg-${tono}`} style={{ width: `${v}%` }} />
      </div>
      <span className={`rd-porcentaje rd-texto-${tono}`}>{valor ?? 0}%</span>
    </div>
  );
}

function ContadorDocs({ valor, tono }) {
  return valor > 0 ? (
    <span className={`rd-contador dash-tono-${tono}`}>{valor}</span>
  ) : (
    <span className="rd-contador rd-contador-cero">0</span>
  );
}

function ReporteClientesDocumentos() {

  const [clientes, setClientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [dashboardEjecutivos, setDashboardEjecutivos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;
  const indiceFinal = paginaActual * registrosPorPagina;
  const indiceInicial = indiceFinal - registrosPorPagina;


  const obtenerReporte = async () => {

    try {

      const res = await api.get("/reportes/clientes-documentos-matriz");

      setClientes(res.data.clientes);
      setDocumentos(res.data.documentos);
      setDashboardEjecutivos(res.data.dashboardEjecutivos);

    } catch (error) {

      console.error("Error cargando reporte", error);

    } finally {

      setCargando(false);

    }

  };

const descargarExcel = async () => {

    try {

        setLoadingReporte(true);
        // Llamada a la API para obtener el archivo Excel en localhost
        //const response = await fetch("https://localhost:7094/api/reportes/excel");

        // Llamada a la API para obtener el archivo Excel en producción
        const response = await fetch("http://192.168.1.234:9099/api/reportes/excel");
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "ReporteDocumentos.xlsx";
        a.click();

    } catch (error) {
        console.error(error);
    }
    finally {
        setLoadingReporte(false);
    }
};

  useEffect(() => {

    obtenerReporte();

  }, []);

  const clientesFiltrados = clientes.filter(c =>
    c.razonSocial?.toLowerCase().includes(busqueda.toLowerCase())
  );
  const clientesPagina = clientesFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / registrosPorPagina));

  const calcularFaltantes = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "FALTANTE").length;

  const calcularVencidos = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "VENCIDO").length;

  const calcularEntregados = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "OK").length;

  /* Indicadores generales (solo lectura de los datos ya cargados) */
  const cumplimientoGeneral = clientes.length
    ? Math.round(clientes.reduce((t, c) => t + (Number(c.cumplimiento) || 0), 0) / clientes.length)
    : 0;
  const clientesCompletos = clientes.filter(c => Number(c.cumplimiento) >= 100).length;
  const totalFaltantes = clientes.reduce((t, c) => t + calcularFaltantes(c), 0);
  const totalVencidos = clientes.reduce((t, c) => t + calcularVencidos(c), 0);

  const abrirDocumentos = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModal(true);
  };

  const KPIS = [
    {
      label: "Clientes evaluados",
      valor: clientes.length.toLocaleString("es-MX"),
      pie: `${documentos.length} documentos requeridos`,
      icono: <FaUsers />,
      tono: "primary",
    },
    {
      label: "Cumplimiento general",
      valor: `${cumplimientoGeneral}%`,
      pie: "Promedio de todos los clientes",
      icono: <FaChartPie />,
      tono: tonoCumplimiento(cumplimientoGeneral),
      barra: cumplimientoGeneral,
    },
    {
      label: "Expedientes completos",
      valor: clientesCompletos.toLocaleString("es-MX"),
      pie: "Clientes al 100%",
      icono: <FaCheckCircle />,
      tono: "success",
    },
    {
      label: "Documentos faltantes",
      valor: totalFaltantes.toLocaleString("es-MX"),
      pie: "Sin entregar",
      icono: <FaExclamationCircle />,
      tono: "danger",
    },
    {
      label: "Documentos vencidos",
      valor: totalVencidos.toLocaleString("es-MX"),
      pie: "Requieren actualización",
      icono: <FaClock />,
      tono: "warning",
    },
  ];

  return (

    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Reportes</span>
          <h2 className="dash-titulo">Reporte documental de clientes</h2>
          <div className="dash-contexto">
            <span><FaFolderOpen /> Estado de los expedientes por cliente y ejecutivo</span>
          </div>
        </div>

        <button
            onClick={descargarExcel}
            className="btn btn-light dash-btn-hero"
            disabled={loadingReporte}
        >
            {loadingReporte ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                Generando reporte...
              </>
            ) : (
              <>
                <FaFileExcel className="text-success" />
                Descargar Excel
              </>
            )}
        </button>
      </div>

      {/* ========================= */}
      {/* INDICADORES */}
      {/* ========================= */}

      <div className="row g-3 mb-4">
        {KPIS.map((k) => (
          <div className="col-6 col-lg" key={k.label}>
            <div className="dash-kpi h-100">
              <div className="dash-kpi-top">
                <span className="dash-kpi-label">{k.label}</span>
                <span className={`dash-kpi-icono dash-tono-${k.tono}`}>{k.icono}</span>
              </div>
              <div className="dash-kpi-valor">{cargando ? "—" : k.valor}</div>
              {k.barra !== undefined && (
                <div className="dash-barra">
                  <div
                    className={`dash-barra-relleno dash-bg-${k.tono}`}
                    style={{ width: `${k.barra}%` }}
                  />
                </div>
              )}
              <div className="dash-kpi-pie">{k.pie}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* CUMPLIMIENTO POR EJECUTIVO */}
      {/* ========================= */}

      {dashboardEjecutivos.length > 0 && (
        <div className="dash-panel mb-4">
          <div className="dash-panel-header">
            <div>
              <h5 className="dash-panel-titulo">Cumplimiento por ejecutivo</h5>
              <span className="dash-panel-subtitulo">
                Clientes asignados y cumplimiento documental promedio
              </span>
            </div>
          </div>

          <div className="rd-ejecutivos">
            {dashboardEjecutivos.map((ejecutivo, index) => (
              <div className="rd-ejecutivo" key={index}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="cliente-avatar">
                    {ejecutivo.ejecutivo ? inicial(ejecutivo.ejecutivo) : <FaUserTie />}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="rd-ejecutivo-nombre" title={ejecutivo.ejecutivo}>
                      {ejecutivo.ejecutivo || "Sin asignar"}
                    </div>
                    <div className="rd-ejecutivo-clientes">
                      {ejecutivo.totalClientes} {ejecutivo.totalClientes === 1 ? "cliente" : "clientes"}
                    </div>
                  </div>
                </div>
                <BarraCumplimiento valor={ejecutivo.cumplimientoPromedio} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* LISTADO DE CLIENTES */}
      {/* ========================= */}

      <div className="dash-panel p-0 overflow-hidden mb-4">

        <div className="listado-toolbar">

          <div className="explorador-buscar listado-buscar">
            <FaSearch />
            <input
              placeholder="Buscar cliente..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              aria-label="Buscar cliente"
            />
          </div>

          <span className="listado-contador">
            <strong>{clientesFiltrados.length.toLocaleString("es-MX")}</strong>{" "}
            {clientesFiltrados.length === 1 ? "cliente" : "clientes"}
          </span>

        </div>

        {cargando ? (

          <div className="dash-vacio">
            <div className="spinner-border text-primary" role="status" />
            <span>Cargando reporte…</span>
          </div>

        ) : clientesPagina.length === 0 ? (

          <div className="dash-vacio">
            <FaSearch />
            <span>No hay clientes para mostrar.</span>
          </div>

        ) : (
          <>
            {/* TABLA (escritorio) */}

            <div className="table-responsive d-none d-md-block">
            <table className="table align-middle docs-tabla no-cards">

              <thead>

                <tr>
                  <th>Empresa</th>
                  <th>RFC</th>
                  <th style={{ width: 240 }}>Cumplimiento</th>
                  <th className="text-center">Faltantes</th>
                  <th className="text-center">Vencidos</th>
                  <th className="text-end">Acciones</th>
                </tr>

              </thead>

              <tbody>

                {clientesPagina.map(cliente => (

                  <tr key={cliente.clienteId}>

                    <td>
                      <div className="cliente-nombre" style={{ maxWidth: 360 }}>
                        <span className="cliente-avatar">{inicial(cliente.razonSocial)}</span>
                        <span className="text-truncate" title={cliente.razonSocial}>
                          {cliente.razonSocial}
                        </span>
                      </div>
                    </td>

                    <td>
                      {cliente.rfc
                        ? <span className="cliente-rfc">{cliente.rfc}</span>
                        : <span className="text-muted">—</span>}
                    </td>

                    <td>
                      <BarraCumplimiento valor={cliente.cumplimiento} />
                    </td>

                    <td className="text-center">
                      <ContadorDocs valor={calcularFaltantes(cliente)} tono="danger" />
                    </td>

                    <td className="text-center">
                      <ContadorDocs valor={calcularVencidos(cliente)} tono="warning" />
                    </td>

                    <td>
                      <div className="docs-acciones">
                        <button
                          className="btn dash-btn-tabla dash-btn-suave"
                          onClick={() => abrirDocumentos(cliente)}
                        >
                          <FaFolderOpen /> Ver documentos
                        </button>
                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
            </div>

            {/* TARJETAS (celular) */}

            <div className="d-md-none p-3">
              {clientesPagina.map(cliente => (
                <div className="cliente-tarjeta rd-tarjeta" key={cliente.clienteId}>
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <span className="cliente-avatar">{inicial(cliente.razonSocial)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-break">{cliente.razonSocial}</div>
                      {cliente.rfc && (
                        <span className="cliente-rfc d-inline-block mt-1">{cliente.rfc}</span>
                      )}
                    </div>
                  </div>

                  <BarraCumplimiento valor={cliente.cumplimiento} />

                  <div className="rd-tarjeta-conteos">
                    <span>
                      <ContadorDocs valor={calcularFaltantes(cliente)} tono="danger" /> Faltantes
                    </span>
                    <span>
                      <ContadorDocs valor={calcularVencidos(cliente)} tono="warning" /> Vencidos
                    </span>
                  </div>

                  <button
                    className="btn dash-btn-tabla dash-btn-suave w-100"
                    onClick={() => abrirDocumentos(cliente)}
                  >
                    <FaFolderOpen /> Ver documentos
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PAGINACIÓN */}

        <div className="rd-paginacion">

          <span className="listado-contador">
            {clientesFiltrados.length > 0
              ? <>Mostrando <strong>{indiceInicial + 1}–{Math.min(indiceFinal, clientesFiltrados.length)}</strong> de <strong>{clientesFiltrados.length}</strong></>
              : "Sin resultados"}
          </span>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary dash-btn-tabla"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
              aria-label="Página anterior"
            >
              <FaChevronLeft /> <span className="d-none d-sm-inline">Anterior</span>
            </button>

            <span className="rd-pagina">
              {paginaActual} / {totalPaginas}
            </span>

            <button
              className="btn btn-outline-secondary dash-btn-tabla"
              disabled={indiceFinal >= clientesFiltrados.length}
              onClick={() => setPaginaActual(paginaActual + 1)}
              aria-label="Página siguiente"
            >
              <span className="d-none d-sm-inline">Siguiente</span> <FaChevronRight />
            </button>
          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* MODAL DOCUMENTOS */}
      {/* ========================= */}

      {mostrarModal && clienteSeleccionado && (

        <div
          className="modal fade show d-block rd-modal"
          onClick={(e) => e.target === e.currentTarget && setMostrarModal(false)}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">

              <div className="modal-header rd-modal-header">

                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                  <span className="np-header-icono"><FaFolderOpen /></span>
                  <div style={{ minWidth: 0 }}>
                    <h5 className="modal-title text-break">
                      {clienteSeleccionado.razonSocial}
                    </h5>
                    <div className="rd-modal-sub">
                      {clienteSeleccionado.rfc && <span className="cliente-rfc">{clienteSeleccionado.rfc}</span>}
                      <span>Expediente documental</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setMostrarModal(false)}
                ></button>

              </div>

              <div className="modal-body">

                <div className="rd-resumen">
                  <div className="rd-resumen-cumplimiento">
                    <span className="rd-resumen-label">Cumplimiento</span>
                    <BarraCumplimiento valor={clienteSeleccionado.cumplimiento} />
                  </div>
                  <div className="rd-resumen-item">
                    <span className="estatus-pastilla estatus-activo">
                      <span className="estatus-punto" />{calcularEntregados(clienteSeleccionado)}
                    </span>
                    Entregados
                  </div>
                  <div className="rd-resumen-item">
                    <span className="estatus-pastilla estatus-negado">
                      <span className="estatus-punto" />{calcularFaltantes(clienteSeleccionado)}
                    </span>
                    Faltantes
                  </div>
                  <div className="rd-resumen-item">
                    <span className="estatus-pastilla estatus-borrador">
                      <span className="estatus-punto" />{calcularVencidos(clienteSeleccionado)}
                    </span>
                    Vencidos
                  </div>
                </div>

                <div className="docs-lista">
                <table className="table align-middle docs-tabla no-cards">

                  <thead>

                    <tr>
                      <th>Documento</th>
                      <th className="text-end">Estado</th>
                    </tr>

                  </thead>

                  <tbody>

                    {documentos.map((doc, index) => {

                      const estado = clienteSeleccionado.estados?.[doc];
                      const info = ESTADOS_DOC[estado];

                      return (

                        <tr key={`${clienteSeleccionado.clienteId}-${index}`}>

                          <td className="text-break">{doc}</td>

                          <td className="text-end">

                            <span className={`estatus-pastilla ${info ? info.clase : "rd-estado-na"}`}>
                              <span className="estatus-punto" />
                              {info ? info.texto : estado || "N/A"}
                            </span>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary np-btn"
                  onClick={() => setMostrarModal(false)}
                >
                  <FaTimes /> Cerrar
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default ReporteClientesDocumentos;
