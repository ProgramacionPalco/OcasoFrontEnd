import { useEffect, useState } from "react";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";
import {
    FaClipboardList,
    FaUser,
    FaInfoCircle,
    FaTruck,
    FaPlusCircle,
    FaMinusCircle,
    FaUserPlus,
    FaStore,
    FaBuilding,
    FaIdCard,
    FaPhoneAlt,
    FaEnvelope,
    FaSave,
    FaBoxOpen,
    FaTrashAlt,
    FaPlus,
    FaCommentAlt,
    FaPaperclip,
    FaCloudUploadAlt,
    FaFileAlt
} from "react-icons/fa";

export default function NuevaRequisicion() {

    const [empresas,setEmpresas]=useState([]);
    const [departamentos,setDepartamentos]=useState([]);
    const [categorias,setCategorias]=useState([]);
    const [clasificaciones,setClasificaciones]=useState([]);
    const [documentos,setDocumentos]=useState([]);
    const esMovil = window.innerWidth < 768;
    const [proveedores, setProveedores] = useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
    const [mostrarPreregistro, setMostrarPreregistro] = useState(false);
    const [datosProveedor, setDatosProveedor] = useState({
        nombre: "",
        RFC: "",
        razonSocial: "",
        asesor: "",
        telefono: "",
        email: ""
    });

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
                clasificacionesRes,
                proveedoresRes
            ] = await Promise.all([
                api.get("/compras/catalogos/empresas"),
                api.get("/compras/catalogos/departamentos"),
                api.get("/compras/catalogos/categorias"),
                api.get("/compras/catalogos/polizas"),
                api.get("/compras/proveedores")
            ]);
            //console.log(
            //    "CLASIFICACIONES API",
            //    clasificacionesRes.data
            //);
            setProveedores
            (
                proveedoresRes.data
            );

            setEmpresas(
                empresasRes.data
            );
            //console.log("EMPRESAS API:", empresasRes.data);

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

    const manejarCambioProveedor = (e) => {
        const { name, value } = e.target;

        setDatosProveedor(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const guardarPreregistroProveedor = async () => {
        if (!datosProveedor.nombre.trim() && !datosProveedor.razonSocial.trim()) {
            alert("Ingresa el nombre o la razón social del proveedor.");
            return;
        }

        try {
            const response = await api.post(
                "/compras/proveedores",
                datosProveedor
            );

            // Obtener nuevamente el catálogo
            const proveedoresRes = await api.get("/compras/proveedores");

            setProveedores(proveedoresRes.data);

            // Identificar el proveedor recién registrado
            const proveedorNuevo = proveedoresRes.data.find(p =>
                (datosProveedor.RFC &&
                    p.RFC?.toUpperCase() === datosProveedor.RFC.toUpperCase()) ||
                (datosProveedor.razonSocial &&
                    p.razonSocial?.toUpperCase() === datosProveedor.razonSocial.toUpperCase()) ||
                p.nombre?.toUpperCase() === datosProveedor.nombre.toUpperCase()
            );

            if (proveedorNuevo) {
                setProveedorSeleccionado(String(proveedorNuevo.id));
            }

            setDatosProveedor({
                nombre: "",
                RFC: "",
                razonSocial: "",
                asesor: "",
                telefono: "",
                email: ""
            });

            setMostrarPreregistro(false);

            alert("Proveedor preregistrado correctamente.");
        }
        catch (error) {
            console.error("Error al preregistrar proveedor:", error);

            alert(
                error.response?.data?.mensaje ||
                error.response?.data?.message ||
                "No fue posible registrar el proveedor."
            );
        }
    };

    const cancelarPreregistro = () => {
        setMostrarPreregistro(false);
        setDatosProveedor({
            nombre: "",
            RFC: "",
            razonSocial: "",
            asesor: "",
            telefono: "",
            email: ""
        });
    };

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
                urgente: Number(form.urgente),
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
            const idRequisicion = response.data.idRequisicion;

            if (proveedorSeleccionado) {
                await api.post(
                    `/compras/requisicion/${idRequisicion}/proveedores`,
                    null,
                    {
                        params: {
                            idProveedor: Number(proveedorSeleccionado),
                            opcion: 1
                        }
                    }
                );
            }

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

    const formatoMonto = (valor) =>
        Number(valor || 0).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const CAMPOS_PROVEEDOR = [
        { name: "nombre", label: "Nombre", icon: <FaStore />, placeholder: "Nombre comercial" },
        { name: "razonSocial", label: "Razón social", icon: <FaBuilding />, placeholder: "Razón social completa" },
        { name: "RFC", label: "RFC", icon: <FaIdCard />, placeholder: "XAXX010101000" },
        { name: "asesor", label: "Asesor", icon: <FaUser />, placeholder: "Nombre del asesor" },
        { name: "telefono", label: "Teléfono", icon: <FaPhoneAlt />, placeholder: "10 dígitos", type: "tel" },
        { name: "email", label: "Correo electrónico", icon: <FaEnvelope />, placeholder: "correo@proveedor.com", type: "email" }
    ];

    return(

        <div className="container-fluid dash fade-in">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">
                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Compras</span>
                    <h2 className="dash-titulo">Nueva requisición</h2>
                    <div className="dash-contexto">
                        <span><FaClipboardList /> Registro de solicitud de compra</span>
                        {form.solicitanteNombre && (
                            <span><FaUser /> {form.solicitanteNombre}</span>
                        )}
                    </div>
                </div>

                <div className="nr-hero-total">
                    <span>Total de la requisición</span>
                    <strong>
                        ${formatoMonto(obtenerTotalRequisicion())}
                        <small>{form.tipocambio}</small>
                    </strong>
                </div>
            </div>

            {/* ========================= */}
            {/* INFORMACIÓN GENERAL */}
            {/* ========================= */}

            <div className="dash-panel nc-form p-0 overflow-hidden mb-4">

                <div className="nc-form-header">
                    <span className="nc-form-icono"><FaInfoCircle /></span>
                    <div>
                        <h3 className="nc-form-titulo">Información general</h3>
                        <div className="nc-form-sub">Solicitante, empresa y clasificación de la compra</div>
                    </div>
                    <span className="nc-form-paso">1</span>
                </div>

                <div className="nc-form-cuerpo">
                    <div className="row g-3">
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
                                Orden de compra
                            </label>
                            <input
                                className="form-control"
                                placeholder="Opcional"
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
                                Descripción general
                            </label>
                            <input
                                className="form-control"
                                placeholder="¿Qué se necesita comprar?"
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
                                Clasificación póliza
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
                                Condición de compra
                            </label>
                            <select
                                className={`form-select ${String(form.urgente) === "1" ? "nr-urgente" : ""}`}
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

            {/* ========================= */}
            {/* COTIZACIONES */}
            {/* ========================= */}

            <div className="dash-panel nc-form p-0 mb-4">

                <div className="nc-form-header">
                    <span className="nc-form-icono"><FaTruck /></span>
                    <div>
                        <h3 className="nc-form-titulo">Cotizaciones</h3>
                        <div className="nc-form-sub">Proveedor, IVA y moneda de la compra</div>
                    </div>
                    <span className="nc-form-paso">2</span>
                </div>

                <div className="nc-form-cuerpo">
                    <div className="row g-3">
                        <div className="col-12 col-lg-6">
                            <label className="form-label">
                                Proveedor
                            </label>
                                <Select
                                    options={proveedores.map(p => ({
                                        value: p.id,
                                        label: `${p.razonSocial || p.nombre}${p.RFC ? ` | RFC: ${p.RFC}` : ""}${p.estatusRegistro === 1 ? " (Preregistro)" : ""}`,
                                        nombre: p.nombre,
                                        razonSocial: p.razonSocial,
                                        RFC: p.RFC
                                    }))}
                                    value={
                                        proveedores
                                            .map(p => ({
                                                value: p.id,
                                                label: `${p.razonSocial || p.nombre}${p.RFC ? ` | RFC: ${p.RFC}` : ""}${p.estatusRegistro === 1 ? " (Preregistro)" : ""}`
                                            }))
                                            .find(p => String(p.value) === String(proveedorSeleccionado)) || null
                                    }
                                    onChange={(opcion) =>
                                        setProveedorSeleccionado(opcion ? String(opcion.value) : "")
                                    }
                                    placeholder="Buscar proveedor por nombre o RFC..."
                                    isClearable
                                    isSearchable
                                    noOptionsMessage={() => "No se encontraron proveedores"}
                                    classNamePrefix="proveedor-select"
                                />
                            <button
                                type="button"
                                className={`nr-link ${mostrarPreregistro ? "nr-link-cancelar" : ""}`}
                                onClick={() =>
                                    mostrarPreregistro
                                        ? cancelarPreregistro()
                                        : setMostrarPreregistro(true)
                                }
                            >
                                {mostrarPreregistro ? <FaMinusCircle /> : <FaPlusCircle />}
                                {mostrarPreregistro ? "Cancelar preregistro" : "¿No está en la lista? Preregistrar proveedor"}
                            </button>
                        </div>
                        <div className="col-6 col-lg-3">
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
                        <div className="col-6 col-lg-3">
                            <label className="form-label">
                                Tipo de cambio
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

                        {mostrarPreregistro && (
                            <div className="col-12">
                                <div className="nr-preregistro">
                                    <div className="nr-preregistro-header">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="np-header-icono"><FaUserPlus /></span>
                                            <div>
                                                <h6 className="mb-0 fw-bold">
                                                    Preregistro de proveedor
                                                </h6>
                                                <small className="text-muted">
                                                    Captura los datos básicos del proveedor
                                                </small>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            aria-label="Cerrar"
                                            onClick={cancelarPreregistro}
                                        />
                                    </div>

                                    <div className="nr-preregistro-cuerpo">
                                        <div className="row g-3">
                                            {CAMPOS_PROVEEDOR.map(campo => (
                                                <div key={campo.name} className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label">
                                                        {campo.label}
                                                    </label>
                                                    <div className="nr-input-icono">
                                                        {campo.icon}
                                                        <input
                                                            type={campo.type || "text"}
                                                            className="form-control"
                                                            name={campo.name}
                                                            placeholder={campo.placeholder}
                                                            value={datosProveedor[campo.name]}
                                                            onChange={manejarCambioProveedor}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="nr-preregistro-pie">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary np-btn"
                                            onClick={cancelarPreregistro}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary np-btn"
                                            onClick={guardarPreregistroProveedor}
                                        >
                                            <FaSave /> Guardar proveedor
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* PRODUCTOS */}
            {/* ========================= */}

            <div className="dash-panel nc-form p-0 overflow-hidden mb-4">

                <div className="nc-form-header">
                    <span className="nc-form-icono"><FaBoxOpen /></span>
                    <div>
                        <h3 className="nc-form-titulo">Productos</h3>
                        <div className="nc-form-sub">
                            {detalles.length} {detalles.length === 1 ? "partida" : "partidas"} · IVA {form.iva}%
                        </div>
                    </div>
                    <span className="nc-form-paso">3</span>
                </div>

                {
                    esMovil ? (

                        <div className="p-3 d-flex flex-column gap-3">

                            {
                                detalles.map((d,index)=>(

                                    <div
                                        key={index}
                                        className="nr-producto"
                                    >

                                        <div className="nr-producto-header">
                                            <span className="nr-producto-num">Partida {index + 1}</span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger explorador-btn-icono"
                                                title="Eliminar partida"
                                                aria-label="Eliminar partida"
                                                onClick={()=>
                                                    eliminarDetalle(index)
                                                }
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>

                                        <div className="row g-2">
                                            <div className="col-12">
                                                <label className="form-label">
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

                                            <div className="col-5">
                                                <label className="form-label">
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

                                            <div className="col-7">
                                                <label className="form-label">
                                                    Precio unitario
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
                                        </div>

                                        <div className="nr-producto-montos">
                                            <div>
                                                <small>IVA</small>
                                                <span>${formatoMonto(d.iva)}</span>
                                            </div>
                                            <div>
                                                <small>Total</small>
                                                <strong>${formatoMonto(d.total)}</strong>
                                            </div>
                                        </div>

                                    </div>

                                ))
                            }

                        </div>

                    ) : (

                <div className="table-responsive">
                <table className="table align-middle docs-tabla no-cards productos-table nr-tabla">
                    <thead>
                        <tr>
                            <th style={{ width: 50 }}>#</th>
                            <th style={{ width: 130 }}>Cantidad</th>
                            <th>Concepto</th>
                            <th style={{ width: 180 }}>Precio unitario</th>
                            <th className="text-end" style={{ width: 140 }}>IVA</th>
                            <th className="text-end" style={{ width: 150 }}>Total</th>
                            <th style={{ width: 60 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            detalles.map((d,index)=>(
                                <tr key={index}>
                                    <td className="nr-partida">{index + 1}</td>
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
                                            placeholder="Descripción del producto o servicio"
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
                                        <div className="nr-input-moneda">
                                            <span>$</span>
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
                                        </div>
                                    </td>
                                    <td className="text-end nr-monto">
                                        ${formatoMonto(d.iva)}
                                    </td>
                                    <td className="text-end nr-monto fw-semibold">
                                        ${formatoMonto(d.total)}
                                    </td>
                                    <td className="text-end">
                                        <button
                                            type="button"
                                            onClick={() => eliminarDetalle(index)}
                                            className="btn btn-sm btn-outline-danger explorador-btn-icono"
                                            title="Eliminar partida"
                                            aria-label="Eliminar partida"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                </div>
                    )
                }

                {/* Total Requisición */}
                <div className="nr-productos-pie">

                    <button
                        type="button"
                        onClick={
                            agregarDetalle
                        }
                        className="btn btn-outline-primary np-btn"
                    >
                        <FaPlus /> Agregar producto
                    </button>

                    <div className="nr-total">
                        <span>Total requisición</span>
                        <strong>
                            ${formatoMonto(obtenerTotalRequisicion())}
                            <small>{form.tipocambio}</small>
                        </strong>
                    </div>

                </div>
            </div>

            <div className="row g-4 mb-4">

                {/* ========================= */}
                {/* COMENTARIOS */}
                {/* ========================= */}

                <div className="col-12 col-xl-5">
                    <div className="dash-panel nc-form p-0 overflow-hidden h-100">

                        <div className="nc-form-header">
                            <span className="nc-form-icono"><FaCommentAlt /></span>
                            <div>
                                <h3 className="nc-form-titulo">Comentarios generales</h3>
                                <div className="nc-form-sub">Notas para compras y aprobadores</div>
                            </div>
                        </div>

                        <div className="nc-form-cuerpo">
                            <textarea
                                rows="6"
                                className="form-control nr-textarea"
                                placeholder="Escriba aquí cualquier detalle adicional..."
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
                </div>

                {/* ========================= */}
                {/* DOCUMENTOS */}
                {/* ========================= */}

                <div className="col-12 col-xl-7">
                    <div className="dash-panel nc-form p-0 overflow-hidden h-100">

                        <div className="nc-form-header">
                            <span className="nc-form-icono"><FaPaperclip /></span>
                            <div>
                                <h3 className="nc-form-titulo">Documentos adjuntos / cotizaciones</h3>
                                <div className="nc-form-sub">
                                    {documentos.length
                                        ? `${documentos.length} ${documentos.length === 1 ? "archivo adjunto" : "archivos adjuntos"}`
                                        : "Adjunte cotizaciones o soportes de la compra"}
                                </div>
                            </div>
                        </div>

                        <div className="nc-form-cuerpo">

                            <label className="nr-archivo">
                                <FaCloudUploadAlt />
                                <span>
                                    <strong>Seleccionar archivo</strong>
                                    <small>Haga clic para adjuntar una cotización o documento</small>
                                </span>
                                <input
                                    type="file"
                                    onChange={agregarDocumento}
                                />
                            </label>

                            <div className="nr-documentos">

                                {documentos.map((d, index) => (

                                    <div
                                        className="nr-documento"
                                        key={index}
                                    >

                                        <span className="nr-documento-icono">
                                            <FaFileAlt />
                                        </span>

                                        <div className="nr-documento-datos">

                                            <span className="nr-documento-nombre text-break">
                                                {d.archivo?.name}
                                            </span>

                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Comentario del archivo"
                                                value={d.comentario}
                                                onChange={(e) =>
                                                    actualizarComentario(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger explorador-btn-icono"
                                            title="Eliminar documento"
                                            aria-label="Eliminar documento"
                                            onClick={() =>
                                                eliminarDocumento(index)
                                            }
                                        >
                                            <FaTrashAlt />
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* ACCIONES */}
            {/* ========================= */}

            <div className="nr-acciones mb-4">

                <div className="nr-acciones-total">
                    <span>Total</span>
                    <strong>${formatoMonto(obtenerTotalRequisicion())} {form.tipocambio}</strong>
                </div>

                <div className="d-flex gap-2 nr-acciones-botones">
                    <button
                        type="button"
                        className="btn btn-outline-secondary np-btn"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={guardarRequisicion}
                        className="btn btn-primary np-btn"
                    >
                        <FaSave /> Guardar requisición
                    </button>
                </div>

            </div>

            <div className="nr-formato mb-4">
                <span><strong>No.:</strong> ADM-F-5</span>
                <span><strong>Rev.:</strong> 5</span>
                <span><strong>Fecha de rev.:</strong> 05-MAR-2023</span>
                <span><strong>Página</strong> 1 de 1</span>
            </div>
        </div>
    );
}
