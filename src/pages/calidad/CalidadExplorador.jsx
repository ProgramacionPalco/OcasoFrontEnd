import { useState } from "react";

export default function CalidadExplorador(){

const [ruta,setRuta] = useState("")

const items = [
{nombre:"ISO",tipo:"carpeta"},
{nombre:"OEA",tipo:"carpeta"}
]

return(

<div className="container-fluid">

    <h3 className="mb-4">Calidad (ISO / OEA)</h3>

        {/* Breadcrumb */}

        <div className="mb-3 text-muted">

            <span
            style={{cursor:"pointer"}}
            onClick={()=>setRuta("")}
            >

            Calidad

            </span>

            {ruta && <> / {ruta}</>}

        </div>

    {/* Explorador */}

    <div className="row">

    {items.map((item,index)=>(
        
    <div className="col-md-3 mb-3" key={index}>

    <div
    className="card shadow-sm p-3"
    style={{cursor:"pointer"}}
    onClick={()=>{

    if(item.tipo === "carpeta"){
    setRuta(item.nombre)
    }

    }}
    >

    <div style={{fontSize:40}}>
    {item.tipo === "carpeta" ? "📁" : "📄"}
    </div>

    <div className="mt-2 fw-semibold">

    {item.nombre}

    </div>

    </div>

    </div>

    ))}

    </div>

</div>

)

}