import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import { DataGrid } from "@mui/x-data-grid";
import {
  FaAddressBook,
  FaUsers,
  FaSearch,
  FaPlus,
  FaFileInvoiceDollar,
  FaHourglassHalf,
  FaUserCheck,
  FaExchangeAlt,
  FaUserPlus,
  FaBuilding,
  FaMapMarkerAlt,
  FaTruck,
  FaCalendarCheck,
  FaChevronUp,
  FaSave,
} from "react-icons/fa";

// Quita acentos y pasa a minúsculas para comparar
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// Un filtro coincide si algún campo del prospecto contiene el texto (misma regla de antes)
const coincide = (prospecto, filtro) => {
  const f = normalizar(filtro);
  if (!f) return true;
  return Object.values(prospecto).some((valor) => normalizar(valor).includes(f));
};

const claseUrgencia = (nivel) => {
  const n = normalizar(nivel);
  if (n.startsWith("crit")) return "critica";
  if (n.startsWith("alta")) return "alta";
  if (n.startsWith("media")) return "media";
  return "baja";
};

// Estilo del DataGrid alineado al tema (claro y oscuro)
const estiloGridProspectos = {
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
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus": {
    outline: "none",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "var(--bs-tertiary-bg)",
  },
  "& .MuiDataGrid-footerContainer": {
    borderColor: "var(--bs-border-color-translucent)",
  },
};

import Select from "react-select";
import makeAnimated from "react-select/animated";

import Swal from "sweetalert2";

import UbicacionSelects from "./components/UbicacionSelects";

const formProspectoInicial = {
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
  logistica: false,
  importador: false,
  idPais: null,
  idEstado: null,
  idCiudad: null,
};

