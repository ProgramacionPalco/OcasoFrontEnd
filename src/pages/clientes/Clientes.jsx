import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import { DataGrid } from "@mui/x-data-grid";
import { useMediaQuery } from "@mui/material";
import {
  FaUsers,
  FaUserCheck,
  FaUserEdit,
  FaUserSlash,
  FaPlus,
  FaSearch,
  FaEye,
  FaChevronRight
} from "react-icons/fa";

const TARJETAS_POR_PAGINA = 20;

// Estatus del cliente (misma regla que el filtro)
const estatusDe = (c) => {
  if (c.servicioNegado) return { texto: "Servicio negado", clase: "estatus-negado" };
  if (c.estadoClienteId === 3) return { texto: "Activo", clase: "estatus-activo" };
  return { texto: "Borrador", clase: "estatus-borrador" };
};

function PastillaEstatus({ cliente }) {
  const e = estatusDe(cliente);
  return (
    <span
      className={`estatus-pastilla ${e.clase}`}
      title={cliente.servicioNegado ? cliente.motivoServicioNegado : undefined}
    >
      <span className="estatus-punto" />
      {e.texto}
    </span>
  );
}

function Clientes() {

  const esMovil = useMediaQuery("(max-width:768px)");
  const [visibles, setVisibles] = useState(TARJETAS_POR_PAGINA);

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

      estatusFiltro==="" ||

      (
      estatusFiltro==="activo" &&
      c.estadoClienteId===3 &&
      !c.servicioNegado
      )

      ||

      (
      estatusFiltro==="borrador" &&
      c.estadoClienteId!==3 &&
      !c.servicioNegado
      )

      ||

      (
      estatusFiltro==="negado" &&
      c.servicioNegado
      );

    return coincideBusqueda && coincideEstatus;

  });

  const conteo = {
    "": clientes.length,
    activo: clientes.filter(x => x.estadoClienteId === 3 && !x.servicioNegado).length,
    borrador: clientes.filter(x => x.estadoClienteId !== 3 && !x.servicioNegado).length,
    negado: clientes.filter(x => x.servicioNegado).length,
  };

  const FILTROS = [
    { valor: "", texto: "Todos", icono: <FaUsers />, tono: "primary" },
    { valor: "activo", texto: "Activos", icono: <FaUserCheck />, tono: "success" },
    { valor: "borrador", texto: "Borradores", icono: <FaUserEdit />, tono: "warning" },
    { valor: "negado", texto: "Servicio negado", icono: <FaUserSlash />, tono: "danger" },
  ];

  const columns = [

    {
      field: "id",
      headerName: "ID",
      width: 90,
      renderCell: (params) => (
        <span className="cliente-id">#{params.value}</span>
      ),
    },

    {
      field: "razonSocial",
      headerName: "Razón Social",
      flex: 2,
      minWidth: 320,
      renderCell: (params) => (
        <div className="cliente-nombre">
          <span className="cliente-avatar">
            {(params.value || "?").trim().charAt(0).toUpperCase()}
          </span>
          <span className="text-truncate" title={params.value}>{params.value}</span>
        </div>
      ),
    },

    {
      field: "rfc",
      headerName: "RFC",
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        params.value ? <span className="cliente-rfc">{params.value}</span> : "—"
      ),
    },

    {
      field: "motivoServicioNegado",
      headerName: "Motivo",
      flex: 2,
      minWidth: 230,
      renderCell: (params) => {
        if (!params.row.servicioNegado) {
          return <span className="text-muted">—</span>;
        }
        return (
          <span className="cliente-motivo" title={params.value}>
            {params.value}
          </span>
        );
      },
    },

    {
      field: "estatus",
      headerName: "Estatus",
      width: 170,
      renderCell: (params) => <PastillaEstatus cliente={params.row} />,
    },

    {
      field: "acciones",
      headerName: "",
      width: 110,
      sortable: false,
      filterable: false,
      align: "right",
      renderCell: (params) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary dash-btn-tabla"
          onClick={() => navigate(`/clientes/${params.row.id}`)}
        >
          <FaEye /> Ver
        </button>
      ),
    },

  ];

  // Estilo del DataGrid alineado al tema (claro y oscuro)
  const estiloGrid = {
    border: 0,
    backgroundColor: "transparent",
    fontSize: 14,
    "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": {
      backgroundColor: "var(--bs-tertiary-bg)",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 600,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: ".03em",
      color: "var(--bs-secondary-color)",
    },
    "& .MuiDataGrid-cell": {
      borderColor: "var(--bs-border-color-translucent)",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus": {
      outline: "none",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "var(--bs-tertiary-bg)",
    },
    "& .MuiDataGrid-footerContainer": {
      borderColor: "var(--bs-border-color-translucent)",
    },
  };

  return (

    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">

        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Altas</span>
          <h2 className="dash-titulo">Clientes</h2>
          <div className="dash-contexto">
            <span><FaUsers /> {conteo[""].toLocaleString("es-MX")} clientes registrados</span>
          </div>
        </div>

        {permisoModulo("/clientes")?.puedeCrear && (
          <button
            type="button"
            className="btn btn-light dash-btn-hero"
            onClick={() => navigate("/clientes/nuevo")}
          >
            <FaPlus />
            Nuevo cliente
          </button>
        )}

      </div>

      {/* ========================= */}
      {/* FILTRO POR ESTATUS (KPIs) */}
      {/* ========================= */}

      <div className="row g-3 mb-4">
        {FILTROS.map((f) => (
          <div className="col-6 col-xl-3" key={f.valor || "todos"}>
            <button
              type="button"
              className={`filtro-kpi ${estatusFiltro === f.valor ? "activo" : ""}`}
              onClick={() => setEstatusFiltro(f.valor)}
              aria-pressed={estatusFiltro === f.valor}
            >
              <span className={`dash-kpi-icono dash-tono-${f.tono}`}>{f.icono}</span>
              <span className="filtro-kpi-texto">
                <span className="filtro-kpi-label">{f.texto}</span>
                <span className="filtro-kpi-valor">
                  {conteo[f.valor].toLocaleString("es-MX")}
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* LISTADO */}
      {/* ========================= */}

      <div className="dash-panel p-0 overflow-hidden">

        {/* Barra de búsqueda */}
        <div className="listado-toolbar">

          <div className="explorador-buscar listado-buscar">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar por razón social o RFC..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar cliente o RFC"
            />
          </div>

          <span className="listado-contador">
            Mostrando <strong>{clientesFiltrados.length.toLocaleString("es-MX")}</strong> de{" "}
            <strong>{clientes.length.toLocaleString("es-MX")}</strong>
          </span>

        </div>

        {esMovil ? (

          <div className="p-3">

            {loading && (
              <div className="dash-vacio">
                <div className="spinner-border text-primary" role="status" />
                <span>Cargando clientes…</span>
              </div>
            )}

            {!loading && clientesFiltrados.length === 0 && (
              <div className="dash-vacio">
                <FaUsers />
                <span>No hay clientes para mostrar.</span>
              </div>
            )}

            {clientesFiltrados.slice(0, visibles).map((c) => (

              <div
                key={c.id}
                className="cliente-tarjeta"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/clientes/${c.id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/clientes/${c.id}`)}
              >

                <div className="d-flex align-items-start gap-3">

                  <span className="cliente-avatar">
                    {(c.razonSocial || "?").trim().charAt(0).toUpperCase()}
                  </span>

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-break">{c.razonSocial}</div>
                    <div className="small text-muted text-break">
                      {c.rfc || "Sin RFC"} · #{c.id}
                    </div>
                    <div className="mt-2">
                      <PastillaEstatus cliente={c} />
                    </div>
                  </div>

                  <FaChevronRight className="cliente-tarjeta-flecha" />

                </div>

                {c.servicioNegado && c.motivoServicioNegado && (
                  <div className="cliente-tarjeta-motivo text-break">
                    <strong>Motivo: </strong>
                    {c.motivoServicioNegado}
                  </div>
                )}

              </div>

            ))}

            {clientesFiltrados.length > visibles && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-outline-primary dash-btn"
                  onClick={() => setVisibles(v => v + TARJETAS_POR_PAGINA)}
                >
                  Ver más ({clientesFiltrados.length - visibles} restantes)
                </button>
              </div>
            )}

          </div>

        ) : (

        <div
          className="table-responsive-custom"
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >

          <div
            style={{
              height: 650,
              minWidth: 1100,
            }}
          >

            <DataGrid
              rows={clientesFiltrados}
              columns={columns}
              loading={loading}
              rowHeight={58}
              pageSizeOptions={[10, 25, 30, 50]}
              disableRowSelectionOnClick
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 30 },
                },
              }}
              checkboxSelection
              localeText={{ noRowsLabel: "No hay clientes para mostrar" }}
              sx={estiloGrid}
            />

          </div>

        </div>

        )}

      </div>

    </div>

  );

}

export default Clientes;
