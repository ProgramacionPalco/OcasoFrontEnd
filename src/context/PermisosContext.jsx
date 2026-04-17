import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const PermisosContext = createContext();

export function PermisosProvider({ children }) {

  const [permisos, setPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(true);

  useEffect(() => {
    cargarPermisos();
  }, []);

  const cargarPermisos = async () => {

    try {

      const res = await api.get("/seguridad/mis-permisos");

      setPermisos(res.data);

    } catch (error) {

      console.error("Error cargando permisos", error);

    } finally {

      setLoadingPermisos(false);

    }

  };

  return (
    <PermisosContext.Provider value={{ permisos, loadingPermisos }}>
      {children}
    </PermisosContext.Provider>
  );
}

export function usePermisosContext() {
  return useContext(PermisosContext);
}