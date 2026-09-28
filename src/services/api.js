import axios from "axios";

const hostname = window.location.hostname;

let apiBase = "";

// LOCALHOST DEV
if (
    hostname === "localhost"
    ||
    hostname === "127.0.0.1"
) {
    apiBase = "https://localhost:7094/api";
}
// RED LOCAL
else if (
    hostname.startsWith("192.168.")
    ||
    hostname.startsWith("10.")
) {
    apiBase = "http://192.168.1.234:9099/api";
}
// PRODUCCIÓN
else {
    apiBase = `http://${hostname}:9099/api`;
}

const api = axios.create({
    baseURL: apiBase
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const obtenerDashboardRequisiciones = (page = 1, pageSize = 20) =>
    api.get(`/compras/dashboard?page=${page}&pageSize=${pageSize}`);

export const obtenerMetricasDashboard = async () => {
    const { data } = await api.get("/compras/dashboard/metricas");
    return data;
};

export const obtenerDetalleRequisicion = (id) =>
    api.get(`/compras/${id}`);

export const obtenerPendientesCompra = () =>
    api.get("/compras/pendientes");

export const obtenerOrdenesCompra = (idRequisicion) =>
    api.get(`/compras/${idRequisicion}/ordenes-compra`);

export const obtenerRequisicion = (id) =>
    api.get(`/compras/requisicion/${id}`);

export const obtenerProductosDisponiblesOC = (id) =>
    api.get(`/compras/ordenes-compra/${id}/productos-disponibles`);

export const crearOrdenCompra = (data) =>
    api.post("/compras/ordenes-compra", data);

export const obtenerPendientesAprobacion = () =>
    api.get("/compras/pendientes-aprobacion");

export const procesarAprobacion = (data) =>
    api.post("/compras/aprobar-requisicion", data);

export const verDocumentoRequisicion = (idDocumento) =>
    api.get(`/compras/documentos/${idDocumento}/ver`,
        {
            responseType: "blob"
        }
    );

export const aprobarRequisicion = (data) =>
    api.post("/compras/aprobar-requisicion", data);  

export const obtenerDetalleOrdenCompra = (idOrdenCompra) =>
    api.get(`/compras/ordenes-compra/detalle/${idOrdenCompra}`);

export default api;
//import axios from "axios";
//
//// Configuración para el proceso en desarrollo
////const api = axios.create({
////  baseURL: "https://localhost:7094/api"
////});
//// Configuración para producción (ajustar IP y puerto según tu backend)
//const api = axios.create({
//  baseURL: "http://192.168.1.234:9099/api"
//});
//
//
//api.interceptors.request.use((config) => {
//
//  const token = localStorage.getItem("token");
//
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`;
//  }
//
//  return config;
//
//});
//
//export default api;