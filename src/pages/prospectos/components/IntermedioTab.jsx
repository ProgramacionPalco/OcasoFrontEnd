import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  FaAddressBook,
  FaUserTie,
  FaUserPlus,
  FaLink,
  FaExchangeAlt,
  FaSyncAlt,
  FaTimes,
  FaSave,
} from "react-icons/fa";

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
  const [clientesRegistrados, setClientesRegistrados] = useState([]);
  const [clienteALigar, setClienteALigar] = useState(null);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [ligando, setLigando] = useState(false);

  /* modales */
  const [modalEstatus, setModalEstatus] = useState(false);
  const [modalEjecutivos, setModalEjecutivos] = useState(false);
  const [modalLigarCliente, setModalLigarCliente] = useState(false);

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

  const obtenerClientesRegistrados = async () => {
    setCargandoClientes(true);
    try {
      const res = await api.get("/altas/clientes");
      setClientesRegistrados(res.data ?? []);
    } catch (error) {
      console.error("Error cargando clientes registrados", error);
    } finally {
      setCargandoClientes(false);
    }
  };

  const ligarClienteProspecto = async () => {
    try {
      const res = await api.post(
        `/ventas/registrarClienteProspecto?idProspecto=${prospecto.id}&idCliente=${clienteALigar.value}`,
      );
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const abrirModalLigarCliente = async () => {
    setClienteALigar(null);
    setModalLigarCliente(true);
    await obtenerClientesRegistrados();
  };

  /* pasa el prospecto a estatus 12 (igual que al registrar cliente nuevo) */
  const actualizarEstatusProspectoAltas = async () => {
    try {
      const res = await api.post("/ventas/actualizarEstatusProspectos", {
        id: prospecto.id,
        idEstatus: 12,
      });
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  /* copia los contactos de prospección al cliente ligado */
  const enviarContactosACliente = async (clienteId) => {
    let enviados = 0;

    for (const contacto of formContactos) {
      try {
        await api.post(`/altas/clientes/${clienteId}/contactos`, {
          nombreContacto: contacto.contacto ?? "",
          correoContacto: contacto.correo ?? "",
          telefonoContacto: contacto.telefono ?? "",
          ext: contacto.extension ?? "",
          area: "",
          puesto: "",
          numeroOficina: "",
        });
        enviados++;
      } catch (error) {
        console.error("Error enviando contacto al cliente", error);
      }
    }

    return enviados;
  };

  const historialContactosProspecto = async (clienteId, texto) => {
    try {
      const res = await api.post(
        `/altas/clientes/historialContactosProspecto?clienteId=${clienteId}&texto=${encodeURIComponent(texto)}`,
      );
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const registrarEstatusHistorial = async (idEstatus = 11) => {
    try {
      const estatusHistorialObj = {
        idProspecto: prospecto.id,
        idEstatus,
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

  const tieneEjecutivoAltas =
    prospecto.idEjecutivoAltas != null && prospecto.idEjecutivoAltas !== "";

  const nombreEjecutivoAltas = ejecutivoAltas
    ? [
        ejecutivoAltas.nombre,
        ejecutivoAltas.apellidoPaterno,
        ejecutivoAltas.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const inicialesEjecutivo = nombreEjecutivoAltas
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  // clientes que aún no están ligados a este prospecto
  const idsClientesLigados = new Set(clientes.map((c) => Number(c.id)));
  const opcionesClientes = clientesRegistrados
    .filter((c) => !idsClientesLigados.has(Number(c.id)))
    .map((c) => ({
      value: c.id,
      label: `${c.razonSocial ?? "Sin razón social"} — ${c.rfc ?? "Sin RFC"}`,
    }));

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
                <div className="col-12 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                  <h3 className="mb-0">Prospecto intermedio</h3>

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
                    <FaSyncAlt /> Actualizar estatus prospecto
                  </button>
                </div>

                {/* tarjeta contactos */}
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
                          <FaAddressBook size={22} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <small className="text-muted text-uppercase fw-semibold d-block">
                            Contactos del prospecto
                          </small>
                          <h5 className="fw-bold mb-0">
                            {formContactos.length}{" "}
                            {formContactos.length === 1
                              ? "contacto registrado"
                              : "contactos registrados"}
                          </h5>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                        <button
                          className={`btn btn-sm d-inline-flex align-items-center gap-2 ${
                            seccionContacto
                              ? "btn-outline-secondary"
                              : "btn-primary"
                          }`}
                          onClick={() => setSeccionContacto(!seccionContacto)}
                        >
                          {seccionContacto ? (
                            <>
                              <FaTimes /> Cerrar formulario
                            </>
                          ) : (
                            <>
                              <FaUserPlus /> Agregar contacto
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* seccion de contactos */}
                    {seccionContacto && (
                      <div className="row px-3 pb-3 mx-0 border-top pt-3">
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
                        <div className="col-12 mt-3 d-flex flex-wrap gap-2 justify-content-end">
                          <button
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                            onClick={() => setSeccionContacto(false)}
                          >
                            <FaTimes /> Cancelar
                          </button>

                          <button
                            className="btn btn-success btn-sm d-inline-flex align-items-center gap-2"
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

                              const resultado =
                                await guardarContactos(contactos);

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
                            <FaSave /> Guardar contacto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group full-prospectos">
                  <h5 className="fw-bold mb-2">Contactos prospectos</h5>

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

                  {/* tarjeta ejecutivo de altas */}
                  <div
                    className={`card border-0 shadow-sm mb-3 ${
                      tieneEjecutivoAltas ? "" : "bg-light"
                    }`}
                    style={{
                      borderLeft: `4px solid ${
                        tieneEjecutivoAltas ? "#198754" : "#adb5bd"
                      }`,
                    }}
                  >
                    <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
                      {/* datos del ejecutivo */}
                      <div
                        className="d-flex align-items-center gap-3 flex-grow-1"
                        style={{ minWidth: 0 }}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 ${
                            tieneEjecutivoAltas
                              ? "bg-success bg-opacity-10 text-success"
                              : "bg-secondary bg-opacity-10 text-secondary"
                          }`}
                          style={{ width: 52, height: 52, fontSize: 18 }}
                        >
                          {tieneEjecutivoAltas && inicialesEjecutivo ? (
                            inicialesEjecutivo
                          ) : (
                            <FaUserTie size={22} />
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <small className="text-muted text-uppercase fw-semibold d-block">
                            Ejecutivo de altas
                          </small>
                          {tieneEjecutivoAltas ? (
                            <h5 className="fw-bold mb-0 text-break">
                              {nombreEjecutivoAltas || "Cargando..."}
                            </h5>
                          ) : (
                            <h6 className="mb-0 text-muted fst-italic">
                              Sin ejecutivo asignado
                            </h6>
                          )}
                        </div>
                      </div>

                      {/* acciones */}
                      <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                        <button
                          className={`btn btn-sm d-inline-flex align-items-center gap-2 ${
                            tieneEjecutivoAltas
                              ? "btn-outline-secondary"
                              : "btn-primary"
                          }`}
                          onClick={() => {
                            setFormEjecutivoAltas({
                              ...formEjecutivoAltas,
                              id: prospecto.id,
                              idEjecutivoAltas:
                                prospecto.idEjecutivoAltas ?? "",
                              idEstatus: 11,
                            });

                            setModalEjecutivos(true);
                          }}
                        >
                          {tieneEjecutivoAltas ? (
                            <>
                              <FaExchangeAlt /> Cambiar ejecutivo
                            </>
                          ) : (
                            <>
                              <FaUserTie /> Asignar ejecutivo altas
                            </>
                          )}
                        </button>

                        {tieneEjecutivoAltas && (
                          <>
                            <button
                              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                              onClick={abrirModalLigarCliente}
                            >
                              <FaLink /> Ligar cliente existente
                            </button>

                            <button
                              className="btn btn-success btn-sm d-inline-flex align-items-center gap-2"
                              onClick={() =>
                                navigate(`/clientes/nuevo/${prospecto.id}`)
                              }
                            >
                              <FaUserPlus /> Registrar nuevo cliente
                            </button>
                          </>
                        )}
                      </div>
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

        {/* MODAL LIGAR CLIENTE EXISTENTE */}
        {modalLigarCliente && (
          <div className="modal-overlay">
            <div className="modal-box-prospectos modal-prospectos">
              <div className="modal-header">
                <h2>Ligar cliente existente</h2>
              </div>

              <div className="form-grid-prospectos">
                <div className="form-group full-prospectos">
                  <label>Clientes registrados</label>

                  <Select
                    components={makeAnimated()}
                    options={opcionesClientes}
                    value={clienteALigar}
                    onChange={setClienteALigar}
                    isLoading={cargandoClientes}
                    isClearable
                    placeholder="Buscar por razón social o RFC..."
                    noOptionsMessage={() =>
                      cargandoClientes
                        ? "Cargando clientes..."
                        : "No hay clientes disponibles para ligar"
                    }
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                  <small className="text-muted mt-1">
                    Solo se muestran clientes que aún no están ligados a este
                    prospecto.
                  </small>
                </div>
              </div>

              <div className="modal-footer-prospectos">
                <button
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                  disabled={!clienteALigar || ligando}
                  onClick={async () => {
                    setLigando(true);
                    const resultado = await ligarClienteProspecto();
                    let enviados = 0;

                    if (resultado === "Cliente registrado exitosamente") {
                      const clienteId = clienteALigar.value;

                      /* mismas funciones que al registrar cliente nuevo */
                      enviados = await enviarContactosACliente(clienteId);
                      const texto = `Se guardaron ${enviados} contacto's, desde prospección`;

                      await actualizarEstatusProspectoAltas();
                      await registrarEstatusHistorial(12);
                      await historialContactosProspecto(clienteId, texto);
                    }

                    setLigando(false);

                    if (resultado !== "Cliente registrado exitosamente") {
                      await Swal.fire({
                        icon: "warning",
                        title: "Aviso",
                        html: `${resultado ?? "No se pudo ligar el cliente"}`,
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#830912",
                        allowOutsideClick: false,
                      });
                    } else {
                      await ObtenerClientesPorProspecto();
                      setModalLigarCliente(false);
                      await Swal.fire({
                        icon: "success",
                        html: `Cliente ligado al prospecto correctamente.<br>Se enviaron ${enviados} de ${formContactos.length} contacto(s) de prospección al cliente.`,
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#28a745",
                        allowOutsideClick: false,
                      });
                      await onProspectoActualizado();
                    }
                  }}
                >
                  <FaLink /> {ligando ? "Ligando..." : "Ligar cliente"}
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setModalLigarCliente(false)}
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
