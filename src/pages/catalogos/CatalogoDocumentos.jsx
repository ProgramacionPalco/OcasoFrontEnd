import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    FaFolderOpen,
    FaFileAlt,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaSave,
    FaTimes,
    FaSearch,
    FaCheck,
    FaMinus,
    FaUser,
    FaBuilding,
    FaGlobeAmericas,
    FaCalendarAlt,
    FaExclamationCircle
} from "react-icons/fa";

const FORM_VACIO = {
    nombreDocumento: "",
    personaFisica: false,
    personaMoral: false,
    internacional: false,
    requiereVencimiento: false,
    obligatorio: false
};

// Opciones del documento (interruptores del formulario)
const OPCIONES_DOC = [
    { campo: "personaFisica", texto: "Persona física", desc: "Aplica a personas físicas", icono: <FaUser /> },
    { campo: "personaMoral", texto: "Persona moral", desc: "Aplica a personas morales", icono: <FaBuilding /> },
    { campo: "internacional", texto: "Internacional", desc: "Aplica a clientes extranjeros", icono: <FaGlobeAmericas /> },
    { campo: "requiereVencimiento", texto: "Requiere vencimiento", desc: "Se captura fecha de vencimiento", icono: <FaCalendarAlt /> },
    { campo: "obligatorio", texto: "Obligatorio", desc: "Necesario para el expediente", icono: <FaExclamationCircle /> }
];

function Marca({ activo }) {
    return activo ? (
        <span className="cd-marca cd-marca-si" title="Sí"><FaCheck /></span>
    ) : (
        <span className="cd-marca cd-marca-no" title="No"><FaMinus /></span>
    );
}

