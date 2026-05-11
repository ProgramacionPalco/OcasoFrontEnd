import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

import {
  FaTachometerAlt,
  FaUsers,
  FaCogs,
  FaChevronDown,
  FaFileAlt,
  FaBuilding,
  FaUserTie,
  FaUserTag,
  FaBars,
  FaUserCog,
  FaExchangeAlt,
   FaShieldAlt 
} from "react-icons/fa";

function Sidebar() {

  const [collapsed, setCollapsed] = useState(false);
  const [catalogosOpen, setCatalogosOpen] = useState(false);
  const [reportesOpen, setReportesOpen] = useState(false);
  const [altasOpen, setAltasOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [calidadOpen, setCalidadOpen] = useState(false);

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const cargarPermisos = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        const response = await api.get("/seguridad/mis-permisos");
        setMenus(response.data);

      } catch (error) {

        console.error("Error cargando permisos", error);

      } finally {

        setLoading(false);

      }

    };

    cargarPermisos();

  }, []);

  const tienePermiso = (ruta) => {

    if (!menus || menus.length === 0) return false;

    const modulo = menus.find(m =>
      m.ruta?.toLowerCase() === ruta.toLowerCase()
    );

    if (!modulo) return false;

    return modulo.puedeVer;

  };

  if (loading) return null;

  return (

    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <div className="sidebar-header">

        {!collapsed && <h4 className="logo">OCASO</h4>}

        <FaBars
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        />

      </div>

      <ul className="menu">

        {tienePermiso("/dashboard") && (
          <li>
            <NavLink to="/dashboard" className="menu-link">
              <FaTachometerAlt className="icon" />
              {!collapsed && "Dashboard"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/calidad") && (

          <li className="menu-group">

            <div
              className="menu-title"
              onClick={() => !collapsed && setCalidadOpen(!calidadOpen)}
            >

              <FaShieldAlt className="icon" />
              {!collapsed && "Calidad"}

              {!collapsed &&
                <FaChevronDown
                  className={`arrow ${calidadOpen ? "open" : ""}`}
                />
              }

            </div>

            {!collapsed && calidadOpen && (

              <ul className="submenu">

                <li>

                  <NavLink
                    to="/calidad/iso"
                    className="menu-link"
                  >

                    <FaFileAlt className="icon" />
                    {!collapsed && "ISO"}

                  </NavLink>

                </li>

                <li>

                  <NavLink
                    to="/calidad/oea"
                    className="menu-link"
                  >

                    <FaFileAlt className="icon" />
                    {!collapsed && "OEA"}

                  </NavLink>

                </li>

              </ul>

            )}

          </li>

        )}




        {tienePermiso("/clientes") && (
          <li>
            <NavLink to="/clientes" className="menu-link">
              <FaUsers className="icon" />
              {!collapsed && "Clientes"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/reportes/clientes-documentos") && (

          <li className="menu-group">

            <div
              className="menu-title"
              onClick={() => !collapsed && setReportesOpen(!reportesOpen)}
            >

              <FaFileAlt className="icon" />
              {!collapsed && "Reportes"}

              {!collapsed &&
                <FaChevronDown
                  className={`arrow ${reportesOpen ? "open" : ""}`}
                />
              }

            </div>

            {!collapsed && reportesOpen && (

              <ul className="submenu">

                <li
                  className="submenu-title"
                  onClick={() => setAltasOpen(!altasOpen)}
                >
                  Altas
                </li>

                {altasOpen && (

                  <ul className="submenu">

                    <li>

                      <NavLink
                        to="/reportes/clientes-documentos"
                        className="menu-link"
                      >
                        Clientes y Documentos
                      </NavLink>

                    </li>

                  </ul>

                )}

              </ul>

            )}

          </li>

        )}

        {(tienePermiso("/catalogos/documentos") ||
          tienePermiso("/catalogos/empresas") ||
          tienePermiso("/catalogos/ejecutivos")) && (

            <li className="menu-group">

              <div
                className="menu-title"
                onClick={() => setCatalogosOpen(!catalogosOpen)}
              >

                <FaCogs className="icon" />
                {!collapsed && "Catálogos"}

                {!collapsed &&
                  <FaChevronDown
                    className={`arrow ${catalogosOpen ? "open" : ""}`}
                  />
                }

              </div>

              {catalogosOpen && !collapsed && (

                <ul className="submenu">

                  {tienePermiso("/catalogos/documentos") && (

                    <li>

                      <NavLink to="/catalogos/documentos" className="menu-link">

                        <FaFileAlt className="icon" />
                        {!collapsed && "Documentos"}

                      </NavLink>

                    </li>

                  )}

                  {tienePermiso("/catalogos/empresas") && (

                    <li>

                      <NavLink to="/catalogos/empresas" className="menu-link">

                        <FaBuilding className="icon" />
                        {!collapsed && "Empresas"}

                      </NavLink>

                    </li>

                  )}

                  {tienePermiso("/catalogos/ejecutivos") && (

                    <li>

                      <NavLink to="/catalogos/ejecutivos" className="menu-link">

                        <FaUserTie className="icon" />
                        {!collapsed && "Ejecutivos"}

                      </NavLink>

                    </li>

                  )}

                  {tienePermiso("/catalogos/ejecutivosVentas") && (

                    <li>

                      <NavLink to="/catalogos/ventas" className="menu-link">

                        <FaUserTag className="icon" />
                        {!collapsed && "Ejecutivos de ventas"}

                      </NavLink>

                    </li>

                  )}

                  {/* NUEVA OPCION */}
                  {tienePermiso("/catalogos/reasignar-clientes") && (

                    <li>

                      <NavLink to="/catalogos/reasignar-clientes" className="menu-link">

                        <FaExchangeAlt className="icon" />
                        {!collapsed && "Reasignar clientes"}

                      </NavLink>

                    </li>

                  )}

                </ul>

              )}

            </li>

          )}

        {tienePermiso("/admin/usuarios") && (

          <li className="menu-group">

            <div
              className="menu-title"
              onClick={() => setAdminOpen(!adminOpen)}
            >

              <FaUserCog className="icon" />
              {!collapsed && "Administrador"}

              {!collapsed &&
                <FaChevronDown
                  className={`arrow ${adminOpen ? "open" : ""}`}
                />
              }

            </div>

            {adminOpen && !collapsed && (

              <ul className="submenu">

                <li>

                  <NavLink
                    to="/admin/usuarios"
                    className="menu-link"
                  >

                    <FaUsers className="icon" />
                    {!collapsed && "Usuarios"}

                  </NavLink>

                </li>

              </ul>

            )}

          </li>

        )}

      </ul>

    </div>

  );

}

export default Sidebar;