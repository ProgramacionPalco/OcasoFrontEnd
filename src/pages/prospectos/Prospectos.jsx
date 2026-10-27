import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, MenuItem } from "@mui/material";
import { FaAddressBook } from "react-icons/fa";

import Select from "react-select";
import makeAnimated from "react-select/animated";

import Swal from "sweetalert2";

function Prospectos() {
  /* import del select para seleccion multiple */
  const animatedComponents = makeAnimated();

  /* catalogos */
  const [prospectos, setProspectos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [ejecutivos, setEjecutivos] = useState([]);
  const [tipoEmpresa, setTipoEmpresa] = useState([]);
  const [estatus, setEstatus] = useState([]);

  /* modales */
  const [modalNuevoProspecto, setModalNuevoProspecto] = useState(false);
  const [modalEstatus, setModalEstatus] = useState(false);

  /* seccion contactos */
  const [seccionContacto, setSeccionContacto] = useState(false);

  /* variables */
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [btnCotizar, setBtnCotizar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* formularios */
  const [formProspecto, setFormProspecto] = useState({
    /* idServicio: "", */
    nombre: "",
    idTipoEmpresa: "",
    /* contacto: "",
    correo: "",
    telefono: "",
    ext: "", */
    tipoContacto: "",
    fechaContacto: "",
    /* idAduanas: "", */
    aduanas: "",
    rutasOperacion: "",
    volumenEstimadoMensual: "",
    mercanciasProductos: "",
    asuntoCorreo: "",
    nivelUrgencia: "",
    comentarios: "",
    idEjecutivo: "",
    tipoOperacion: "",
  });

  const [formEstatus, setFormEstatus] = useState({
    id: "",
    idEstatus: "",
  });

  const [formComentarios, setFormComentarios] = useState({
    idProspecto: "",
    idEstatus: "",
    comentario: "",
  });

  const [formContactos, setFormContactos] = useState([]);

  const [nuevoContacto, setNuevoContacto] = useState({
    contacto: "",
    correo: "",
    telefono: "",
    extension: "",
  });

  const [formServicios, setFormServicios] = useState([]);

  const navigate = useNavigate();

  const validarProspecto = async () => {
    const camposVacios = [];

    if (!formProspecto.nombre?.trim()) camposVacios.push("Nombre");

    if (!formProspecto.fechaContacto) camposVacios.push("Fecha de contacto");

    if (!formProspecto.idEjecutivo) camposVacios.push("Ejecutivo");

    if (formContactos.length === 0)
      camposVacios.push("Al menos un contacto para registro inicial");

    if (camposVacios.length > 0) {
      /* alert(
        "Los siguientes campos son obligatorios:\n\n" + camposVacios.join("\n"),
      ); */

      await Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        html: `Los siguientes campos son obligatorios:<br><br>${camposVacios.join("<br>")}`,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#830912",
        allowOutsideClick: false,
      });

      return false;
    }

    return true;
  };

  const validarContacto = async () => {
    const camposVacios = [];

    if (!nuevoContacto.contacto) camposVacios.push("Contacto");

    if (!nuevoContacto.correo?.trim() && !nuevoContacto.telefono?.trim()) {
      camposVacios.push("Correo o Teléfono");
    }

    if (camposVacios.length > 0) {
      /*  alert(
        "" +
          .join("\n"),
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

  const obtenerProspectos = async () => {
    try {
      const res = await api.post("/ventas/ObtenerProspectos");

      setProspectos(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const obtenerServicios = async () => {
    try {
      const res = await api.post("/ventas/obtenerServicios");

      setServicios(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const obtenerAduanas = async () => {
    try {
      const res = await api.post("/ventas/obtenerAduanas");

      setAduanas(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const obtenerEjecutivos = async () => {
    try {
      const res = await api.get("/catalogos/ejecutivosVentasProspectos");
      setEjecutivos(res.data);
    } catch (error) {
      console.error("Error cargando ejecutivos ventas", error);
    }
  };

  const guardarNuevosProspectos = async () => {
    try {
      const res = await api.post("/ventas/crearProspecto", formProspecto);
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const obtenerTipoEmpresa = async () => {
    try {
      const res = await api.post("/ventas/obtenerTipoEmpresa", formProspecto);
      setTipoEmpresa(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const obtenerEstatus = async (idEstatus) => {
    try {
      const res = await api.post(
        `/ventas/obtenerEstatus?idEstatus=${idEstatus}`,
      );

      setEstatus(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Error cargando estatus", error);
    }
  };

  const prospectosFiltrados = prospectos.filter((p) =>
    Object.values(p).some((valor) =>
      String(valor ?? "")
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
    ),
  );

  const actualizarEstatusProspectos = async () => {
    try {
      const res = await api.post(
        "/ventas/actualizarEstatusProspectos",
        formEstatus,
      );
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

  const agregarContacto = async () => {
    const contacto = {
      id: Date.now(),
      idProspecto: "",
      ...nuevoContacto,
    };

    setFormContactos([...formContactos, contacto]);
  };

  const guardarContactos = async (contactos) => {
    try {
      const res = await api.post("/ventas/crearContacto", contactos);
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const guardarServicios = async (servicios) => {
    try {
      console.log(servicios);

      const res = await api.post("/ventas/crearServicioRegistrado", servicios);
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  useEffect(() => {
    obtenerProspectos();
    obtenerEjecutivos();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 991);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
    {
      field: "tipoCompañia",
      headerName: "Tipo compañía",
      flex: 1,
      minWidth: 150,
    },
    { field: "nivelUrgencia", headerName: "Urgencia", flex: 1, minWidth: 150 },
    {
      field: "nombreEjecutivo",
      headerName: "Ejecutivo",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "descripcionEstatus",
      headerName: "Estatus",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={async () => {
            const idEstatus = params.row.estatus;

            setFormEstatus({
              ...formEstatus,
              idEstatus: idEstatus,
              id: params.row.id,
            });

            setFormComentarios({
              ...formComentarios,
              idProspecto: params.row.id,
              idEstatus: idEstatus,
            });

            if (idEstatus >= 4) {
              setBtnCotizar(true);
            } else {
              setBtnCotizar(false);
            }

            await obtenerEstatus(idEstatus);

            setModalEstatus(true);
          }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "fechaContacto",
      headerName: "Contacto",
      flex: 1,
      minWidth: 150,
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
      field: "fechaRegistro",
      headerName: "Registro",
      flex: 1,
      minWidth: 150,
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
  ];

  const columnsContactos = [
    { field: "contacto", headerName: "Contacto", flex: 1, minWidth: 120 },
    { field: "correo", headerName: "Correo", flex: 1, minWidth: 120 },
    { field: "telefono", headerName: "Telefono", flex: 1, minWidth: 120 },
    { field: "extension", headerName: "Extension", flex: 1, minWidth: 120 },
  ];

  return (
    <div className="w-100 overflow-hidden">
      <div className="justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="row">
          <h2 className="fw-bold m-0 ">Prospectos</h2>

          <div className="col-md-3 mt-3">
            <TextField
              fullWidth
              label="Buscar prospecto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-md-3 mt-3">
            <TextField
              select
              fullWidth
              label="Estatus"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Prospeccion">Prospeccion</MenuItem>
              <MenuItem value="Cotizacion">Cotizacion</MenuItem>
              <MenuItem value="Intermedio">Intermedio</MenuItem>
              <MenuItem value="Altas">Altas</MenuItem>
            </TextField>
          </div>
          <div className="col-md-3 mt-3">
            <TextField
              select
              fullWidth
              label="Buscar ejecutivo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            >
              <MenuItem value="">Todos los ejecutivos</MenuItem>

              {ejecutivos.map((r) => (
                <MenuItem
                  key={r.id}
                  value={`${r.nombre} ${r.apellidoPaterno ?? ""} ${r.apellidoMaterno ?? ""}`}
                >
                  {r.nombre} {r.apellidoPaterno ?? ""} {r.apellidoMaterno ?? ""}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="col-md-3 mt-3">
            <Button
              variant="contained"
              className="btn btn-primary"
              onClick={async () => {
                await obtenerServicios();
                /* await obtenerAduanas(); */
                await obtenerTipoEmpresa();

                setModalNuevoProspecto(true);
              }}
            >
              + Nuevo Prospecto
            </Button>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-11">
            {!isMobile ? (
              <>
                {/* TABLA */}

                <div
                  className="table-responsive-custom"
                  style={{
                    width: "100%",
                    overflowX: "auto",
                  }}
                >
                  <div
                    style={{
                      height: 650,
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    <DataGrid
                      rows={prospectosFiltrados}
                      columns={columns}
                      loading={loading}
                      pageSizeOptions={[5, 10, 25, 50]}
                      disableRowSelectionOnClick
                      autoHeight
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10 },
                        },
                      }}
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        width: "100%",
                        minWidth: 0,
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

                        "& .MuiDataGrid-cell": {
                          borderColor: "#f1f5f9",
                        },

                        // Ajustes para móviles
                        "@media (max-width: 768px)": {
                          fontSize: "12px",

                          "& .MuiDataGrid-columnHeaderTitle": {
                            fontSize: "12px",
                          },

                          "& .MuiDataGrid-cell": {
                            fontSize: "12px",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* CARDS PARA MÓVIL */}
                <div className="row g-3">
                  {prospectosFiltrados.map((prospecto) => (
                    <div className="col-12" key={prospecto.id}>
                      <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">
                                {prospecto.nombre}
                              </h6>
                              <small className="text-muted">
                                {prospecto.tipoCompañia}
                              </small>
                            </div>

                            <span className="badge bg-primary">
                              {prospecto.nivelUrgencia}
                            </span>
                          </div>

                          <hr />

                          <div className="mb-2">
                            <small className="text-muted">Ejecutivo</small>
                            <div className="fw-medium">
                              {prospecto.nombreEjecutivo || "Sin asignar"}
                            </div>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Fecha contacto
                              </small>
                              <small>
                                {prospecto.fechaContacto
                                  ? new Date(
                                      prospecto.fechaContacto,
                                    ).toLocaleString("es-MX")
                                  : "Sin fecha"}
                              </small>
                            </div>

                            <div className="col-6">
                              <small className="text-muted d-block">
                                Fecha registro
                              </small>
                              <small>
                                {prospecto.fechaRegistro
                                  ? new Date(
                                      prospecto.fechaRegistro,
                                    ).toLocaleString("es-MX")
                                  : "Sin fecha"}
                              </small>
                            </div>
                          </div>

                          <button
                            className="btn btn-success w-100"
                            onClick={async () => {
                              const idEstatus = prospecto.estatus;

                              setFormEstatus({
                                ...formEstatus,
                                idEstatus: idEstatus,
                                id: prospecto.id,
                              });

                              setFormComentarios({
                                ...formComentarios,
                                idProspecto: prospecto.id,
                                idEstatus: idEstatus,
                              });

                              if (idEstatus >= 4) {
                                setBtnCotizar(true);
                              } else {
                                setBtnCotizar(false);
                              }

                              await obtenerEstatus(idEstatus);

                              setModalEstatus(true);
                            }}
                          >
                            {prospecto.descripcionEstatus}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* MODAL PROSPECTO */}

        {modalNuevoProspecto && (
          <div className="modal-overlay">
            <div className="modal-box-prospectos modal-prospectos">
              <div className="modal-header">
                <h2>Registrar Prospecto</h2>
              </div>

              <div className="form-grid-prospectos">
                <div className="form-group full-prospectos">
                  <label>Nombre</label>
                  <input
                    autoComplete="off"
                    value={formProspecto.nombre || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Servicio</label>

                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    placeholder="Seleccione servicio"
                    options={servicios.map((r) => ({
                      value: r.id,
                      label: r.servicio,
                    }))}
                    value={servicios
                      .map((r) => ({
                        value: r.id,
                        label: r.servicio,
                      }))
                      .filter((opcion) =>
                        formProspecto.idServicios?.includes(opcion.value),
                      )}
                    onChange={(opciones) => {
                      const seleccionados = opciones.map((x) => ({
                        idProspecto: "",
                        idServicio: Number(x.value),
                      }));

                      setFormServicios(seleccionados);

                      setFormProspecto({
                        ...formProspecto,
                        idServicios: opciones.map((x) => Number(x.value)),
                      });
                    }}
                  />
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Tipo Compañia</label>

                  <select
                    value={formProspecto.idTipoEmpresa}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        idTipoEmpresa: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Seleccione tipo empresa</option>

                    {tipoEmpresa.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-prospectos">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={async () => {
                      setSeccionContacto(true);
                    }}
                  >
                    Seccion contactos
                  </Button>
                </div>

                {/* seccion de contactos */}
                {seccionContacto && (
                  <>
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

                    <div className="form-group span-2-prospectos">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={async () => {
                          if (!(await validarContacto())) return;

                          await agregarContacto();
                        }}
                      >
                        agregar contacto a prospecto
                      </button>
                    </div>

                    <div className="form-group full-prospectos">
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
                                <div
                                  className="col-12"
                                  key={contacto.id ?? index}
                                >
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
                                            {contacto.telefono ||
                                              "Sin teléfono"}
                                          </span>
                                        </div>

                                        <div className="col-4">
                                          <small className="text-muted d-block">
                                            Extensión
                                          </small>
                                          <span>
                                            {contacto.extension || "N/A"}
                                          </span>
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

                    <div className="form-group full-prospectos">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSeccionContacto(false)}
                      >
                        Cerrar contactos
                      </button>
                    </div>
                  </>
                )}

                <div className="form-group span-2-prospectos">
                  <label>Tipo Contacto</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.tipoContacto || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        tipoContacto: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Asunto Correo</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.asuntoCorreo || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        asuntoCorreo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Aduanas</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.aduanas || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        aduanas: e.target.value,
                      })
                    }
                  />

                  {/*  <select
                    value={formProspecto.idAduanas}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        idAduanas: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Seleccione aduana</option>

                    {aduanas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.seccion} {r.nombre}
                      </option>
                    ))}
                  </select> */}
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Rutas Operacion</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.rutasOperacion || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        rutasOperacion: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group full-prospectos">
                  <label>Mercancias Productos</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.mercanciasProductos || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        mercanciasProductos: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Volumen Estimado Mensual</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.volumenEstimadoMensual || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        volumenEstimadoMensual: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Nivel Urgencia</label>

                  <select
                    value={formProspecto.nivelUrgencia}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        nivelUrgencia: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione nivel de urgencia</option>

                    <option key="Baja"> Baja </option>
                    <option key="Media"> Media </option>
                    <option key="Alta"> Alta </option>
                    <option key="Critica"> Critica </option>
                  </select>
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Tipo Operacion</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.tipoOperacion || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        tipoOperacion: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Ejecutivo de ventas</label>

                  <select
                    value={formProspecto.idEjecutivo}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        idEjecutivo: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione ejecutivo ventas</option>

                    {ejecutivos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} {r.apellidoPaterno ?? ""}{" "}
                        {r.apellidoMaterno ?? ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group span-2-prospectos">
                  <label>Fecha Contacto</label>

                  <input
                    type="datetime-local"
                    autoComplete="off"
                    value={formProspecto.fechaContacto || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        fechaContacto: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group full-prospectos">
                  <label>Comentarios</label>

                  <input
                    autoComplete="off"
                    value={formProspecto.comentarios || ""}
                    onChange={(e) =>
                      setFormProspecto({
                        ...formProspecto,
                        comentarios: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer-prospectos">
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (!(await validarProspecto())) return;

                    const resultado = await guardarNuevosProspectos();

                    if (typeof resultado === "number") {
                      const contactos = formContactos.map((contacto) => ({
                        ...contacto,
                        idProspecto: resultado,
                      }));

                      const servicios = formServicios.map((servicio) => ({
                        ...servicio,
                        idProspecto: resultado,
                      }));

                      await guardarContactos(contactos);

                      if (servicios.length > 0) {
                        await guardarServicios(servicios);
                      }

                      /* alert("Prospecto creado exitosamente"); */
                      await Swal.fire({
                        icon: "success",
                        title: "Prospecto creado exitosamente",
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#28a745",
                        allowOutsideClick: false,
                      });

                      setModalNuevoProspecto(false);
                      await obtenerProspectos();
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
                  Guardar Prospecto
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setModalNuevoProspecto(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ESTATUS */}
        {modalEstatus && (
          <div className="modal-overlay">
            <div className="modal-box-prospectos modal-prospectos">
              <div className="modal-header">
                <h2>Cambiar estatus prospectos</h2>
              </div>

              <div className="form-grid-prospectos">
                <div className="form-group full-prospectos">
                  <label>Estatus</label>

                  <select
                    value={formEstatus.idEstatus}
                    onChange={(e) => {
                      const idEstatus = Number(e.target.value);

                      setFormEstatus({
                        ...formEstatus,
                        idEstatus: idEstatus,
                      });

                      setFormComentarios({
                        ...formComentarios,
                        idEstatus: idEstatus,
                      });
                    }}
                  >
                    <option value="">Seleccione estatus de prospeccion</option>

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

              <div className="my-3">
                <div className="row justify-content-end">
                  {/* Botón para cotizaciones */}
                  {btnCotizar && (
                    <div className="col-md-5 mb-3">
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          navigate(
                            `/prospectos/prospectoSeguimiento/${formEstatus.id}`,
                          )
                        }
                      >
                        Cotizacion seguimiento prospecto
                      </button>
                    </div>
                  )}
                  <div className="col-md-3 col-6">
                    <button
                      className="btn btn-primary"
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

                          if (formEstatus.idEstatus >= 4) {
                            setBtnCotizar(true);
                          } else {
                            setBtnCotizar(false);
                            setModalEstatus(false);
                            await obtenerProspectos();
                          }
                        }
                      }}
                    >
                      Actualizar estatus
                    </button>
                  </div>

                  <div className="col-md-2 col-6">
                    <button
                      className="btn btn-secondary"
                      onClick={async () => {
                        await obtenerProspectos();
                        setModalEstatus(false);
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
      </div>
    </div>
  );
}

export default Prospectos;
