import { useEffect, useState } from "react";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { Button, TextField, MenuItem } from "@mui/material";
import GraficaProspectos from "./components/GraficaProspectos";
import GraficaClientes from "./components/GraficaClientes";

function DashboardVentas() {
  /* formularios */
  const [filtro, setFiltro] = useState({
    Mes: "",
    Año: "",
  });
  const [clientes, setClientes] = useState([]);
  const [prospectos, setProspectos] = useState([]);

  /* variables */
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const [año, setAño] = useState(new Date().getFullYear());

  const años = Array.from(
    { length: new Date().getFullYear() - 2025 + 1 },
    (_, i) => 2025 + i,
  );

  const ObtenerVentasPorMes = async () => {
    try {
      const res = await api.get("/dashboardVentas/ObtenerVentasPorMes");
      setEjecutivos(res.data);
    } catch (error) {
      console.error("Error cargando ejecutivos ventas", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <h2 className="fw-bold m-0 mb-3">Dashboard</h2>

        <div className="col-md-4 my-3">
          <TextField
            select
            fullWidth
            label="Seleccione mes"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          >
            <MenuItem value="">Seleccione mes</MenuItem>
            <MenuItem value={1}>Enero</MenuItem>
            <MenuItem value={2}>Febrero</MenuItem>
            <MenuItem value={3}>Marzo</MenuItem>
            <MenuItem value={4}>Abril</MenuItem>
            <MenuItem value={5}>Mayo</MenuItem>
            <MenuItem value={6}>Junio</MenuItem>
            <MenuItem value={7}>Julio</MenuItem>
            <MenuItem value={8}>Agosto</MenuItem>
            <MenuItem value={9}>Septiembre</MenuItem>
            <MenuItem value={10}>Octubre</MenuItem>
            <MenuItem value={11}>Noviembre</MenuItem>
            <MenuItem value={12}>Diciembre</MenuItem>
          </TextField>
        </div>

        <div className="col-md-4 my-3">
          <TextField
            select
            fullWidth
            label="Seleccione año"
            value={año}
            onChange={(e) => setAnio(Number(e.target.value))}
          >
            {años.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="col-md-4 mt-3">
          <Button
            fullWidth
            variant="contained"
            className="btn btn-primary mt-2"
          >
            Filtrar
          </Button>
        </div>
        {/* cards */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 bg-success bg-opacity-10 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-secondary mb-2">
                    Clientes nuevos registrados
                  </h6>

                  <h2 className="fw-bold text-success mb-1">2</h2>

                  <small className="text-muted">Total de clientes nuevos</small>
                </div>

                <div className="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center">
                  <FaUserPlus size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 bg-primary bg-opacity-10 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-secondary mb-2">
                    Prospectos registrados
                  </h6>

                  <h2 className="fw-bold text-primary mb-1">6</h2>

                  <small className="text-muted">Total de prospectos</small>
                </div>

                <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center">
                  <FaUsers size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* graficas */}
        <div className="col-md-6 my-2">
          <GraficaClientes />
        </div>

        <div className="col-md-6 my-2">
          <GraficaProspectos />
        </div>
      </div>
    </div>
  );
}

export default DashboardVentas;
