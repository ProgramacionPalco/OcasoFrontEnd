import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import estilosTabla, { paginacionEs } from "../../components/estilosTabla";
import {
    FaTruck,
    FaPlus,
    FaSearch,
    FaTimes,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaSave,
    FaStore,
    FaBuilding,
    FaIdCard,
    FaUser,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaHourglassHalf,
    FaBriefcase,
    FaCreditCard,
    FaHashtag,
    FaUserPlus,
    FaClipboardCheck,
    FaCalendarAlt,
    FaHandshake
} from "react-icons/fa";

// =============================
// Constantes y utilerías
// =============================

const ESTATUS_PREREGISTRO = 1;
const ESTATUS_COMPLETO = 2;

const FILTROS = [
    { valor: "todos", texto: "Todos", desc: "Proveedores en el catálogo", icono: <FaTruck />, tono: "primary" },
    { valor: "completos", texto: "Registro completo", desc: "Listos para usarse en compras", icono: <FaCheckCircle />, tono: "success" },
    { valor: "preregistro", texto: "Preregistro", desc: "Pendientes de completar datos", icono: <FaHourglassHalf />, tono: "warning" }
];

const PREREGISTRO_VACIO = {
    nombre: "",
    razonSocial: "",
    RFC: "",
    asesor: "",
    telefono: "",
    email: ""
};

const COMPLETAR_VACIO = {
    giro: "",
    calle: "",
    numero: "",
    colonia: "",
    codigoPostal: "",
    ciudad: "",
    estado: "",
    pais: "México",
    clave: "",
    subcontratado: 0,
    credito: 0,
    diasCredito: ""
};

const CAMPOS_PREREGISTRO = [
    { name: "nombre", label: "Nombre comercial", icon: <FaStore />, placeholder: "Nombre comercial" },
    { name: "razonSocial", label: "Razón social", icon: <FaBuilding />, placeholder: "Razón social completa" },
    { name: "RFC", label: "RFC", icon: <FaIdCard />, placeholder: "XAXX010101000" },
    { name: "asesor", label: "Asesor / contacto", icon: <FaUser />, placeholder: "Nombre del asesor" },
    { name: "telefono", label: "Teléfono", icon: <FaPhoneAlt />, placeholder: "10 dígitos", type: "tel" },
    { name: "email", label: "Correo electrónico", icon: <FaEnvelope />, placeholder: "correo@proveedor.com", type: "email" }
];

// La API serializa en camelCase ("RFC" llega como "rfc"); se aceptan ambas formas
const rfcDe = (p) => p?.rfc ?? p?.RFC ?? "";

const nombreDe = (p) => p?.nombre || p?.razonSocial || "Sin nombre";

const inicial = (texto) => (texto || "?").trim().charAt(0).toUpperCase();

const esPreregistro = (p) => Number(p?.estatusRegistro) === ESTATUS_PREREGISTRO;

const formatoFecha = (valor) =>
    valor
        ? new Date(valor).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "—";

const ubicacionDe = (p) =>
    [p?.ciudad, p?.estado].filter(Boolean).join(", ");

const direccionDe = (p) => {
    const calle = [p?.calle, p?.numero].filter(Boolean).join(" ");
    return [calle, p?.colonia, p?.codigoPostal && `C.P. ${p.codigoPostal}`, p?.ciudad, p?.estado, p?.pais]
        .filter(Boolean)
        .join(", ");
};

const textoONull = (v) => {
    const t = String(v ?? "").trim();
    return t === "" ? null : t;
};

const enteroONull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? null : n;
};

const mensajeError = (error, porDefecto) =>
    error?.response?.data?.mensaje ||
    error?.response?.data?.message ||
    porDefecto;

// =============================
// Componente
// =============================

