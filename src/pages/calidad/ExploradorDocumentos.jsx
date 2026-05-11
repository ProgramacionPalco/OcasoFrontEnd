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
  FaTh
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

  const irRuta = (index) => {
    const nueva = partesRuta.slice(0,index+1).join("/");
    cargar(nueva);
 };

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

            if (!nombreArchivo) {
            Swal.fire("Error", "No se pudo obtener el nombre del documento", "error");
            return;
            }

            const nombreBase = nombreArchivo.split(" ")[0]; 

            formData.append("archivo", archivoActualizar);
            formData.append("nombreBase", nombreBase);
            formData.append("tipo", tipo.toUpperCase() || "ISO"); //fallback
            formData.append("carpeta", path || ""); //Fallback

            console.log("FORMDATA:");
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
      setItems(res.data);
      setPath(rutaActual);
    }catch(err){
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(()=>{
    cargar("");
  },[tipo]);

    const abrirHistorial = async(item) => {
        try{

            const res = await api.get(`/calidad/historial`, {
                params: {
                    nombre: item.nombre.split(" ")[0], // 👈 nombreBase disfrazado
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

  return(
    <div className="container-fluid">
      {/* HEADER */}
        <div className="mb-3">

        <h4 className="mb-1 text-uppercase">
            Calidad / {tipo}
        </h4>

        {/*  BREADCRUMB */}
        <div style={{fontSize:"14px"}}>

            <span 
            style={{cursor:"pointer", color:"#2563eb", fontWeight:"500"}}
            onClick={()=>cargar("")}
            >
            {tipo.toUpperCase()}
            </span>

            {partesRuta.map((parte,index)=>(
            <span key={index}>
                {" / "}
                <span
                style={{cursor:"pointer", color:"#2563eb"}}
                onClick={()=>irRuta(index)}
                >
                {parte}
                </span>
            </span>
            ))}

        </div>

        </div>

        {/* CONTROLES DERECHA */}
        <div className="d-flex justify-content-end align-items-center mb-3 gap-2">

        <input
            type="text"
            placeholder="Buscar..."
            className="form-control"
            style={{width:200}}
            value={busqueda}
            onChange={(e)=>setBusqueda(e.target.value)}
        />

        <button className={`btn ${vista==="grid"?"btn-dark":"btn-outline-dark"}`} onClick={()=>setVista("grid")}>
            <FaTh />
        </button>

        <button className={`btn ${vista==="list"?"btn-dark":"btn-outline-dark"}`} onClick={()=>setVista("list")}>
            <FaList />
        </button>

        </div>  

      {/* GRID */}
      {!loading && vista === "grid" && (
        <div className="row">
          {filtrados.map((item,index)=>(
            <div key={index} className="col-md-3 mb-4">
              <div 
                className="card p-3 h-100 shadow-sm"
                style={{cursor:"pointer"}}
                onClick={()=>handleClick(item)}
              >
                <div className="text-center mb-3">
                  {getIcon(item)}
                </div>

                <div className="text-center">
                  <p className="mb-1">{item.nombre}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LISTA */}
      {!loading && vista === "list" && (
        <table className="table table-hover">

            <thead>
            <tr>
                <th>Nombre</th>
                <th>Versión</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
            </tr>
            </thead>

        <tbody>
        {filtrados.map((item,index)=>{

            const esVigente = item.esVigente !== false;

            return(
            <tr key={index}>

                <td className="d-flex align-items-center gap-2">
                {getIcon(item)}
                {item.nombre}
                </td>

                {item.tipo === "carpeta" ? (
                <>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={()=>entrarCarpeta(item.nombre)}
                    >
                        Abrir
                    </button>
                    </td>
                </>
                ) : (
                <>
                    <td>
                    v{item.version ?? 1}

                    {item.version == null && (
                        <span className="badge bg-warning text-dark ms-2">
                        Sin control
                        </span>
                    )}
                    </td>

                    <td>
                    {esVigente ? (
                        <span className="badge bg-success">Vigente</span>
                    ) : (
                        <span className="badge bg-secondary">Obsoleto</span>
                    )}
                    </td>

                    <td>
                    {item.fechaModificacion
                        ? new Date(item.fechaModificacion).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="d-flex gap-2">

                    {esVigente && (
                        <button
                        className="btn btn-sm btn-primary"
                        onClick={()=>handleClick(item)}
                        >
                        Ver
                        </button>
                    )}

                    {esVigente && (
                        <button
                        className="btn btn-sm btn-dark"
                        onClick={()=>descargarArchivo(item)}
                        >
                        Descargar
                        </button>
                    )}

                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={(e)=>{
                                e.stopPropagation();
                                abrirHistorial(item);
                            }}
                        >
                            Historial
                        </button>

                        <button
                            className="btn btn-sm btn-warning"
                            onClick={(e)=>{
                                e.stopPropagation();
                                abrirActualizar(item);
                            }}
                        >
                            Actualizar
                        </button>

                    </td>
                </>
                )}

            </tr>
            );

        })}
        </tbody>

        </table>
        )}

      {/* VISOR PDF */}
      {/* VISOR PDF PRO */}
{pdfUrl && (
  <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>

    <div className="modal-dialog modal-xl modal-dialog-centered">

      <div className="modal-content" style={{ borderRadius: "12px", overflow: "hidden" }}>

        {/* HEADER */}
        <div className="modal-header bg-dark text-white d-flex justify-content-between align-items-center">

          <div>
            <h6 className="mb-0">Vista previa del documento</h6>
            <small style={{ opacity: 0.7 }}>
              Documento controlado - No descargar versiones locales
            </small>
          </div>

          <button
            className="btn-close btn-close-white"
            onClick={() => setPdfUrl(null)}
          />
        </div>

        {/* TOOLBAR */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">

          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            Visualización protegida
          </span>

          <div className="d-flex gap-2">

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() =>
                Swal.fire({
                  icon: "warning",
                  title: "Acción restringida",
                  text: "La descarga está controlada por el sistema",
                })
              }
            >
              Descargar
            </button>

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() =>
                Swal.fire({
                  icon: "warning",
                  title: "Acción restringida",
                  text: "La impresión no está permitida",
                })
              }
            >
              Imprimir
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
            />

            {/* WATERMARK */}
            <div
                style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-20deg)",
                fontSize: "48px",
                color: "rgba(0,0,0,0.08)",
                fontWeight: "bold",
                pointerEvents: "none",
                userSelect: "none"
                }}
            >
                DOCUMENTO CONTROLADO
            </div>

            </div>

        </div>

        </div>
    </div>
    )}  

      {descargando && (
            <div 
                className="modal show d-block"
                style={{background:"rgba(0,0,0,0.5)"}}
            >
                <div className="modal-dialog modal-sm modal-dialog-centered">

                <div className="modal-content text-center p-4">

                    <div className="spinner-border text-primary mb-3" />

                    <p className="mb-0">Descargando documento...</p>

                </div>

                </div>
            </div>
        )}

        {/* Modal actualizar */}
        {showModalActualizar && (
            <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                <div className="modal-content">

                    <div className="modal-header">
                    <h5 className="modal-title">Actualizar documento</h5>
                    <button
                        className="btn-close"
                        onClick={() => setShowModalActualizar(false)}
                    />
                    </div>

                    <div className="modal-body">

                    <p>
                        Documento: <b>{documentoSeleccionado?.nombre}</b>
                    </p>

                    <input
                        type="file"
                        className="form-control"
                        accept="application/pdf"
                        onChange={(e) => setArchivoActualizar(e.target.files[0])}
                    />

                    <small className="text-muted">
                        Se generará automáticamente una nueva versión
                    </small>

                    </div>

                    <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowModalActualizar(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={actualizarDocumento}
                    >
                        Subir nueva versión
                    </button>
                    </div>

                </div>
                </div>
            </div>
            )}

      {/* MODAL HISTORIAL */}

      {modalHistorial && (

  <div 
    className="modal show d-block"
    style={{background:"rgba(0,0,0,0.6)"}}
  >

    <div className="modal-dialog modal-lg">

      <div className="modal-content">

        <div className="modal-header">
          <h5>Historial de versiones</h5>

          <button
            className="btn-close"
            onClick={()=>setModalHistorial(false)}
          />
        </div>

        <div className="modal-body">

          {historial.length === 0 ? (
            <p>No hay historial disponible</p>
          ) : (

            <table className="table table-bordered">

              <thead>
                <tr>
                  <th>Versión</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>

                {historial.map((h,index)=>(
                  <tr key={index}>

                    <td>v{h.version}</td>

                    <td>
                      {new Date(h.fecha).toLocaleDateString()}
                    </td>

                    <td>{h.creadoPor ?? "-"}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={()=>window.open(
                          `${api.defaults.baseURL}/calidad/descargar?path=${encodeURIComponent(h.ruta)}`
                        )}
                      >
                        Ver
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  </div>

)}

    </div>
  );
}