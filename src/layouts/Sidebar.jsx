import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import logoOcaso from "../assets/Ocaso 2.0.png";

import {
  FaTachometerAlt,
  FaUsers,
  FaUserPlus,
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
   FaChartLine,
   FaFileInvoiceDollar,
   FaClipboardCheck 
} from "react-icons/fa";

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen}){

  //const [mobileOpen, setMobileOpen] = useState(false);

  // Grupo activo según la ruta actual (para resaltarlo y abrirlo al cargar)
  const { pathname } = useLocation();
  const enRuta = (...prefijos) =>
    prefijos.some(p => pathname.toLowerCase().startsWith(p.toLowerCase()));

  const grupoActivo = {
    calidad: enRuta("/calidad"),
    ventas: enRuta("/ventas", "/prospectos", "/cotizador"),
    reportes: enRuta("/reportes"),
    compras: enRuta("/compras"),
    catalogos: enRuta("/catalogos"),
    admin: enRuta("/admin"),
  };

  const [catalogosOpen, setCatalogosOpen] = useState(grupoActivo.catalogos);
  const [reportesOpen, setReportesOpen] = useState(grupoActivo.reportes);
  const [altasOpen, setAltasOpen] = useState(grupoActivo.reportes);
  const [adminOpen, setAdminOpen] = useState(grupoActivo.admin);
  const [calidadOpen, setCalidadOpen] = useState(grupoActivo.calidad);
  const [comprasOpen, setComprasOpen] = useState(grupoActivo.compras);
  const [ventasOpen, setVentasOpen] = useState(grupoActivo.ventas);

  // Con el menú colapsado, al tocar un grupo se expande el menú y se abre ese grupo
  const alternarGrupo = (abierto, setAbierto) => {
    if (collapsed) {
      setCollapsed(false);
      setAbierto(true);
    } else {
      setAbierto(!abierto);
    }
  };

  const claseGrupo = (activo) => `menu-title ${activo ? "group-active" : ""}`;

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

                <NavLink to="/dashboard" className="sidebar-brand" title="Ocaso ERP">
                    {collapsed ? (
                        <img src="/IconoOcaso2.ico" alt="Ocaso" className="sidebar-brand-icono" />
                    ) : (
                        <img src={logoOcaso} alt="Ocaso" className="sidebar-brand-logo" />
                    )}
                </NavLink>

              <button
                  type="button"
                  className="toggle-btn"
                  title={collapsed ? "Expandir menú" : "Contraer menú"}
                  aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
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
              >
                  <FaBars />
              </button>

            </div>

      <ul className="menu">

        {(tienePermiso("/dashboard") || tienePermiso("/calidad")) && !collapsed && (
          <li className="menu-section">Principal</li>
        )}

        {tienePermiso("/dashboard") && (
          <li>
            <NavLink to="/dashboard" className="menu-link" title="Dashboard">
              <FaTachometerAlt className="icon" />
              {!collapsed && "Dashboard"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/calidad") && (

          <li className="menu-group">

            <div
              className={claseGrupo(grupoActivo.calidad)}
              title="Calidad"
              onClick={() => alternarGrupo(calidadOpen, setCalidadOpen)}
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
                    to="/calidad"
                    end
                    className="menu-link"
                  >

                    <FaTachometerAlt className="icon" />
                    {!collapsed && "Inicio"}

                  </NavLink>

                </li>

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

        {(tienePermiso("/clientes") || tienePermiso("/ventas") ||
          tienePermiso("/clientes/inactivos") || tienePermiso("/reportes/clientes-documentos")) && !collapsed && (
          <li className="menu-section">Comercial</li>
        )}

        {tienePermiso("/clientes") && (
          <li>
            <NavLink to="/clientes" end className="menu-link" title="Clientes">
              <FaUsers className="icon" />
              {!collapsed && "Clientes"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/ventas") && (

          <li className="menu-group">

            <div
              className={claseGrupo(grupoActivo.ventas)}
              title="Ventas"
              onClick={() => alternarGrupo(ventasOpen, setVentasOpen)}
            >

              <div className="menu-title-left">

                <FaChartLine className="icon" />

                {!collapsed && <span>Ventas</span>}

              </div>

              {!collapsed && (
                <FaChevronDown
                  className={`arrow ${ventasOpen ? "open" : ""}`}
                />
              )}

            </div>

            {!collapsed && ventasOpen && (

              <ul className="submenu">
                      {tienePermiso("/ventas/DashboardVentas") && (
                        <li>
                          <NavLink to="/ventas/DashboardVentas" end className="menu-link">
                            <FaTachometerAlt className="icon" />
                            {!collapsed && "Dashboard"}
                          </NavLink>
                        </li>
                      )}

                     {tienePermiso("/prospectos") && (
                        <li>
                          <NavLink to="/prospectos" end className="menu-link">
                            <FaUserPlus className="icon" />
                            {!collapsed && "Prospectos"}
                          </NavLink>
                        </li>
                      )}
                      
                       {tienePermiso("/ventas/cotizador") && (
                        <li>
                          <NavLink to="/cotizador" end className="menu-link">
                            <FaFileInvoiceDollar className="icon" />
                            {!collapsed && "Cotizador"}
                          </NavLink>
                        </li>
                      )}

              </ul>

            )}

          </li>

        )}

      

        
        {tienePermiso("/clientes/inactivos") && (
          <li>
            <NavLink to="/clientes/inactivos" className="menu-link" title="Clientes Inactivos">
              <FaUserSlash className="icon" />
              {!collapsed && "Clientes Inactivos"}
            </NavLink>
          </li>
        )}

        {tienePermiso("/reportes/clientes-documentos") && (

          <li className="menu-group">

            <div
              className={claseGrupo(grupoActivo.reportes)}
              title="Reportes"
              onClick={() => alternarGrupo(reportesOpen, setReportesOpen)}
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
                  <FaChevronDown className={`arrow ${altasOpen ? "open" : ""}`} />
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
        ) && !collapsed && (
          <li className="menu-section">Operación</li>
        )}

        {(tienePermiso("/compras/dashboard") || tienePermiso("/compras/nueva") || tienePermiso("/compras/mis-requisiciones")
        )
        && (

        <li className="menu-group">

            <div
                className={claseGrupo(grupoActivo.compras)}
                title="Compras"
                onClick={() =>
                    alternarGrupo(comprasOpen, setComprasOpen)
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
          tienePermiso("/catalogos/ejecutivos") ||
          tienePermiso("/admin/usuarios")) && !collapsed && (
          <li className="menu-section">Configuración</li>
        )}

        {(tienePermiso("/catalogos/documentos") ||
          tienePermiso("/catalogos/empresas") ||
          tienePermiso("/catalogos/ejecutivos")) && (

            <li className="menu-group">

              <div
                className={claseGrupo(grupoActivo.catalogos)}
                title="Catálogos"
                onClick={() => alternarGrupo(catalogosOpen, setCatalogosOpen)}
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
                        {!collapsed && "Ejecutivos de Altas"}

                      </NavLink>

                    </li>

                  )}

                  {/* se agrego catalogo de ventas para prospectos */}
                  {tienePermiso("/catalogos/ejecutivosVentasProspectos") && (

                    <li>

                      <NavLink to="/catalogos/ventasProspectos" className="menu-link">

                        <FaUserTag className="icon" />
                        {!collapsed && "Ejecutivos de Ventas"}

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
              className={claseGrupo(grupoActivo.admin)}
              title="Administrador"
              onClick={() => alternarGrupo(adminOpen, setAdminOpen)}
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

      {!collapsed && (
        <div className="sidebar-footer">
          <span className="sidebar-footer-punto" />
          Ocaso ERP · {new Date().getFullYear()}
        </div>
      )}

    </div>

    </>


  );

}

export default Sidebar;