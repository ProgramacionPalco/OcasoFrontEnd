// Estilos para react-data-table-component acordes al tema (claro / oscuro).
// Uso: <DataTable customStyles={estilosTabla} ... />
const estilosTabla = {
    table: {
        style: { backgroundColor: "transparent" }
    },
    headRow: {
        style: {
            minHeight: "46px",
            backgroundColor: "var(--bs-tertiary-bg)",
            borderBottomColor: "var(--bs-border-color)"
        }
    },
    headCells: {
        style: {
            fontSize: "11.5px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".04em",
            color: "var(--bs-secondary-color)"
        }
    },
    rows: {
        style: {
            minHeight: "58px",
            fontSize: "14px",
            color: "var(--bs-body-color)",
            backgroundColor: "var(--bs-body-bg)",
            borderBottomColor: "var(--bs-border-color-translucent) !important"
        },
        highlightOnHoverStyle: {
            color: "var(--bs-body-color)",
            backgroundColor: "var(--bs-tertiary-bg)",
            outline: "none"
        }
    },
    pagination: {
        style: {
            color: "var(--bs-secondary-color)",
            backgroundColor: "var(--bs-tertiary-bg)",
            borderTopColor: "var(--bs-border-color-translucent)"
        }
    },
    noData: {
        style: {
            padding: "32px",
            color: "var(--bs-secondary-color)",
            backgroundColor: "transparent"
        }
    },
    progress: {
        style: { backgroundColor: "transparent" }
    }
};

export const paginacionEs = {
    rowsPerPageText: "Filas por página:",
    rangeSeparatorText: "de"
};

export default estilosTabla;
