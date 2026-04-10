import { Link } from "react-router-dom";
import { FaFileAlt, FaBuilding, FaUserTie, FaUserTag } from "react-icons/fa";

function Catalogos() {

    return (

        <div className="container-fluid">

            <h2 className="mb-4">Catálogos</h2>

            <div className="row">

                {/* Documentos */}
                <div className="col-md-3">
                    <Link to="/catalogos/documentos" className="text-decoration-none text-dark">
                        <div className="card catalog-card text-center p-4 shadow-sm">
                            <div className="catalog-icon mb-3">
                                <FaFileAlt size={35}/>
                            </div>
                            <h5>Documentos</h5>
                        </div>
                    </Link>
                </div>

                {/* Empresas */}
                <div className="col-md-3">
                    <Link to="/catalogos/empresas" className="text-decoration-none text-dark">
                        <div className="card catalog-card text-center p-4 shadow-sm">
                            <div className="catalog-icon mb-3">
                                <FaBuilding size={35}/>
                            </div>
                            <h5>Empresas</h5>
                        </div>
                    </Link>
                </div>

                {/* Ejecutivos */}
                <div className="col-md-3">
                    <Link to="/catalogos/ejecutivos" className="text-decoration-none text-dark">
                        <div className="card catalog-card text-center p-4 shadow-sm">
                            <div className="catalog-icon mb-3">
                                <FaUserTie size={35}/>
                            </div>
                            <h5>Ejecutivos</h5>
                        </div>
                    </Link>
                </div>

                {/* Ejecutivos de ventas */}
                <div className="col-md-3">
                    <Link to="/catalogos/ventas" className="text-decoration-none text-dark">
                        <div className="card catalog-card text-center p-4 shadow-sm">
                            <div className="catalog-icon mb-3">
                                <FaUserTag size={35}/>
                            </div>
                            <h5>Ejecutivos de Ventas</h5>
                        </div>
                    </Link>
                </div>

            </div>

        </div>

    );

}

export default Catalogos;