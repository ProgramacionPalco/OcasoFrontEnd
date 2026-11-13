import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Document, Page, pdfjs } from "react-pdf";


pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

import {
  FaFolder,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaList,
  FaTh,
  FaFolderOpen,
  FaLock,
  FaHome,
  FaChevronRight,
  FaSearch,
  FaCheckCircle,
  FaEye,
  FaDownload,
  FaHistory,
  FaUpload,
  FaPrint,
  FaCloudUploadAlt
} from "react-icons/fa";

export default function ExploradorDocumentos(){

  const { tipo } = useParams();

  const [path,setPath] = useState("");
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(false);
  const [busqueda,setBusqueda] = useState("");
  const [vista,setVista] = useState("grid");
  const [pdfUrl,setPdfUrl] = useState(null);
  const [numPages,setNumPages] = useState(null);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [descargando,setDescargando] = useState(false);
  const partesRuta = path.split("/").filter(x => x);
  const [showModalActualizar, setShowModalActualizar] = useState(false);
  const [archivoActualizar, setArchivoActualizar] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [permisos, setPermisos] = useState([]);


  const irRuta = (index) => {
    const nueva = partesRuta.slice(0,index+1).join("/");
    cargar(nueva);
 };

     //console.log(permisos);
const permisoModulo = (ruta) => {

    if(!permisos?.length)
        return null;

    return permisos.find(
        p =>
            p?.ruta?.trim()?.toLowerCase()
            ===
            ruta?.trim()?.toLowerCase()
    );

};

const permisoCalidad =
    permisoModulo("/calidad");

//console.log("PERMISO CALIDAD", permisoCalidad);

const puedeSubirDocumentos =
    Boolean(
        permisoCalidad?.puedeEditar
    );

const puedeDescargarDocumentos =
    Boolean(
        permisoCalidad?.puedeImprimir
    );

    const abrirActualizar = (item) => {
    setDocumentoSeleccionado(item);
    setArchivoActualizar(null);
    setShowModalActualizar(true);
    };

    const actualizarDocumento = async () => {
        if (!archivoActualizar) {
            Swal.fire("Error", "Selecciona un archivo", "warning");
            return;
        }
        if (!documentoSeleccionado) {
            Swal.fire("Error","No hay documento seleccionado","error");
            return;
        }

        try {
            const formData = new FormData();

            // EXTRAER NOMBRE BASE REAL
            const nombreArchivo = documentoSeleccionado.nombre;
            // quitar extensión
            const sinExtension = nombreArchivo.replace(/\.[^/.]+$/, "");

            if (!nombreArchivo) {
            Swal.fire("Error", "No se pudo obtener el nombre del documento", "error");
            return;
            }

            // tomar clave documental
            const nombreBase = sinExtension.trim().split(/\s+/)[0];

            formData.append("archivo", archivoActualizar);
            formData.append("nombreBase", nombreBase);
            formData.append("tipo", tipo.toUpperCase() || "ISO"); //fallback
            formData.append("carpeta", path || ""); //Fallback

            //console.log("FORMDATA:");
            for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
            }

            await api.post("/calidad/actualizar", formData);

            Swal.fire("Correcto", "Documento actualizado", "success");

            setShowModalActualizar(false);
            cargar(path);

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Datos incompletos", "error");
        }
    };


    const descargarArchivo = async (item) => {
    try{

        setDescargando(true);

        const response = await api.get(
        `/calidad/descargar?path=${encodeURIComponent(item.ruta)}`,
        { responseType: "blob" }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", item.nombre);
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

    }catch(err){
        Swal.fire("Error","No se pudo descargar el archivo","error");
    }

    setDescargando(false);
    };

  const cargar = async(rutaActual = "") => {
    setLoading(true);
    try{
      const fullPath = `${tipo}${rutaActual ? "/" + rutaActual : ""}`;
      const res = await api.get(`/calidad/explorar?path=${fullPath}`);
      //console.log(res.data);

      setItems(res.data);
      setPath(rutaActual);
    }catch(err){
      console.error(err);
    }
    setLoading(false);
  };

useEffect(() => {

    const cargarDatos = async () => {

        try {

            const permisosRes =
                await api.get(
                    "/seguridad/mis-permisos"
                );

            //console.log(
            //    "PERMISOS API",
            //    permisosRes.data
            //);

            setPermisos(
                permisosRes.data || []
            );

        }
        catch (error) {

            console.error(
                "Error cargando permisos",
                error
            );

        }

        // LIMPIAR EXPLORADOR AL CAMBIAR ISO/OEA
        setItems([]);

        // SOLO SI EXISTEN EN TU COMPONENTE
        if (typeof setRutaActual !== "undefined")
            setRutaActual("");

        if (typeof setBreadcrumbs !== "undefined")
            setBreadcrumbs([]);

        // RECARGAR RAÍZ
        cargar("");

    };

    cargarDatos();

}, [tipo]);

    const abrirHistorial = async(item) => {
        try{

            const res = await api.get(`/calidad/historial`, {
                params: {
                    nombre: item.nombre.split(" ")[0], // nombreBase disfrazado
                    path: path
                }
            });

            setHistorial(res.data);
            setModalHistorial(true);

        }catch(err){
            console.error(err);
            Swal.fire("Error","No se pudo cargar el historial","error");
        }
    };

  const entrarCarpeta = (nombre) => {
    const nuevaRuta = path ? `${path}/${nombre}` : nombre;
    cargar(nuevaRuta);
  };

  const getIcon = (item) => {
    if(item.tipo === "carpeta") return <FaFolder size={30} color="#facc15" />;

    const ext = item.nombre.split(".").pop().toLowerCase();

    if(ext === "pdf") return <FaFilePdf size={28} color="#ef4444" />;
    if(ext === "doc" || ext === "docx") return <FaFileWord size={28} color="#2563eb" />;
    if(ext === "xls" || ext === "xlsx") return <FaFileExcel size={28} color="#16a34a" />;

    return <FaFileAlt size={28} />;
  };

  const filtrados = items.filter(x =>
    x.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleClick = (item) => {
    if(item.tipo === "carpeta"){
      entrarCarpeta(item.nombre);
      return;
    }

    const ext = item.nombre.split(".").pop().toLowerCase();

    if(ext === "pdf"){
      const baseURL = api.defaults.baseURL;
      setPdfUrl(`${baseURL}/calidad/ver?path=${encodeURIComponent(item.ruta)}`);
    }else{
      window.open(`${api.defaults.baseURL}/calidad/descargar?path=${encodeURIComponent(item.ruta)}`);
    }
  };

  // ==============================
  // DATOS DE PRESENTACIÓN
  // ==============================

  const TITULOS = {
    iso: "Sistema de Gestión ISO",
    oea: "Operador Económico Autorizado"
  };

  const tipoTexto = (tipo || "").toUpperCase();
  const tituloTipo = TITULOS[(tipo || "").toLowerCase()] ?? `Documentos ${tipoTexto}`;

  const totalCarpetas = filtrados.filter(x => x.tipo === "carpeta").length;
  const totalArchivos = filtrados.length - totalCarpetas;

  // Carpetas primero, luego archivos
  const ordenados = [...filtrados].sort((a, b) => {
    if (a.tipo === "carpeta" && b.tipo !== "carpeta") return -1;
    if (a.tipo !== "carpeta" && b.tipo === "carpeta") return 1;
    return 0;
  });

  const extension = (item) =>
    item.tipo === "carpeta" ? "carpeta" : item.nombre.split(".").pop().toLowerCase();

  const claseTipo = (item) => {
    const ext = extension(item);
    if (ext === "carpeta") return "archivo-carpeta";
    if (ext === "pdf") return "archivo-pdf";
    if (ext === "doc" || ext === "docx") return "archivo-word";
    if (ext === "xls" || ext === "xlsx") return "archivo-excel";
    return "archivo-otro";
  };

  const fechaCorta = (f) => (f ? new Date(f).toLocaleDateString("es-MX") : null);

  return(
    <div className="container-fluid dash">

      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
          <span className="dash-eyebrow">Calidad · {tipoTexto}</span>
          <h2 className="dash-titulo">{tituloTipo}</h2>
          <div className="dash-contexto">
            <span><FaFolderOpen /> {totalCarpetas} carpetas</span>
            <span><FaFileAlt /> {totalArchivos} documentos</span>
            <span><FaLock /> Documentos controlados</span>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* BARRA DE NAVEGACIÓN */}
      {/* ========================= */}

      <div className="explorador-toolbar mb-3">

        {/* BREADCRUMB */}
        <nav className="explorador-ruta" aria-label="Ruta">

          <button
            type="button"
            className={`explorador-miga ${partesRuta.length === 0 ? "actual" : ""}`}
            onClick={()=>cargar("")}
          >
            <FaHome /> {tipoTexto}
          </button>

          {partesRuta.map((parte,index)=>(
            <span key={index} className="explorador-ruta-tramo">
              <FaChevronRight className="explorador-ruta-sep" />
              <button
                type="button"
                className={`explorador-miga ${index === partesRuta.length - 1 ? "actual" : ""}`}
                onClick={()=>irRuta(index)}
              >
                {parte}
              </button>
            </span>
          ))}

        </nav>

        {/* CONTROLES */}
        <div className="explorador-controles">

          <div className="explorador-buscar">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar en esta carpeta..."
              value={busqueda}
              onChange={(e)=>setBusqueda(e.target.value)}
              aria-label="Buscar"
            />
          </div>

          <div className="explorador-vista" role="group" aria-label="Tipo de vista">
            <button
              type="button"
              className={vista==="grid" ? "activo" : ""}
              onClick={()=>setVista("grid")}
              title="Vista de cuadrícula"
              aria-label="Vista de cuadrícula"
            >
              <FaTh />
            </button>
            <button
              type="button"
              className={vista==="list" ? "activo" : ""}
              onClick={()=>setVista("list")}
              title="Vista de lista"
              aria-label="Vista de lista"
            >
              <FaList />
            </button>
          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* CARGANDO / VACÍO */}
      {/* ========================= */}

      {loading && (
        <div className="dash-panel">
          <div className="dash-vacio">
            <div className="spinner-border text-primary" role="status" />
            <span>Cargando documentos…</span>
          </div>
        </div>
      )}

      {!loading && ordenados.length === 0 && (
        <div className="dash-panel">
          <div className="dash-vacio">
            <FaFolderOpen />
            <span>
              {busqueda
                ? "No se encontraron elementos con esa búsqueda."
                : "Esta carpeta está vacía."}
            </span>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* GRID */}
      {/* ========================= */}

      {!loading && vista === "grid" && ordenados.length > 0 && (
        <div className="explorador-grid">
          {ordenados.map((item,index)=>(
            <div
              key={index}
              className={`archivo-card ${claseTipo(item)}`}
              role="button"
              tabIndex={0}
              onClick={()=>handleClick(item)}
              onKeyDown={(e)=>{
                if (e.key === "Enter") handleClick(item);
              }}
              title={item.nombre}
            >
              <div className="archivo-icono">
                {getIcon(item)}
              </div>

              <div className="archivo-nombre">{item.nombre}</div>

              <div className="archivo-meta">
                {item.tipo === "carpeta" ? (
                  <span>Carpeta</span>
                ) : (
                  <>
                    <span className="archivo-ext">{extension(item).toUpperCase()}</span>
                    {item.version && <span>v{item.version}</span>}
                    {fechaCorta(item.fechaModificacion) && (
                      <span>{fechaCorta(item.fechaModificacion)}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* LISTA */}
      {/* ========================= */}

      {!loading && vista === "list" && ordenados.length > 0 && (
        <div className="dash-panel p-0 overflow-hidden">
        <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 explorador-tabla">

            <thead>
            <tr>
                <th>Nombre</th>
                <th>Versión</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-end">Acciones</th>
            </tr>
            </thead>

        <tbody>
        {ordenados.map((item,index)=>{

            const esVigente =
                item.esVigente ?? item.EsVigente;

            return(
            <tr key={index}>

                <td>
                  <div className={`explorador-nombre ${claseTipo(item)}`}>
                    <span className="archivo-icono archivo-icono-sm">
                      {getIcon(item)}
                    </span>
                    <span className="text-break">{item.nombre}</span>
                  </div>
                </td>

                {item.tipo === "carpeta" ? (
                <>
                    <td className="text-muted">—</td>
                    <td className="text-muted">—</td>
                    <td className="text-muted">—</td>
                    <td className="text-end">
                    <button
                        className="btn btn-sm btn-outline-primary dash-btn-tabla"
                        onClick={()=>entrarCarpeta(item.nombre)}
                    >
                        <FaFolderOpen /> Abrir
                    </button>
                    </td>
                </>
                ) : (
                <>
                    <td>
                      <span className="explorador-version">
                          v{item.version || 1}
                      </span>
                    </td>

                    <td>
                      <span className="explorador-estado">
                          <FaCheckCircle /> Vigente
                      </span>
                    </td>

                    <td className="text-muted">
                    {item.fechaModificacion
                        ? new Date(item.fechaModificacion).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                    <div className="explorador-acciones">

                    {esVigente && (
                        <button
                        className="btn btn-sm btn-primary explorador-btn-icono"
                        onClick={()=>handleClick(item)}
                        title="Ver documento"
                        aria-label="Ver documento"
                        >
                        <FaEye />
                        </button>
                    )}

                      {
                        puedeDescargarDocumentos &&
                        esVigente && (

                          <button
                            className="btn btn-sm btn-outline-secondary explorador-btn-icono"
                            onClick={() => descargarArchivo(item)}
                            title="Descargar"
                            aria-label="Descargar"
                          >
                            <FaDownload />
                          </button>

                      )}

                        <button
                            className="btn btn-sm btn-outline-secondary explorador-btn-icono"
                            onClick={(e)=>{
                                e.stopPropagation();
                                abrirHistorial(item);
                            }}
                            title="Historial de versiones"
                            aria-label="Historial de versiones"
                        >
                            <FaHistory />
                        </button>

                      {
                        puedeSubirDocumentos &&
                        esVigente && (

                          <button
                            className="btn btn-sm btn-outline-warning explorador-btn-icono"
                            onClick={(e)=>{
                              e.stopPropagation();
                              abrirActualizar(item);
                            }}
                            title="Actualizar (subir nueva versión)"
                            aria-label="Actualizar documento"
                          >
                            <FaUpload />
                          </button>

                      )}

                    </div>
                    </td>
                </>
                )}

            </tr>
            );

        })}
        </tbody>

        </table>
        </div>
        </div>
        )}

      {/* ========================= */}
      {/* VISOR PDF */}
      {/* ========================= */}

{pdfUrl && (
  <div className="modal show d-block explorador-modal-fondo">

    <div className="modal-dialog modal-xl modal-dialog-centered">

      <div className="modal-content explorador-visor">

        {/* HEADER */}
        <div className="explorador-visor-header">

          <div className="d-flex align-items-center gap-3">
            <span className="explorador-visor-icono"><FaFilePdf /></span>
            <div>
              <h6 className="mb-0">Vista previa del documento</h6>
              <small>Documento controlado - No descargar versiones locales</small>
            </div>
          </div>

          <button
            className="btn-close btn-close-white"
            onClick={() => setPdfUrl(null)}
            aria-label="Cerrar"
          />
        </div>

        {/* TOOLBAR */}
        <div className="explorador-visor-toolbar">

          <span className="explorador-visor-protegido">
            <FaLock /> Visualización protegida
          </span>

          <div className="d-flex gap-2">

            <button
              className="btn btn-sm btn-outline-secondary dash-btn-tabla"
              onClick={() =>
                Swal.fire({
                  icon: "warning",
                  title: "Acción restringida",
                  text: "La descarga está controlada por el sistema",
                })
              }
            >
              <FaDownload /> Descargar
            </button>

            <button
              className="btn btn-sm btn-outline-secondary dash-btn-tabla"
              onClick={() =>
                Swal.fire({
                  icon: "warning",
                  title: "Acción restringida",
                  text: "La impresión no está permitida",
                })
              }
            >
              <FaPrint /> Imprimir
            </button>

          </div>
        </div>

        {/* CONTENIDO PDF */}
        <div style={{ position: "relative", height: "80vh" }}>

            <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Vista previa del documento"
            />

            {/* WATERMARK */}
            <div className="explorador-marca-agua">
                DOCUMENTO CONTROLADO
            </div>

            </div>

        </div>

        </div>
    </div>
    )}

      {descargando && (
            <div className="modal show d-block explorador-modal-fondo">
                <div className="modal-dialog modal-sm modal-dialog-centered">

                <div className="modal-content text-center p-4 explorador-modal">

                    <div className="spinner-border text-primary mb-3 mx-auto" />

                    <p className="mb-0 fw-semibold">Descargando documento...</p>

                </div>

                </div>
            </div>
        )}

        {/* ========================= */}
        {/* MODAL ACTUALIZAR */}
        {/* ========================= */}

        {showModalActualizar && (
            <div className="modal show d-block explorador-modal-fondo">
                <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content explorador-modal">

                    <div className="modal-header">
                      <div className="d-flex align-items-center gap-3">
                        <span className="explorador-modal-icono dash-tono-warning"><FaUpload /></span>
                        <h5 className="modal-title mb-0">Actualizar documento</h5>
                      </div>
                    <button
                        className="btn-close"
                        onClick={() => setShowModalActualizar(false)}
                        aria-label="Cerrar"
                    />
                    </div>

                    <div className="modal-body">

                    <div className="explorador-doc-actual">
                        <FaFilePdf />
                        <div style={{ minWidth: 0 }}>
                          <small>Documento</small>
                          <div className="fw-semibold text-break">{documentoSeleccionado?.nombre}</div>
                        </div>
                    </div>

                    <label className={`explorador-subir ${archivoActualizar ? "con-archivo" : ""}`}>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setArchivoActualizar(e.target.files[0])}
                        />
                        <FaCloudUploadAlt className="explorador-subir-icono" />
                        {archivoActualizar ? (
                          <>
                            <span className="fw-semibold text-break">{archivoActualizar.name}</span>
                            <small>Haz clic para cambiar el archivo</small>
                          </>
                        ) : (
                          <>
                            <span className="fw-semibold">Selecciona el nuevo PDF</span>
                            <small>Haz clic para buscar el archivo</small>
                          </>
                        )}
                    </label>

                    <small className="text-muted d-flex align-items-center gap-2 mt-3">
                        <FaHistory /> Se generará automáticamente una nueva versión
                    </small>

                    </div>

                    <div className="modal-footer">
                    <button
                        className="btn btn-outline-secondary dash-btn"
                        onClick={() => setShowModalActualizar(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        className="btn btn-primary dash-btn"
                        onClick={actualizarDocumento}
                    >
                        <FaUpload /> Subir nueva versión
                    </button>
                    </div>

                </div>
                </div>
            </div>
            )}

      {/* ========================= */}
      {/* MODAL HISTORIAL */}
      {/* ========================= */}

      {modalHistorial && (

  <div className="modal show d-block explorador-modal-fondo">

    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

      <div className="modal-content explorador-modal">

        <div className="modal-header">
          <div className="d-flex align-items-center gap-3">
            <span className="explorador-modal-icono dash-tono-primary"><FaHistory /></span>
            <h5 className="modal-title mb-0">Historial de versiones</h5>
          </div>

          <button
            className="btn-close"
            onClick={()=>setModalHistorial(false)}
            aria-label="Cerrar"
          />
        </div>

        <div className="modal-body">

          {historial.length === 0 ? (
            <div className="dash-vacio">
              <FaHistory />
              <span>No hay historial disponible</span>
            </div>
          ) : (

            <div className="table-responsive">
            <table className="table align-middle mb-0 explorador-tabla">

              <thead>
                <tr>
                  <th>Versión</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>

              <tbody>

                {historial.map((h,index)=>(
                  <tr key={index}>

                    <td>
                      <span className="explorador-version">v{h.version}</span>
                    </td>

                    <td className="text-muted">
                      {new Date(h.fecha).toLocaleDateString()}
                    </td>

                    <td>{h.creadoPor ?? "-"}</td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary dash-btn-tabla"
                        onClick={() => {

                          const ext = h.ruta.split(".").pop().toLowerCase();

                          if(ext === "pdf"){

                            // cerrar historial
                            setModalHistorial(false);

                            // abrir visor
                            setTimeout(() => {

                              setPdfUrl(
                                `${api.defaults.baseURL}/calidad/ver?path=${encodeURIComponent(h.ruta)}`
                              );

                            }, 200);

                          }else{

                            window.open(
                              `${api.defaults.baseURL}/calidad/ver?path=${encodeURIComponent(h.ruta)}`,
                              "_blank"
                            );

                          }

                        }}
                      >
                        <FaEye /> Ver
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
            </div>

          )}

        </div>

      </div>

    </div>

  </div>

)}

    </div>
  );
}
