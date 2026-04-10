import { useEffect, useState } from "react";
import api from "../../services/api";

function ReporteClientesDocumentos() {

  const [clientes, setClientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [dashboardEjecutivos, setDashboardEjecutivos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

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

  useEffect(() => {

    obtenerReporte();

  }, []);

  const clientesFiltrados = clientes.filter(c =>
    c.razonSocial?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularFaltantes = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "FALTANTE").length;

  const calcularVencidos = (cliente) =>
    Object.values(cliente.estados || {}).filter(x => x === "VENCIDO").length;

  return (

    <div className="container-fluid">

      <h2 className="mb-4">
        Reporte Documental de Clientes
      </h2>

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
          onChange={(e) => setBusqueda(e.target.value)}
        />

      </div>

      {/* TABLA PRINCIPAL */}

      <div className="card shadow-sm">

        <table className="table table-hover">

          <thead className="table-dark">

            <tr>
              <th>Empresa</th>
              <th>RFC</th>
              <th>Cumplimiento</th>
              <th>Faltantes</th>
              <th>Vencidos</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {clientesFiltrados.map(cliente => (

              <tr key={cliente.clienteId}>

                <td>{cliente.razonSocial}</td>

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
                    className="btn btn-sm btn-primary"
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