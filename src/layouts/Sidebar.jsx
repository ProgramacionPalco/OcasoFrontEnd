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
   FaShieldAlt,
   FaUserSlash,
   FaKey,
   FaShoppingCart,
   FaClipboardList,
   FaClipboardCheck
} from "react-icons/fa";

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen}){

  //const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogosOpen, setCatalogosOpen] = useState(false);
  const [reportesOpen, setReportesOpen] = useState(false);
  const [altasOpen, setAltasOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [calidadOpen, setCalidadOpen] = useState(false);
  const [comprasOpen, setComprasOpen] = useState(false);

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

//  useEffect(() => {
//
//    const resize = () => {
//
//        if(window.innerWidth < 768){
//
//            setCollapsed(true);
//
//        }
//
//    };
//
//    resize();
//
//    window.addEventListener(
//        "resize",
//        resize
//    );
//
//    return () =>
//        window.removeEventListener(
//            "resize",
//            resize
//        );
//
//}, []);

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
    
    <>
    
        {mobileOpen && window.innerWidth < 768 && (

            <div
                className="sidebar-overlay"
                onClick={() =>
                    setMobileOpen(false)
                }
            />

        )}

        <div
            className={`
                sidebar
                ${collapsed ? "collapsed" : ""}
                ${mobileOpen ? "mobile-open" : ""}
            `}
        >

            <div className="sidebar-header">

                {!collapsed &&
                    <h4 className="logo">
                        OCASO
                    </h4>
                }

              <FaBars
                  className="toggle-btn"
                  onClick={() => {

                      if(window.innerWidth < 768){

                          setMobileOpen(false);

                      }
                      else{

                          setCollapsed(
                              !collapsed
                          );

                      }

                  }}
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

              <div className="menu-title-left">

                <FaShieldAlt className="icon" />

                {!collapsed && <span>Calidad</span>}

              </div>

              {!collapsed && (
                <FaChevronDown
                  className={`arrow ${calidadOpen ? "open" : ""}`}
                />
              )}

            </div>

            {!collapsed && calidadOpen && (

              <ul className="submenu">

                <li>

                  <NavLink
                    to="/calidad/iso"
                    className="menu-link"
                  >

                    <FaKey className="icon" />
                    {!collapsed && "ISO"}

                  </NavLink>

                </li>

                <li>

                  <NavLink
                    to="/calidad/oea"
                    className="menu-link"
                  >

                    <FaKey className="icon" />
                    {!collapsed && "OEA"}

                  </NavLink>

                </li>

              </ul>

            )}

          </li>

        )}

        {tienePermiso("/clientes") && (
          <li>
            <NavLink to="/clientes" end className="menu-link">
              <FaUsers className="icon" />
              {!collapsed && "Clientes"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/clientes/inactivos") && (
          <li>
            <NavLink to="/clientes/inactivos" className="menu-link">
              <FaUserSlash className="icon" />
              {!collapsed && "Clientes Inactivos"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/reportes/clientes-documentos") && (

          <li className="menu-group">

            <div
              className="menu-title"
              onClick={() => !collapsed && setReportesOpen(!reportesOpen)}
            >

              <div className="menu-title-left">

                <FaFileAlt className="icon" />

                {!collapsed && <span>Reportes</span>}

              </div>

              {!collapsed && (
                <FaChevronDown
                  className={`arrow ${reportesOpen ? "open" : ""}`}
                />
              )}

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
                    <li>

                      <NavLink
                        to="/reportes/movimientos"
                        className="menu-link"
                      >
                        Movimientos de Clientes
                      </NavLink>

                    </li>

                  </ul>

                )}

              </ul>

            )}

          </li>

        )}

                {/**Sección de compras**/}
        {(tienePermiso("/compras/dashboard") || tienePermiso("/compras/nueva") || tienePermiso("/compras/mis-requisiciones")
        )
        && (

        <li className="menu-group">

            <div
                className="menu-title"
                onClick={() =>
                    setComprasOpen(!comprasOpen)
                }
            >

                <div className="menu-title-left">

                    <FaShoppingCart className="icon" />

                    {!collapsed &&
                        <span>Compras</span>
                    }

                </div>

                {!collapsed && (

                    <FaChevronDown
                        className={`arrow ${
                            comprasOpen
                            ? "open"
                            : ""
                        }`}
                    />

                )}

            </div>

            {comprasOpen && !collapsed && (

                <ul className="submenu">

                    {tienePermiso(
                        "/compras/dashboard"
                    ) && (

                        <li>

                            <NavLink
                                to="/compras/dashboard"
                                className="menu-link"
                            >

                                <FaTachometerAlt
                                    className="icon"
                                />

                                {!collapsed &&
                                    "Dashboard"
                                }

                            </NavLink>

                        </li>

                    )}
                    
                    {tienePermiso(
                        "/compras/aprobaciones"
                    ) && (

                        <li>

                            <NavLink
                                to="/compras/aprobaciones"
                                className="menu-link"
                            >

                                <FaClipboardCheck
                                    className="icon"
                                />

                                {!collapsed &&
                                    "Aprobaciones"
                                }

                            </NavLink>

                        </li>

                    )}

                    {tienePermiso(
                        "/compras/pendientes"
                    ) && (

                        <li>

                            <NavLink
                                to="/compras/pendientes"
                                className="menu-link"
                            >

                                <FaClipboardList
                                    className="icon"
                                />

                                {!collapsed &&
                                    "Requisiciones pendientes"
                                }

                            </NavLink>

                        </li>

                    )}

                    {tienePermiso(
                        "/compras/nueva"
                    ) && (

                        <li>

                            <NavLink
                                to="/compras/nueva"
                                className="menu-link"
                            >

                                <FaFileAlt
                                    className="icon"
                                />

                                {!collapsed &&
                                    "Nueva requisición"
                                }

                            </NavLink>

                        </li>

                    )}

                    {tienePermiso(
                        "/compras/mis-requisiciones"
                    ) && (

                        <li>

                            <NavLink
                                to="/compras/mis-requisiciones"
                                className="menu-link"
                            >

                                <FaUsers
                                    className="icon"
                                />

                                {!collapsed &&
                                    "Mis requisiciones"
                                }

                            </NavLink>

                        </li>

                    )}

                </ul>

            )}

        </li>

        )}  


        {/**Fin de sección de compras**/}  

        {(tienePermiso("/catalogos/documentos") ||
          tienePermiso("/catalogos/empresas") ||
          tienePermiso("/catalogos/ejecutivos")) && (

            <li className="menu-group">

              <div
                className="menu-title"
                onClick={() => setCatalogosOpen(!catalogosOpen)}
              >

                <div className="menu-title-left">

                  <FaCogs className="icon" />

                  {!collapsed && <span>Catálogos</span>}

                </div>

                {!collapsed && (
                  <FaChevronDown
                    className={`arrow ${catalogosOpen ? "open" : ""}`}
                  />
                )}

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

              <div className="menu-title-left">

                <FaUserCog className="icon" />

                {!collapsed && <span>Administrador</span>}

              </div>

              {!collapsed && (
                <FaChevronDown
                  className={`arrow ${adminOpen ? "open" : ""}`}
                />
              )}

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

    </>

  );

}

export default Sidebar;