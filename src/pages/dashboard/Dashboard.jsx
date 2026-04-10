import { useEffect, useState } from "react";
import api from "../../services/api";

function Dashboard() {

  const [data, setData] = useState(null);
  const [docsPorVencer,setDocsPorVencer] = useState([]);
  const [alertas,setAlertas] = useState(null);

  const obtenerDashboard = async () => {
    try {
      const res = await api.get("/altas/clientes/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    }
  };

  const cargarAlertas = async () => {
    try {
      const res = await api.get("/reportes/documentos-por-vencer");
      setDocsPorVencer(res.data || []);
    } catch (error) {
      console.error("Error cargando alertas documentos", error);
    }
  };

  const cargarResumenAlertas = async () => {
    try{
      const res = await api.get("/reportes/alertas-documentos");
      setAlertas(res.data);
    }
    catch(err){
      console.error("Error cargando resumen alertas",err);
    }
  }

  useEffect(() => {
    obtenerDashboard();
    cargarAlertas();
    cargarResumenAlertas();
  }, []);

  if (!data) return <p>Cargando dashboard...</p>;

  return (
    <div>

      <h2 className="fw-bold mb-4">Dashboard</h2>

      {/* ALERTA DOCUMENTOS */}
      {docsPorVencer.length > 0 && (
        <div className="alert alert-warning mb-4">
          ⚠ {docsPorVencer.length} documentos vencerán en los próximos 30 días
        </div>
      )}

      {/* SEMAFORO DOCUMENTOS */}
      {alertas && (
        <div className="row mb-4">

          <div className="col-md-4">
            <div className="card border-danger shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-danger">Documentos vencidos</h6>
                <h2 className="fw-bold text-danger">{alertas.vencidos}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-warning shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-warning">Por vencer (30 días)</h6>
                <h2 className="fw-bold text-warning">{alertas.porVencer}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-success shadow-sm">
              <div className="card-body text-center">
                <h6 className="text-success">Documentos vigentes</h6>
                <h2 className="fw-bold text-success">{alertas.vigentes}</h2>
              </div>
            </div>
          </div>

        </div>
      )}

      <div className="row">

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Total Clientes</h6>
              <h2 className="fw-bold">{data.totalClientes}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Clientes Activos</h6>
              <h2 className="fw-bold text-success">{data.activos}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Borradores</h6>
              <h2 className="fw-bold text-warning">{data.borradores}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Clientes USA</h6>
              <h2 className="fw-bold text-primary">{data.usa}</h2>
            </div>
          </div>
        </div>

      </div>

      <div className="row">

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Corresponsalía</h6>
              <h2 className="fw-bold text-info">{data.corresponsalia}</h2>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;