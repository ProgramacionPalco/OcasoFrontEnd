import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

import Select from "react-select";
import makeAnimated from "react-select/animated";
import { FaAddressBook } from "react-icons/fa";

import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

import Swal from "sweetalert2";

function IntermedioTab({
  prospecto: prospectoInicial,
  onProspectoActualizado,
}) {
  const navigate = useNavigate();

  /* catalogos */
  const [prospecto, setProspecto] = useState(prospectoInicial);
  const [formEstatus, setFormEstatus] = useState({
    id: "",
    idEstatus: "",
  });
  const [formComentarios, setFormComentarios] = useState({
    idProspecto: "",
    idEstatus: "",
    comentario: "",
  });
  const [estatus, setEstatus] = useState([]);
  const [formContactos, setFormContactos] = useState([]);
  const [formClientes, setFormClientes] = useState([]);
  const [formContactosNuevos, setFormContactosNuevos] = useState([]);
  const [nuevoContacto, setNuevoContacto] = useState({
    contacto: "",
    correo: "",
    telefono: "",
    extension: "",
  });
  const [ejecutivos, setEjecutivos] = useState([]);
  const [formEjecutivoAltas, setFormEjecutivoAltas] = useState({
    id: "",
    idEjecutivoAltas: "",
    idEstatus: "",
  });
  const [clientes, setClientes] = useState([]);

  /* modales */
  const [modalEstatus, setModalEstatus] = useState(false);
  const [modalEjecutivos, setModalEjecutivos] = useState(false);

  /* variables */
  const [loading, setLoading] = useState(true);
  const [seccionContacto, setSeccionContacto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const obtenerEstatus = async () => {
    try {
      const res = await api.post(`/ventas/obtenerEstatus?idEstatus=${10}`);

      setEstatus(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Error cargando estatus", error);
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

  const obtenerContactos = async () => {
    try {
      const res = await api.post(
        `/ventas/obtenerContactos?idProspecto=${prospecto.id}`,
      );
      setFormContactos(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Error cargando estatus", error);
    }
  };

  const validarContacto = async () => {
    const camposVacios = [];

    if (!nuevoContacto.contacto) camposVacios.push("Contacto");

    if (!nuevoContacto.correo?.trim() && !nuevoContacto.telefono?.trim()) {
      camposVacios.push("Correo o Teléfono");
    }

    if (camposVacios.length > 0) {
      /* alert(
        "Campos obligatorios para registro de contacto:\n\n" +
          camposVacios.join("\n"),
      ); */

      await Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        html: `Campos obligatorios para registro de contacto:<br><br>${camposVacios.join("<br>")}`,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#830912",
        allowOutsideClick: false,
      });

      return false;
    }

    return true;
  };

  const agregarContacto = () => {
    const contacto = {
      id: Date.now(),
      ...nuevoContacto,
    };

    setFormContactosNuevos((prev) => [...prev, contacto]);

    return contacto;
  };

  const guardarContactos = async (contactos) => {
    try {
      console.log(contactos);

      const res = await api.post("/ventas/crearContacto", contactos);
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const obtenerEjecutivos = async () => {
    try {
      const res = await api.get("/catalogos/ejecutivosVentas");
      setEjecutivos(res.data);
    } catch (error) {
      console.error("Error cargando ejecutivos ventas", error);
    }
  };

  const actualizarEjecutivo = async () => {
    try {
      const res = await api.post(
        "/ventas/actualizarEjecutivo",
        formEjecutivoAltas,
      );

      await onProspectoActualizado();

      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const ObtenerClientesPorProspecto = async () => {
    try {
      const res = await api.get(
        `/altas/clientes/ObtenerClientesPorProspecto?idProspecto=${prospecto.id}`,
      );
      setClientes(res.data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    }
  };

  const registrarEstatusHistorial = async () => {
    try {
      const estatusHistorialObj = {
        idProspecto: prospecto.id,
        idEstatus: 11,
      };

      const res = await api.post(
        "/ventas/registrarEstatusHistorial",
        estatusHistorialObj,
      );

      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const ejecutivoAltas = ejecutivos.find(
    (e) => Number(e.id) === Number(prospecto.idEjecutivoAltas),
  );

  const columnsContactos = [
    { field: "contacto", headerName: "Contacto", flex: 1, minWidth: 120 },
    { field: "correo", headerName: "Correo", flex: 1, minWidth: 120 },
    { field: "telefono", headerName: "Telefono", flex: 1, minWidth: 120 },
    { field: "extension", headerName: "Extension", flex: 1, minWidth: 120 },
  ];

  const columnsClientes = [
    { field: "id", headerName: "ID", width: 90 },

    { field: "rfc", headerName: "RFC", flex: 1, minWidth: 180 },

    {
      field: "razonSocial",
      headerName: "Razón Social",
      flex: 2,
      minWidth: 350,
    },
    {
      field: "motivoServicioNegado",
      headerName: "Motivo",
      flex: 2,
      minWidth: 250,

      renderCell: (params) => {
        if (!params.row.servicioNegado) {
          return "-";
        }

        return (
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={params.value}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "estatus",
      headerName: "Estatus",
      width: 140,
      renderCell: (params) => {
        if (params.row.servicioNegado) {
          return (
            <div title={params.row.motivoServicioNegado}>
              <span className="badge bg-danger">Servicio negado</span>
            </div>
          );
        }

        if (params.row.estadoClienteId === 3) {
          return <span className="badge bg-success">Activo</span>;
        }

        return <span className="badge bg-warning text-dark">Borrador</span>;
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/clientes/${params.row.id}`)}
        >
          Ver
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (prospectoInicial?.id) {
      setProspecto(prospectoInicial);
    }
  }, [prospectoInicial]);

  useEffect(() => {
    if (prospecto?.id) {
      obtenerContactos();
      setLoading(false);
      obtenerEjecutivos();
      ObtenerClientesPorProspecto();
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
                <h3>Prospecto intermedio</h3>

                <div className="col-md-6 d-flex justify-content-end">
                  <button
                    className="btn btn-success btn-sm mb-3 mb-sm-0"
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
                    Actualizar estatus prospecto
                  </button>
                </div>

                <div className="col-md-6 d-flex justify-content-end">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      setSeccionContacto(true);
                    }}
                  >
                    Agregar contacto a prospecto
                  </button>
                </div>

                {/* seccion de contactos */}
                {seccionContacto && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group span-2-prospectos">
                        <label>Contacto</label>
                        <input
                          autoComplete="off"
                          value={nuevoContacto.contacto}
                          onChange={(e) =>
                            setNuevoContacto({
                              ...nuevoContacto,
                              contacto: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group span-2-prospectos">
                        <label>Correo</label>
                        <input
                          type="email"
                          autoComplete="off"
                          value={nuevoContacto.correo}
                          onChange={(e) =>
                            setNuevoContacto({
                              ...nuevoContacto,
                              correo: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group span-2-prospectos">
                        <label>telefono</label>

                        <input
                          autoComplete="off"
                          value={nuevoContacto.telefono}
                          onChange={(e) =>
                            setNuevoContacto({
                              ...nuevoContacto,
                              telefono: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group span-2-prospectos">
                        <label>Ext</label>

                        <input
                          autoComplete="off"
                          value={nuevoContacto.extension}
                          onChange={(e) =>
                            setNuevoContacto({
                              ...nuevoContacto,
                              extension: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3 offset-md-6 mt-3">
                      <div className="form-group span-2-prospectos">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={async () => {
                            if (!(await validarContacto())) return;

                            const nuevo = agregarContacto();

                            const contactos = [
                              ...formContactosNuevos,
                              nuevo,
                            ].map((contacto) => ({
                              ...contacto,
                              idProspecto: prospecto.id,
                            }));

                            const resultado = await guardarContactos(contactos);

                            if (
                              resultado ==
                              "Todos los contactos fueron registrados exitosamente"
                            ) {
                              /* alert(resultado); */
                              await Swal.fire({
                                icon: "success",
                                html: `${resultado}`,
                                confirmButtonText: "Aceptar",
                                confirmButtonColor: "#28a745",
                                allowOutsideClick: false,
                              });
                              await obtenerContactos();

                              setFormContactosNuevos([]); // limpia la lista
                              setNuevoContacto({
                                // limpia los inputs
                                contacto: "",
                                correo: "",
                                telefono: "",
                                extension: "",
                              });
                            } else {
                              /* alert(resultado); */
                              await Swal.fire({
                                icon: "warning",
                                title: "Aviso",
                                html: `${resultado}`,
                                confirmButtonText: "Aceptar",
                                confirmButtonColor: "#830912",
                                allowOutsideClick: false,
                              });
                            }
                          }}
                        >
                          agregar contacto a prospecto
                        </button>
                      </div>
                    </div>

                    <div className="col-md-3 mt-3">
                      <div className="form-group full-prospectos">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSeccionContacto(false)}
                        >
                          Cerrar contactos
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group full-prospectos mt-3">
                  <h5 className="fw-bold m-0">Contactos prospectos</h5>

                  {!isMobile ? (
                    <DataGrid
                      rows={formContactos}
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
                      {/* CARDS DE CONTACTOS PARA MÓVIL */}
                      <div className="row g-3">
                        {formContactos.length === 0 ? (
                          <div className="text-center text-muted py-4">
                            No hay contactos registrados.
                          </div>
                        ) : (
                          formContactos.map((contacto, index) => (
                            <div className="col-12" key={contacto.id ?? index}>
                              <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-body">
                                  <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                                      <FaAddressBook size={22} />
                                    </div>

                                    <div>
                                      <h6 className="fw-bold mb-0">
                                        {contacto.contacto || "Sin nombre"}
                                      </h6>
                                      <small className="text-muted">
                                        Contacto registrado
                                      </small>
                                    </div>
                                  </div>

                                  <hr />

                                  <div className="mb-3">
                                    <small className="text-muted d-block">
                                      Correo electrónico
                                    </small>
                                    <span className="text-break">
                                      {contacto.correo || "Sin correo"}
                                    </span>
                                  </div>

                                  <div className="row g-2">
                                    <div className="col-8">
                                      <small className="text-muted d-block">
                                        Teléfono
                                      </small>
                                      <span>
                                        {contacto.telefono || "Sin teléfono"}
                                      </span>
                                    </div>

                                    <div className="col-4">
                                      <small className="text-muted d-block">
                                        Extensión
                                      </small>
                                      <span>{contacto.extension || "N/A"}</span>
                                    </div>
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

                {/* seccion para ejecutivos de altas */}
                <div className="col-12 mt-5">
                  <hr />
                  <h4 className="mb-3">Clientes por prospecto</h4>
                  <div className="row my-3">
                    <div className="col-md-4 offset-md-8  mb-3 mb-sm-0 d-flex justify-content-end">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                          setFormEjecutivoAltas({
                            ...formEjecutivoAltas,
                            id: prospecto.id,
                            idEstatus: 11,
                          });

                          setModalEjecutivos(true);
                        }}
                      >
                        Asignar ejecutivo altas
                      </button>
                    </div>

                    <div className="col-md-8">
                      {prospecto.idEjecutivoAltas == null ||
                      prospecto.idEjecutivoAltas === "" ? (
                        <h5 className="fw-medium">
                          No se asignó ejecutivo de altas
                        </h5>
                      ) : (
                        <>
                          <div className="row">
                            <div className="col-md-8">
                              <h5 className="fw-medium">
                                <strong>Ejecutivo de altas asignado:</strong>{" "}
                                {ejecutivoAltas?.nombre}{" "}
                                {ejecutivoAltas?.apellidoPaterno ?? ""}{" "}
                                {ejecutivoAltas?.apellidoMaterno ?? ""}
                              </h5>
                            </div>
                            <div className="col-md-4">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  navigate(`/clientes/nuevo/${prospecto.id}`)
                                }
                              >
                                Registrar nuevo cliente
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {!isMobile ? (
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <DataGrid
                        rows={clientes}
                        columns={columnsClientes}
                        pageSizeOptions={[5, 10, 25, 50]}
                        disableRowSelectionOnClick
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 30 },
                          },
                        }}
                        checkboxSelection
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
                    </div>
                  ) : (
                    <>
                      {/* CARDS MÓVILES */}
                      <div className="row g-3">
                        {clientes.length === 0 ? (
                          <div className="col-12 text-center text-muted py-4">
                            No hay clientes registrados.
                          </div>
                        ) : (
                          clientes.map((cliente) => (
                            <div className="col-12" key={cliente.id}>
                              <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-body">
                                  {/* ENCABEZADO */}
                                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                    <div
                                      className="flex-grow-1"
                                      style={{ minWidth: 0 }}
                                    >
                                      <h6 className="fw-bold mb-1 text-break">
                                        {cliente.razonSocial}
                                      </h6>
                                      <small className="text-muted">
                                        ID: {cliente.id}
                                      </small>
                                    </div>

                                    {cliente.servicioNegado ? (
                                      <span className="badge bg-danger">
                                        Servicio negado
                                      </span>
                                    ) : cliente.estadoClienteId === 3 ? (
                                      <span className="badge bg-success">
                                        Activo
                                      </span>
                                    ) : (
                                      <span className="badge bg-warning text-dark">
                                        Borrador
                                      </span>
                                    )}
                                  </div>

                                  <hr />

                                  {/* RFC */}
                                  <div className="mb-3">
                                    <small className="text-muted d-block">
                                      RFC
                                    </small>
                                    <span className="fw-medium">
                                      {cliente.rfc || "Sin RFC"}
                                    </span>
                                  </div>

                                  {/* MOTIVO SERVICIO NEGADO */}
                                  {cliente.servicioNegado && (
                                    <div className="alert alert-danger py-2 small">
                                      <strong>Motivo:</strong>{" "}
                                      {cliente.motivoServicioNegado ||
                                        "Sin motivo registrado"}
                                    </div>
                                  )}

                                  {/* ACCIONES */}
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary w-100"
                                    onClick={() =>
                                      navigate(`/clientes/${cliente.id}`)
                                    }
                                  >
                                    Ver cliente
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* final de row */}
              </div>
            </div>
          </div>
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
                  <label>Estatus Intermedio</label>

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
                    <option value="">Seleccione estatus de prospecto</option>

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

        {/* MODAL EJECUTIVOS */}
        {modalEjecutivos && (
          <div className="modal-overlay">
            <div className="modal-box-prospectos modal-prospectos">
              <div className="modal-header">
                <h2>Asignar ejecutivo de altas</h2>
              </div>

              <div className="form-grid-prospectos">
                <div className="form-group full-prospectos">
                  <label>Ejecutivos de ventas</label>

                  <select
                    value={formEjecutivoAltas.idEjecutivoAltas}
                    onChange={(e) =>
                      setFormEjecutivoAltas({
                        ...formEjecutivoAltas,
                        idEjecutivoAltas: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Seleccione ejecutivo altas</option>

                    {ejecutivos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} {r.apellidoPaterno ?? ""}{" "}
                        {r.apellidoMaterno ?? ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer-prospectos">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    const resultado = await actualizarEjecutivo();

                    if (
                      resultado !==
                      "Ejecutivo y estatus del prospecto actualizados exitosamente"
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
                      await registrarEstatusHistorial();

                      /* alert("Ejecutivo asignado al prospecto correctamente"); */
                      await Swal.fire({
                        icon: "success",
                        html: `Ejecutivo asignado al prospecto correctamente`,
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#28a745",
                        allowOutsideClick: false,
                      });
                      setModalEjecutivos(false);
                    }
                  }}
                >
                  Asignar
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    setModalEjecutivos(false);
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

export default IntermedioTab;
