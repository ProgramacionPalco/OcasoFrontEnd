import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid } from "@mui/x-data-grid";

function NuevoCliente() {
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

  return (
    <div className="card p-4">
      <h3>Nuevo Cliente</h3>

      <div className="mb-4">
        <span className={step === 0 ? "fw-bold" : ""}>0- Prospeccion</span>
        {" → "}
        <span className={step === 1 ? "fw-bold" : ""}>1- Datos</span>
        {" → "}
        <span className={step === 2 ? "fw-bold" : ""}>2- Dirección</span>
        {" → "}
        <span className={step === 3 ? "fw-bold" : ""}>3- Configuración</span>
      </div>

      {step === 0 && (
        <div>
          <h5>Datos de prospeccion</h5>

          {!clienteProspeccion ? (
            <>
              <div
                className="alert alert-warning d-flex align-items-center"
                role="alert"
              >
                <svg
                  className="bi flex-shrink-0 me-2"
                  role="img"
                  aria-label="Warning:"
                >
                  <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                  No accedio desde prospeccion, por lo tanto esta seccion no
                  contiene datos
                </div>
              </div>
            </>
          ) : (
            <div className="row">
              <div className="form-group">
                <label>Nombre del prospecto</label>
                <input
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
              <div className="form-group span-2-prospectos">
                <label>Servicio</label>

                <Select
                  readOnly
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
                      (serviciosRegistrados ?? [])
                        .map((x) => x.idServicio)
                        .includes(opcion.value),
                    )}
                />
              </div>
              <div className="form-group">
                <label>Tipo Compañia</label>

                <select disabled value={prospecto.idTipoEmpresa}>
                  <option value="">Seleccione tipo empresa</option>

                  {tipoEmpresa.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Aduanas</label>

                <input
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

              <div className="form-group">
                <label>Tipo Contacto</label>

                <input
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

              <div className="form-group">
                <label>Nivel Urgencia</label>

                <select disabled value={prospecto.nivelUrgencia}>
                  <option value="">Seleccione nivel de urgencia</option>

                  <option key="Baja"> Baja </option>
                  <option key="Media"> Media </option>
                  <option key="Alta"> Alta </option>
                  <option key="Critica"> Critica </option>
                </select>
              </div>

              <div className="form-group mt-3">
                <h5 className="fw-bold m-0">Contactos prospectos</h5>

                <DataGrid
                  rows={formContactos}
                  columns={columnsContactos}
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
            </div>
          )}
          <button className="btn btn-primary mt-3" onClick={() => setStep(1)}>
            Siguiente
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h5>Datos Fiscales</h5>

          <input
            className="form-control mb-2"
            placeholder="RFC"
            name="rfc"
            value={cliente.rfc}
            onChange={handleChange}
          />

          <input
            className="form-control mb-2"
            placeholder="Razón Social"
            name="razonSocial"
            value={cliente.razonSocial}
            onChange={handleChange}
          />

          <select
            className="form-control mb-2"
            name="personaFM"
            onChange={handleChange}
          >
            <option value="">Tipo Persona</option>
            <option value="1">Persona Física</option>
            <option value="2">Persona Moral</option>
          </select>

          <select
            className="form-control"
            name="tipoClienteId"
            onChange={handleChange}
          >
            <option value="">Tipo Cliente</option>
            <option value="1">Importador</option>
            <option value="2">Exportador</option>
            <option value="3">Mixto</option>
          </select>
          <button
            className="btn btn-secondary mt-3 me-3"
            onClick={() => setStep(0)}
          >
            Regresar
          </button>
          <button className="btn btn-primary mt-3" onClick={() => setStep(2)}>
            Siguiente
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h5>Dirección</h5>

          <input
            className="form-control mb-2"
            placeholder="Calle"
            name="calle"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Número"
            name="numero"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Número Interior"
            name="numeroInterior"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Colonia"
            name="colonia"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="CP"
            name="cp"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Ciudad"
            name="ciudad"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Estado"
            name="estado"
            onChange={handleChange}
          />
          <input
            className="form-control mb-2"
            placeholder="País"
            name="pais"
            onChange={handleChange}
          />

          <button className="btn btn-secondary me-2" onClick={() => setStep(1)}>
            Regresar
          </button>

          <button className="btn btn-primary" onClick={() => setStep(3)}>
            Siguiente
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h5>Configuración Comercial</h5>
          {/* Ejecutivo de ventas */}
          <select
            className="form-control mb-3"
            name="ejecutivoVentaId"
            value={cliente.ejecutivoVentaId || ""}
            onChange={handleChange}
            disabled={!!prospecto?.idEjecutivoAltas}
          >
            <option value="">Ejecutivo de altas responsable</option>

            {ejecutivosVentas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre + " " + e.apellidoPaterno + " " + e.apellidoMaterno}
              </option>
            ))}
          </select>

          {/* Ejecutivo */}
          <select
            className="form-control mb-3"
            name="idEjecutivo"
            onChange={handleChange}
          >
            <option value="">Seleccione Ejecutivo</option>

            {ejecutivos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>

          {/* Empresa */}
          <select
            className="form-control mb-3"
            name="idRazon"
            onChange={handleChange}
          >
            <option value="">Empresa Razón</option>

            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombreEmpresa}
              </option>
            ))}
          </select>

          <label className="form-check">
            <input
              type="checkbox"
              name="servicioPalco"
              onChange={handleChange}
            />
            Servicio Palco
          </label>

          <label className="form-check">
            <input type="checkbox" name="servicioSLP" onChange={handleChange} />
            Servicio SLP
          </label>

          <label className="form-check">
            <input
              type="checkbox"
              name="servicioMAYA"
              onChange={handleChange}
            />
            Servicio MAYA
          </label>

          <label className="form-check">
            <input type="checkbox" name="servicioOla" onChange={handleChange} />
            Servicio OLA
          </label>

          <label className="form-check mt-3">
            <input
              type="checkbox"
              name="esInternacional"
              onChange={handleChange}
            />
            Cliente Internacional
          </label>

          <div className="mt-3">
            <button
              className="btn btn-secondary me-2"
              onClick={() => setStep(2)}
            >
              Regresar
            </button>

            <button className="btn btn-success" onClick={guardarCliente}>
              Guardar Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NuevoCliente;
