import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import {
  FaUserTie,
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";

function CatalogoEjecutivosVentas() {

const [ejecutivos, setEjecutivos] = useState([]);

const [ejecutivoForm, setEjecutivoForm] = useState({
    id: null,
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: ""
});

const obtenerEjecutivos = async () => {
    try {
        const res = await api.get("/catalogos/ejecutivosVentasProspectos");
        setEjecutivos(res.data);
    } catch (error) {
        console.error("Error cargando ejecutivos ventas", error);
    }
};

useEffect(() => {
    obtenerEjecutivos();
}, []);

const guardarEjecutivo = async () => {

    if (!ejecutivoForm.nombre || !ejecutivoForm.correo) {
        alert("Nombre y correo son obligatorios");
        return;
    }

    try {

        if (ejecutivoForm.id) {

            const payload = {
                id: ejecutivoForm.id,
                nombre: ejecutivoForm.nombre,
                apellidoPaterno: ejecutivoForm.apellidoPaterno,
                apellidoMaterno: ejecutivoForm.apellidoMaterno,
                correo: ejecutivoForm.correo
            };

            await api.put("/catalogos/ejecutivosVentasProspectos", payload);

        } else {

            const payload = {
                nombre: ejecutivoForm.nombre,
                apellidoPaterno: ejecutivoForm.apellidoPaterno,
                apellidoMaterno: ejecutivoForm.apellidoMaterno,
                correo: ejecutivoForm.correo
            };

            await api.post("/catalogos/ejecutivosVentasProspectos", payload);

        }

        setEjecutivoForm({
            id: null,
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            correo: ""
        });

        obtenerEjecutivos();

    } catch (error) {
        console.error(error);
        alert("Error al guardar ejecutivo");
    }
};

const editarEjecutivo = (ejecutivo) => {

    setEjecutivoForm({
        id: ejecutivo.id,
        nombre: ejecutivo.nombre || "",
        apellidoPaterno: ejecutivo.apellidoPaterno || "",
        apellidoMaterno: ejecutivo.apellidoMaterno || "",
        correo: ejecutivo.correo || ""
    });

};

const eliminarEjecutivo = async (id) => {

    if (!window.confirm("¿Eliminar ejecutivo?")) return;

    try {

        await api.delete(`/catalogos/ejecutivosVentasProspectos/${id}`);

        obtenerEjecutivos();

    } catch (error) {

        console.error(error);

        alert("Error al eliminar");

    }

};

  const editando = Boolean(ejecutivoForm.id);

  const cancelarEdicion = () =>
    setEjecutivoForm({
      id: null,
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      correo: "",
    });

  const nombreCompleto = (row) =>
    `${row.nombre ?? ""} ${row.apellidoPaterno ?? ""} ${row.apellidoMaterno ?? ""}`
      .replace(/\s+/g, " ")
      .trim();

  const iniciales = (row) =>
    `${(row.nombre || "?").trim().charAt(0)}${(row.apellidoPaterno || "").trim().charAt(0)}`.toUpperCase();

  const columns = [
    {
      header: "Nombre",
      render: (row) => (
        <div className={`cliente-nombre ${ejecutivoForm.id === row.id ? "ce-editando" : ""}`}>
          <span className="cliente-avatar">{iniciales(row)}</span>
          <span className="text-break">{nombreCompleto(row)}</span>
        </div>
      ),
    },

    {
      header: "Correo",
      render: (row) =>
        row.correo ? (
          <a className="contacto-dato" href={`mailto:${row.correo}`}>
            <FaEnvelope />
            <span className="text-break">{row.correo}</span>
          </a>
        ) : (
          <span className="text-muted">—</span>
        ),
    },

    {
      header: "Acciones",
      align: "end",
      render: (row) => (
        <div className="docs-acciones">
          <button
            className="btn btn-sm btn-outline-primary explorador-btn-icono"
            title="Editar"
            aria-label="Editar ejecutivo"
            onClick={() => {
              editarEjecutivo(row);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <FaEdit />
          </button>

          <button
            className="btn btn-sm btn-outline-danger explorador-btn-icono"
            title="Eliminar"
            aria-label="Eliminar ejecutivo"
            onClick={() => eliminarEjecutivo(row.id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const CAMPOS = [
    { name: "nombre", label: "Nombre", placeholder: "Nombre(s)", icono: <FaUser />, requerido: true },
    { name: "apellidoPaterno", label: "Apellido paterno", placeholder: "Apellido paterno", icono: <FaUser /> },
    { name: "apellidoMaterno", label: "Apellido materno", placeholder: "Apellido materno", icono: <FaUser /> },
    { name: "correo", label: "Correo", placeholder: "correo@empresa.com", icono: <FaEnvelope />, requerido: true, type: "email" },
  ];

  return (
    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Catálogos</span>
          <h2 className="dash-titulo">Ejecutivos de ventas</h2>
          <div className="dash-contexto">
            <span>
              <FaUserTie /> {ejecutivos.length.toLocaleString("es-MX")}{" "}
              {ejecutivos.length === 1 ? "ejecutivo registrado" : "ejecutivos registrados"}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">

        {/* ========================= */}
        {/* FORMULARIO */}
        {/* ========================= */}

        <div className="col-12 col-xl-4">
          <div className={`dash-panel nc-form p-0 overflow-hidden cd-form ${editando ? "cd-form-editando" : ""}`}>

            <div className="nc-form-header">
              <span className="nc-form-icono">{editando ? <FaEdit /> : <FaUserPlus />}</span>
              <div style={{ minWidth: 0 }}>
                <h3 className="nc-form-titulo">
                  {ejecutivoForm.id ? "Editar ejecutivo" : "Nuevo ejecutivo"}
                </h3>
                <div className="nc-form-sub text-truncate">
                  {editando
                    ? nombreCompleto(ejecutivoForm) || "Ejecutivo seleccionado"
                    : "Agrega un ejecutivo de ventas al catálogo"}
                </div>
              </div>
            </div>

            <div className="nc-form-cuerpo">
              <div className="row g-3">
                {CAMPOS.map((c) => (
                  <div className={c.name === "correo" ? "col-12" : "col-12 col-md-4 col-xl-12"} key={c.name}>
                    <label className="form-label">
                      {c.label}
                      {c.requerido && <span className="text-danger ms-1">*</span>}
                    </label>
                    <div className="nr-input-icono">
                      {c.icono}
                      <input
                        type={c.type || "text"}
                        className="form-control"
                        placeholder={c.placeholder}
                        value={ejecutivoForm[c.name]}
                        onChange={(e) =>
                          setEjecutivoForm({
                            ...ejecutivoForm,
                            [c.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nc-pie">
              {editando ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary np-btn"
                  onClick={cancelarEdicion}
                >
                  <FaTimes /> Cancelar
                </button>
              ) : (
                <span />
              )}

              <button className="btn btn-primary np-btn" onClick={guardarEjecutivo}>
                <FaSave /> {editando ? "Actualizar ejecutivo" : "Guardar ejecutivo"}
              </button>
            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* LISTADO */}
        {/* ========================= */}

        <div className="col-12 col-xl-8">
          <div className="dash-panel p-0 overflow-hidden">
            <DataTable
              data={ejecutivos}
              columns={columns}
              placeholder="Buscar ejecutivo o correo..."
              vacio="No hay ejecutivos registrados."
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default CatalogoEjecutivosVentas;
