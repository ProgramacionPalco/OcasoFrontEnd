import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout() {

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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

                <div className="main-content">
                    <Outlet />
                </div>

            </div>

        </div>

    );

}

export default MainLayout;