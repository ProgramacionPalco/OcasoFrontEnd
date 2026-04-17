import { usePermisosContext } from "../context/PermisosContext";

export default function usePermiso(ruta) {

  const { permisos } = usePermisosContext();

  const permiso = permisos.find(
    p => p.ruta?.toLowerCase() === ruta.toLowerCase()
  );

  return {

    puedeVer: permiso?.puedeVer ?? false,
    puedeCrear: permiso?.puedeCrear ?? false,
    puedeEditar: permiso?.puedeEditar ?? false,
    puedeEliminar: permiso?.puedeEliminar ?? false,
    puedeImprimir: permiso?.puedeImprimir ?? false

  };

}