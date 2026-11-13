import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid } from "@mui/x-data-grid";
import { useMediaQuery } from "@mui/material";
import {
  FaEnvelope,
  FaPhone,
  FaUserTie,
  FaUserPlus,
  FaCheck,
  FaFileInvoice,
  FaMapMarkerAlt,
  FaCogs,
  FaInfoCircle,
  FaAddressBook,
  FaConciergeBell,
  FaGlobeAmericas,
  FaArrowLeft,
  FaArrowRight,
  FaSave,
} from "react-icons/fa";

const PASOS = [
  {
    titulo: "Prospección",
    desc: "Origen del cliente",
    subtitulo: "Información capturada durante la prospección",
    icono: <FaUserTie />,
  },
  {
    titulo: "Datos fiscales",
    desc: "RFC y razón social",
    subtitulo: "Identificación fiscal del cliente",
    icono: <FaFileInvoice />,
  },
  {
    titulo: "Dirección",
    desc: "Domicilio fiscal",
    subtitulo: "Domicilio fiscal registrado ante el SAT",
    icono: <FaMapMarkerAlt />,
  },
  {
    titulo: "Configuración",
    desc: "Ejecutivos y servicios",
    subtitulo: "Responsables comerciales y servicios contratados",
    icono: <FaCogs />,
  },
];

const SERVICIOS_CLIENTE = [
  { name: "servicioPalco", texto: "Servicio Palco" },
  { name: "servicioSLP", texto: "Servicio SLP" },
  { name: "servicioMAYA", texto: "Servicio MAYA" },
  { name: "servicioOla", texto: "Servicio OLA" },
];

const estiloGridContactos = {
  border: 0,
  fontSize: 14,
  "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": {
    backgroundColor: "var(--bs-tertiary-bg)",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    color: "var(--bs-secondary-color)",
  },
  "& .MuiDataGrid-cell": {
    borderColor: "var(--bs-border-color-translucent)",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(var(--bs-primary-rgb), .04)",
  },
};