export default function Proveedores() {

    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todos");

    // Modales
    const [modalNuevo, setModalNuevo] = useState(false);
    const [formNuevo, setFormNuevo] = useState(PREREGISTRO_VACIO);

    const [proveedorCompletar, setProveedorCompletar] = useState(null);
    const [formCompletar, setFormCompletar] = useState(COMPLETAR_VACIO);

    const [proveedorDetalle, setProveedorDetalle] = useState(null);

    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const { data } = await api.get("/compras/proveedores");
            setProveedores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando proveedores:", error);
            Swal.fire({
                icon: "error",
                title: "No fue posible cargar los proveedores",
                text: mensajeError(error, "Intente de nuevo más tarde.")
            });
        } finally {
            setCargando(false);
        }
    };

    // =============================
    // Preregistro
    // =============================

    const abrirNuevo = () => {
        setFormNuevo(PREREGISTRO_VACIO);
        setModalNuevo(true);
    };

    const guardarNuevo = async () => {

        if (!formNuevo.nombre.trim() && !formNuevo.razonSocial.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Faltan datos",
                text: "Capture el nombre comercial o la razón social del proveedor."
            });
            return;
        }

        setGuardando(true);
        try {
            const { data } = await api.post("/compras/proveedores", formNuevo);

            setModalNuevo(false);
            await cargar();

            Swal.fire({
                icon: "success",
                title: "Proveedor preregistrado",
                text: data?.mensaje || "El proveedor se registró correctamente.",
                timer: 2200,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "No se pudo registrar",
                text: mensajeError(error, "No fue posible registrar el proveedor.")
            });
        } finally {
            setGuardando(false);
        }
    };

    // =============================
    // Completar / actualizar datos
    // =============================

    const abrirCompletar = (p) => {
        setFormCompletar({
            giro: p.giro || "",
            calle: p.calle || "",
            numero: p.numero || "",
            colonia: p.colonia || "",
            codigoPostal: p.codigoPostal || "",
            ciudad: p.ciudad || "",
            estado: p.estado || "",
            pais: p.pais || "México",
            clave: p.clave ?? "",
            subcontratado: Number(p.subcontratado) === 1 ? 1 : 0,
            credito: Number(p.credito) === 1 ? 1 : 0,
            diasCredito: p.diasCredito ?? ""
        });
        setProveedorDetalle(null);
        setProveedorCompletar(p);
    };

    const cambiarCompletar = (campo, valor) =>
        setFormCompletar(prev => ({ ...prev, [campo]: valor }));

    const guardarCompletar = async () => {

        if (formCompletar.credito === 1 && enteroONull(formCompletar.diasCredito) === null) {
            Swal.fire({
                icon: "warning",
                title: "Faltan datos",
                text: "Indique los días de crédito que otorga el proveedor."
            });
            return;
        }

        const payload = {
            giro: textoONull(formCompletar.giro),
            calle: textoONull(formCompletar.calle),
            numero: textoONull(formCompletar.numero),
            colonia: textoONull(formCompletar.colonia),
            codigoPostal: textoONull(formCompletar.codigoPostal),
            ciudad: textoONull(formCompletar.ciudad),
            estado: textoONull(formCompletar.estado),
            pais: textoONull(formCompletar.pais),
            clave: enteroONull(formCompletar.clave),
            subcontratado: formCompletar.subcontratado,
            credito: formCompletar.credito,
            diasCredito: formCompletar.credito === 1 ? enteroONull(formCompletar.diasCredito) : 0
        };

        setGuardando(true);
        try {
            const { data } = await api.put(
                `/compras/proveedores/${proveedorCompletar.id}/completar`,
                payload
            );

            setProveedorCompletar(null);
            await cargar();

            Swal.fire({
                icon: "success",
                title: "Proveedor actualizado",
                text: data?.mensaje || "Los datos del proveedor se guardaron correctamente.",
                timer: 2200,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensajeError(error, "No fue posible actualizar el proveedor.")
            });
        } finally {
            setGuardando(false);
        }
    };

    // =============================
    // Eliminar
    // =============================

    const eliminar = async (p) => {

        const confirmacion = await Swal.fire({
            icon: "warning",
            title: "¿Eliminar proveedor?",
            html: `<b>${nombreDe(p)}</b> dejará de aparecer en el catálogo y no podrá seleccionarse en nuevas requisiciones.`,
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc3545",
            reverseButtons: true,
            focusCancel: true
        });

        if (!confirmacion.isConfirmed) return;

        try {
            const { data } = await api.delete(`/compras/proveedores/${p.id}`);

            setProveedorDetalle(null);
            await cargar();

            Swal.fire({
                icon: "success",
                title: "Proveedor eliminado",
                text: data?.mensaje || "El proveedor se eliminó correctamente.",
                timer: 2200,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "No se pudo eliminar",
                text: mensajeError(error, "No fue posible eliminar el proveedor.")
            });
        }
    };

    // =============================
    // Filtros
    // =============================

    const cumpleFiltro = (p, valor) =>
        valor === "todos" ||
        (valor === "preregistro" ? esPreregistro(p) : !esPreregistro(p));

    const conteo = (valor) => proveedores.filter(p => cumpleFiltro(p, valor)).length;

    const texto = busqueda.trim().toLowerCase();

    const filtrados = proveedores.filter(p =>
        cumpleFiltro(p, filtro) &&
        (
            !texto ||
            [p.nombre, p.razonSocial, rfcDe(p), p.asesor, p.email, p.telefono, p.giro, p.ciudad]
                .some(v => String(v ?? "").toLowerCase().includes(texto))
        )
    );

    // =============================
    // Columnas
    // =============================

    const columnas = [
        {
            name: "Proveedor",
            selector: row => nombreDe(row),
            sortable: true,
            grow: 2,
            minWidth: "220px",
            cell: row => (
                <div className="cliente-nombre py-2">
                    <span className="cliente-avatar">{inicial(nombreDe(row))}</span>
                    <div className="pv-nombre">
                        <span className="text-break">{nombreDe(row)}</span>
                        {row.razonSocial && row.nombre && row.razonSocial !== row.nombre && (
                            <small>{row.razonSocial}</small>
                        )}
                    </div>
                </div>
            )
        },
        {
            name: "RFC",
            selector: row => rfcDe(row),
            sortable: true,
            width: "145px",
            cell: row =>
                rfcDe(row)
                    ? <span className="cliente-rfc">{rfcDe(row)}</span>
                    : <span className="text-muted">—</span>
        },
        {
            name: "Contacto",
            grow: 1.6,
            minWidth: "200px",
            cell: row => (
                <div className="pv-contacto">
                    {row.asesor && (
                        <span className="contacto-dato"><FaUser /> {row.asesor}</span>
                    )}
                    {row.telefono && (
                        <a className="contacto-dato" href={`tel:${row.telefono}`}><FaPhoneAlt /> {row.telefono}</a>
                    )}
                    {row.email && (
                        <a className="contacto-dato text-truncate" href={`mailto:${row.email}`} title={row.email}><FaEnvelope /> {row.email}</a>
                    )}
                    {!row.asesor && !row.telefono && !row.email && (
                        <span className="text-muted">Sin datos de contacto</span>
                    )}
                </div>
            )
        },
        {
            name: "Ubicación",
            selector: row => ubicacionDe(row),
            sortable: true,
            minWidth: "130px",
            cell: row =>
                ubicacionDe(row)
                    ? <span className="pv-texto">{ubicacionDe(row)}</span>
                    : <span className="text-muted">—</span>
        },
        {
            name: "Crédito",
            selector: row => (Number(row.credito) === 1 ? Number(row.diasCredito || 0) : -1),
            sortable: true,
            width: "105px",
            cell: row =>
                Number(row.credito) === 1
                    ? <span className="mr-categoria">{row.diasCredito || 0} días</span>
                    : <span className="text-muted">Contado</span>
        },
        {
            name: "Estatus",
            selector: row => Number(row.estatusRegistro),
            sortable: true,
            width: "135px",
            cell: row =>
                esPreregistro(row)
                    ? <span className="estatus-pastilla estatus-borrador"><span className="estatus-punto" /> Preregistro</span>
                    : <span className="estatus-pastilla estatus-activo"><span className="estatus-punto" /> Completo</span>
        },
        {
            name: "Acciones",
            right: true,
            width: "145px",
            ignoreRowClick: true,
            cell: row => (
                <div className="docs-acciones">
                    <button
                        className="btn btn-sm btn-outline-primary explorador-btn-icono"
                        title="Ver detalle"
                        aria-label="Ver detalle"
                        onClick={() => setProveedorDetalle(row)}
                    >
                        <FaEye />
                    </button>
                    <button
                        className={`btn btn-sm explorador-btn-icono ${esPreregistro(row) ? "btn-warning" : "btn-outline-secondary"}`}
                        title={esPreregistro(row) ? "Completar registro" : "Editar datos"}
                        aria-label={esPreregistro(row) ? "Completar registro" : "Editar datos"}
                        onClick={() => abrirCompletar(row)}
                    >
                        {esPreregistro(row) ? <FaClipboardCheck /> : <FaEdit />}
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger explorador-btn-icono"
                        title="Eliminar proveedor"
                        aria-label="Eliminar proveedor"
                        onClick={() => eliminar(row)}
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            )
        }
    ];

    // =============================
    // Render
    // =============================

    return (

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">

                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Compras</span>
                    <h2 className="dash-titulo">Proveedores</h2>
                    <div className="dash-contexto">
                        <span><FaTruck /> Catálogo de proveedores para requisiciones y órdenes de compra</span>
                    </div>
                </div>

                <button
                    className="btn btn-light dash-btn-hero"
                    onClick={abrirNuevo}
                >
                    <FaPlus />
                    Nuevo proveedor
                </button>

            </div>

            {/* ========================= */}
            {/* FILTRO POR ESTATUS */}
            {/* ========================= */}

            <div className="row g-3 mb-4">
                {FILTROS.map(f => (
                    <div className="col-12 col-md-4" key={f.valor}>
                        <button
                            type="button"
                            className={`filtro-kpi ${filtro === f.valor ? "activo" : ""}`}
                            onClick={() => setFiltro(f.valor)}
                            aria-pressed={filtro === f.valor}
                        >
                            <span className={`dash-kpi-icono dash-tono-${f.tono}`}>{f.icono}</span>
                            <span className="filtro-kpi-texto">
                                <span className="filtro-kpi-label">{f.texto}</span>
                                <span className="filtro-kpi-valor">
                                    {cargando ? "—" : conteo(f.valor).toLocaleString("es-MX")}
                                </span>
                                <span className="pc-filtro-desc">{f.desc}</span>
                            </span>
                        </button>
                    </div>
                ))}
            </div>

            {/* ========================= */}
            {/* LISTADO */}
            {/* ========================= */}

            <div className="dash-panel p-0 overflow-hidden mb-4">

                <div className="listado-toolbar">

                    <div className="explorador-buscar listado-buscar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Nombre, razón social, RFC, contacto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            aria-label="Buscar proveedor"
                        />
                        {busqueda && (
                            <button
                                type="button"
                                className="pc-limpiar"
                                title="Limpiar búsqueda"
                                aria-label="Limpiar búsqueda"
                                onClick={() => setBusqueda("")}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <span className="listado-contador">
                        Mostrando <strong>{filtrados.length}</strong> de <strong>{proveedores.length}</strong>
                    </span>

                </div>

                <DataTable
                    columns={columnas}
                    data={filtrados}
                    customStyles={estilosTabla}
                    progressPending={cargando}
                    progressComponent={
                        <div className="dash-vacio">
                            <div className="spinner-border text-primary" role="status" />
                            <span>Cargando proveedores…</span>
                        </div>
                    }
                    noDataComponent={
                        <div className="dash-vacio">
                            <FaTruck />
                            <span>
                                {proveedores.length
                                    ? "Ningún proveedor coincide con la búsqueda."
                                    : "Aún no hay proveedores registrados."}
                            </span>
                            {!proveedores.length && (
                                <button className="btn btn-primary np-btn mt-2" onClick={abrirNuevo}>
                                    <FaPlus /> Registrar el primer proveedor
                                </button>
                            )}
                        </div>
                    }
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    paginationComponentOptions={paginacionEs}
                    defaultSortFieldId={1}
                    highlightOnHover
                    pointerOnHover
                    onRowClicked={(row) => setProveedorDetalle(row)}
                    responsive
                    persistTableHead
                />

            </div>

            {/* ========================= */}
            {/* MODAL: NUEVO PROVEEDOR */}
            {/* ========================= */}

            {modalNuevo && (

                <div
                    className="modal show d-block rd-modal"
                    onClick={(e) => e.target === e.currentTarget && !guardando && setModalNuevo(false)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content nc-form">

                            <div className="modal-header rd-modal-header">
                                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                                    <span className="np-header-icono"><FaUserPlus /></span>
                                    <div style={{ minWidth: 0 }}>
                                        <h5 className="modal-title">Nuevo proveedor</h5>
                                        <div className="rd-modal-sub">
                                            Preregistro con datos básicos; podrá completarse después
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={() => setModalNuevo(false)}
                                    disabled={guardando}
                                />
                            </div>

                            <div className="modal-body">

                                <div className="row g-3">
                                    {CAMPOS_PREREGISTRO.map(campo => (
                                        <div key={campo.name} className="col-12 col-md-6">
                                            <label className="form-label">
                                                {campo.label}
                                                {(campo.name === "nombre" || campo.name === "razonSocial") && (
                                                    <span className="text-danger"> *</span>
                                                )}
                                            </label>
                                            <div className="nr-input-icono">
                                                {campo.icon}
                                                <input
                                                    type={campo.type || "text"}
                                                    className={`form-control ${campo.name === "RFC" ? "nc-mayusculas" : ""}`}
                                                    placeholder={campo.placeholder}
                                                    value={formNuevo[campo.name]}
                                                    onChange={(e) =>
                                                        setFormNuevo(prev => ({
                                                            ...prev,
                                                            [campo.name]: campo.name === "RFC"
                                                                ? e.target.value.toUpperCase()
                                                                : e.target.value
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="pv-nota mb-0 mt-3">
                                    <span className="text-danger">*</span> Capture al menos el nombre comercial o la razón social.
                                    El sistema avisa si el proveedor ya existe (por RFC, razón social o nombre).
                                </p>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-secondary np-btn"
                                    onClick={() => setModalNuevo(false)}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary np-btn"
                                    onClick={guardarNuevo}
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? <><span className="spinner-border spinner-border-sm" role="status" /> Guardando...</>
                                        : <><FaSave /> Guardar proveedor</>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            )}

            {/* ========================= */}
            {/* MODAL: COMPLETAR / EDITAR */}
            {/* ========================= */}

            {proveedorCompletar && (

                <div
                    className="modal show d-block rd-modal"
                    onClick={(e) => e.target === e.currentTarget && !guardando && setProveedorCompletar(null)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content nc-form">

                            <div className="modal-header rd-modal-header">
                                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                                    <span className="np-header-icono">
                                        {esPreregistro(proveedorCompletar) ? <FaClipboardCheck /> : <FaEdit />}
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                        <h5 className="modal-title">
                                            {esPreregistro(proveedorCompletar) ? "Completar registro" : "Editar datos del proveedor"}
                                        </h5>
                                        <div className="rd-modal-sub text-truncate">
                                            {nombreDe(proveedorCompletar)}
                                            {rfcDe(proveedorCompletar) && ` · ${rfcDe(proveedorCompletar)}`}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={() => setProveedorCompletar(null)}
                                    disabled={guardando}
                                />
                            </div>

                            <div className="modal-body">

                                {esPreregistro(proveedorCompletar) && (
                                    <div className="nc-aviso nc-aviso-advertencia mb-3">
                                        <FaHourglassHalf />
                                        <div>
                                            <strong>Proveedor en preregistro</strong>
                                            <span>Al guardar, el registro queda completo y el proveedor se activa en el catálogo.</span>
                                        </div>
                                    </div>
                                )}

                                <h6 className="nc-seccion mt-0"><FaBriefcase /> Datos comerciales</h6>

                                <div className="row g-3">
                                    <div className="col-12 col-md-8">
                                        <label className="form-label">Giro</label>
                                        <input
                                            className="form-control"
                                            placeholder="Ej. Equipo de cómputo, papelería, servicios..."
                                            value={formCompletar.giro}
                                            onChange={(e) => cambiarCompletar("giro", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Clave</label>
                                        <div className="nr-input-icono">
                                            <FaHashtag />
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                placeholder="Clave interna"
                                                value={formCompletar.clave}
                                                onChange={(e) => cambiarCompletar("clave", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="pv-subcontratado"
                                                checked={formCompletar.subcontratado === 1}
                                                onChange={(e) => cambiarCompletar("subcontratado", e.target.checked ? 1 : 0)}
                                            />
                                            <label className="form-check-label" htmlFor="pv-subcontratado">
                                                Proveedor subcontratado
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="nc-seccion"><FaMapMarkerAlt /> Domicilio</h6>

                                <div className="row g-3">
                                    <div className="col-12 col-md-8">
                                        <label className="form-label">Calle</label>
                                        <input
                                            className="form-control"
                                            value={formCompletar.calle}
                                            onChange={(e) => cambiarCompletar("calle", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <label className="form-label">Número</label>
                                        <input
                                            className="form-control"
                                            value={formCompletar.numero}
                                            onChange={(e) => cambiarCompletar("numero", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6 col-md-8">
                                        <label className="form-label">Colonia</label>
                                        <input
                                            className="form-control"
                                            value={formCompletar.colonia}
                                            onChange={(e) => cambiarCompletar("colonia", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Código postal</label>
                                        <input
                                            className="form-control"
                                            inputMode="numeric"
                                            maxLength={5}
                                            value={formCompletar.codigoPostal}
                                            onChange={(e) => cambiarCompletar("codigoPostal", e.target.value.replace(/\D/g, ""))}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Ciudad</label>
                                        <input
                                            className="form-control"
                                            value={formCompletar.ciudad}
                                            onChange={(e) => cambiarCompletar("ciudad", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Estado</label>
                                        <input
                                            className="form-control"
                                            value={formCompletar.estado}
                                            onChange={(e) => cambiarCompletar("estado", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">País</label>
                                        <input
                                            className="form-control"
                                            value={formCompletar.pais}
                                            onChange={(e) => cambiarCompletar("pais", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <h6 className="nc-seccion"><FaCreditCard /> Condiciones de pago</h6>

                                <div className="row g-3 align-items-end">
                                    <div className="col-12 col-md-6">
                                        <div className="form-check form-switch pv-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="pv-credito"
                                                checked={formCompletar.credito === 1}
                                                onChange={(e) => cambiarCompletar("credito", e.target.checked ? 1 : 0)}
                                            />
                                            <label className="form-check-label" htmlFor="pv-credito">
                                                {formCompletar.credito === 1 ? "Otorga crédito" : "Pago de contado"}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label">
                                            Días de crédito
                                            {formCompletar.credito === 1 && <span className="text-danger"> *</span>}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder={formCompletar.credito === 1 ? "Ej. 30" : "No aplica"}
                                            disabled={formCompletar.credito !== 1}
                                            value={formCompletar.credito === 1 ? formCompletar.diasCredito : ""}
                                            onChange={(e) => cambiarCompletar("diasCredito", e.target.value)}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-secondary np-btn"
                                    onClick={() => setProveedorCompletar(null)}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary np-btn"
                                    onClick={guardarCompletar}
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? <><span className="spinner-border spinner-border-sm" role="status" /> Guardando...</>
                                        : <><FaSave /> {esPreregistro(proveedorCompletar) ? "Completar registro" : "Guardar cambios"}</>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            )}

            {/* ========================= */}
            {/* MODAL: DETALLE */}
            {/* ========================= */}

            {proveedorDetalle && (

                <div
                    className="modal show d-block rd-modal"
                    onClick={(e) => e.target === e.currentTarget && setProveedorDetalle(null)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content nc-form">

                            <div className="modal-header rd-modal-header">
                                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                                    <span className="cliente-avatar pv-avatar-grande">{inicial(nombreDe(proveedorDetalle))}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <h5 className="modal-title text-break">{nombreDe(proveedorDetalle)}</h5>
                                        <div className="rd-modal-sub d-flex flex-wrap align-items-center gap-2 mt-1">
                                            {esPreregistro(proveedorDetalle)
                                                ? <span className="estatus-pastilla estatus-borrador"><span className="estatus-punto" /> Preregistro</span>
                                                : <span className="estatus-pastilla estatus-activo"><span className="estatus-punto" /> Completo</span>}
                                            {rfcDe(proveedorDetalle) && <span className="cliente-rfc">{rfcDe(proveedorDetalle)}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={() => setProveedorDetalle(null)}
                                />
                            </div>

                            <div className="modal-body">

                                <h6 className="nc-seccion mt-0"><FaBuilding /> Datos generales</h6>
                                <div className="oc-resumen pv-detalle">
                                    {[
                                        { label: "Nombre comercial", valor: proveedorDetalle.nombre, icono: <FaStore /> },
                                        { label: "Razón social", valor: proveedorDetalle.razonSocial, icono: <FaBuilding /> },
                                        { label: "Giro", valor: proveedorDetalle.giro, icono: <FaBriefcase /> },
                                        { label: "Clave", valor: proveedorDetalle.clave, icono: <FaHashtag /> }
                                    ].map(d => (
                                        <div className="oc-resumen-item" key={d.label}>
                                            <span className="oc-resumen-icono">{d.icono}</span>
                                            <div style={{ minWidth: 0 }}>
                                                <small>{d.label}</small>
                                                <span className="text-break">{(d.valor ?? "") !== "" ? d.valor : "—"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h6 className="nc-seccion"><FaUser /> Contacto</h6>
                                <div className="oc-resumen pv-detalle">
                                    {[
                                        { label: "Asesor", valor: proveedorDetalle.asesor, icono: <FaUser /> },
                                        { label: "Teléfono", valor: proveedorDetalle.telefono, icono: <FaPhoneAlt /> },
                                        { label: "Correo electrónico", valor: proveedorDetalle.email, icono: <FaEnvelope /> },
                                        { label: "Domicilio", valor: direccionDe(proveedorDetalle), icono: <FaMapMarkerAlt /> }
                                    ].map(d => (
                                        <div className="oc-resumen-item" key={d.label}>
                                            <span className="oc-resumen-icono">{d.icono}</span>
                                            <div style={{ minWidth: 0 }}>
                                                <small>{d.label}</small>
                                                <span className="text-break">{d.valor || "—"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h6 className="nc-seccion"><FaHandshake /> Condiciones</h6>
                                <div className="oc-resumen pv-detalle">
                                    {[
                                        {
                                            label: "Forma de pago",
                                            valor: Number(proveedorDetalle.credito) === 1
                                                ? `Crédito a ${proveedorDetalle.diasCredito || 0} días`
                                                : "Contado",
                                            icono: <FaCreditCard />
                                        },
                                        {
                                            label: "Subcontratado",
                                            valor: Number(proveedorDetalle.subcontratado) === 1 ? "Sí" : "No",
                                            icono: <FaBriefcase />
                                        }
                                    ].map(d => (
                                        <div className="oc-resumen-item" key={d.label}>
                                            <span className="oc-resumen-icono">{d.icono}</span>
                                            <div style={{ minWidth: 0 }}>
                                                <small>{d.label}</small>
                                                <span>{d.valor}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h6 className="nc-seccion"><FaCalendarAlt /> Historial del registro</h6>
                                <div className="oc-resumen pv-detalle">
                                    <div className="oc-resumen-item">
                                        <span className="oc-resumen-icono"><FaUserPlus /></span>
                                        <div style={{ minWidth: 0 }}>
                                            <small>Preregistro</small>
                                            <span className="text-break">
                                                {formatoFecha(proveedorDetalle.fechaPreregistro)}
                                                {proveedorDetalle.usuarioPreregistro && ` · ${proveedorDetalle.usuarioPreregistro}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="oc-resumen-item">
                                        <span className="oc-resumen-icono"><FaClipboardCheck /></span>
                                        <div style={{ minWidth: 0 }}>
                                            <small>Registro completo</small>
                                            <span className="text-break">
                                                {proveedorDetalle.fechaRegistroCompleto
                                                    ? `${formatoFecha(proveedorDetalle.fechaRegistroCompleto)}${proveedorDetalle.usuarioRegistroCompleto ? ` · ${proveedorDetalle.usuarioRegistroCompleto}` : ""}`
                                                    : "Pendiente"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-danger np-btn me-auto"
                                    onClick={() => eliminar(proveedorDetalle)}
                                >
                                    <FaTrashAlt /> Eliminar
                                </button>
                                <button
                                    className="btn btn-outline-secondary np-btn"
                                    onClick={() => setProveedorDetalle(null)}
                                >
                                    Cerrar
                                </button>
                                <button
                                    className="btn btn-primary np-btn"
                                    onClick={() => abrirCompletar(proveedorDetalle)}
                                >
                                    {esPreregistro(proveedorDetalle)
                                        ? <><FaClipboardCheck /> Completar registro</>
                                        : <><FaEdit /> Editar datos</>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            )}

        </div>

    );

}
