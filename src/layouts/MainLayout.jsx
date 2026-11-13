import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "../components/Header";
import { Outlet, useLocation } from "react-router-dom";
import useTablasResponsivas from "../hooks/useTablasResponsivas";

function MainLayout() {

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Etiqueta las celdas de las tablas para mostrarlas como tarjetas en celular
    const contenidoRef = useRef(null);
    useTablasResponsivas(contenidoRef);

    const { pathname } = useLocation();

    // En celular, cerrar el menú lateral al navegar a otra vista
    const [rutaAnterior, setRutaAnterior] = useState(pathname);
    if (rutaAnterior !== pathname) {
        setRutaAnterior(pathname);
        setMobileOpen(false);
    }

    return (

        <div className="app-layout">

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="main-area">

                <Header
                    setMobileOpen={setMobileOpen}
                    setCollapsed={setCollapsed}
                />

                <div className="main-content" ref={contenidoRef}>
                    <Outlet />
                </div>

            </div>

        </div>

    );

}

export default MainLayout;