function CatalogoDocumentos() {

const [documentos, setDocumentos] = useState([]);
const [cargando, setCargando] = useState(true);
const [busqueda, setBusqueda] = useState("");

const [nuevoDoc, setNuevoDoc] = useState({
    nombreDocumento: "",
    personaFisica: false,
    personaMoral: false,
    internacional: false,
    requiereVencimiento: false,
    obligatorio:false
});

const obtenerDocumentos = async () => {
    try {

        const res = await api.get("/catalogos/documentos?pageSize=500");

       //console.log("Respuesta documentos:", res.data);

        const data = Array.isArray(res.data)
            ? res.data
            : res.data.data || [];

        setDocumentos(data);

    } catch (error) {
        console.error("Error cargando catálogo", error);
        setDocumentos([]);
    } finally {
        setCargando(false);
    }
};

useEffect(() => {
    obtenerDocumentos();
}, []);

const guardarDocumento = async () => {

    try {

        const payload = {
            nombreDocumento: nuevoDoc.nombreDocumento,
            personaFisica: nuevoDoc.personaFisica ? 1 : 0,
            personaMoral: nuevoDoc.personaMoral ? 1 : 0,
            internacional: nuevoDoc.internacional ? 1 : 0,
            requiereVencimiento: nuevoDoc.requiereVencimiento ? 1 : 0,
            obligatorio: nuevoDoc.obligatorio
        };

        //console.log("Payload enviado:", payload);

        if (nuevoDoc.id) {
            await api.put(`/catalogos/documentos/${nuevoDoc.id}`, payload);
        } else {
            await api.post("/catalogos/documentos", payload);
        }

        // 🔹 RECARGAR TABLA
        await obtenerDocumentos();
        //console.log(obtenerDocumentos);
        // 🔹 LIMPIAR FORMULARIO
        setNuevoDoc({
            nombreDocumento: "",
            personaFisica: false,
            personaMoral: false,
            internacional: false,
            requiereVencimiento: false,
            obligatorio: false
        });

    } catch {
        alert("Error al guardar documento");
    }

};

const eliminarDocumento = async (id) => {
    if(!window.confirm("¿Eliminar documento?"))
        return;
    try{
        await api.delete(`/catalogos/documentos/${id}`);
        obtenerDocumentos();
    }catch{
        alert("Error al eliminar documento");
    }
};

const editarDocumento = (doc) => {

    setNuevoDoc({
        id: doc.id,
        nombreDocumento: doc.nombreDocumento,
        personaFisica: doc.personaFisica === 1 || doc.personaFisica === true,
        personaMoral: doc.personaMoral === 1 || doc.personaMoral === true,
        internacional: doc.internacional === 1 || doc.internacional === true,
        requiereVencimiento: doc.requiereVencimiento === 1 || doc.requiereVencimiento === true,
        obligatorio: doc.obligatorio === 1 || doc.obligatorio === true
    });

    // En pantallas chicas el formulario queda arriba: lo llevamos a la vista
    window.scrollTo({ top: 0, behavior: "smooth" });

};

const cancelarEdicion = () => setNuevoDoc(FORM_VACIO);

const editando = Boolean(nuevoDoc.id);

const documentosFiltrados = documentos.filter((d) =>
    String(d.nombreDocumento ?? "")
        .toLowerCase()
        .includes(busqueda.toLowerCase().trim())
);

const totalObligatorios = documentos.filter((d) => d.obligatorio).length;
const totalVencimiento = documentos.filter((d) => d.requiereVencimiento).length;
const totalInternacional = documentos.filter((d) => d.internacional).length;

const KPIS = [
    { label: "Documentos", valor: documentos.length, icono: <FaFileAlt />, tono: "primary" },
    { label: "Obligatorios", valor: totalObligatorios, icono: <FaExclamationCircle />, tono: "danger" },
    { label: "Con vencimiento", valor: totalVencimiento, icono: <FaCalendarAlt />, tono: "warning" },
    { label: "Internacionales", valor: totalInternacional, icono: <FaGlobeAmericas />, tono: "info" }
];

return (

    <div className="container-fluid dash">

        {/* ========================= */}
        {/* ENCABEZADO */}
        {/* ========================= */}

        <div className="dash-hero mb-4">
            <div className="dash-hero-texto">
                <span className="dash-eyebrow">Catálogos</span>
                <h2 className="dash-titulo">Catálogo de documentos</h2>
                <div className="dash-contexto">
                    <span><FaFolderOpen /> Documentos que integran el expediente de los clientes</span>
                </div>
            </div>
        </div>

        {/* ========================= */}
        {/* INDICADORES */}
        {/* ========================= */}

        <div className="row g-3 mb-4">
            {KPIS.map((k) => (
                <div className="col-6 col-lg-3" key={k.label}>
                    <div className="dash-kpi h-100">
                        <div className="dash-kpi-top">
                            <span className="dash-kpi-label">{k.label}</span>
                            <span className={`dash-kpi-icono dash-tono-${k.tono}`}>{k.icono}</span>
                        </div>
                        <div className="dash-kpi-valor">
                            {cargando ? "—" : k.valor.toLocaleString("es-MX")}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="row g-4 mb-4">

            {/* ========================= */}
            {/* FORMULARIO */}
            {/* ========================= */}

            <div className="col-12 col-xl-4">
                <div className={`dash-panel nc-form p-0 overflow-hidden cd-form ${editando ? "cd-form-editando" : ""}`}>

                    <div className="nc-form-header">
                        <span className="nc-form-icono">{editando ? <FaEdit /> : <FaPlus />}</span>
                        <div style={{ minWidth: 0 }}>
                            <h3 className="nc-form-titulo">
                                {editando ? "Editar documento" : "Nuevo documento"}
                            </h3>
                            <div className="nc-form-sub text-truncate">
                                {editando
                                    ? nuevoDoc.nombreDocumento || "Documento seleccionado"
                                    : "Agrega un documento al catálogo"}
                            </div>
                        </div>
                    </div>

                    <div className="nc-form-cuerpo">

                        <label className="form-label">Nombre del documento</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Ej. Constancia de situación fiscal"
                            value={nuevoDoc.nombreDocumento}
                            onChange={(e) =>
                                setNuevoDoc({
                                    ...nuevoDoc,
                                    nombreDocumento: e.target.value
                                })
                            }
                        />

                        <label className="form-label">Aplica / configuración</label>
                        <div className="cd-opciones">
                            {OPCIONES_DOC.map((o) => (
                                <label
                                    key={o.campo}
                                    className={`nc-opcion ${nuevoDoc[o.campo] ? "activa" : ""}`}
                                >
                                    <span className="cd-opcion-icono">{o.icono}</span>
                                    <span className="nc-opcion-texto flex-grow-1">
                                        <span className="nc-opcion-titulo">{o.texto}</span>
                                        <span className="nc-opcion-desc">{o.desc}</span>
                                    </span>
                                    <span className="form-check form-switch m-0">
                                        <input
                                            type="checkbox"
                                            role="switch"
                                            className="form-check-input"
                                            checked={nuevoDoc[o.campo]}
                                            onChange={(e) =>
                                                setNuevoDoc({
                                                    ...nuevoDoc,
                                                    [o.campo]: e.target.checked
                                                })
                                            }
                                        />
                                    </span>
                                </label>
                            ))}
                        </div>

                    </div>

                    <div className="nc-pie">
                        {editando ? (
                            <button
                                type="button"
                                className="btn btn-outline-secondary np-btn"
                                onClick={cancelarEdicion}
                            >
                                <FaTimes /> Cancelar
                            </button>
                        ) : (
                            <span />
                        )}

                        <button
                        className="btn btn-primary np-btn"
                        onClick={guardarDocumento}
                        >
                        <FaSave /> {nuevoDoc.id ? "Actualizar documento" : "Guardar documento"}
                        </button>
                    </div>

                </div>
            </div>

            {/* ========================= */}
            {/* LISTADO */}
            {/* ========================= */}

            <div className="col-12 col-xl-8">
                <div className="dash-panel p-0 overflow-hidden">

                    <div className="listado-toolbar">

                        <div className="explorador-buscar listado-buscar">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Buscar documento..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                aria-label="Buscar documento"
                            />
                        </div>

                        <span className="listado-contador">
                            Mostrando <strong>{documentosFiltrados.length}</strong> de{" "}
                            <strong>{documentos.length}</strong>
                        </span>

                    </div>

                    {cargando ? (

                        <div className="dash-vacio">
                            <div className="spinner-border text-primary" role="status" />
                            <span>Cargando catálogo…</span>
                        </div>

                    ) : documentosFiltrados.length === 0 ? (

                        <div className="dash-vacio">
                            <FaFileAlt />
                            <span>
                                {documentos.length
                                    ? "Ningún documento coincide con la búsqueda."
                                    : "No hay documentos registrados."}
                            </span>
                        </div>

                    ) : (
                        <>
                            {/* TABLA (escritorio) */}

                            <div className="table-responsive d-none d-md-block">
                            <table className="table align-middle docs-tabla no-cards">

                                <thead>
                                    <tr>
                                        <th>Documento</th>
                                        <th className="text-center" title="Persona física">PF</th>
                                        <th className="text-center" title="Persona moral">PM</th>
                                        <th className="text-center">Internacional</th>
                                        <th className="text-center">Vencimiento</th>
                                        <th className="text-center">Obligatorio</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {documentosFiltrados.map((d) => (
                                        <tr key={d.id} className={nuevoDoc.id === d.id ? "cd-fila-editando" : ""}>

                                            <td>
                                                <div className="docs-nombre">
                                                    <span className="docs-icono docs-icono-otro cd-doc-icono">
                                                        <FaFileAlt />
                                                    </span>
                                                    <span className="fw-semibold text-break">{d.nombreDocumento}</span>
                                                </div>
                                            </td>

                                            <td className="text-center"><Marca activo={d.personaFisica} /></td>

                                            <td className="text-center"><Marca activo={d.personaMoral} /></td>

                                            <td className="text-center"><Marca activo={d.internacional} /></td>

                                            <td className="text-center"><Marca activo={d.requiereVencimiento} /></td>

                                            <td className="text-center">
                                                {d.obligatorio
                                                    ? <span className="estatus-pastilla estatus-negado">Obligatorio</span>
                                                    : <span className="estatus-pastilla rd-estado-na">Opcional</span>}
                                            </td>

                                            <td>
                                                <div className="docs-acciones">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary explorador-btn-icono"
                                                        title="Editar"
                                                        aria-label="Editar documento"
                                                        onClick={() => editarDocumento(d)}
                                                        >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger explorador-btn-icono"
                                                        title="Eliminar"
                                                        aria-label="Eliminar documento"
                                                        onClick={() => eliminarDocumento(d.id)}
                                                        >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>

                            </table>
                            </div>

                            {/* TARJETAS (celular) */}

                            <div className="d-md-none p-3 d-flex flex-column gap-2">
                                {documentosFiltrados.map((d) => (
                                    <div
                                        key={d.id}
                                        className={`cd-tarjeta ${nuevoDoc.id === d.id ? "cd-fila-editando" : ""}`}
                                    >
                                        <div className="d-flex align-items-start justify-content-between gap-2">
                                            <div className="docs-nombre" style={{ minWidth: 0 }}>
                                                <span className="docs-icono docs-icono-otro cd-doc-icono">
                                                    <FaFileAlt />
                                                </span>
                                                <span className="fw-semibold text-break">{d.nombreDocumento}</span>
                                            </div>
                                            <div className="docs-acciones">
                                                <button
                                                    className="btn btn-sm btn-outline-primary explorador-btn-icono"
                                                    aria-label="Editar documento"
                                                    onClick={() => editarDocumento(d)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger explorador-btn-icono"
                                                    aria-label="Eliminar documento"
                                                    onClick={() => eliminarDocumento(d.id)}
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="cd-etiquetas">
                                            {d.personaFisica ? <span className="mr-categoria">Persona física</span> : null}
                                            {d.personaMoral ? <span className="mr-categoria">Persona moral</span> : null}
                                            {d.internacional ? <span className="mr-categoria">Internacional</span> : null}
                                            {d.requiereVencimiento ? <span className="mr-categoria">Con vencimiento</span> : null}
                                            {d.obligatorio
                                                ? <span className="estatus-pastilla estatus-negado">Obligatorio</span>
                                                : <span className="estatus-pastilla rd-estado-na">Opcional</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </div>
            </div>

        </div>

    </div>
);

}

export default CatalogoDocumentos;
