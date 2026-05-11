import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

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

return(

<div className="container mt-4">

    <div className="card shadow-sm">

        <div className="card-body">

            <h4 className="mb-4">
            Reasignar clientes entre ejecutivos
            </h4>

            <div className="row">

                <div className="col-md-6">

                    <label className="form-label">
                        Ejecutivo actual
                    </label>

                    <select
                        className="form-select"
                        value={ejecutivoAnterior}
                        onChange={(e)=>setEjecutivoAnterior(e.target.value)}
                        >

                        <option value="">Seleccione ejecutivo</option>

                        {ejecutivos.map(e=>(
                            <option key={e.id} value={e.id}>
                                {e.nombre}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="col-md-6">

                    <label className="form-label">
                        Nuevo ejecutivo
                    </label>

                    <select
                        className="form-select"
                        value={nuevoEjecutivo}
                        onChange={(e)=>setNuevoEjecutivo(e.target.value)}
                    >

                    <option value="">Seleccione ejecutivo</option>

                        {ejecutivos.map(e=>(
                            <option key={e.id} value={e.id}>
                                {e.nombre}
                            </option>
                        ))}

                    </select>

                </div>

            </div>

            <div className="mt-4">

                <button
                    className="btn btn-danger"
                    onClick={reasignar}
                    >

                    Reasignar clientes

                </button>

            </div>

        </div>

    </div>

</div>

);

}

export default ReasignarClientes;