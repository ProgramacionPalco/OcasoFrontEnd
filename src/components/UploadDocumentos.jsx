import { useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "../services/api";
import Swal from "sweetalert2";

export default function UploadDocumentos({
  clienteId,
  idDocumento,
  fechaVencimiento,
  noAplica,
  onUploadComplete
}) {

  const [files,setFiles] = useState([]);
  const [progress,setProgress] = useState(0);
  const [subiendo,setSubiendo] = useState(false);

  const onDrop = (acceptedFiles) => {

  if(noAplica) return;

  const nuevos = acceptedFiles.map(file => ({
  file,
  preview: URL.createObjectURL(file)
  }));

  setFiles(prev => [...prev,...nuevos]);

};

const {getRootProps,getInputProps,isDragActive} = useDropzone({
    onDrop,
    multiple:true,
    disabled:noAplica,
    accept:{
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-excel": [".xls"]
  }
});

const subirArchivos = async () => {

  if(!clienteId){
    Swal.fire("Error","Cliente inválido","error");
    return;
  }

  if(!idDocumento){
    Swal.fire("Seleccione el tipo de documento");
    return;
  }

  if(!noAplica && files.length === 0){
    Swal.fire("Seleccione al menos un archivo");
    return;
  }

setSubiendo(true);

try{

// CASO JUSTIFICACIÓN
if(noAplica){

const formData = new FormData();

formData.append("idDocumento",idDocumento);
formData.append("fechaVencimiento", fechaVencimiento || "");
formData.append("noAplica",true);

await api.post(`/altas/clientes/${clienteId}/documentos`,formData);

Swal.fire({
icon:"success",
title:"Justificación generada correctamente"
});

}

// CASO DOCUMENTO NORMAL
else{

for(const item of files){

const formData = new FormData();

formData.append("Archivo",item.file);
formData.append("idDocumento",idDocumento);
formData.append("fechaVencimiento",fechaVencimiento || "");
formData.append("noAplica",false);

await api.post(`/altas/clientes/${clienteId}/documentos`,formData,{
headers:{
"Content-Type":"multipart/form-data"
},
onUploadProgress:(p)=>{

if(!p.total) return;

const porcentaje = Math.round((p.loaded * 100)/p.total);
setProgress(porcentaje);

}
});

}

Swal.fire({
icon:"success",
title:"Documentos subidos correctamente"
});

}

// limpiar previews
files.forEach(f => URL.revokeObjectURL(f.preview));

setFiles([]);
setProgress(0);

if(onUploadComplete)
onUploadComplete();

}
catch(err){

Swal.fire({
icon:"error",
title:"Error al subir archivo",
text: err.response?.data?.message || "No se pudo subir el documento"
});

}

setSubiendo(false);

};

const eliminarArchivo = (index) => {

const copia = [...files];

URL.revokeObjectURL(copia[index].preview);

copia.splice(index,1);

setFiles(copia);

};

return (

<div>

<div
{...getRootProps()}
style={{
border:"2px dashed #999",
padding:"25px",
textAlign:"center",
borderRadius:"10px",
cursor:noAplica ? "not-allowed":"pointer",
background:isDragActive ? "#f5f5f5":"white",
opacity:noAplica ? 0.5 : 1
}}
>

<input {...getInputProps()} />

{noAplica
? <p>Documento marcado como "No aplica"</p>
: isDragActive
? <p>Suelta los archivos aquí...</p>
: <p>Arrastra archivos aquí o haz click para seleccionar</p>
}

</div>

{!noAplica && files.length > 0 && (

<div style={{marginTop:"20px"}}>

<h6>Archivos seleccionados</h6>

{files.map((item,index)=>(

<div
key={index}
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"10px",
border:"1px solid #ddd",
padding:"10px",
borderRadius:"6px"
}}
>

<span>{item.file.name}</span>

<button
className="btn btn-danger btn-sm"
onClick={()=>eliminarArchivo(index)}
>
Eliminar
</button>

</div>

))}

</div>

)}

{progress > 0 && (

<div className="progress mt-3">

<div
className="progress-bar progress-bar-striped progress-bar-animated"
style={{width:progress+"%"}}
>

{progress}%

</div>

</div>

)}

<button
className="btn btn-primary mt-3"
onClick={subirArchivos}
disabled={subiendo}
>

{subiendo ? "Procesando..." : noAplica ? "Generar justificación" : "Subir documentos"}

</button>

</div>

);

}