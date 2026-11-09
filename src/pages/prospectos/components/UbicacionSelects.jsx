import { useEffect, useState } from "react";
import api from "../../../services/api";

import Select from "react-select";

/* el menu se monta en body para que no lo recorte el overflow del modal */
const selectProps = {
  isClearable: true,
  classNamePrefix: "rs",
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 10000 }) },
  noOptionsMessage: () => "Sin resultados",
  loadingMessage: () => "Cargando...",
};

/* Selects en cascada: pais -> estado -> ciudad.
   onChange recibe solo los campos que cambiaron, ej. { idPais, idEstado: null, idCiudad: null } */
function UbicacionSelects({ idPais, idEstado, idCiudad, onChange }) {
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const obtenerPaises = async () => {
    try {
      const res = await api.get("/catalogos/paises");
      setPaises(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const obtenerEstados = async (id) => {
    try {
      const res = await api.get(`/catalogos/estados/${id}`);
      setEstados(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const obtenerCiudades = async (id) => {
    try {
      const res = await api.get(`/catalogos/ciudades/${id}`);
      setCiudades(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    obtenerPaises();
  }, []);

  /* tambien carga los estados/ciudades de un prospecto existente al editar */
  useEffect(() => {
    if (idPais) obtenerEstados(idPais);
    else setEstados([]);
  }, [idPais]);

  useEffect(() => {
    if (idEstado) obtenerCiudades(idEstado);
    else setCiudades([]);
  }, [idEstado]);

  const opcionesPaises = paises.map((p) => ({ value: p.idPais, label: p.nombre }));
  const opcionesEstados = estados.map((e) => ({ value: e.idEstado, label: e.nombre }));
  const opcionesCiudades = ciudades.map((c) => ({ value: c.idCiudad, label: c.nombre }));

  return (
    <>
      <div className="form-group span-2-prospectos">
        <label>País</label>

        <Select
          {...selectProps}
          placeholder="Seleccione país"
          options={opcionesPaises}
          value={opcionesPaises.find((o) => o.value === idPais) ?? null}
          onChange={(opcion) =>
            onChange({
              idPais: opcion?.value ?? null,
              idEstado: null,
              idCiudad: null,
            })
          }
        />
      </div>

      <div className="form-group span-2-prospectos">
        <label>Estado</label>

        <Select
          {...selectProps}
          isDisabled={!idPais}
          placeholder={idPais ? "Buscar estado" : "Seleccione primero un país"}
          options={opcionesEstados}
          value={opcionesEstados.find((o) => o.value === idEstado) ?? null}
          onChange={(opcion) =>
            onChange({
              idEstado: opcion?.value ?? null,
              idCiudad: null,
            })
          }
        />
      </div>

      <div className="form-group span-2-prospectos">
        <label>Ciudad / Municipio</label>

        <Select
          {...selectProps}
          isDisabled={!idEstado}
          placeholder={idEstado ? "Buscar ciudad" : "Seleccione primero un estado"}
          options={opcionesCiudades}
          value={opcionesCiudades.find((o) => o.value === idCiudad) ?? null}
          onChange={(opcion) => onChange({ idCiudad: opcion?.value ?? null })}
        />
      </div>
    </>
  );
}

export default UbicacionSelects;
