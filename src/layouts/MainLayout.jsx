import Sidebar from "./Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout(){

  return(

    <div className="app-layout">

      <Sidebar />

      <div className="main-area">

        <Header />

        <div className="main-content">
          <Outlet />
        </div>

      </div>

    </div>

  );

}

export default MainLayout;