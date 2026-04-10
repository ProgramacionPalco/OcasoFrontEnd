import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function NuevoCliente() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

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
    ejecutivoVentasId: null,

    servicioPalco: false,
    servicioSLP: false,
    servicioMAYA: false,
    servicioOla: false,
    esInternacional: false
  });

  const [ejecutivos, setEjecutivos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [ejecutivosVentas, setEjecutivosVentas] = useState([]);

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
            name === "ejecutivoVentasId"
          ? value === "" ? null : parseInt(value)
          : value
    });

  };

  const guardarCliente = async () => {
    try {

      const payload = {
        ...cliente,
        servicioPalco: cliente.servicioPalco ? 1 : 0,
        servicioSLP: cliente.servicioSLP ? 1 : 0,
        servicioMAYA: cliente.servicioMAYA ? 1 : 0,
        servicioOla: cliente.servicioOla ? 1 : 0
      };

      const res = await api.post("/altas/clientes", payload);

      navigate(`/clientes/${res.data.data.id}`);

    } catch (error) {
      console.error(error);
      alert("Error al guardar cliente");
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

  useEffect(() => {
    cargarEjecutivos();
    cargarEmpresas();
    cargarEjecutivosVentas();
  }, []);

  return (
    <div className="card p-4">

      <h3>Nuevo Cliente</h3>

      <div className="mb-4">
        <span className={step === 1 ? "fw-bold" : ""}>1- Datos</span>
        {" → "}
        <span className={step === 2 ? "fw-bold" : ""}>2- Dirección</span>
        {" → "}
        <span className={step === 3 ? "fw-bold" : ""}>3- Configuración</span>
      </div>

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
            className="btn btn-primary mt-3"
            onClick={() => setStep(2)}
          >
            Siguiente
          </button>

        </div>
      )}

      {step === 2 && (
        <div>

          <h5>Dirección</h5>

          <input className="form-control mb-2" placeholder="Calle" name="calle" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="Número" name="numero" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="Número Interior" name="numeroInterior" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="Colonia" name="colonia" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="CP" name="cp" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="Ciudad" name="ciudad" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="Estado" name="estado" onChange={handleChange}/>
          <input className="form-control mb-2" placeholder="País" name="pais" onChange={handleChange}/>

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
            name="ejecutivoVentasId"
            onChange={handleChange}
          >
            <option value="">Ejecutivo de ventas responsable</option>

            {ejecutivosVentas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre +" "+ e.apellidoPaterno +" "+e.apellidoMaterno}
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
            <input type="checkbox" name="servicioPalco" onChange={handleChange}/>
            Servicio Palco
          </label>

          <label className="form-check">
            <input type="checkbox" name="servicioSLP" onChange={handleChange}/>
            Servicio SLP
          </label>

          <label className="form-check">
            <input type="checkbox" name="servicioMAYA" onChange={handleChange}/>
            Servicio MAYA
          </label>

          <label className="form-check">
            <input type="checkbox" name="servicioOla" onChange={handleChange}/>
            Servicio OLA
          </label>

          <label className="form-check mt-3">
            <input type="checkbox" name="esInternacional" onChange={handleChange}/>
            Cliente Internacional
          </label>

          <div className="mt-3">

            <button className="btn btn-secondary me-2" onClick={() => setStep(2)}>
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