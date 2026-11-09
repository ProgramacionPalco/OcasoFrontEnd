import { useEffect, useState } from "react";
import api from "../../../services/api";

import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  FaSyncAlt,
  FaFileInvoiceDollar,
  FaCalculator,
  FaTimes,
} from "react-icons/fa";

import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField } from "@mui/material";

import Swal from "sweetalert2";

function CotizarTab({ prospecto: prospectoInicial, onProspectoActualizado }) {
  /* import del select para seleccion multiple */
  const animatedComponents = makeAnimated();

  /* catalogos */
  const [serviciosRegistrados, setServiciosRegistrados] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [prospecto, setProspecto] = useState(prospectoInicial);
  const [prospectosCotizaciones, setProspectosCotizaciones] = useState([]);
  const [formEstatus, setFormEstatus] = useState({
    id: "",
    idEstatus: "",
  });
  const [estatus, setEstatus] = useState([]);
  const [formComentarios, setFormComentarios] = useState({
    idProspecto: "",
    idEstatus: "",
    comentario: "",
  });

  /* variables */
  const [loading, setLoading] = useState(true);
  const [cotizadorSeccion, setCotizadorSeccion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* modales */
  const [modalEstatus, setModalEstatus] = useState(false);

  const obtenerCotizacionesPorProspecto = async () => {
    try {
      const id = Number(prospecto.id);
      const res = await api.post(
        `/ventas/ObtenerCotizacionesPorProspecto/?idProspecto=${id}`,
      );

      setProspectosCotizaciones(res.data);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Error API:", error.response?.data);
      console.error("Errors:", error.response?.data?.errors);
    } finally {
      setLoading(false);
    }
  };

  const obtenerServiciosRegistrados = async () => {
    try {
      const id = Number(prospecto.id);
      const res = await api.post(
        `/ventas/obtenerServiciosRegistrados/?idProspecto=${id}`,
      );

      setServiciosRegistrados(res.data);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Error API:", error.response?.data);
      console.error("Errors:", error.response?.data?.errors);
    }
  };

  const obtenerServicios = async () => {
    try {
      const res = await api.post("/ventas/obtenerServicios");

      setServicios(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Status:", error.response?.status);
    }
  };

  const obtenerEstatus = async () => {
    try {
      const res = await api.post(`/ventas/obtenerEstatus?idEstatus=${5}`);

      setEstatus(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Error cargando estatus", error);
    }
  };

  const actualizarEstatusProspectos = async () => {
    try {
      const res = await api.post(
        "/ventas/actualizarEstatusProspectos",
        formEstatus,
      );

      await onProspectoActualizado();

      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const registrarComentario = async () => {
    try {
      const res = await api.post(
        "/ventas/registrarComentario",
        formComentarios,
      );
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  useEffect(() => {
    if (prospectoInicial?.id) {
      setProspecto(prospectoInicial);
    }
  }, [prospectoInicial]);

  useEffect(() => {
    if (prospecto?.id) {
      obtenerCotizacionesPorProspecto();
    }
  }, [prospecto?.id]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 991);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnsContactos = [
    { field: "id", headerName: "#", flex: 1, minWidth: 50 },
    {
      field: "prospectoNombre",
      headerName: "Prospecto",
      flex: 1,
      minWidth: 120,
    },
    { field: "servicio", headerName: "Servicio", flex: 1, minWidth: 120 },
    { field: "estatus", headerName: "Estatus", flex: 1, minWidth: 120 },
  ];

  const opcionesServicios = servicios
    .filter((servicio) =>
      (serviciosRegistrados ?? []).some(
        (registrado) => registrado.idServicio === servicio.id,
      ),
    )
    .map((servicio) => ({
      value: servicio.id,
      label: servicio.servicio,
    }));

  if (!prospectoInicial?.id) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3">Cargando prospecto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-12 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                  <h3 className="mb-0">Cotizar prospecto</h3>

                  <button
                    className="btn btn-success btn-sm d-inline-flex align-items-center gap-2 align-self-start align-self-sm-auto"
                    onClick={async () => {
                      await obtenerEstatus();

                      setFormEstatus({
                        ...formEstatus,
                        idEstatus: prospecto.idEstatus,
                        id: prospecto.id,
                      });

                      setFormComentarios({
                        ...formComentarios,
                        idProspecto: prospecto.id,
                        idEstatus: prospecto.idEstatus,
                      });

                      setModalEstatus(true);
                    }}
                  >
                    <FaSyncAlt /> Actualizar estatus cotización
                  </button>
                </div>

                {/* tarjeta cotizaciones */}
                <div className="col-12">
                  <div
                    className="card border-0 shadow-sm mb-3"
                    style={{ borderLeft: "4px solid #0d6efd" }}
                  >
                    <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
                      <div
                        className="d-flex align-items-center gap-3 flex-grow-1"
                        style={{ minWidth: 0 }}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-primary bg-opacity-10 text-primary"
                          style={{ width: 52, height: 52 }}
                        >
                          <FaFileInvoiceDollar size={22} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <small className="text-muted text-uppercase fw-semibold d-block">
                            Cotizaciones del prospecto
                          </small>
                          <h5 className="fw-bold mb-0">
                            {prospectosCotizaciones.length}{" "}
                            {prospectosCotizaciones.length === 1
                              ? "cotización registrada"
                              : "cotizaciones registradas"}
                          </h5>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                        <button
                          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                          onClick={async () => {
                            /* alert(
                        "La seccion de cotizador sera habilitada proximamente",
                      ); */

                            await Swal.fire({
                              icon: "warning",
                              title: "Aviso",
                              html: `La seccion de cotizador sera habilitada proximamente`,
                              confirmButtonText: "Aceptar",
                              confirmButtonColor: "#830912",
                              allowOutsideClick: false,
                            });

                            /* await obtenerServicios();
                      await obtenerServiciosRegistrados();

                      setCotizadorSeccion(true); */
                          }}
                        >
                          <FaCalculator /> Cotizar servicio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-2">Cotizaciones historial</h5>
                {!isMobile ? (
                  <DataGrid
                    rows={prospectosCotizaciones}
                    columns={columnsContactos}
                    loading={loading}
                    pageSizeOptions={[5, 10, 25, 50]}
                    disableRowSelectionOnClick
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 30 },
                      },
                    }}
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",

                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#1f2937",
                        color: "#fff",
                        fontWeight: "bold",
                      },

                      "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: "bold",
                        color: "#fff",
                      },

                      "& .MuiDataGrid-columnHeader": {
                        backgroundColor: "#1f2937",
                        color: "#fff",
                      },

                      "& .MuiDataGrid-cell": {
                        borderColor: "#f1f5f9",
                      },

                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  />
                ) : (
                  <>
                    {/* CARDS DE COTIZACIONES EN MÓVIL */}
                    <div className="row g-3">
                      {prospectosCotizaciones.length === 0 ? (
                        <div className="col-12 text-center text-muted py-4">
                          No hay cotizaciones registradas.
                        </div>
                      ) : (
                        prospectosCotizaciones.map((cotizacion) => (
                          <div className="col-12" key={cotizacion.id}>
                            <div className="card shadow-sm border-0 rounded-3">
                              <div className="card-body">
                                {/* ENCABEZADO */}
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                  <div
                                    className="flex-grow-1"
                                    style={{ minWidth: 0 }}
                                  >
                                    <h6 className="fw-bold mb-1 text-break">
                                      {cotizacion.prospectoNombre ||
                                        "Sin prospecto"}
                                    </h6>

                                    <small className="text-muted">
                                      Cotización #{cotizacion.id}
                                    </small>
                                  </div>

                                  <span className="badge bg-primary">
                                    {cotizacion.estatus || "Sin estatus"}
                                  </span>
                                </div>

                                <hr />

                                {/* SERVICIO */}
                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Servicio
                                  </small>

                                  <span className="fw-medium text-break">
                                    {cotizacion.servicio || "Sin servicio"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          {cotizadorSeccion && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <h3 className="my-4">Generar cotizacion</h3>

                  <div className="col-md-4">
                    <label>Servicios Registrados</label>

                    <Select
                      placeholder="Seleccione servicio"
                      options={opcionesServicios}
                    />
                  </div>

                  <div className="col-md-8 d-flex align-items-end justify-content-end mt-3 mt-md-0">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                      onClick={() => setCotizadorSeccion(false)}
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL ESTATUS */}
        {modalEstatus && (
          <div className="modal-overlay">
            <div className="modal-box-prospectos modal-prospectos">
              <div className="modal-header">
                <h2>Actualizar estatus cotizacion</h2>
              </div>

              <div className="form-grid-prospectos">
                <div className="form-group full-prospectos">
                  <label>Estatus cotizaciones</label>

                  <select
                    value={formEstatus.idEstatus}
                    onChange={(e) => {
                      setFormEstatus({
                        ...formEstatus,
                        idEstatus: Number(e.target.value),
                      });

                      setFormComentarios({
                        ...formComentarios,
                        idEstatus: Number(e.target.value),
                      });
                    }}
                  >
                    <option value="">Seleccione estatus de cotizacion</option>

                    {estatus.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.descripcionSubEstatus}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group span-3-prospectos">
                  <label>Comentarios</label>

                  <input
                    type="text"
                    autoComplete="off"
                    value={formComentarios.comentario || ""}
                    onChange={(e) =>
                      setFormComentarios((prev) => ({
                        ...prev,
                        comentario: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group span-1-prospectos">
                  <button
                    className="btn btn-primary btn-sm mt-4"
                    onClick={async () => {
                      const resultado = await registrarComentario();

                      if (resultado !== "Comentario registrado exitosamente") {
                        /* alert(resultado); */
                        await Swal.fire({
                          icon: "warning",
                          title: "Aviso",
                          html: `${resultado}`,
                          confirmButtonText: "Aceptar",
                          confirmButtonColor: "#830912",
                          allowOutsideClick: false,
                        });
                      } else {
                        setFormComentarios((prev) => ({
                          ...prev,
                          comentario: "",
                        }));
                        /* alert(resultado); */
                        await Swal.fire({
                          icon: "success",
                          html: `${resultado}`,
                          confirmButtonText: "Aceptar",
                          confirmButtonColor: "#28a745",
                          allowOutsideClick: false,
                        });
                      }
                    }}
                  >
                    enviar comentarios
                  </button>
                </div>
              </div>

              <div className="modal-footer-prospectos">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    const resultado = await actualizarEstatusProspectos();

                    if (
                      resultado !==
                      "Estatus del prospecto actualizado exitosamente"
                    ) {
                      /* alert(resultado); */
                      await Swal.fire({
                        icon: "warning",
                        title: "Aviso",
                        html: `${resultado}`,
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#830912",
                        allowOutsideClick: false,
                      });
                    } else {
                      /* alert(resultado); */
                      await Swal.fire({
                        icon: "success",
                        html: `${resultado}`,
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#28a745",
                        allowOutsideClick: false,
                      });
                      setModalEstatus(false);
                    }
                  }}
                >
                  Actualizar estatus
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    setModalEstatus(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CotizarTab;
