import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import {
    FaBuilding,
    FaPlus,
    FaEdit,
    FaSave,
    FaTimes,
    FaToggleOn,
    FaToggleOff,
    FaIdCard
} from "react-icons/fa";

const FORM_VACIO = {
    id: null,
    nombreEmpresa: "",
    rfc: ""
};

const inicial = (texto) => (texto || "?").trim().charAt(0).toUpperCase();

function CatalogoEmpresas() {

    const [empresas, setEmpresas] = useState([]);

    const [empresaForm, setEmpresaForm] = useState({
        id: null,
        nombreEmpresa: "",
        rfc: ""
    });

    const obtenerEmpresas = async () => {
        try {
            const res = await api.get("/catalogos/empresas");
            setEmpresas(res.data);
        } catch (error) {
            console.error("Error cargando empresas", error);
        }
    };

    useEffect(() => {
        obtenerEmpresas();
    }, []);

    const guardarEmpresa = async () => {

        try {

            const payload = {
                id: empresaForm.id,
                nombreEmpresa: empresaForm.nombreEmpresa,
                rfc: empresaForm.rfc
            };

            if (empresaForm.id) {

                await api.put("/catalogos/empresas", payload);

            } else {

                await api.post("/catalogos/empresas", payload);

            }

            setEmpresaForm({
                id: null,
                nombreEmpresa: "",
                rfc: ""
            });

            obtenerEmpresas();

        } catch (error) {

            console.error(error);

            alert("Error al guardar empresa");

        }

    };

    const editarEmpresa = (empresa) => {

        setEmpresaForm({
            id: empresa.id,
            nombreEmpresa: empresa.nombreEmpresa,
            rfc: empresa.rfc
        });

        // En pantallas chicas el formulario queda arriba: lo llevamos a la vista
        window.scrollTo({ top: 0, behavior: "smooth" });

    };

    const cancelarEdicion = () => setEmpresaForm(FORM_VACIO);

    const cambiarEstatus = async (id) => {

        try {

            await api.put(`/catalogos/empresas/${id}/estatus`);

            obtenerEmpresas();

        } catch (error) {

            console.error(error);

        }

    };

    const editando = Boolean(empresaForm.id);

    const columns = [
        {
            header: "Empresa",
            render: (row) => (
                <div className={`cliente-nombre ${empresaForm.id === row.id ? "ce-editando" : ""}`}>
                    <span className="cliente-avatar">{inicial(row.nombreEmpresa)}</span>
                    <span className="text-break">{row.nombreEmpresa}</span>
                </div>
            )
        },
        {
            header: "RFC",
            render: (row) => (
                row.rfc
                    ? <span className="cliente-rfc">{row.rfc}</span>
                    : <span className="text-muted">—</span>
            )
        },
        {
            header: "Estatus",
            render: (row) => (
                row.activo
                    ? <span className="estatus-pastilla rd-estado-na"><span className="estatus-punto" />Inactivo</span>
                    : <span className="estatus-pastilla estatus-activo"><span className="estatus-punto" />Activo</span>
            )
        },
        {
            header: "Acciones",
            align: "end",
            render: (row) => (
                <div className="docs-acciones">
                    <button
                        className="btn btn-sm btn-outline-primary explorador-btn-icono"
                        title="Editar"
                        aria-label="Editar empresa"
                        onClick={() => editarEmpresa(row)}
                    >
                        <FaEdit />
                    </button>

                    <button
                        className={`btn dash-btn-tabla ${row.activo ? "btn-outline-secondary" : "btn-outline-success"}`}
                        onClick={() => cambiarEstatus(row.id)}
                    >
                        {row.activo ? <FaToggleOff /> : <FaToggleOn />}
                        {row.activo ? "Desactivar" : "Activar"}
                    </button>
                </div>
            )
        }
    ];

    return (

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">
                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Catálogos</span>
                    <h2 className="dash-titulo">Catálogo de empresas</h2>
                    <div className="dash-contexto">
                        <span>
                            <FaBuilding /> {empresas.length.toLocaleString("es-MX")}{" "}
                            {empresas.length === 1 ? "empresa registrada" : "empresas registradas"}
                        </span>
                    </div>
                </div>
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
                                    {empresaForm.id ? "Editar empresa" : "Nueva empresa"}
                                </h3>
                                <div className="nc-form-sub text-truncate">
                                    {editando
                                        ? empresaForm.nombreEmpresa || "Empresa seleccionada"
                                        : "Agrega una razón social al catálogo"}
                                </div>
                            </div>
                        </div>

                        <div className="nc-form-cuerpo">

                            <label className="form-label">Nombre de la empresa</label>
                            <div className="nr-input-icono mb-3">
                                <FaBuilding />
                                <input
                                    className="form-control"
                                    placeholder="Razón social"
                                    value={empresaForm.nombreEmpresa}
                                    onChange={(e) =>
                                        setEmpresaForm({
                                            ...empresaForm,
                                            nombreEmpresa: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <label className="form-label">RFC</label>
                            <div className="nr-input-icono">
                                <FaIdCard />
                                <input
                                    className="form-control nc-mayusculas"
                                    placeholder="Ej. ABC123456XYZ"
                                    value={empresaForm.rfc}
                                    onChange={(e) =>
                                        setEmpresaForm({
                                            ...empresaForm,
                                            rfc: e.target.value
                                        })
                                    }
                                />
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
                                onClick={guardarEmpresa}
                            >
                                <FaSave /> {editando ? "Actualizar" : "Guardar"}
                            </button>
                        </div>

                    </div>
                </div>

                {/* ========================= */}
                {/* LISTADO */}
                {/* ========================= */}

                <div className="col-12 col-xl-8">
                    <div className="dash-panel p-0 overflow-hidden">

                        <DataTable
                            data={empresas}
                            columns={columns}
                            placeholder="Buscar empresa o RFC..."
                            vacio="No hay empresas registradas."
                        />

                    </div>
                </div>

            </div>

        </div>

    );

}

export default CatalogoEmpresas;
