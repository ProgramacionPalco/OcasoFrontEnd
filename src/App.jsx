import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Clientes from "./pages/clientes/Clientes";
import DetalleCliente from "./pages/clientes/DetalleCliente";
import Catalogos from "./pages/catalogos/Catalogos";
import NuevoCliente from "./pages/clientes/NuevoCliente";
import CatalogoDocumentos from "./pages/catalogos/CatalogoDocumentos";
import CatalogoEmpresas from "./pages/catalogos/CatalogoEmpresas";
import CatalogoEjecutivos from "./pages/catalogos/CatalogoEjecutivos";
import CatalogoEjecutivosVentas from "./pages/catalogos/CatalogoEjecutivosVentas";
import ReporteClientesDocumentos from "./pages/reportes/ReporteClientesDocumentos";
import ReasignarClientes from "./pages/catalogos/ReasignarClientes";
import CalidadExplorador from "./pages/calidad/CalidadExplorador";
import ExploradorDocumentos from "./pages/calidad/ExploradorDocumentos";
import ClientesInactivos from "./pages/clientes/ClientesInactivos";
import ReporteMovimientos from "./pages/reportes/ReporteMovimientos";
import NuevaRequisicion from "./pages/compras/NuevaRequisicion";
import MisRequisiciones from "./pages/compras/MisRequisiciones";
import DashboardCompras from "./pages/compras/DashboardCompras";
import DetalleRequisicion from "./pages/compras/DetalleRequisicion";
import PendientesCompra from "./pages/compras/PendientesCompra";
import OrdenCompra from "./pages/compras/OrdenCompra";
import AdministrarOrdenesCompra from "./pages/compras/AdministrarOrdenesCompra";
import NuevaOrdenCompra from "./pages/compras/NuevaOrdenCompra";
import Aprobaciones from "./pages/compras/Aprobaciones";
import DetalleAprobacion from "./pages/compras/DetalleAprobacion";
import DetalleOrdenCompra from "./pages/compras/DetalleOrdenCompra";


import Usuarios from "./pages/admin/Usuarios";
import NuevoUsuario from "./pages/admin/NuevoUsuario";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/admin.css";

import { PermisosProvider } from "./context/PermisosContext";

function App() {

  const token = localStorage.getItem("token");

  return (

    <PermisosProvider>

      <BrowserRouter>

        <Routes>

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* REDIRECCIÓN INICIAL */}
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />

          {/* RUTAS PROTEGIDAS */}
          <Route element={<ProtectedRoute />}>

            <Route element={<MainLayout />}>

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/calidad" element={<CalidadExplorador />} />
              
              <Route path="/calidad/:tipo" element={<ExploradorDocumentos />} />

              <Route path="/clientes" element={<Clientes />} />

              <Route path="/clientes/nuevo" element={<NuevoCliente />} />

              <Route path="/clientes/:id" element={<DetalleCliente />} />

              <Route path="/clientes/inactivos" element={<ClientesInactivos />}/>

              <Route path="/reportes/clientes-documentos" element={<ReporteClientesDocumentos />} />

              <Route path="/reportes/movimientos" element={<ReporteMovimientos />}/>

              <Route path="/catalogos" element={<Catalogos />} />

              <Route path="/catalogos/documentos" element={<CatalogoDocumentos />} />

              <Route path="/catalogos/empresas" element={<CatalogoEmpresas />} />

              <Route path="/catalogos/ejecutivos" element={<CatalogoEjecutivos />} />

              <Route path="/catalogos/ventas" element={<CatalogoEjecutivosVentas />} />

              <Route path="/catalogos/reasignar-clientes" element={<ReasignarClientes />} />

              <Route path="/admin/usuarios" element={<Usuarios />} />

              <Route path="/admin/usuarios/nuevo" element={<NuevoUsuario />} />

              <Route path="/compras/dashboard" element={<DashboardCompras/>} />

              <Route path="/compras/nueva" element={<NuevaRequisicion/>} />

              <Route path="/compras/mis-requisiciones" element={<MisRequisiciones/>} />

              <Route path="/compras/detalle/:id" element={<DetalleRequisicion/>} />

              <Route path="/compras/pendientes" element={<PendientesCompra />} />

              <Route path="/compras/orden-compra/:id" element={<AdministrarOrdenesCompra  />} />

              <Route path="/compras/ordenes-compra/:idRequisicion/nueva" element={<NuevaOrdenCompra />} />

              <Route path="/compras/aprobaciones" element={<Aprobaciones />} />

              <Route path="/compras/aprobaciones/:id" element={<DetalleAprobacion />} />

              <Route path="/compras/orden-compra/detalle/:idOrdenCompra" element={<DetalleOrdenCompra />} />

            </Route>

          </Route>

        </Routes>

      </BrowserRouter>

    </PermisosProvider>

  );

}

export default App;