function NuevoCliente() {
  const esMovil = useMediaQuery("(max-width:768px)");
  /* import del select para seleccion multiple */
  const animatedComponents = makeAnimated();

  const navigate = useNavigate();
  const { id: idProspecto } = useParams();

  const [step, setStep] = useState(0);
  const [clienteProspeccion, setClienteProspeccion] = useState(false);

  const [contactos, setContactos] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const [cliente, setCliente] = useState({
    rfc: "",
    razonSocial: "",
    personaFM: "",
    tipoClienteId: null,

    calle: "",
    numero: "",
    numeroInterior: "",
    colonia: "",
    cp: "",
    ciudad: "",
    estado: "",
    pais: "México",

    idEjecutivo: null,
    idRazon: null,
    ejecutivoVentaId: null,

    servicioPalco: false,
    servicioSLP: false,
    servicioMAYA: false,
    servicioOla: false,
    esInternacional: false,

    prospectoEjecutivoId: null,
  });

  const [ejecutivos, setEjecutivos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [ejecutivosVentas, setEjecutivosVentas] = useState([]);
  const [tipoEmpresa, setTipoEmpresa] = useState([]);
  const [serviciosRegistrados, setServiciosRegistrados] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [formContactos, setFormContactos] = useState([]);

  const [prospecto, setProspecto] = useState({
    id: "",
    nombre: "",
    idTipoEmpresa: "",
    tipoContacto: "",
    fechaContacto: "",
    aduanas: "",
    rutasOperacion: "",
    volumenEstimadoMensual: "",
    mercanciasProductos: "",
    asuntoCorreo: "",
    nivelUrgencia: "",
    comentarios: "",
    idEjecutivo: "",
    idEjecutivoAltas: "",
    tipoOperacion: "",
    fechaRegistro: "",
    idEstatus: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCliente({
      ...cliente,
      [name]:
        type === "checkbox"
          ? checked
          : name === "tipoClienteId" ||
              name === "idEjecutivo" ||
              name === "idRazon" ||
              name === "ejecutivoVentaId"
            ? value === ""
              ? null
              : parseInt(value)
            : value,
    });
  };

  //const guardarCliente = async () => {

  //  try {

  //    const payload = {
  //      ...cliente,
  //      servicioPalco: cliente.servicioPalco ? 1 : 0,
  //      servicioSLP: cliente.servicioSLP ? 1 : 0,
  //      servicioMAYA: cliente.servicioMAYA ? 1 : 0,
  //      servicioOla: cliente.servicioOla ? 1 : 0,
  //      contactos
  //    };

  //    const res = await api.post("/altas/clientes", payload);
  //    console.log(res.data);
  //    navigate(`/clientes/${res.data}`);

  //  } catch (error) {

  //    console.error(error);
  //    alert("Error al guardar cliente");

  //  }
  //};

  const guardarCliente = async () => {
    try {
      const nuevosContactos = formContactos.map((contacto) => ({
        nombreContacto: contacto.contacto,
        correoContacto: contacto.correo,
        telefonoContacto: contacto.telefono,
        ext: contacto.extension,
        area: "",
        puesto: "",
        numeroOficina: "",
      }));

      const payload = {
        ...cliente,
        servicioPalco: cliente.servicioPalco ? 1 : 0,
        servicioSLP: cliente.servicioSLP ? 1 : 0,
        servicioMAYA: cliente.servicioMAYA ? 1 : 0,
        servicioOla: cliente.servicioOla ? 1 : 0,
        contactos: nuevosContactos,
      };

      console.log("PAYLOAD:", payload);

      const res = await api.post("/altas/clientes", payload);

      console.log("RESPUESTA API:", res.data);

      // NORMALIZAR RESPUESTA (YA CONTEMPLA TU CASO)
      let clienteId = null;

      if (typeof res.data === "number") {
        clienteId = res.data;
      } else if (res.data?.clienteId) {
        clienteId = res.data.clienteId;
      } else if (res.data?.data?.id) {
        clienteId = res.data.data.id;
      } else if (res.data?.id) {
        clienteId = res.data.id;
      }

      if (!clienteId) {
        throw new Error("No se pudo obtener el ID del cliente");
      } else {
        const respuesta = await registrarClienteProspecto(clienteId);

        if (respuesta == "Cliente registrado exitosamente") {
          // MENSAJE DE ÉXITO
          /* funciones para guardar estatus de prospeccio e historial  */
          const texto = `Se guardaron ${nuevosContactos.length} contacto's, desde prospección`;
          const actulizarEstatusProspectos = await actualizarEstatusProspectos();
          const enviarAltas = await registrarEstatusHistorial();
          const gaurdarHistorial = await historialContactosProspecto(clienteId, texto);
          
          Swal.fire({
            icon: "success",
            title: "Cliente guardado correctamente",
            timer: 1500,
            showConfirmButton: false,
          });

          //  REDIRECCIÓN
          navigate(`/clientes/${clienteId}`);
        } else {
          alert(respuesta);
        }
      }
    } catch (error) {
      console.error("ERROR GUARDAR:", error);

      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Error al guardar cliente";

      alert(mensaje);
    }
  };

  const cargarEjecutivos = async () => {
    const res = await api.get("/catalogos/ejecutivos");
    setEjecutivos(res.data);
  };

  const cargarEjecutivosVentas = async () => {
    const res = await api.get("/catalogos/ejecutivosVentas");
    setEjecutivosVentas(res.data);
  };

  const cargarEmpresas = async () => {
    const res = await api.get("/catalogos/empresas");
    setEmpresas(res.data);
  };

  const obtenerProspecto = async () => {
    try {
      const res = await api.post(
        `/ventas/ObtenerProspectosById/?id=${idProspecto}`,
      );

      setProspecto(res.data);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Error API:", error.response?.data);
      console.error("Errors:", error.response?.data?.errors);
    }
  };

  const obtenerTipoEmpresa = async () => {
    try {
      const res = await api.post("/ventas/obtenerTipoEmpresa");
      setTipoEmpresa(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const obtenerServiciosRegistrados = async () => {
    try {
      const id = Number(prospecto.id);
      const res = await api.post(
        `/ventas/obtenerServiciosRegistrados/?idProspecto=${idProspecto}`,
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

  const obtenerContactos = async () => {
    try {
      const res = await api.post(
        `/ventas/obtenerContactos?idProspecto=${idProspecto}`,
      );
      setFormContactos(res.data);
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Error cargando estatus", error);
    }
  };

  const registrarClienteProspecto = async (idCliente) => {
    try {
      const res = await api.post(
        `/ventas/registrarClienteProspecto?idProspecto=${idProspecto}&idCliente=${idCliente}`,
      );

      return res.data;
    } catch (error) {
      console.error("Error:", error.response?.data);
      console.error("Error cargando estatus", error);
      return error.response?.data;
    }
  };

  const registrarEstatusHistorial = async () => {
    try {
      const estatusHistorialObj = {
        idProspecto: idProspecto,
        idEstatus: 12
      }

      const res = await api.post(
        "/ventas/registrarEstatusHistorial",
        estatusHistorialObj,
      );

      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  }

  const actualizarEstatusProspectos = async () => {
    try {
      const prospectoOcasoEditEstatusDTO = {
        id: idProspecto,
        idEstatus: 12
      }

      const res = await api.post(
        "/ventas/actualizarEstatusProspectos",
        prospectoOcasoEditEstatusDTO,
      );

      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  }

  const historialContactosProspecto = async (clienteId, texto) => {
      try {

      const res = await api.post(
        `altas/clientes/historialContactosProspecto?clienteId=${clienteId}&texto=${texto}`,
      );

      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data
    }
  }
  

  const columnsContactos = [
    { field: "contacto", headerName: "Contacto", flex: 1 },
    { field: "correo", headerName: "Correo", flex: 1 },
    { field: "telefono", headerName: "Telefono", flex: 1 },
    { field: "extension", headerName: "Extension", flex: 1 },
  ];

  useEffect(() => {
    cargarEjecutivos();
    cargarEmpresas();
    cargarEjecutivosVentas();
  }, []);

  useEffect(() => {
    if (idProspecto) {
      obtenerTipoEmpresa();
      obtenerServiciosRegistrados();
      obtenerServicios();
      obtenerProspecto();
      obtenerContactos();

      setClienteProspeccion(true);
    }
  }, [idProspecto]);

  useEffect(() => {
  if (prospecto?.idEjecutivoAltas) {
    setCliente((prev) => ({
      ...prev,
      ejecutivoVentaId: prospecto.idEjecutivoAltas,
      prospectoEjecutivoId: prospecto.idEjecutivo
    }));
  }
}, [prospecto?.idEjecutivoAltas]);

  const pasoActual = PASOS[step];

  return (
    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Clientes</span>
          <h2 className="dash-titulo">Nuevo cliente</h2>
          <div className="dash-contexto">
            {clienteProspeccion ? (
              <span>
                <FaUserTie /> Alta desde prospección
                {prospecto.nombre ? `: ${prospecto.nombre}` : ""}
              </span>
            ) : (
              <span><FaUserPlus /> Alta directa de cliente</span>
            )}
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* PASOS */}
      {/* ========================= */}

      <ol className="nc-pasos mb-4">
        {PASOS.map((p, i) => {
          const estado = i === step ? "activo" : i < step ? "completo" : "";
          return (
            <li key={p.titulo} className={`nc-paso ${estado}`}>
              <button
                type="button"
                className="nc-paso-boton"
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
                aria-current={i === step ? "step" : undefined}
              >
                <span className="nc-paso-num">
                  {i < step ? <FaCheck /> : i + 1}
                </span>
                <span className="nc-paso-texto">
                  <span className="nc-paso-titulo">{p.titulo}</span>
                  <span className="nc-paso-desc">{p.desc}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ========================= */}
      {/* FORMULARIO */}
      {/* ========================= */}

      <div className="dash-panel nc-form p-0 overflow-hidden mb-4">

        <div className="nc-form-header">
          <span className="nc-form-icono">{pasoActual.icono}</span>
          <div>
            <h3 className="nc-form-titulo">{pasoActual.titulo}</h3>
            <div className="nc-form-sub">{pasoActual.subtitulo}</div>
          </div>
          <span className="nc-form-paso">Paso {step + 1} de {PASOS.length}</span>
        </div>

        <div className="nc-form-cuerpo">

          {step === 0 && (
            <>
              {!clienteProspeccion ? (
                <div className="nc-aviso">
                  <FaInfoCircle />
                  <div>
                    <strong>No accedió desde prospección.</strong>
                    <span>
                      Esta sección no contiene datos; continúe con el siguiente paso
                      para capturar la información del cliente.
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre del prospecto</label>
                      <input
                        className="form-control"
                        readOnly
                        autoComplete="off"
                        value={prospecto.nombre || ""}
                        onChange={(e) =>
                          setProspecto({
                            ...prospecto,
                            nombre: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Tipo compañía</label>
                      <select
                        className="form-select"
                        disabled
                        value={prospecto.idTipoEmpresa}
                      >
                        <option value="">Seleccione tipo empresa</option>

                        {tipoEmpresa.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Servicio</label>

                      <Select
                        readOnly
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        classNamePrefix="rs"
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
                            (serviciosRegistrados ?? [])
                              .map((x) => x.idServicio)
                              .includes(opcion.value),
                          )}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Aduanas</label>
                      <input
                        className="form-control"
                        readOnly
                        autoComplete="off"
                        value={prospecto.aduanas || ""}
                        onChange={(e) =>
                          setProspecto({
                            ...prospecto,
                            aduanas: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Tipo contacto</label>
                      <input
                        className="form-control"
                        readOnly
                        autoComplete="off"
                        value={prospecto.tipoContacto || ""}
                        onChange={(e) =>
                          setProspecto({
                            ...prospecto,
                            tipoContacto: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Nivel de urgencia</label>
                      <select
                        className="form-select"
                        disabled
                        value={prospecto.nivelUrgencia}
                      >
                        <option value="">Seleccione nivel de urgencia</option>

                        <option key="Baja"> Baja </option>
                        <option key="Media"> Media </option>
                        <option key="Alta"> Alta </option>
                        <option key="Critica"> Critica </option>
                      </select>
                    </div>
                  </div>

                  <h4 className="nc-seccion">
                    <FaAddressBook /> Contactos del prospecto
                    <span className="np-contador">{formContactos.length}</span>
                  </h4>

                  {formContactos.length === 0 ? (
                    <div className="np-vacio">
                      <FaAddressBook /> Sin contactos registrados.
                    </div>
                  ) : esMovil ? (
                    <div className="d-flex flex-column gap-2">
                      {formContactos.map((c, i) => (
                        <div key={c.id ?? i} className="nc-contacto">
                          <span className="cliente-avatar">
                            {(c.contacto || "?").trim().charAt(0).toUpperCase()}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-semibold text-break">{c.contacto}</div>
                            {c.correo && (
                              <div className="small text-break text-muted">
                                <FaEnvelope className="me-1" />{c.correo}
                              </div>
                            )}
                            {(c.telefono || c.extension) && (
                              <div className="small text-muted">
                                <FaPhone className="me-1" />
                                {c.telefono}
                                {c.extension ? ` ext. ${c.extension}` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="np-tabla">
                      <DataGrid
                        rows={formContactos}
                        columns={columnsContactos}
                        pageSizeOptions={[5, 10, 25, 30, 50]}
                        disableRowSelectionOnClick
                        autoHeight
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 30 },
                          },
                        }}
                        checkboxSelection
                        sx={estiloGridContactos}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {step === 1 && (
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">RFC</label>
                <input
                  className="form-control nc-mayusculas"
                  placeholder="Ej. ABC123456XYZ"
                  name="rfc"
                  value={cliente.rfc}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">Razón social</label>
                <input
                  className="form-control"
                  placeholder="Nombre o razón social del cliente"
                  name="razonSocial"
                  value={cliente.razonSocial}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Tipo de persona</label>
                <select
                  className="form-select"
                  name="personaFM"
                  value={cliente.personaFM}
                  onChange={handleChange}
                >
                  <option value="">Seleccione tipo de persona</option>
                  <option value="1">Persona Física</option>
                  <option value="2">Persona Moral</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Tipo de cliente</label>
                <select
                  className="form-select"
                  name="tipoClienteId"
                  value={cliente.tipoClienteId ?? ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione tipo de cliente</option>
                  <option value="1">Importador</option>
                  <option value="2">Exportador</option>
                  <option value="3">Mixto</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Calle</label>
                <input
                  className="form-control"
                  name="calle"
                  value={cliente.calle}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Número</label>
                <input
                  className="form-control"
                  name="numero"
                  value={cliente.numero}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Número interior</label>
                <input
                  className="form-control"
                  placeholder="Opcional"
                  name="numeroInterior"
                  value={cliente.numeroInterior}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-8">
                <label className="form-label">Colonia</label>
                <input
                  className="form-control"
                  name="colonia"
                  value={cliente.colonia}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Código postal</label>
                <input
                  className="form-control"
                  name="cp"
                  inputMode="numeric"
                  value={cliente.cp}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Ciudad</label>
                <input
                  className="form-control"
                  name="ciudad"
                  value={cliente.ciudad}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Estado</label>
                <input
                  className="form-control"
                  name="estado"
                  value={cliente.estado}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">País</label>
                <input
                  className="form-control"
                  name="pais"
                  value={cliente.pais}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div className="row g-3">
                {/* Ejecutivo de ventas */}
                <div className="col-md-4">
                  <label className="form-label">Ejecutivo de altas responsable</label>
                  <select
                    className="form-select"
                    name="ejecutivoVentaId"
                    value={cliente.ejecutivoVentaId || ""}
                    onChange={handleChange}
                    disabled={!!prospecto?.idEjecutivoAltas}
                  >
                    <option value="">Seleccione ejecutivo de altas</option>

                    {ejecutivosVentas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre + " " + e.apellidoPaterno + " " + e.apellidoMaterno}
                      </option>
                    ))}
                  </select>
                  {!!prospecto?.idEjecutivoAltas && (
                    <div className="form-text">Asignado desde prospección.</div>
                  )}
                </div>

                {/* Ejecutivo */}
                <div className="col-md-4">
                  <label className="form-label">Ejecutivo</label>
                  <select
                    className="form-select"
                    name="idEjecutivo"
                    value={cliente.idEjecutivo ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione ejecutivo</option>

                    {ejecutivos.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Empresa */}
                <div className="col-md-4">
                  <label className="form-label">Empresa razón</label>
                  <select
                    className="form-select"
                    name="idRazon"
                    value={cliente.idRazon ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione empresa</option>

                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombreEmpresa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="nc-seccion">
                <FaConciergeBell /> Servicios contratados
              </h4>

              <div className="nc-opciones">
                {SERVICIOS_CLIENTE.map((s) => (
                  <label
                    key={s.name}
                    className={`nc-opcion ${cliente[s.name] ? "activa" : ""}`}
                  >
                    <span className="nc-opcion-texto">
                      <span className="nc-opcion-titulo">{s.texto}</span>
                      <span className="nc-opcion-desc">
                        {cliente[s.name] ? "Activo" : "No contratado"}
                      </span>
                    </span>
                    <span className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name={s.name}
                        checked={!!cliente[s.name]}
                        onChange={handleChange}
                      />
                    </span>
                  </label>
                ))}
              </div>

              <h4 className="nc-seccion">
                <FaGlobeAmericas /> Alcance
              </h4>

              <label className={`nc-opcion nc-opcion-ancha ${cliente.esInternacional ? "activa" : ""}`}>
                <span className="nc-opcion-texto">
                  <span className="nc-opcion-titulo">Cliente internacional</span>
                  <span className="nc-opcion-desc">
                    Marque esta opción si el cliente opera fuera de México.
                  </span>
                </span>
                <span className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="esInternacional"
                    checked={!!cliente.esInternacional}
                    onChange={handleChange}
                  />
                </span>
              </label>
            </>
          )}
        </div>

        {/* ========================= */}
        {/* NAVEGACIÓN */}
        {/* ========================= */}

        <div className="nc-pie">
          {step > 0 ? (
            <button
              type="button"
              className="btn btn-outline-secondary np-btn"
              onClick={() => setStep(step - 1)}
            >
              <FaArrowLeft /> Regresar
            </button>
          ) : (
            <span />
          )}

          {step < PASOS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary np-btn"
              onClick={() => setStep(step + 1)}
            >
              Siguiente <FaArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success np-btn"
              onClick={guardarCliente}
            >
              <FaSave /> Guardar cliente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NuevoCliente;
