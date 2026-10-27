import { useEffect, useState } from "react";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { Button, TextField, MenuItem } from "@mui/material";
import GraficaProspectos from "./components/GraficaProspectos";
import GraficaClientes from "./components/GraficaClientes";
import api from "../../services/api";
import { DataGrid } from "@mui/x-data-grid";

function DashboardVentas() {
  /* formularios */
  const [filtro, setFiltro] = useState({
    Mes: "",
    Año: "",
  });
  const [clientes, setClientes] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [clientesAnuales, setClientesAnuales] = useState([]);

  /* variables */
  const [modalClientes, setModalClientes] = useState(false);
  const [modalProspectos, setModalProspectos] = useState(false);

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());

  const años = Array.from(
    { length: new Date().getFullYear() - 2025 + 1 },
    (_, i) => 2025 + i,
  );

  const ObtenerVentasPorMes = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerVentasPorMes",
        payload,
      );
      setClientes(res.data);
    } catch (error) {
      console.error("Error cargando ventas", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

  const ObtenerProspectosPorMes = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerProspectosPorMes",
        payload,
      );
      setProspectos(res.data);
    } catch (error) {
      console.error("Error cargando prospectos", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

  const ObtenerClientesAnuales = async () => {
    try {
      const payload = {
        mes: mes,
        anio: año,
      };

      const res = await api.post(
        "/dashboardVentas/ObtenerClientesAnuales",
        payload,
      );
      setClientesAnuales(res.data);
    } catch (error) {
      console.error("Error cargando ventas", error);
      console.error("Mensaje:", error.message);
      console.error("Respuesta API:", error.response?.data);
    }
  };

  useEffect(() => {
    ObtenerVentasPorMes();
    ObtenerProspectosPorMes();
    ObtenerClientesAnuales();
  }, []);

  const columnsClientes = [
    { field: "id", headerName: "id", width: 60, minWidth: 50 },
    {
      field: "fecha",
      headerName: "Fecha registro",
      width: 140,
      minWidth: 120,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
    },
    {
      field: "razonSocial",
      headerName: "Razon Social",
      flex: 1,
      minWidth: 200,
    },
    { field: "rfc", headerName: "Rfc", width: 140, minWidth: 120 },
  ];

   const columnsProspectos = [
    { field: "id", headerName: "id", width: 60, minWidth: 50 },
    {
      field: "fechaRegistro",
      headerName: "Fecha registro",
      width: 140,
      minWidth: 120,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200,
    },
    { field: "ejecutivo", headerName: "Ejecutivo", width: 160, minWidth: 150 },
    { field: "estatus", headerName: "Estatus", width: 160, minWidth: 150 },
  ];

  return (
    <>
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
              onClick={async () => {
                await ObtenerVentasPorMes();
                await ObtenerProspectosPorMes();
              }}
            >
              Filtrar
            </Button>
          </div>
          {/* cards */}
          <div
            className="col-md-6"
            onClick={async () => {
              setModalClientes(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="card shadow-sm border-0 bg-success bg-opacity-10 rounded-3">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-secondary mb-2">
                      Clientes nuevos registrados
                    </h6>

                    <h2 className="fw-bold text-success mb-1">
                      {clientes.length}
                    </h2>

                    <small className="text-muted">
                      Total de clientes nuevos
                    </small>
                  </div>

                  <div className="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center">
                    <FaUserPlus size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="col-md-6"
            onClick={async () => {
              setModalProspectos(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="card shadow-sm border-0 bg-primary bg-opacity-10 rounded-3">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-secondary mb-2">
                      Prospectos registrados
                    </h6>

                    <h2 className="fw-bold text-primary mb-1">
                      {prospectos.length}
                    </h2>

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
            <GraficaClientes clientesAnuales={clientesAnuales} />
          </div>

          <div className="col-md-6 my-2">
            <GraficaProspectos />
          </div>
        </div>
      </div>

      {/* MODAL CLIENTES */}
      {modalClientes && (
        <div className="modal-overlay">
          <div className="modal-box-prospectos modal-prospectos">
            <div className="modal-header">
              <h2>Nuevos clientes registrados</h2>
            </div>

            <div className="form-grid-prospectos">
              <DataGrid
                rows={clientes}
                columns={columnsClientes}
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#1f2937",
                    color: "#fff",
                    fontWeight: "bold",
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                    color: "#fff",
                  },

                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "#1f2937",
                    color: "#fff",
                  },

                  "& .MuiDataGrid-cell": {
                    borderColor: "#f1f5f9",
                  },

                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
            </div>

            <div className="my-3">
              <div className="row justify-content-end">
                <div className="col-md-2 col-6">
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      setModalClientes(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROSPECTOS */}
      {modalProspectos && (
       <div className="modal-overlay">
          <div className="modal-box-prospectos modal-prospectos">
            <div className="modal-header">
              <h2>Nuevos prospectos registrados</h2>
            </div>

            <div className="form-grid-prospectos">
              <DataGrid
                rows={prospectos}
                columns={columnsProspectos}
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#1f2937",
                    color: "#fff",
                    fontWeight: "bold",
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                    color: "#fff",
                  },

                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "#1f2937",
                    color: "#fff",
                  },

                  "& .MuiDataGrid-cell": {
                    borderColor: "#f1f5f9",
                  },

                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
            </div>

            <div className="my-3">
              <div className="row justify-content-end">
                <div className="col-md-2 col-6">
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      setModalProspectos(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardVentas;
