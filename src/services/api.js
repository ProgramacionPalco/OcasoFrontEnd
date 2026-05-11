import axios from "axios";

// Configuración para el proceso en desarrollo
const api = axios.create({
  baseURL: "https://localhost:7094/api"
});
// Configuración para producción (ajustar IP y puerto según tu backend)
//const api = axios.create({
//  baseURL: "http://192.168.1.234:9099/api"
//});


api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

export default api;