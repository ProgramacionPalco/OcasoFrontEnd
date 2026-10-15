import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Workflow from "./components/Workflow";
import EditarTab from "./components/EditarTab";
import CotizarTab from "./components/CotizarTab";
import IntermedioTab from "./components/IntermedioTab";

function ProspectosSeguimiento() {
  const { idProspecto } = useParams();
  const id = Number(idProspecto);

  /* catalogos */
  const [ejecutivos, setEjecutivos] = useState([]);
  const [tipoEmpresa, setTipoEmpresa] = useState([]);

  /* variables */
  const [tab, setTab] = useState("editar");

  /* formularios */
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

  const [estatusHistorial, setEstatusHistorial] = useState([]);

  const obtenerProspecto = async () => {
    try {
      const res = await api.post(`/ventas/ObtenerProspectosById/?id=${id}`);

      setProspecto(res.data);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Error API:", error.response?.data);
      console.error("Errors:", error.response?.data?.errors);
    }
  };

  const obtenerEstatusHistorial = async () => {
    try {
      const res = await api.post(
        `/ventas/obtenerEstatusHistorial/?idProspecto=${id}`,
      );

      setEstatusHistorial(res.data);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Error API:", error.response?.data);
      console.error("Errors:", error.response?.data?.errors);
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

  const obtenerTipoEmpresa = async () => {
    try {
      const res = await api.post("/ventas/obtenerTipoEmpresa");
      setTipoEmpresa(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const ejecutivo = ejecutivos.find((e) => e.id === prospecto.idEjecutivo);

  const actualizarDatosProspecto = async () => {
    await obtenerProspecto();
    await obtenerEstatusHistorial();
  };

  useEffect(() => {
    obtenerProspecto();
    obtenerEstatusHistorial();
    obtenerEjecutivos();
    obtenerTipoEmpresa();
  }, []);

  if (prospecto.length === 0) {
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
    <div className="container-fluid">
      <div className="card shadow-sm mb-4">
        <div className="card-header">Seguimientos prospectos</div>
        <div className="card-body">
          <h2 className="card-title">
            Nombre del prospecto: {prospecto.nombre}
          </h2>
          <Workflow estatusHistorial={estatusHistorial} />
          <hr />

          <div className="row">
            <div className="col-md-4">
              <p>
                <strong>Ejecutivo asignado:</strong>{" "}
                {ejecutivo
                  ? `${ejecutivo.nombre} ${ejecutivo.apellidoPaterno} ${ejecutivo.apellidoMaterno}`
                  : "Sin ejecutivo"}
              </p>
            </div>
            <div className="col-md-4">
              <p>
                <strong>Fecha contacto:</strong>{" "}
                {new Date(prospecto.fechaContacto).toLocaleString("es-MX")}
              </p>
            </div>
            <div className="col-md-4">
              <p>
                <strong>Fecha registro:</strong>{" "}
                {new Date(prospecto.fechaRegistro).toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "editar" ? "active" : ""}`}
            onClick={() => setTab("editar")}
          >
            Editar prospecto
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${tab === "cotizar" ? "active" : ""}`}
            onClick={() => setTab("cotizar")}
          >
            Cotizar
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${tab === "intermedio" ? "active" : ""}`}
            onClick={() => setTab("intermedio")}
          >
            Intermedio
          </button>
        </li>
      </ul>
      {tab === "editar" && (
        <EditarTab
          prospecto={prospecto}
          ejecutivos={ejecutivos}
          tipoEmpresa={tipoEmpresa}
          onProspectoActualizado={actualizarDatosProspecto}
        />
      )}

      {tab === "cotizar" && (
        <CotizarTab
          prospecto={prospecto}
          onProspectoActualizado={actualizarDatosProspecto}
        />
      )}

      {tab === "intermedio" && (
        <IntermedioTab
          prospecto={prospecto}
          onProspectoActualizado={actualizarDatosProspecto}
        />
      )}
    </div>
  );
}

export default ProspectosSeguimiento;
