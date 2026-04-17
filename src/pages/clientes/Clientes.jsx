import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, MenuItem } from "@mui/material";

function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estatusFiltro, setEstatusFiltro] = useState("");
  const [permisos, setPermisos] = useState([]);

  const navigate = useNavigate();

  const permisoModulo = (ruta) => {
    return permisos.find(p => p.ruta?.toLowerCase() === ruta.toLowerCase());
  };

  const obtenerPermisos = async () => {
    try {
      const res = await api.get("/seguridad/mis-permisos");
      setPermisos(res.data);
    } catch (error) {
      console.error("Error cargando permisos", error);
    }
  };
  const obtenerClientes = async () => {
    try {

      const res = await api.get("/altas/clientes");

      setClientes(res.data);

    } catch (error) {

      console.error("Error cargando clientes", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    obtenerClientes();
    obtenerPermisos();

  }, []);

  const clientesFiltrados = clientes.filter((c) => {

    const coincideBusqueda =
      c.razonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.rfc?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstatus =
      estatusFiltro === "" ||
      (estatusFiltro === "activo" && c.estadoClienteId === 3) ||
      (estatusFiltro === "borrador" && c.estadoClienteId !== 3);

    return coincideBusqueda && coincideEstatus;

  });

  const columns = [

    { field: "id", headerName: "ID", width: 90 },

    { field: "rfc", headerName: "RFC", flex: 1 },

    { field: "razonSocial", headerName: "Razón Social", flex: 2 },

    {
      field: "estatus",
      headerName: "Estatus",
      width: 130,
      renderCell: (params) => {

        return params.row.estadoClienteId === 3 ? (

          <span className="badge bg-success">
            Activo
          </span>

        ) : (

          <span className="badge bg-warning text-dark">
            Borrador
          </span>

        );

      },
    },

    {
      field: "acciones",
      headerName: "Acciones",
      width: 130,
      renderCell: (params) => (

        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/clientes/${params.row.id}`)}
        >
          Ver
        </Button>

      ),
    },

  ];

  return (

    <div>

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">Clientes</h2>


       {permisoModulo("/clientes")?.puedeCrear && (

          <Button
            variant="contained"
            onClick={() => navigate("/clientes/nuevo")}
          >
            + Nuevo Cliente
          </Button>

        )}

      </div>

      {/* FILTROS */}

      <div className="row mb-3">

        <div className="col-md-6">

          <TextField
            fullWidth
            label="Buscar cliente o RFC"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

        </div>

        <div className="col-md-3">

          <TextField
            select
            fullWidth
            label="Estatus"
            value={estatusFiltro}
            onChange={(e) => setEstatusFiltro(e.target.value)}
          >

            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="activo">Activos</MenuItem>
            <MenuItem value="borrador">Borradores</MenuItem>

          </TextField>

        </div>

      </div>

      {/* TABLA ERP */}

      <div style={{ height: 650, width: "100%" }}>

        <DataGrid
          rows={clientesFiltrados}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 30 },
            },
          }}
          checkboxSelection
        />

      </div>

    </div>

  );

}

export default Clientes;