const nuevoContactoInicial = {
  contacto: "",
  correo: "",
  telefono: "",
  extension: "",
};

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
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [filtroEjecutivo, setFiltroEjecutivo] = useState("");
  const [btnCotizar, setBtnCotizar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* formularios */
  const [formProspecto, setFormProspecto] = useState(formProspectoInicial);

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

  const [nuevoContacto, setNuevoContacto] = useState(nuevoContactoInicial);

  const [formServicios, setFormServicios] = useState([]);

  const navigate = useNavigate();

  const cerrarModalNuevoProspecto = () => {
    setFormProspecto(formProspectoInicial);
    setFormServicios([]);
    setFormContactos([]);
    setNuevoContacto(nuevoContactoInicial);
    setSeccionContacto(false);
    setModalNuevoProspecto(false);
  };

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

  // Búsqueda, estatus y ejecutivo se combinan (antes compartían la misma variable)
  const prospectosFiltrados = prospectos.filter(
    (p) =>
      coincide(p, busqueda) &&
      coincide(p, filtroEstatus) &&
      coincide(p, filtroEjecutivo),
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

  // Abre el modal para cambiar el estatus (misma lógica para tabla y tarjetas)
  const abrirCambioEstatus = async (prospecto) => {
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

    /* if (idEstatus >= 4) {
      setBtnCotizar(true);
    } else {
      setBtnCotizar(false);
    } */

    await obtenerEstatus(idEstatus);

    setModalEstatus(true);
  };

  const formatoFecha = (value) =>
    value
      ? new Date(value).toLocaleString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "";

  const columns = [
    {
      field: "nombre",
      headerName: "Prospecto",
      flex: 1.6,
      minWidth: 240,
      renderCell: (params) => (
        <div className="cliente-nombre">
          <span className="cliente-avatar">
            {(params.value || "?").trim().charAt(0).toUpperCase()}
          </span>
          <div style={{ minWidth: 0, lineHeight: 1.25 }}>
            <div className="text-truncate" title={params.value}>{params.value}</div>
            {params.row.tipoCompañia && (
              <div className="prospecto-tipo text-truncate">{params.row.tipoCompañia}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      field: "nivelUrgencia",
      headerName: "Urgencia",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) =>
        params.value ? (
          <span className={`urgencia-pastilla urgencia-${claseUrgencia(params.value)}`}>
            {params.value}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      field: "nombreEjecutivo",
      headerName: "Ejecutivo",
      flex: 1,
      minWidth: 170,
      renderCell: (params) =>
        params.value ? (
          <span className="text-truncate" title={params.value}>{params.value}</span>
        ) : (
          <span className="text-muted">Sin asignar</span>
        ),
    },
    {
      field: "descripcionEstatus",
      headerName: "Estatus",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <button
          type="button"
          className="estatus-boton"
          title="Cambiar estatus"
          onClick={() => abrirCambioEstatus(params.row)}
        >
          <span className="estatus-punto" />
          {params.value}
          <FaExchangeAlt className="estatus-boton-icono" />
        </button>
      ),
    },
    {
      field: "fechaContacto",
      headerName: "Contacto",
      flex: 1,
      minWidth: 150,
      valueFormatter: (value) => formatoFecha(value),
      renderCell: (params) => (
        <span className="prospecto-fecha">{formatoFecha(params.row.fechaContacto) || "—"}</span>
      ),
    },
    {
      field: "fechaRegistro",
      headerName: "Registro",
      flex: 1,
      minWidth: 150,
      valueFormatter: (value) => formatoFecha(value),
      renderCell: (params) => (
        <span className="prospecto-fecha">{formatoFecha(params.row.fechaRegistro) || "—"}</span>
      ),
    },
  ];

  const columnsContactos = [
    { field: "contacto", headerName: "Contacto", flex: 1, minWidth: 120 },
    { field: "correo", headerName: "Correo", flex: 1, minWidth: 120 },
    { field: "telefono", headerName: "Telefono", flex: 1, minWidth: 120 },
    { field: "extension", headerName: "Extension", flex: 1, minWidth: 120 },
  ];

  const FILTROS_ESTATUS = [
    { valor: "", texto: "Todos", icono: <FaUsers />, tono: "primary" },
    { valor: "Prospeccion", texto: "Prospección", icono: <FaSearch />, tono: "info" },
    { valor: "Cotizacion", texto: "Cotización", icono: <FaFileInvoiceDollar />, tono: "purple" },
    { valor: "Intermedio", texto: "Intermedio", icono: <FaHourglassHalf />, tono: "warning" },
    { valor: "Altas", texto: "Altas", icono: <FaUserCheck />, tono: "success" },
  ];

  const conteoEstatus = (valor) =>
    valor ? prospectos.filter((p) => coincide(p, valor)).length : prospectos.length;

  return (
    <div className="container-fluid dash">
      <div>

        {/* ========================= */}
        {/* ENCABEZADO */}
        {/* ========================= */}

        <div className="dash-hero mb-4">
          <div className="dash-hero-texto">
            <span className="dash-eyebrow">Ventas</span>
            <h2 className="dash-titulo">Prospectos</h2>
            <div className="dash-contexto">
              <span><FaUsers /> {prospectos.length.toLocaleString("es-MX")} prospectos registrados</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light dash-btn-hero"
            onClick={async () => {
              await obtenerServicios();
              /* await obtenerAduanas(); */
              await obtenerTipoEmpresa();

              setModalNuevoProspecto(true);
            }}
          >
            <FaPlus />
            Nuevo prospecto
          </button>
        </div>

        {/* ========================= */}
        {/* FILTRO POR ESTATUS */}
        {/* ========================= */}

        <div className="row g-3 mb-4">
          {FILTROS_ESTATUS.map((f) => (
            <div className={f.valor ? "col-6 col-md" : "col-12 col-md"} key={f.valor || "todos"}>
              <button
                type="button"
                className={`filtro-kpi ${filtroEstatus === f.valor ? "activo" : ""}`}
                onClick={() => setFiltroEstatus(f.valor)}
                aria-pressed={filtroEstatus === f.valor}
              >
                <span className={`dash-kpi-icono dash-tono-${f.tono}`}>{f.icono}</span>
                <span className="filtro-kpi-texto">
                  <span className="filtro-kpi-label">{f.texto}</span>
                  <span className="filtro-kpi-valor">
                    {conteoEstatus(f.valor).toLocaleString("es-MX")}
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* ========================= */}
        {/* LISTADO */}
        {/* ========================= */}

        <div className="dash-panel p-0 overflow-hidden mb-4">

          <div className="listado-toolbar">

            <div className="d-flex flex-wrap gap-2 flex-grow-1">
              <div className="explorador-buscar listado-buscar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar prospecto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  aria-label="Buscar prospecto"
                />
              </div>

              {/* Buscador de ejecutivo: escribir para filtrar y seleccionar */}
              <Select
                className="listado-combo"
                classNamePrefix="rs"
                aria-label="Buscar ejecutivo"
                placeholder="Buscar ejecutivo..."
                isClearable
                isSearchable
                options={ejecutivos.map((r) => {
                  const nombre = `${r.nombre} ${r.apellidoPaterno ?? ""} ${r.apellidoMaterno ?? ""}`;
                  return { value: nombre, label: nombre.replace(/\s+/g, " ").trim() };
                })}
                value={
                  filtroEjecutivo
                    ? { value: filtroEjecutivo, label: filtroEjecutivo.replace(/\s+/g, " ").trim() }
                    : null
                }
                onChange={(opcion) => setFiltroEjecutivo(opcion?.value ?? "")}
                noOptionsMessage={() => "Sin coincidencias"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 1060 }) }}
              />
            </div>

            <span className="listado-contador">
              Mostrando <strong>{prospectosFiltrados.length.toLocaleString("es-MX")}</strong> de{" "}
              <strong>{prospectos.length.toLocaleString("es-MX")}</strong>
            </span>

          </div>

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
                      width: "100%",
                      minWidth: 1000,
                    }}
                  >
                    <DataGrid
                      rows={prospectosFiltrados}
                      columns={columns}
                      loading={loading}
                      rowHeight={60}
                      pageSizeOptions={[5, 10, 25, 50]}
                      disableRowSelectionOnClick
                      autoHeight
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10 },
                        },
                      }}
                      localeText={{ noRowsLabel: "No hay prospectos para mostrar" }}
                      sx={estiloGridProspectos}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-3">
                {/* CARDS PARA MÓVIL */}

                {loading && (
                  <div className="dash-vacio">
                    <div className="spinner-border text-primary" role="status" />
                    <span>Cargando prospectos…</span>
                  </div>
                )}

                {!loading && prospectosFiltrados.length === 0 && (
                  <div className="dash-vacio">
                    <FaUsers />
                    <span>No hay prospectos para mostrar.</span>
                  </div>
                )}

                {prospectosFiltrados.map((prospecto) => (
                  <div className="cliente-tarjeta" key={prospecto.id}>

                    <div className="d-flex align-items-start gap-3">
                      <span className="cliente-avatar">
                        {(prospecto.nombre || "?").trim().charAt(0).toUpperCase()}
                      </span>

                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="fw-semibold text-break">{prospecto.nombre}</div>
                          {prospecto.nivelUrgencia && (
                            <span className={`urgencia-pastilla urgencia-${claseUrgencia(prospecto.nivelUrgencia)}`}>
                              {prospecto.nivelUrgencia}
                            </span>
                          )}
                        </div>
                        <div className="small text-muted text-break">{prospecto.tipoCompañia}</div>
                      </div>
                    </div>

                    <div className="prospecto-tarjeta-datos">
                      <div>
                        <small>Ejecutivo</small>
                        <span>{prospecto.nombreEjecutivo || "Sin asignar"}</span>
                      </div>
                      <div>
                        <small>Fecha contacto</small>
                        <span>
                          {prospecto.fechaContacto
                            ? new Date(prospecto.fechaContacto).toLocaleString("es-MX")
                            : "Sin fecha"}
                        </span>
                      </div>
                      <div>
                        <small>Fecha registro</small>
                        <span>
                          {prospecto.fechaRegistro
                            ? new Date(prospecto.fechaRegistro).toLocaleString("es-MX")
                            : "Sin fecha"}
                        </span>
                      </div>
                    </div>

                    <div className="prospecto-tarjeta-pie">
                      <small>Estatus</small>
                      <button
                        type="button"
                        className="estatus-boton"
                        title="Cambiar estatus"
                        onClick={() => abrirCambioEstatus(prospecto)}
                      >
                        <span className="estatus-punto" />
                        {prospecto.descripcionEstatus}
                        <FaExchangeAlt className="estatus-boton-icono" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* MODAL PROSPECTO */}

        {modalNuevoProspecto && (
          <div className="modal-overlay">
            <div className="modal-box-prospectos modal-prospectos modal-nuevo-prospecto">
              <div className="modal-header modal-header-nuevo-prospecto">
                <div className="d-flex align-items-center gap-3">
                  <span className="np-header-icono"><FaUserPlus /></span>
                  <div>
                    <h2>Registrar Prospecto</h2>
                    <small className="np-header-sub">Captura los datos del nuevo prospecto y sus contactos</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={cerrarModalNuevoProspecto}
                />
              </div>

              <div className="modal-body-nuevo-prospecto">
                <div className="form-grid-nuevo-prospecto">
                  {/* DATOS GENERALES */}
                  <h6 className="seccion-nuevo-prospecto"><FaBuilding /> Datos generales</h6>

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

                  <div className="form-group span-3-prospectos">
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

                  <div className="form-group span-3-prospectos">
                    <label>Servicio</label>

                    <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      placeholder="Seleccione servicio"
                      classNamePrefix="rs"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 10000 }),
                      }}
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

                  <div className="form-group span-3-prospectos">
                    <label>Contacto obtenido a travez de</label>

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

                  <div className="form-group span-3-prospectos">
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

                  {/* UBICACION */}
                  <h6 className="seccion-nuevo-prospecto"><FaMapMarkerAlt /> Ubicación</h6>

                  <UbicacionSelects
                    idPais={formProspecto.idPais}
                    idEstado={formProspecto.idEstado}
                    idCiudad={formProspecto.idCiudad}
                    onChange={(cambios) =>
                      setFormProspecto((prev) => ({ ...prev, ...cambios }))
                    }
                  />

                  {/* OPERACION */}
                  <h6 className="seccion-nuevo-prospecto"><FaTruck /> Operación</h6>

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

                  <div className="form-group span-2-prospectos">
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

                  <div className="form-group span-2-prospectos">
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

                  {/* fuera de .form-group para no heredar el padding de los inputs */}
                  <div className="checks-nuevo-prospecto d-flex flex-wrap align-items-center gap-4">
                    <div className="form-check m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="chkLogistica"
                        checked={formProspecto.logistica}
                        onChange={(e) =>
                          setFormProspecto({
                            ...formProspecto,
                            logistica: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label" htmlFor="chkLogistica">
                        Logística
                      </label>
                    </div>

                    <div className="form-check m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="chkImportador"
                        checked={formProspecto.importador}
                        onChange={(e) =>
                          setFormProspecto({
                            ...formProspecto,
                            importador: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label" htmlFor="chkImportador">
                        Importador
                      </label>
                    </div>
                  </div>

                  {/* SEGUIMIENTO */}
                  <h6 className="seccion-nuevo-prospecto"><FaCalendarCheck /> Seguimiento</h6>

                  <div className="form-group span-3-prospectos">
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

                  <div className="form-group span-3-prospectos">
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

                    <textarea
                      rows={2}
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

                  {/* CONTACTOS */}
                  <div className="seccion-nuevo-prospecto d-flex justify-content-between align-items-center gap-2">
                    <h6 className="m-0">
                      <FaAddressBook /> Contactos
                      <span className="np-contador">{formContactos.length}</span>
                    </h6>

                    <button
                      type="button"
                      className={`btn btn-sm np-btn ${
                        seccionContacto ? "btn-outline-secondary" : "btn-outline-primary"
                      }`}
                      onClick={() => setSeccionContacto(!seccionContacto)}
                    >
                      {seccionContacto ? <FaChevronUp /> : <FaPlus />}
                      {seccionContacto ? "Ocultar formulario" : "Agregar contacto"}
                    </button>
                  </div>

                  {seccionContacto && (
                    <>
                      <div className="form-group span-3-prospectos">
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

                      <div className="form-group span-3-prospectos">
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
                        <label>Telefono</label>

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

                      <div className="form-group span-2-prospectos justify-content-end">
                        <button
                          type="button"
                          className="btn btn-primary np-btn w-100"
                          onClick={async () => {
                            if (!(await validarContacto())) return;

                            await agregarContacto();
                          }}
                        >
                          <FaPlus /> Agregar contacto a prospecto
                        </button>
                      </div>
                    </>
                  )}

                  {formContactos.length > 0 && (
                    <div className="form-group full-prospectos">
                      {!isMobile ? (
                        <div className="np-tabla">
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
                          autoHeight
                          sx={estiloGridProspectos}
                        />
                        </div>
                      ) : (
                        <>
                          {/* CARDS DE CONTACTOS PARA MÓVIL */}
                          <div className="row g-3">
                            {formContactos.map((contacto, index) => (
                              <div
                                className="col-12"
                                key={contacto.id ?? index}
                              >
                                <div className="card shadow-sm border-0 rounded-3 np-contacto-card">
                                  <div className="card-body">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                      <div className="cliente-avatar">
                                        <FaAddressBook size={16} />
                                      </div>

                                      <div style={{ minWidth: 0 }}>
                                        <h6 className="fw-bold mb-0 text-break">
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
                                        <span>
                                          {contacto.extension || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {formContactos.length === 0 && !seccionContacto && (
                    <div className="np-vacio">
                      <FaAddressBook />
                      No hay contactos registrados.
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer-prospectos modal-footer-nuevo-prospecto">
                <button
                  className="btn btn-outline-secondary np-btn"
                  onClick={cerrarModalNuevoProspecto}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary np-btn"
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

                      cerrarModalNuevoProspecto();
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
                  <FaSave /> Guardar prospecto
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
                 {/*  {btnCotizar && ( */}
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
                 {/*  )} */}
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
