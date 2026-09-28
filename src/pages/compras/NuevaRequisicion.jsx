import { useEffect, useState } from "react";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";

export default function NuevaRequisicion() {

    const [empresas,setEmpresas]=useState([]);
    const [departamentos,setDepartamentos]=useState([]);
    const [categorias,setCategorias]=useState([]);
    const [clasificaciones,setClasificaciones]=useState([]);
    const [documentos,setDocumentos]=useState([]);
    const esMovil = window.innerWidth < 768;

    const [detalles,setDetalles]=useState([
        {
            cantidad:1,
            concepto:"",
            precioUnitario:0,
            iva:0,
            total:0
        }
    ]);

    const token = localStorage.getItem("token");

    let nombreCompleto = "";

    if(token){

        try{

            const payload = JSON.parse(
                atob(
                    token.split(".")[1]
                )
            );

            nombreCompleto =
                `${payload.Nombre || ""} ${payload.Apellidos || ""}`.trim();

        }
        catch{

            nombreCompleto = "";

        }

    }

    const [form,setForm]=useState({

        empresa:"",
        departamento:"",
        categoria:"",
        clasificacionPoliza:"",
        descripcion:"",
        comentarios:"",

        proveedor:"",
        iva:8,
        tipocambio:"MXN",

    solicitanteNombre: nombreCompleto,

        fecha:
            new Date()
            .toISOString()
            .split("T")[0],

        urgente:0

    });

    useEffect(()=>{

        cargarCatalogos();
        recalcularIVA();

    },[form.iva]);

    const cargarCatalogos = async ()=>{

        try{

            const [

                empresasRes,
                deptosRes,
                categoriasRes,
                clasificacionesRes

            ] = await Promise.all([

                api.get("/compras/catalogos/empresas"),
                api.get("/compras/catalogos/departamentos"),
                api.get("/compras/catalogos/categorias"),
                api.get("/compras/catalogos/polizas")

            ]);
            //console.log(
            //    "CLASIFICACIONES API",
            //    clasificacionesRes.data
            //);

            setEmpresas(
                empresasRes.data
            );

            setDepartamentos(
                deptosRes.data
            );

            setCategorias(
                categoriasRes.data
            );

            setClasificaciones(
                clasificacionesRes.data
            );

        }
        catch(error){

            console.error(
                "Error catálogos:",
                error
            );

        }

    };

    const agregarDetalle=()=>{

        setDetalles([

            ...detalles,

            {
                cantidad:1,
                concepto:"",
                precioUnitario:0,
                iva:0,
                total:0
            }

        ]);

    };

    const eliminarDetalle=(index)=>{

        const copia=[...detalles];

        copia.splice(index,1);

        setDetalles(copia);

    };

    const actualizarDetalle=(index,campo,valor)=>{

       
        const copia = [...detalles];

        if(
            campo === "cantidad" ||
            campo === "precioUnitario"
        ){
            copia[index][campo] = Number(valor);
        }
        else{
            copia[index][campo] = valor;
        }

        const cantidad =
            Number(copia[index].cantidad || 0);

        const precio =
            Number(copia[index].precioUnitario || 0);

        const subtotal =
            cantidad * precio;

        const porcentajeIVA =
            Number(form.iva) / 100;

        copia[index].iva =
            subtotal * porcentajeIVA;

        copia[index].total =
            subtotal + copia[index].iva;

        setDetalles(copia);

    };

    const recalcularIVA=()=>{

        const copia=[...detalles];

        copia.forEach(x=>{

            const subtotal=

                Number(x.cantidad)

                *

                Number(
                    x.precioUnitario
                );

            const porcentajeIVA=
                Number(form.iva)/100;

            x.iva=
                subtotal*
                porcentajeIVA;

            x.total=
                subtotal+
                x.iva;

        });

        setDetalles(copia);

    };

    const agregarDocumento=(e)=>{

        const archivo=
            e.target.files[0];

        if(!archivo)
            return;

        setDocumentos([

            ...documentos,

            {

                archivo,
                comentario:""

            }

        ]);

    };

    const actualizarComentario=(index,valor)=>{

        const copia=[...documentos];

        copia[index].comentario=
            valor;

        setDocumentos(
            copia
        );

    };

    const eliminarDocumento=(index)=>{

        const copia=[...documentos];

        copia.splice(index,1);

        setDocumentos(
            copia
        );

    };

    /**const guardarRequisicion=async()=>{

        try{

            const payload={

                requisicion:{

                    empresa:
                        Number(form.empresa),

                    departamento:
                        Number(
                            form.departamento
                        ),

                    usuario:
                        localStorage.getItem(
                            "usuario"
                        ),

                    solicitanteNombre:
                        form.solicitanteNombre,

                    fecha:
                        form.fecha,

                    descripcion:
                        form.descripcion,

                    categoria:
                        Number(
                            form.categoria
                        ),

                    comentarios:
                        form.comentarios,

                    clasificacionPoliza:
                        Number(
                            form.clasificacionPoliza
                        ),

                    oc:
                        form.oc || "",

                    estatus:1,

                    correo:0,
                    duplicada:0,
                    entregado:0,
                    eliminada:0,
                    validada:0,
                    guardada:0

                },

                detalles:

                    detalles.map(x=>({

                        cantidad:
                            Number(
                                x.cantidad
                            ),

                        concepto:
                            x.concepto,

                        precioUnitario:
                            Number(
                                x.precioUnitario
                            ),

                        iva:
                            Number(
                                x.iva
                            ),

                        total:
                            Number(
                                x.total
                            )

                    })),

                documentos:[]

            };

            const response=
                await api.post(

                    "/compras/crear",

                    payload

                );

            alert(

                `Requisición creada #${

                    response.data.idRequisicion

                }`

            );

        }
        catch(error){

            console.error(
                error
            );

            alert(
                "Error al guardar requisición"
            );

        }

    };***/

    const guardarRequisicion = async () => {

        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const usuarioCorreo =
            decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ];
        
        try {

            const formData = new FormData();

            const requisicion = {
                usuario: usuarioCorreo,
                empresa: Number(form.empresa),
                departamento: Number(form.departamento),
                solicitanteNombre: form.solicitanteNombre,
                fecha: form.fecha,
                descripcion: form.descripcion,
                categoria: Number(form.categoria),
                comentarios: form.comentarios,
                clasificacionPoliza: Number(form.clasificacionPoliza),
                guardada: 1
            };

            formData.append(
                "Requisicion",
                JSON.stringify(requisicion)
            );

            const detallesEnviar = detalles.map(x => ({
                cantidad: Number(x.cantidad),
                concepto: x.concepto,
                precioUnitario: Number(x.precioUnitario),
                iva: Number(x.iva),
                total: Number(x.total)
            }));

            formData.append(
                "Detalles",
                JSON.stringify(detallesEnviar)
            );

            //formData.append(
            //    "Detalles",
            //    JSON.stringify(detalles)
            //);

            documentos.forEach(doc => {
                formData.append(
                    "Archivos",
                    doc.archivo
                );
                formData.append(
                    "ComentariosDocumentos",
                    doc.comentario || ""
                );
            });

            const response = await api.post(
                "/compras/crear",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            alert(
                `Requisición ${response.data.idRequisicion} creada correctamente`
            );

        }
        catch(error){

            console.error(error);

        }

    };

    const obtenerTotalRequisicion = () => {

        return detalles.reduce(

            (total, item) =>

                total +

                Number(item.total || 0),

            0

        );

    };

    return(

        <div className="main-content">
            <div className="container-fluid px-2 px-md-3 fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Nueva Requisición
                        </h2>
                        <small className="text-muted">
                            Registro de solicitud de compra
                        </small>
                    </div>
                </div>
                <div className="card shadow-sm border-0 mb-3">
                    <div className="card-header bg-white">
                        <h5 className="mb-0 fw-bold">
                            INFORMACIÓN GENERAL
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Solicitante
                                </label>
                                <input
                                    className="form-control"
                                    value={
                                        form.solicitanteNombre
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            solicitanteNombre:
                                                e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Fecha
                                </label>
                                <input
                                    disabled
                                    type="date"
                                    className="form-control"
                                    value={
                                        form.fecha
                                    }
                                />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Orden Compra
                                </label>
                                <input
                                    className="form-control"
                                    value={
                                        form.oc || ""
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            oc:
                                            e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Empresa
                                </label>
                                <select
                                    className="form-select"
                                    value={
                                        form.empresa
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            empresa:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="">
                                        Seleccione
                                    </option>
                                    {
                                        empresas.map(x=>(
                                            <option
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.descripcion}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Departamento
                                </label>
                                <select
                                    className="form-select"
                                    value={
                                        form.departamento
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            departamento:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="">
                                        Seleccione
                                    </option>
                                    {
                                        departamentos.map(x=>(
                                            <option
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.descripcion}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Categoría
                                </label>
                                <select
                                    className="form-select"
                                    value={
                                        form.categoria
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            categoria:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="">
                                        Seleccione
                                    </option>
                                    {
                                        categorias.map(x=>(
                                            <option
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.descripcion}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="form-label">
                                    Descripción General
                                </label>
                                <input
                                    className="form-control"
                                    value={
                                        form.descripcion
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            descripcion:
                                            e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                                <label className="form-label">
                                    Clasificación Póliza
                                </label>
                                <select
                                    className="form-select"
                                    value={
                                        form.clasificacionPoliza
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            clasificacionPoliza:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="">
                                        Seleccione
                                    </option>
                                    {
                                        clasificaciones.map(x=>(
                                            <option
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.descripcion}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                                <label className="form-label">
                                    Condición Compra
                                </label>
                                <select
                                    className="form-select"
                                    value={
                                        form.urgente
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            urgente:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="1">
                                        Urgente
                                    </option>
                                    <option value="0">
                                        No Urgente
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm border-0 mb-3">
                    <div className="card-header bg-white">
                        <h5 className="mb-0 fw-bold">
                            COTIZACIONES
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Proveedor
                                </label>
                                <input
                                    className="form-control"
                                    value={
                                        form.proveedor
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            proveedor:
                                            e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    IVA
                                </label>
                                <select
                                    className="form-select"
                                    value={form.iva}
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            iva:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="16">
                                        16%
                                    </option>
                                    <option value="8">
                                        8%
                                    </option>
                                    <option value="0">
                                        0%
                                    </option>
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">
                                    Tipo Cambio
                                </label>
                                <select
                                    className="form-select"
                                    value={
                                        form.tipocambio
                                    }
                                    onChange={(e)=>
                                        setForm({
                                            ...form,
                                            tipocambio:
                                            e.target.value
                                        })
                                    }
                                >
                                    <option value="MXN">
                                        MXN
                                    </option>
                                    <option value="USD">
                                        USD
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm border-0 mb-3">
                    <div className="card-header bg-white">
                        <h5 className="mb-0 fw-bold">
                            PRODUCTOS
                        </h5>
                    </div>
                    <div className="card-body">
                        
                        <div className="table-responsive" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>

                            {
                                esMovil ? (

                                    <div>

                                        {
                                            detalles.map((d,index)=>(

                                                <div
                                                    key={index}
                                                    className="card mb-3 border"
                                                >

                                                    <div className="card-body">

                                                        <div className="mb-2">
                                                            <label className="fw-bold">
                                                                Cantidad
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={d.cantidad}
                                                                onChange={(e)=>
                                                                    actualizarDetalle(
                                                                        index,
                                                                        "cantidad",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="mb-2">
                                                            <label className="fw-bold">
                                                                Concepto
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                value={d.concepto}
                                                                onChange={(e)=>
                                                                    actualizarDetalle(
                                                                        index,
                                                                        "concepto",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="mb-2">
                                                            <label className="fw-bold">
                                                                Precio Unitario
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={d.precioUnitario}
                                                                onChange={(e)=>
                                                                    actualizarDetalle(
                                                                        index,
                                                                        "precioUnitario",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="mb-2">
                                                            <strong>IVA:</strong>
                                                            {" "}
                                                            ${d.iva.toFixed(2)}
                                                        </div>

                                                        <div className="mb-3">
                                                            <strong>Total:</strong>
                                                            {" "}
                                                            ${d.total.toFixed(2)}
                                                        </div>

                                                        <button
                                                            className="btn btn-danger w-100"
                                                            onClick={()=>
                                                                eliminarDetalle(index)
                                                            }
                                                        >
                                                            Eliminar
                                                        </button>

                                                    </div>

                                                </div>

                                            ))
                                        }

                                    </div>

                                ) : (

                            <table className="table table-hover align-middle productos-table">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Cantidad</th>
                                        <th>Concepto</th>
                                        <th>Precio Unitario</th>
                                        <th>IVA</th>
                                        <th>Total</th>
                                        <th width="80">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        detalles.map((d,index)=>(
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={
                                                            d.cantidad
                                                        }
                                                        onChange={(e)=>
                                                            actualizarDetalle(
                                                                index,
                                                                "cantidad",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="form-control"
                                                        value={
                                                            d.concepto
                                                        }
                                                        onChange={(e)=>
                                                            actualizarDetalle(
                                                                index,
                                                                "concepto",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={
                                                            d.precioUnitario
                                                        }
                                                        onChange={(e)=>
                                                            actualizarDetalle(
                                                                index,
                                                                "precioUnitario",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    {
                                                        d.iva.toFixed(2)
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        d.total.toFixed(2)
                                                    }
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => eliminarDetalle(index)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        🗑
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                                )
                            }
                        </div>

                        {/* Total Requisición */}
                        <div className="row mt-3">

                                <div className="col-md-8">

                                </div>

                                <div className="col-12 col-lg-4 mt-3 mt-lg-0">

                                    <div className="input-group">

                                        <span className="input-group-text fw-bold">

                                            Total Requisición

                                        </span>

                                        <input

                                            type="text"

                                            className="form-control text-end fw-bold"

                                            value={`$ ${obtenerTotalRequisicion().toFixed(2)}`}

                                            readOnly

                                        />

                                    </div>

                                </div>

                            </div>            

                        <button
                            onClick={
                                agregarDetalle
                            }
                            className="
                            btn
                            btn-success
                            mt-3
                            "
                        >
                            + Agregar Producto
                        </button>
                    </div>
                </div>
                <div className="card shadow-sm border-0 mb-3">
                    <div className="card-header bg-white">
                        <h5 className="mb-0 fw-bold">
                            COMENTARIOS GENERALES
                        </h5>
                    </div>
                    <div className="card-body">
                        <textarea
                            rows="5"
                            className="
                            form-control
                            "
                            value={
                                form.comentarios
                            }
                            onChange={(e)=>
                                setForm({
                                    ...form,
                                    comentarios:
                                        e.target.value
                                })
                            }
                        />
                    </div>
                </div>
                <div className="card shadow-sm border-0 mb-3">
                    <div className="card-header bg-white">
                        <h5 className="mb-0 fw-bold">
                            DOCUMENTOS ADJUNTOS/ COTIZACIONES
                        </h5>
                    </div>
                    <div className="card-body">

                        <input
                            type="file"
                            className="form-control mb-4"
                            onChange={agregarDocumento}
                        />

                        <div className="documentos-lista">

                            {documentos.map((d, index) => (

                                <div
                                    className="documento-item"
                                    key={index}
                                >

                                    <div className="documento-archivo">

                                        <strong>Archivo</strong>

                                        <span>
                                            {d.archivo?.name}
                                        </span>

                                    </div>

                                    <div className="documento-comentario">

                                        <strong>Comentario</strong>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={d.comentario}
                                            onChange={(e) =>
                                                actualizarComentario(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                    <div className="documento-accion">

                                        <strong>Acción</strong>

                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                eliminarDocumento(index)
                                            }
                                        >
                                            Eliminar
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>        
                </div>
                <div className="row g-2 mt-4 mb-5">

                    <div className="col-12 col-md-6">

                        <button
                            className="
                            btn
                            btn-outline-secondary
                            w-100
                            "
                        >
                            Cancelar
                        </button>

                    </div>

                    <div className="col-12 col-md-6">

                        <button
                            onClick={guardarRequisicion}
                            className="
                            btn
                            btn-primary
                            w-100
                            "
                        >
                            Guardar Requisición
                        </button>

                    </div>

                </div>
                <div className="border-top pt-4 mt-5 text-muted small">
                    <div className="row">
                        <div className="col-12 col-md-3">
                            <strong>
                                No.:
                            </strong>
                            ADM-F-5
                        </div>
                        <div className="col-md-3 text-center">
                            <strong>
                                Rev.:
                            </strong>
                            5
                        </div>
                        <div className="col-md-3 text-center">
                            <strong>
                                Fecha de rev.:
                            </strong>
                            05-MAR-2023
                        </div>
                        <div className="col-md-3 text-end">
                            <strong>
                                Página
                            </strong>
                            1 de 1
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}