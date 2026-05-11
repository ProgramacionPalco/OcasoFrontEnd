import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import ContactoForm from "../../components/ContactoForm";
import MainLayout from "../../layouts/MainLayout";
import UploadDocumentos from "../../components/UploadDocumentos";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { FaUserPlus, FaFileUpload, FaDownload, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");
const FILE_SERVER = "http://192.168.1.234:9099";


const obtenerHistorial = async () => {

const res = await api.get(`/altas/clientes/${id}/historial`);


setEventos(res.data);

};

function DetalleCliente() {

    const { id } = useParams();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [permisos, setPermisos] = useState([]);
    const [historialDocs,setHistorialDocs] = useState([]);
    const [mostrarHistorial,setMostrarHistorial] = useState(false);
    const [resumen, setResumen] = useState({
        contactos: 0,
        documentosSubidos: 0,
        documentosObligatorios: 0,
        porcentajeCompleto: 0
    });
    const [nuevoDoc, setNuevoDoc] = useState({
        idDocumento: "",
        fechaVencimiento: null
    });
    const permisoModulo = (ruta) => {
         return permisos.find(p => p.ruta?.toLowerCase() === ruta.toLowerCase());
    };
    const [modoEdicion, setModoEdicion] = useState(false);
    const [clienteEditado, setClienteEditado] = useState({});
    const [catalogoDocs, setCatalogoDocs] = useState([]);
    const [docsRequeridos, setDocsRequeridos] = useState([]);
    const [tabActiva, setTabActiva] = useState("info");
    const [docPreview, setDocPreview] = useState(null);
    const [eventos, setEventos] = useState([]);
    const tieneContactos = cliente?.contactos?.length > 0;
    const [catalogoEjecutivos, setCatalogoEjecutivos] = useState([]);
    const [catalogoEjecutivosVentas, setCatalogoEjecutivosVentas] = useState([]);
    const [noAplica, setNoAplica] = useState(false);

    const verHistorialDocumento = async (idDocumento)=>{

        try{

            const res = await api.get(
            `/altas/clientes/${id}/documentos/${idDocumento}/historial`
            );

            setHistorialDocs(res.data);
            setMostrarHistorial(true);

        }
        catch(error){

            console.error("Error cargando historial del documento",error);

            Swal.fire({
            icon:"error",
            title:"Error",
            text:"No se pudo cargar el historial del documento"
            });

        }

    };
    const descargarDocumento = (idDocumento)=>{
        window.open(
        `${api.defaults.baseURL}/altas/clientes/documentos/descargar/${idDocumento}`,
        "_blank"
        );
    };
    
    const eliminarDocumento = async (idDocumento) => {

        const confirm = await Swal.fire({
            title: "¿Eliminar documento?",
            text: "El documento se eliminará del expediente",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar"
        });

        if(!confirm.isConfirmed) return;

        try{

            const res = await api.delete(`/altas/clientes/documentos/${idDocumento}`);

            //console.log(res); // para ver la respuesta real

            if(res.status >= 200 && res.status < 300){

                Swal.fire({
                    icon:"success",
                    title:"Documento eliminado"
                });

                await recargarCliente();

            }

        }
        catch(err){

            console.log(err);

            Swal.fire({
                icon:"error",
                title:"Error al eliminar documento",
                text: err.response?.data?.message || "Error inesperado"
            });

        }
    };

    const obtenerDetalle = async () => {
        try {
            const res = await api.get(`/altas/clientes/${id}`);

            setCliente(res.data);
            setClienteEditado({
                ...res.data,
                activo: res.data.activo ?? 1
            }); // ← importante para edición

        } catch (error) {
            console.error("Error cargando detalle", error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstatus = async () => {
        try {
            await api.put(`/altas/clientes/${id}/estatus`, {
                nuevoEstadoId: 3
            });

            alert("Cliente activado correctamente");
            recargarCliente();
        } catch (error) {
            alert(error.response?.data?.message || "No se pudo activar");
        }
    };

    const guardarCambios = async () => {

        try {

            const payload = {

                RFC: clienteEditado.rfc,

                TipoClienteId: clienteEditado.tipoClienteId
                    ? parseInt(clienteEditado.tipoClienteId)
                    : null,

               activo: clienteEditado.activo === 1 ? 1 : 0,

                personaFM: clienteEditado.personaFM,

                calle: clienteEditado.calle,
                numero: clienteEditado.numero,
                numeroInterior: clienteEditado.numeroInterior,
                colonia: clienteEditado.colonia,
                cp: clienteEditado.cp,
                ciudad: clienteEditado.ciudad,
                estado: clienteEditado.estado,
                pais: clienteEditado.pais,

                idEjecutivo: clienteEditado.idEjecutivo
                    ? parseInt(clienteEditado.idEjecutivo)
                    : null,

                ejecutivoVentaId: clienteEditado.ejecutivoVentaId
                    ? parseInt(clienteEditado.ejecutivoVentaId)
                    : null,

                servicioPalco: clienteEditado.servicioPalco ?? 0,
                servicioSLP: clienteEditado.servicioSLP ?? 0,
                servicioMAYA: clienteEditado.servicioMAYA ?? 0,
                servicioOla: clienteEditado.servicioOla ?? 0,

                idRazon: clienteEditado.idRazon ?? 1

            };

            //console.log("Payload enviado:", payload);

            await api.put(`/altas/clientes/${id}`, payload);

            await recargarCliente();

            setModoEdicion(false);

            Swal.fire({
                icon: "success",
                title: "Cliente actualizado",
                text: "La información del cliente se guardó correctamente.",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Aceptar"
            });

        } catch (error) {

            //console.error("Error actualización:", error.response?.data);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el cliente.",
                confirmButtonColor: "#d33"
            });

        }

    };

    const obtenerResumen = async () => {
        try {
            const res = await api.get(`/altas/clientes/${id}/resumen`);
            setResumen(res.data);
        } catch (error) {
            console.error("Error cargando resumen", error);
        }
    };
    const verDocumento = (ruta) => {
        const url = `${import.meta.env.VITE_API_URL}/documentos/ver?ruta=${encodeURIComponent(ruta)}`;
        window.open(url, "_blank");
    };

    const obtenerCatalogoDocs = async () => {
        try {
            const res = await api.get("/catalogos/documentos?page=1&pageSize=100")
            setCatalogoDocs(res.data.data);
        } catch (error) {
            console.error("Error cargando catálogo documentos", error);
        }
    };

    const obtenerDocsRequeridos = async () => {
        try {
            const res = await api.get(`/altas/clientes/${id}/documentos-requeridos`);
            setDocsRequeridos(res.data);
        } catch (error) {
            console.error("Error cargando documentos requeridos", error);
        }
    };

    const recargarCliente = async () => {

        const [clienteRes, resumenRes, docsReqRes] = await Promise.all([
            api.get(`/altas/clientes/${id}`),
            api.get(`/altas/clientes/${id}/resumen`),
            api.get(`/altas/clientes/${id}/documentos-requeridos`)
        ]);

        setCliente(clienteRes.data);
        setClienteEditado(clienteRes.data);
        setResumen(resumenRes.data);
        setDocsRequeridos(docsReqRes.data);

    };

    const cargarHistorial = async () => {
        try {

            const res = await api.get(`/altas/clientes/${id}/historial`);

            setEventos(res.data);

        } catch (error) {

            console.error("Error cargando historial", error);

        }
    };

    useEffect(() => {

        const cargarDatos = async () => {

            try {

                const [
                    clienteRes,
                    resumenRes,
                    docsRes,
                    requeridosRes,
                    ejecutivosRes,
                    ejecutivosVentasRes,
                    permisosRes
                ] = await Promise.all([
                    api.get(`/altas/clientes/${id}`),
                    api.get(`/altas/clientes/${id}/resumen`),
                    api.get("/catalogos/documentos?page=1&pageSize=100"),
                    api.get(`/altas/clientes/${id}/documentos-requeridos`),
                    api.get("/catalogos/ejecutivos"),
                    api.get("/catalogos/ejecutivosVentas"),
                    api.get("/seguridad/mis-permisos")
                ]);

                setCliente(clienteRes.data);
                setClienteEditado(clienteRes.data);
                setResumen(resumenRes.data);
                setCatalogoDocs(docsRes.data.data);
                setDocsRequeridos(requeridosRes.data);
                setCatalogoEjecutivos(ejecutivosRes.data);
                setCatalogoEjecutivosVentas(ejecutivosVentasRes.data);
                setPermisos(permisosRes.data);

            } catch (error) {

                console.error("Error cargando datos", error);

            } finally {

                setLoading(false);

            }

        };

        cargarDatos();

    }, [id]); 

    if (loading) return <p>Cargando...</p>;
    if (!cliente) return <p>No se encontró el cliente.</p>;

    return (
        <div className="container-fluid">

            {/* HEADER */}
            {/* TARJETA PRINCIPAL DEL CLIENTE */}
            <div className="card shadow-sm mb-4">
                <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
                <div>
                <h3 className="mb-1">{cliente.razonSocial}</h3>
                <div className="d-flex gap-2 mt-2 flex-wrap">

                <span className="badge bg-dark">
                RFC: {cliente.rfc}
                </span>

                <span className={`badge ${cliente.estadoClienteId === 3 ? "bg-success" : "bg-secondary"}`}>
                {cliente.estadoClienteId === 3 ? "Activo" : "Borrador"}
                </span>

                <span className={`badge ${cliente.personaFM === "F" ? "bg-info" : "bg-dark"}`}>
                {cliente.personaFM === "F" ? "Persona Física" : "Persona Moral"}
                </span>

                </div>

                </div>

                <div className="text-end">

                <div className="text-muted small">Ejecutivo de altas</div>

                <div className="fw-bold">

                {modoEdicion ? (

                <select
                className="form-select"
                value={clienteEditado.ejecutivoVentaId || ""}
                onChange={(e)=>
                setClienteEditado({
                ...clienteEditado,
                ejecutivoVentaId: e.target.value
                })
                }
                >

                <option value="">No asignado</option>

                {catalogoEjecutivosVentas.map(e=>(
                <option key={e.id} value={e.id}>
                {e.nombre}
                </option>
                ))}

                </select>

                ) : (

                <span>
                {cliente.ejecutivoNombreVenta || "No asignado"}
                </span>

                )}

                </div>

                </div>

                </div>

                {cliente.estadoClienteId !== 3 && (

                <div className="card-footer bg-light text-end">

                <button
                className="btn btn-success"
                onClick={cambiarEstatus}
                >
                Activar Cliente
                </button>

                </div>

                )}

            </div>

            {/* ALERTA CONTACTOS */}
            {!tieneContactos && (

                <div className="alert alert-warning d-flex align-items-center mb-4">
                    <div className="me-2">⚠</div>
                    <div>
                        <strong>Cliente incompleto. </strong>  
                        Debe registrar al menos un contacto para continuar con el expediente.
                    </div>
                </div>
            )}
            
            {/* Pestañas */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActiva === "info" ? "active" : ""}`}
                        onClick={() => setTabActiva("info")}
                    >
                        Información
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActiva === "contactos" ? "active" : ""}`}
                        onClick={() => setTabActiva("contactos")}
                    >
                        Contactos
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActiva === "documentos" ? "active" : ""}`}
                        onClick={() => setTabActiva("documentos")}
                    >
                        Documentos
                    </button>
                </li>
                <li className="nav-item">
                    <button
                    className={`nav-link ${tabActiva === "historial" ? "active" : ""}`}
                    onClick={() => {

                    setTabActiva("historial");
                    cargarHistorial();

                    }}
                    >
                    Historial
                    </button>
                </li>
            </ul>

            {/* PANEL DE ACCIONES RÁPIDAS */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap">

                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                setTabActiva("contactos");
                                setMostrarForm(true);
                                }}
                                >
                                <FaUserPlus className="me-2"/>
                                Nuevo contacto
                            </button>

                                <button
                                    className="btn btn-dark"
                                    disabled={!tieneContactos}
                                    onClick={() => {

                                    if(!tieneContactos){

                                    Swal.fire({
                                    icon:"warning",
                                    title:"Contacto requerido",
                                    text:"Debe registrar al menos un contacto antes de subir documentos."
                                    })

                                    return
                                    }

                                    setTabActiva("documentos")

                                    }}
                                >
                                <FaFileUpload className="me-2"/>
                                Subir documento
                            </button>

                            <button
                                className="btn btn-success"
                                onClick={() => window.print()}
                                >
                                <FaDownload className="me-2"/>
                                Descargar expediente
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                setTabActiva("historial");
                                cargarHistorial();
                                }}
                                >
                                <FaHistory className="me-2"/>
                                Historial
                            </button>

                        </div>
                </div>
            </div>

            {/*TabInformación*/}
            {tabActiva === "info" && (
            <>
                {resumen && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h5 className="mb-3">Resumen del Expediente</h5>
                            {/* PROGRESO */}
                            <div className="progress mb-4" style={{ height: "30px" }}>

                                <div
                                    className={`progress-bar ${
                                    resumen.porcentajeCompleto >= 80
                                    ? "bg-success"
                                    : resumen.porcentajeCompleto >= 50
                                    ? "bg-warning"
                                    : "bg-danger"
                                    }`}
                                    style={{ width: `${resumen.porcentajeCompleto}%` }}
                                    >

                                    {resumen.porcentajeCompleto}% Expediente completo
                                </div>
                            </div>

                            {/* INDICADORES */}
                            <div className="row text-center">
                                <div className="col-md-4 border-end">
                                    <div className="fs-3 fw-bold">
                                        {resumen.contactos}
                                    </div>
                                    <div className="text-muted">
                                        Contactos
                                    </div>
                                </div>

                                <div className="col-md-4 border-end">
                                    <div className="fs-3 fw-bold">
                                        {resumen.documentosSubidos} / {resumen.documentosObligatorios}
                                    </div>
                                    <div className="text-muted">
                                        Documentos
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="fs-3 fw-bold text-danger">
                                        {resumen.documentosVencidos ?? 0}
                                    </div>
                                    <div className="text-muted">
                                        Vencidos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* INFORMACIÓN GENERAL */}
                <div className="card shadow-sm p-4 mb-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                    <h5 className="mb-0">Información General</h5>

                    {!modoEdicion && permisoModulo("/clientes")?.puedeEditar && (

                        <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={()=>setModoEdicion(true)}
                        >
                        Editar
                        </button>

                        )}

                        {modoEdicion && (

                        <div className="d-flex gap-2">

                        <button
                        className="btn btn-success btn-sm"
                        onClick={guardarCambios}
                        >
                        Guardar
                        </button>

                        <button
                        className="btn btn-secondary btn-sm"
                        onClick={()=>{
                        setModoEdicion(false);
                        setClienteEditado(cliente);
                        }}
                        >
                        Cancelar
                        </button>

                        </div>

                    )}
                    

                    </div>

                    <div className="row mb-4">

                        <div className="col-md-3">
                            <strong>RFC</strong>
                            {modoEdicion ? (

                                <input
                                className="form-control"
                                value={clienteEditado.rfc || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                rfc:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.rfc}</div>

                            )}
                        </div>

                        <div className="col-md-3">
                            <strong>Tipo de operaciones</strong>
                            {modoEdicion ? (

                                <select
                                className="form-select"
                                value={clienteEditado.tipoClienteId || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                tipoClienteId: e.target.value
                                })
                                }
                                >

                                <option value="1">Importación</option>
                                <option value="2">Exportación</option>
                                <option value="3">Ambos</option>

                                </select>

                                ) : (

                                <div>
                                    {
                                    cliente.tipoClienteId === 1 ? "Importación" :
                                    cliente.tipoClienteId === 2 ? "Exportación" :
                                    cliente.tipoClienteId === 3 ? "Ambos" :
                                    "-"
                                    }
                                </div>

                            )}
                        </div>

                        <div className="col-md-3">
                            <strong>Estado</strong>
                            <div>
                                {modoEdicion ? (

                                    <input
                                        type="checkbox"
                                        checked={clienteEditado.activo === 1}
                                        onChange={(e) =>
                                            setClienteEditado({
                                                ...clienteEditado,
                                                activo: e.target.checked ? 1 : 0
                                            })
                                        }
                                    />

                                    ) : (

                                    <span className={`badge px-3 py-2 ${
                                    cliente.servicioPalco === 1 ? "bg-success" : "bg-secondary"
                                    }`}>
                                    {cliente.servicioPalco === 1 ? "Activo" : "Sin servicio"}
                                    </span>

                                )}
                            </div>
                        </div>

                        <div className="col-md-3">
                            <strong>Tipo de cliente</strong>
                            <div>
                                {modoEdicion ? (

                                    <select
                                    className="form-select"
                                    value={clienteEditado.personaFM || ""}
                                    onChange={(e)=>
                                    setClienteEditado({
                                    ...clienteEditado,
                                    personaFM:e.target.value
                                    })
                                    }
                                    >

                                    <option value="M">Persona Moral</option>
                                    <option value="F">Persona Física</option>

                                    </select>

                                    ) : (

                                    <span className={`badge ${cliente.personaFM === "F" ? "bg-info" : "bg-dark"}`}>
                                    {cliente.personaFM === "F" ? "Persona Física" : "Persona Moral"}
                                    </span>

                                )}
                            </div>
                        </div>

                    </div>

                    <hr/>

                    <h6 className="mb-3">Dirección</h6>

                    <div className="row">

                        <div className="col-md-4">
                            <strong>Calle</strong>
                            {modoEdicion ? (

                                <input
                                className="form-control"
                                value={clienteEditado.calle || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                calle:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.calle ?? "-"}</div>

                            )}
                        </div>

                        <div className="col-md-2">
                            <strong>Número Exterior</strong>
                            {modoEdicion ? (

                                <input
                                className="form-control"
                                value={clienteEditado.numero || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                numero:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.numero ?? "-"}</div>

                            )}
                        </div>

                        <div className="col-md-2">
                            <strong>Número Interior</strong>
                            {modoEdicion ? (

                                <input
                                className="form-control"
                                value={clienteEditado.numeroInterior || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                numeroInterior:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.numeroInterior ?? "-"}</div>

                            )}
                        </div>

                        <div className="col-md-4">
                            <strong>Colonia</strong>
                            {modoEdicion ? (

                                <input
                                className="form-control"
                                value={clienteEditado.colonia || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                colonia:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.colonia ?? "-"}</div>

                            )}
                        </div>

                        <div className="col-md-3">
                            <strong>Código Postal</strong>
                            {modoEdicion ? (

                                <input
                                className="form-control"
                                value={clienteEditado.cp || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                cp:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.cp ?? "-"}</div>

                            )}
                        </div>

                        <div className="col-md-3">
                            <strong>Ciudad</strong>
                            {modoEdicion ? (
                            <input
                                className="form-control"
                                value={clienteEditado.ciudad || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                ciudad:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.ciudad ?? "-"}</div>
                            )}
                        </div>

                        <div className="col-md-3">
                            <strong>Estado</strong>
                            {modoEdicion ? (
                            <input
                                className="form-control"
                                value={clienteEditado.estado || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                estado:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.estado ?? "-"}</div>
                            )}
                        </div>

                        <div className="col-md-3">
                            <strong>País</strong>
                            {modoEdicion ? (
                            <input
                                className="form-control"
                                value={clienteEditado.pais || ""}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                pais:e.target.value
                                })
                                }
                                />

                                ) : (

                                <div>{cliente.pais ?? "-"}</div>
                            )}
                        </div>

                    </div>

                </div>

                {/* INFORMACIÓN PROCESOS PALCO */}
                <div className="card shadow-sm p-4 mb-4">
                    <h5 className="mb-4">Información procesos Grupo Palco</h5>

                    <div className="row mb-4">

                        {/* EJECUTIVO OPERACIONES */}
                        <div className="col-md-6">

                            <strong>Ejecutivo de operaciones</strong>

                            <div className="d-flex align-items-center mt-2">

                                <div
                                style={{
                                width:"45px",
                                height:"45px",
                                borderRadius:"50%",
                                background:"#3A3839",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                fontWeight:"bold",
                                color:"#fff"
                                }}
                                >
                                {cliente.ejecutivoNombreOp?.charAt(0) || "?"}
                                </div>

                                <div className="ms-3">

                                {modoEdicion ? (

                                <select
                                className="form-select"
                                value={clienteEditado.idEjecutivo || ""}
                                    onChange={(e)=>
                                    setClienteEditado({
                                    ...clienteEditado,
                                    idEjecutivo: parseInt(e.target.value)
                                    })
                                    }
                                >

                                <option value="">No asignado</option>

                                {catalogoEjecutivos.map(e=>(
                                <option key={e.id} value={e.id}>
                                {e.nombre}
                                </option>
                                ))}

                                </select>

                                ) : (

                                <>
                                <div className="fw-bold">
                                {cliente.ejecutivoNombreOp || "No asignado"}
                                </div>

                                <div className="text-muted small">
                                Ejecutivo de operaciones
                                </div>
                                </>

                                )}

                                </div>

                            </div>

                        </div>


                        {/* EJECUTIVO ALTAS */}
                        <div className="col-md-6">

                            <strong>Ejecutivo de altas</strong>

                            <div className="d-flex align-items-center mt-2">

                                <div
                                    style={{
                                        width:"45px",
                                        height:"45px",
                                        borderRadius:"50%",
                                        background:"#FFCC33",
                                        display:"flex",
                                        alignItems:"center",
                                        justifyContent:"center",
                                        fontWeight:"bold",
                                        color:"#3A3839"
                                    }}
                                >
                                    {cliente.ejecutivoNombreVenta?.charAt(0) || "?"}
                                </div>

                                <div className="ms-3">

                                    <div className="fw-bold">
                                        {modoEdicion ? (

                                            <select
                                            className="form-select"
                                            value={clienteEditado.ejecutivoVentaId || ""}
                                            onChange={(e)=>
                                            setClienteEditado({
                                            ...clienteEditado,
                                            ejecutivoVentaId: parseInt(e.target.value)
                                            })
                                            }
                                            >

                                            <option value="">No asignado</option>

                                            {catalogoEjecutivosVentas.map(e=>(
                                            <option key={e.id} value={e.id}>
                                            {e.nombre}
                                            </option>
                                            ))}

                                            </select>

                                            ) : (

                                            <div className="fw-bold">
                                            {cliente.ejecutivoNombreVenta || "No asignado"}
                                            </div>

                                        )}
                                    </div>

                                    <div className="text-muted small">
                                        Ejecutivo de altas
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                     
                    <hr/>

                    <h6 className="mb-3">Empresas con las que tiene servicios</h6>

                    <div className="row mb-4">

                        <div className="col-md-3">
                            <strong>Palco Consorcio</strong>
                            <div>
                            {modoEdicion ? (

                                <div className="form-check form-switch">

                                <input
                                className="form-check-input"
                                type="checkbox"
                                checked={clienteEditado.servicioPalco === 1}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                servicioPalco: e.target.checked ? 1 : 0
                                })
                                }
                                />

                                <label className="form-check-label">
                                Palco Consorcio
                                </label>

                                </div>

                                ) : (

                                <span className={`badge px-3 py-2 ${
                                cliente.servicioPalco === 1 ? "bg-success" : "bg-secondary"
                                }`}>
                                {cliente.servicioPalco === 1 ? "Activo" : "Sin servicio"}
                                </span>

                            )}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <strong>Servicios Logisticos Palco</strong>
                            <div>
                                <div className="form-check form-switch">

                                <input
                                className="form-check-input"
                                type="checkbox"
                                checked={clienteEditado.servicioSLP === 1}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                servicioSLP: e.target.checked ? 1 : 0
                                })
                                }
                                />

                                <label className="form-check-label">
                                Servicios Logísticos Palco
                                </label>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <strong>S.G.L. Maya</strong>
                            <div>
                                <div className="form-check form-switch">

                                <input
                                className="form-check-input"
                                type="checkbox"
                                checked={clienteEditado.servicioMAYA === 1}
                                onChange={(e)=>
                                setClienteEditado({
                                ...clienteEditado,
                                servicioMAYA: e.target.checked ? 1 : 0
                                })
                                }
                                />

                                <label className="form-check-label">
                                S.G.L. Maya
                                </label>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <strong>Ola Logistics</strong>
                            <div>
                                <div className="form-check form-switch">

                                    <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={clienteEditado.servicioOla === 1}
                                    onChange={(e)=>
                                    setClienteEditado({
                                    ...clienteEditado,
                                    servicioOla: e.target.checked ? 1 : 0
                                    })
                                    }
                                    />

                                    <label className="form-check-label">
                                    Ola Logistics
                                    </label>

                                    </div>
                            </div>
                        </div>

                    </div>

                </div>
            </>
            )}

            {/*TabContactos*/}
            {tabActiva === "contactos" && (
                <>
                    {/* CONTACTOS */}
                    <div className="card p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Contactos</h5>

                            {permisoModulo("/clientes")?.puedeCrear && (

                            <button
                            className="btn btn-primary"
                            onClick={() => setMostrarForm(true)}
                            >
                            + Agregar Contacto
                            </button>

                            )}
                        </div>

                        {mostrarForm && (
                            <ContactoForm
                                clienteId={id}
                                onClose={() => setMostrarForm(false)}
                                onSuccess={() => {
                                    recargarCliente();
                                    setMostrarForm(false);
                                }}
                            />
                        )}

                        {cliente.contactos?.length === 0 ? (
                            <p>No hay contactos.</p>
                        ) : (
                            <table className="table table-bordered table-striped">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Teléfono Ofi</th>
                                        <th>Ext</th>
                                        <th>Celular</th>
                                        <th>Área</th>
                                        <th>Puesto</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {cliente.contactos.map((c) => (
                                <tr key={c.id}>
                                <td>{c.nombreContacto}</td>
                                <td>{c.correoContacto}</td>
                                <td>{c.numeroOficina}</td>
                                <td>{c.ext}</td>
                                <td>{c.telefonoContacto}</td>
                                <td>{c.area}</td>
                                <td>{c.puesto}</td>
                                <td>
                                    {permisoModulo("/clientes")?.puedeEliminar && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={async ()=>{

                                        const confirm = await Swal.fire({
                                        title:"Eliminar contacto",
                                        text:"¿Desea eliminar este contacto?",
                                        icon:"warning",
                                        showCancelButton:true,
                                        confirmButtonText:"Eliminar",
                                        cancelButtonText:"Cancelar"
                                        })

                                        if(!confirm.isConfirmed) return

                                        try{

                                        await api.delete(`/altas/clientes/contactos/${c.id}`)

                                        await recargarCliente()

                                        Swal.fire({
                                        icon:"success",
                                        title:"Contacto eliminado"
                                        })


                                        }
                                        catch{

                                        Swal.fire({
                                        icon:"error",
                                        title:"Error",
                                        text:"No se pudo eliminar el contacto"
                                        })

                                        }

                                        }}
                                        >

                                        🗑 Eliminar

                                    </button>
                                    )}
                                </td>

                                </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/*TabDocumentos*/}
            {tabActiva === "documentos" && (
                <>

                    {/* AGREGAR DOCUMENTO */}
                    <div className="card p-3 mb-4">

                        <h5>Agregar Documento</h5>

                        <select
                            className="form-select mb-2"
                            value={nuevoDoc.idDocumento}
                            onChange={(e)=>
                            setNuevoDoc({...nuevoDoc,idDocumento:e.target.value})
                            }
                        >

                            <option value="">Seleccione documento</option>

                            {catalogoDocs.map(doc=>(
                            <option key={doc.id} value={doc.id}>
                            {doc.nombreDocumento}
                            </option>
                            ))}

                        </select>

                        <input
                            type="date"
                            className="form-control mb-3"
                            onChange={(e)=>
                            setNuevoDoc({...nuevoDoc,fechaVencimiento:e.target.value})
                            }
                        />

                        <div className="form-check mb-2">

                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="noAplica"
                                checked={noAplica}
                                onChange={(e) => setNoAplica(e.target.checked)}
                            />

                            <label className="form-check-label">
                                Documento no aplica (generar justificación)
                            </label>

                        </div>

                        {!modoEdicion && permisoModulo("/clientes")?.puedeEditar && (
                                                    
                            <UploadDocumentos
                                clienteId={id}
                                idDocumento={nuevoDoc.idDocumento}
                                fechaVencimiento={nuevoDoc.fechaVencimiento}
                                noAplica={noAplica}
                                onUploadComplete={()=>{
                                recargarCliente();
                                setNuevoDoc({
                                idDocumento:"",
                                fechaVencimiento:""
                                });
                                    setNoAplica(false);
                                }}
                            />
                        )}
                        
                    </div>

                    {/* DOCUMENTOS SUBIDOS */}
                    <div className="card p-3 mb-4">
                        <h5>Documentos Subidos</h5>

                        {cliente.documentos?.length === 0 ? (
                            <p>No hay documentos.</p>
                        ) : (
                            <table className="table table-bordered table-striped">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Documento</th>
                                        <th>Vencimiento</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cliente.documentos.map((d) => (
                                        <tr key={d.id}>
                                            <td className="fw-semibold">{d.nombreDocumento ?? `Documento ${d.idDocumento}`}</td>
                                            <td>
                                                {d.fechaVencimiento
                                                    ? new Date(d.fechaVencimiento).toLocaleDateString()
                                                    : "Sin vencimiento"}
                                            </td>
                                            <td>
                                                {d.noAplica ? (
                                                    <span className="badge text-dark" style={{
                                                        background:"rgb(223, 233, 138)",
                                                        color:"white"
                                                        }}>
                                                        ⚠ Justificado
                                                    </span>
                                                    ) : (
                                                    <span className="badge bg-success">
                                                        Documento vigente
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary me-2"
                                                    onClick={() => {

                                                        const url = `${api.defaults.baseURL}/documentos/ver?ruta=${encodeURIComponent(d.rutaDocumento)}`;

                                                        const extension = d.rutaDocumento.split('.').pop().toLowerCase();

                                                        if(extension === "pdf"){
                                                            setDocPreview(url);
                                                        }
                                                        else if(extension === "doc" || extension === "docx" || extension === "xls" || extension === "xlsx"){

                                                            window.open(`${api.defaults.baseURL}/altas/clientes/documentos/descargar/${d.id}`, "_blank");

                                                        }
                                                        else{
                                                            window.open(url, "_blank");
                                                        }

                                                    }}
                                                    >
                                                    Ver
                                                </button>
                                                <a
                                                    className="btn btn-sm btn-dark me-2"
                                                    href={`${api.defaults.baseURL}/altas/clientes/documentos/descargar/${d.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    >
                                                    Descargar
                                                </a>
                                                

                                                {!modoEdicion && permisoModulo("/clientes")?.puedeEditar && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={()=>eliminarDocumento(d.id)}
                                                        >
                                                        Eliminar
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => verHistorialDocumento(d.idDocumento)}
                                                    
                                                    >
                                                    Historial
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* DOCUMENTOS REQUERIDOS */}
                    <div className="card p-3">
                        <h5 className="mb-3">
                            Documentos Requeridos ({docsRequeridos.length})
                        </h5>
                        <div className="row">
                            {docsRequeridos.map((doc) => {
                                let icono;
                                let color;
                                let estado;
                                if (doc.vencido) {
                                    icono = <FaTimesCircle />;
                                    color = "danger";
                                    estado = "Vencido";
                                } 
                                else if (doc.subido) {
                                    icono = <FaCheckCircle />;
                                    color = "success";
                                    estado = "Subido";
                                } 
                                else {
                                    icono = <FaClock />;
                                    color = "secondary";
                                    estado = "Pendiente";
                                }
                                return (
                                    <div className="col-md-4 mb-3" key={doc.id}>
                                        <div className={`card border-${color}`}>
                                            <div className="card-body d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-semibold">{doc.nombre}</div>
                                                    <small className="text-muted">{estado}</small>
                                                </div>
                                                <div className={`text-${color}`} style={{fontSize:"20px"}}>
                                                    {icono}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
            {/*TabHistorial*/}
            {tabActiva === "historial" && (

            <div className="card p-4">

            <h5 className="mb-4">Historial del Expediente</h5>

            {eventos.length === 0 ? (

            <p className="text-muted">No hay movimientos registrados.</p>

            ) : (

            <div className="timeline-container">

            {eventos.map((e,index)=>{

            let icon="📄";
            let color="#0d6efd";

            if(e.tipo==="contacto"){
            icon="👤";
            color="#6f42c1";
            }

            if(e.tipo==="cliente"){
            icon="✔";
            color="#198754";
            }

            return(

            <div key={index} className="timeline-row">

            <div className="timeline-dot" style={{background:color}}>
            {icon}
            </div>

            <div className="timeline-card">

            <div className="d-flex justify-content-between">

            <div className="fw-semibold">
            {e.texto}
            </div>

            <small className="text-muted">
            {dayjs(e.fecha).fromNow()}
            </small>

            </div>

            <div className="text-muted small mt-1">

            <span className="timeline-user">
            {e.usuario?.charAt(0).toUpperCase()}
            </span>

            {e.usuario}

            </div>

            </div>

            </div>

            )

            })}

            </div>

            )}

            </div>

            )}

            {mostrarHistorial && (

                <div className="modal fade show d-block" style={{background:"rgba(0,0,0,0.5)"}}>
                <div className="modal-dialog modal-lg">
                <div className="modal-content">

                <div className="modal-header">
                <h5>Historial del documento</h5>

                <button
                className="btn-close"
                onClick={()=>setMostrarHistorial(false)}
                ></button>

                </div>

                <div className="modal-body">

                <table className="table">

                <thead>
                <tr>
                <th>Versión</th>
                <th>Fecha subida</th>
                <th>Vence</th>
                <th>Usuario</th>
                <th></th>
                </tr>
                </thead>

                <tbody>

                {historialDocs.map((doc,index)=>(
                <tr key={doc.id}>

                <td>v{historialDocs.length-index}</td>

                <td>
                {new Date(doc.creadoEn).toLocaleDateString()}
                </td>

                <td>
                {doc.fechaVencimiento
                ? new Date(doc.fechaVencimiento).toLocaleDateString()
                : "-"
                }
                </td>

                <td>{doc.creadoPor}</td>

                <td>

                <button
                className="btn btn-primary btn-sm"
                onClick={()=>descargarDocumento(doc.id)}
                >
                Descargar
                </button>

                </td>

                </tr>
                ))}

                </tbody>

                </table>

                </div>

                </div>
                </div>
                </div>

                )}

            {docPreview && (

                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Vista previa del documento</h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setDocPreview(null)}
                                ></button>
                            </div>

                            <div className="modal-body" style={{ height: "80vh" }}>

                                <iframe
                                    src={docPreview}
                                    width="100%"
                                    height="100%"
                                    style={{ border: "none" }}
                                    title="Documento"
                                />

                            </div>

                        </div>
                    </div>
                </div>

            )}
        </div>
        

    );
}

export default DetalleCliente;