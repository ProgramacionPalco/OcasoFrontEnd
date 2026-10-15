import { useEffect, useState } from "react";
import api from "../../../services/api";

import Select from "react-select";
import makeAnimated from "react-select/animated";

import Swal from "sweetalert2";

function EditarTab({ prospecto: prospectoInicial, ejecutivos, tipoEmpresa, onProspectoActualizado }) {
  /* import del select para seleccion multiple */
  const animatedComponents = makeAnimated();

  /* catalogos */
  const [serviciosRegistrados, setServiciosRegistrados] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [prospecto, setProspecto] = useState(prospectoInicial);

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

  const actualizarProspecto = async () => {
    try {
      const res = await api.post("/ventas/actualizarProspecto", prospecto);
      return res.data;
    } catch (error) {
      console.log(error.response?.data);
      return error.response?.data;
    }
  };

  const actualizarServicios = async () => {
    try {
      const res = await api.post(
        `/ventas/actualizarServicios?idProspecto=${prospecto?.id}`,
        serviciosRegistrados,
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
      obtenerServicios();

      obtenerServiciosRegistrados();
    }
  }, [prospecto?.id]);

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
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="row">
          <h3>Modificar prospecto</h3>
          <div className="form-grid-prospectos">
            <div className="form-group full-prospectos">
              <label>Nombre</label>
              <input
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
                onChange={(opciones) => {
                  const seleccionados = opciones.map((x) => ({
                    idProspecto: Number(prospecto.id),
                    idServicio: Number(x.value),
                  }));

                  setServiciosRegistrados(seleccionados);
                }}
              />
            </div>

            <div className="form-group span-2-prospectos">
              <label>Tipo Compañia</label>

              <select
                value={prospecto.idTipoEmpresa}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
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

            <div className="form-group span-2-prospectos">
              <label>Tipo Contacto</label>

              <input
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

            <div className="form-group span-2-prospectos">
              <label>Asunto Correo</label>

              <input
                autoComplete="off"
                value={prospecto.asuntoCorreo || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    asuntoCorreo: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group span-2-prospectos">
              <label>Aduanas</label>

              <input
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

            <div className="form-group span-2-prospectos">
              <label>Rutas Operacion</label>

              <input
                autoComplete="off"
                value={prospecto.rutasOperacion || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    rutasOperacion: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group full-prospectos">
              <label>Mercancias Productos</label>

              <input
                autoComplete="off"
                value={prospecto.mercanciasProductos || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    mercanciasProductos: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group span-2-prospectos">
              <label>Volumen Estimado Mensual</label>

              <input
                autoComplete="off"
                value={prospecto.volumenEstimadoMensual || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    volumenEstimadoMensual: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group span-2-prospectos">
              <label>Nivel Urgencia</label>

              <select
                value={prospecto.nivelUrgencia}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
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
                value={prospecto.tipoOperacion || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    tipoOperacion: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group span-2-prospectos">
              <label>Ejecutivo de ventas</label>

              <select
                value={prospecto.idEjecutivo}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
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
                readOnly
                value={prospecto.fechaContacto || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    fechaContacto: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group full-prospectos">
              <label>Comentarios</label>

              <input
                autoComplete="off"
                value={prospecto.comentarios || ""}
                onChange={(e) =>
                  setProspecto({
                    ...prospecto,
                    comentarios: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="col-md-6 offset-md-9 mt-5">
            <button
              className="btn btn-primary"
              onClick={async () => {
                const resultado = await actualizarProspecto();

                if (resultado == "Prospecto actualizado exitosamente") {
                  const resultadoServicios = await actualizarServicios();
                  await onProspectoActualizado();

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
              Actualizar datos del Prospecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarTab;
