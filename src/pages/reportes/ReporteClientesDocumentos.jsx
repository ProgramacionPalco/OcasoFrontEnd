import { useEffect, useState } from "react";
import api from "../../services/api";

function ReporteClientesDocumentos() {

  const [clientes, setClientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [dashboardEjecutivos, setDashboardEjecutivos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loadingReporte, setLoadingReporte] = useState(false);
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

  const calcularFaltantes = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "FALTANTE").length;

  const calcularVencidos = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "VENCIDO").length;

  return (

    <div className="container-fluid">

      {/* boton para descargar Excel */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2>Reporte Documental de Clientes</h2>

        <button 
            onClick={descargarExcel} 
            className="btn btn-success"
            disabled={loadingReporte}
        >
            {loadingReporte ? "Generando reporte..." : "Descargar Excel"}
        </button>
      </div>
      {/* DASHBOARD EJECUTIVOS */}

      <div className="row mb-4">

        {dashboardEjecutivos.map((ejecutivo, index) => (

          <div className="col-md-3" key={index}>

            <div className="card shadow-sm text-center">

              <div className="card-body">

                <h6 className="text-muted">
                  {ejecutivo.ejecutivo}
                </h6>

                <h4 className="text-primary">
                  {ejecutivo.totalClientes}
                </h4>

                <small>
                  Cumplimiento {ejecutivo.cumplimientoPromedio}%
                </small>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* BUSCADOR */}

      <div className="card shadow-sm p-3 mb-3">

        <input
          className="form-control"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />

      </div>

      {/* TABLA PRINCIPAL */}

      <div className="card shadow-sm">

        <table className="table table-hover">

          <thead className="table-dark">

            <tr>
              <th style={{ width: "320px" }}>Empresa</th>
              <th>RFC</th>
              <th>Cumplimiento</th>
              <th>Faltantes</th>
              <th>Vencidos</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {clientesPagina.map(cliente => (

              <tr key={cliente.clienteId}>

                <td
                    style={{
                      maxWidth: "320px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={cliente.razonSocial}
                  >
                    {cliente.razonSocial}
                </td>

                <td>{cliente.rfc}</td>

                <td width="200">

                  <div className="progress">

                    <div
                      className="progress-bar bg-success"
                      style={{ width: cliente.cumplimiento + "%" }}
                    >
                      {cliente.cumplimiento}%
                    </div>

                  </div>

                </td>

                <td className="text-danger">
                  {calcularFaltantes(cliente)}
                </td>

                <td className="text-warning">
                  {calcularVencidos(cliente)}
                </td>

                <td>

                  <button
                    className="btn btn-outline-primary btn-sm px-2 py-1"
                    style={{ fontSize: "12px" }}
                    onClick={() => {

                      setClienteSeleccionado(cliente);
                      setMostrarModal(true);

                    }}
                  >
                    Ver documentos
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
        <div className="d-flex justify-content-between align-items-center p-3">

          <button
            className="btn btn-sm btn-secondary"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(paginaActual - 1)}
          >
            ← Anterior
          </button>

          <span>
            Página {paginaActual} de {Math.ceil(clientesFiltrados.length / registrosPorPagina)}
          </span>

          <button
            className="btn btn-sm btn-secondary"
            disabled={indiceFinal >= clientesFiltrados.length}
            onClick={() => setPaginaActual(paginaActual + 1)}
          >
            Siguiente →
          </button>

        </div>

      </div>

      {/* MODAL DOCUMENTOS */}

      {mostrarModal && clienteSeleccionado && (

        <div className="modal fade show d-block">

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Documentos - {clienteSeleccionado.razonSocial}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setMostrarModal(false)}
                ></button>

              </div>

              <div className="modal-body">

                <table className="table table-bordered">

                  <thead className="table-light">

                    <tr>
                      <th>Documento</th>
                      <th>Estado</th>
                    </tr>

                  </thead>

                  <tbody>

                    {documentos.map((doc, index) => {

                      const estado = clienteSeleccionado.estados?.[doc];

                      let color = "secondary";

                      if (estado === "OK") color = "success";
                      if (estado === "FALTANTE") color = "danger";
                      if (estado === "VENCIDO") color = "warning";

                      return (

                        <tr key={`${clienteSeleccionado.clienteId}-${index}`}>

                          <td>{doc}</td>

                          <td>

                            <span className={`badge bg-${color}`}>
                              {estado || "N/A"}
                            </span>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default ReporteClientesDocumentos;