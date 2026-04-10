import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCogs,
  FaChevronDown,
  FaFileAlt,
  FaBuilding,
  FaUserTie,
  FaUserTag,
  FaBars
} from "react-icons/fa";

function Sidebar() {

  const [collapsed, setCollapsed] = useState(false);
  const [catalogosOpen, setCatalogosOpen] = useState(false);
  const [reportesOpen, setReportesOpen] = useState(false);
  const [altasOpen, setAltasOpen] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(null);

  return (

    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}

      <div className="sidebar-header">

        {!collapsed && <h4 className="logo">OCASO</h4>}

        <FaBars
          className="toggle-btn"
          onClick={()=>setCollapsed(!collapsed)}
        />

      </div>

      <ul className="menu">

        {/* DASHBOARD */}

        <li title={collapsed ? "Dashboard" : ""}>
          <NavLink to="/dashboard" className="menu-link">
            <FaTachometerAlt className="icon"/>
            {!collapsed && "Dashboard"}
          </NavLink>
        </li>

        {/* CLIENTES */}

        <li title={collapsed ? "Clientes" : ""}>
          <NavLink to="/clientes" className="menu-link">
            <FaUsers className="icon"/>
            {!collapsed && "Clientes"}
          </NavLink>
        </li>

        {/* REPORTES */}

        <li
          className="menu-group"
          title={collapsed ? "Reportes" : ""}
          onMouseEnter={() => collapsed && setHoverMenu("reportes")}
          onMouseLeave={() => setHoverMenu(null)}
        >

          <div
            className="menu-title"
            onClick={() => !collapsed && setReportesOpen(!reportesOpen)}
          >

            <FaFileAlt className="icon"/>
            {!collapsed && "Reportes"}

            {!collapsed && (
              <FaChevronDown
                className={`arrow ${reportesOpen ? "open" : ""}`}
              />
            )}

          </div>

          {/* NORMAL MENU */}

          {!collapsed && reportesOpen && (

            <ul className="submenu">

              <li
                className="submenu-title"
                onClick={()=>setAltasOpen(!altasOpen)}
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

          {/* FLOAT MENU */}

          {collapsed && hoverMenu === "reportes" && (

            <div className="floating-menu">

              <div className="floating-title">
                Reportes
              </div>

              <div className="floating-sub">

                <div className="floating-sub-title">
                  Altas
                </div>

                <NavLink
                  to="/reportes/clientes-documentos"
                  className="floating-link"
                >

                  Clientes y Documentos

                </NavLink>

              </div>

            </div>

          )}

        </li>

        {/* CATALOGOS */}

        <li className="menu-group" title={collapsed ? "Catálogos" : ""}>

          <div
            className="menu-title"
            onClick={()=>setCatalogosOpen(!catalogosOpen)}
          >

            <FaCogs className="icon"/>
            {!collapsed && "Catálogos"}

            {!collapsed &&
              <FaChevronDown
                className={`arrow ${catalogosOpen ? "open" : ""}`}
              />
            }

          </div>

          {catalogosOpen && !collapsed && (

            <ul className="submenu">

              <li title={collapsed ? "Documentos" : ""}>

                <NavLink to="/catalogos/documentos" className="menu-link">

                  <FaFileAlt className="icon"/>
                  {!collapsed && "Documentos"}

                </NavLink>

              </li>

              <li title={collapsed ? "Empresas" : ""}>

                <NavLink to="/catalogos/empresas" className="menu-link">

                  <FaBuilding className="icon"/>
                  {!collapsed && "Empresas"}

                </NavLink>

              </li>

              <li title={collapsed ? "Ejecutivos" : ""}>

                <NavLink to="/catalogos/ejecutivos" className="menu-link">

                  <FaUserTie className="icon"/>
                  {!collapsed && "Ejecutivos"}

                </NavLink>

              </li>

              <li title={collapsed ? "Ejecutivos de ventas" : ""}>

                <NavLink to="/catalogos/ventas" className="menu-link">

                  <FaUserTag className="icon"/>
                  {!collapsed && "Ejecutivos de ventas"}

                </NavLink>

              </li>

            </ul>

          )}

        </li>

      </ul>

    </div>

  );

}

export default Sidebar;