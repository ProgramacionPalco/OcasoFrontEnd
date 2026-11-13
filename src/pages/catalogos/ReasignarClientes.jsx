import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
    FaExchangeAlt,
    FaUsers,
    FaUserTie,
    FaEnvelope,
    FaArrowRight,
    FaInfoCircle,
    FaExclamationTriangle
} from "react-icons/fa";

function ReasignarClientes() {

const [ejecutivos,setEjecutivos] = useState([]);
const [ejecutivoAnterior,setEjecutivoAnterior] = useState("");
const [nuevoEjecutivo,setNuevoEjecutivo] = useState("");

useEffect(()=>{

cargarEjecutivos();

},[]);

const cargarEjecutivos = async () => {

 const res = await api.get("/catalogos/ejecutivosVentas");
 const ejecutivos = res.data;

 setEjecutivos(ejecutivos);

};


const reasignar = async ()=>{

if(!ejecutivoAnterior || !nuevoEjecutivo){

Swal.fire({
icon:"warning",
title:"Seleccione ambos ejecutivos"
});

return;

}

if(ejecutivoAnterior === nuevoEjecutivo){

Swal.fire({
icon:"warning",
title:"Debe seleccionar ejecutivos diferentes"
});

return;

}

const confirm = await Swal.fire({
title:"¿Reasignar clientes?",
text:"Todos los clientes se moverán al nuevo ejecutivo",
icon:"warning",
showCancelButton:true,
confirmButtonText:"Reasignar"
});

if(!confirm.isConfirmed) return;

try{

await api.post("/altas/clientes/reasignar-ejecutivo",{
ejecutivoAnteriorId: parseInt(ejecutivoAnterior),
nuevoEjecutivoId: parseInt(nuevoEjecutivo)
});

Swal.fire({
icon:"success",
title:"Clientes reasignados correctamente"
});

}
catch(error){

Swal.fire({
icon:"error",
title:"Error",
text:error.response?.data?.message || "No se pudo reasignar"
});

}

};

const nombreCompleto = (e) =>
    `${e?.nombre ?? ""} ${e?.apellidoPaterno ?? ""} ${e?.apellidoMaterno ?? ""}`
        .replace(/\s+/g, " ")
        .trim();

const iniciales = (e) =>
    `${(e?.nombre || "?").trim().charAt(0)}${(e?.apellidoPaterno || "").trim().charAt(0)}`.toUpperCase();

const buscarEjecutivo = (id) =>
    ejecutivos.find((e) => String(e.id) === String(id));

const intercambiar = () => {
    setEjecutivoAnterior(nuevoEjecutivo);
    setNuevoEjecutivo(ejecutivoAnterior);
};

const mismoEjecutivo = ejecutivoAnterior && ejecutivoAnterior === nuevoEjecutivo;

const tarjetaEjecutivo = ({ titulo, descripcion, tono, valor, onChange }) => {
    const seleccionado = buscarEjecutivo(valor);
    return (
        <div className={`rc-tarjeta rc-tarjeta-${tono}`}>
            <span className="rc-etiqueta">{titulo}</span>
            <small className="rc-descripcion">{descripcion}</small>

            <div className="rc-seleccion">
                {seleccionado ? (
                    <>
                        <span className="cliente-avatar rc-avatar">{iniciales(seleccionado)}</span>
                        <div style={{ minWidth: 0 }}>
                            <div className="fw-semibold text-truncate">{nombreCompleto(seleccionado)}</div>
                            {seleccionado.correo && (
                                <div className="rc-correo text-truncate">
                                    <FaEnvelope /> {seleccionado.correo}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <span className="cliente-avatar rc-avatar rc-avatar-vacio"><FaUserTie /></span>
                        <span className="text-muted">Sin seleccionar</span>
                    </>
                )}
            </div>

            <select
                className="form-select"
                value={valor}
                onChange={(e)=>onChange(e.target.value)}
            >

                <option value="">Seleccione ejecutivo</option>

                {ejecutivos.map(e=>(
                    <option key={e.id} value={e.id}>
                        {nombreCompleto(e) || e.nombre}
                    </option>
                ))}

            </select>
        </div>
    );
};

return(

<div className="container-fluid dash">

    {/* ========================= */}
    {/* ENCABEZADO */}
    {/* ========================= */}

    <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
            <span className="dash-eyebrow">Catálogos</span>
            <h2 className="dash-titulo">Reasignar clientes</h2>
            <div className="dash-contexto">
                <span><FaExchangeAlt /> Mueve la cartera de clientes de un ejecutivo a otro</span>
            </div>
        </div>
    </div>

    <div className="dash-panel nc-form p-0 overflow-hidden mb-4 rc-panel">

        <div className="nc-form-header">
            <span className="nc-form-icono"><FaUsers /></span>
            <div>
                <h3 className="nc-form-titulo">Reasignación de cartera</h3>
                <div className="nc-form-sub">Seleccione el ejecutivo actual y el ejecutivo que recibirá los clientes</div>
            </div>
        </div>

        <div className="nc-form-cuerpo">

            <div className="rc-flujo">

                {tarjetaEjecutivo({
                    titulo: "Ejecutivo actual",
                    descripcion: "Entrega sus clientes",
                    tono: "origen",
                    valor: ejecutivoAnterior,
                    onChange: setEjecutivoAnterior
                })}

                <button
                    type="button"
                    className="rc-flecha"
                    title="Intercambiar ejecutivos"
                    aria-label="Intercambiar ejecutivos"
                    onClick={intercambiar}
                >
                    <FaArrowRight className="rc-flecha-icono" />
                    <FaExchangeAlt className="rc-flecha-hover" />
                </button>

                {tarjetaEjecutivo({
                    titulo: "Nuevo ejecutivo",
                    descripcion: "Recibe los clientes",
                    tono: "destino",
                    valor: nuevoEjecutivo,
                    onChange: setNuevoEjecutivo
                })}

            </div>

            {mismoEjecutivo ? (
                <div className="rc-aviso rc-aviso-error">
                    <FaExclamationTriangle />
                    <span>Debe seleccionar ejecutivos diferentes.</span>
                </div>
            ) : (
                <div className="rc-aviso">
                    <FaInfoCircle />
                    <span>
                        <strong>Todos los clientes</strong> del ejecutivo actual se moverán al nuevo ejecutivo.
                        Se pedirá confirmación antes de aplicar el cambio.
                    </span>
                </div>
            )}

        </div>

        <div className="nc-pie justify-content-end">

            <button
                className="btn btn-danger np-btn"
                onClick={reasignar}
                >

                <FaExchangeAlt /> Reasignar clientes

            </button>

        </div>

    </div>

</div>

);

}

export default ReasignarClientes;