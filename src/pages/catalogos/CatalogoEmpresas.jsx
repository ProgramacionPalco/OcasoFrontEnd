import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";

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

    };

    const cambiarEstatus = async (id) => {

        try {

            await api.put(`/catalogos/empresas/${id}/estatus`);

            obtenerEmpresas();

        } catch (error) {

            console.error(error);

        }

    };

    const columns = [
        {
            header: "Empresa",
            field: "nombreEmpresa"
        },
        {
            header: "RFC",
            field: "rfc"
        },
        {
            header: "Estatus",
            render: (row) => (
                row.activo
                    ? <span className="badge bg-secondary">Inactivo</span>
                    : <span className="badge bg-success">Activo</span>
            )
        },
        {
            header: "Acciones",
            render: (row) => (
                <>
                    <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => editarEmpresa(row)}
                    >
                        Editar
                    </button>

                    <button
                        className="btn btn-sm btn-dark"
                        onClick={() => cambiarEstatus(row.id)}
                    >
                        {row.activo ? "Desactivar" : "Activar"}
                    </button>
                </>
            )
        }
    ];

    return (

        <div className="container-fluid">

            <h2 className="mb-4">Catálogo de Empresas</h2>

            {/* FORMULARIO */}

            <div className="card p-3 mb-4">

                <h5>{empresaForm.id ? "Editar Empresa" : "Nueva Empresa"}</h5>

                <input
                    className="form-control mb-2"
                    placeholder="Nombre empresa"
                    value={empresaForm.nombreEmpresa}
                    onChange={(e) =>
                        setEmpresaForm({
                            ...empresaForm,
                            nombreEmpresa: e.target.value
                        })
                    }
                />

                <input
                    className="form-control mb-2"
                    placeholder="RFC"
                    value={empresaForm.rfc}
                    onChange={(e) =>
                        setEmpresaForm({
                            ...empresaForm,
                            rfc: e.target.value
                        })
                    }
                />

                <button
                    className="btn btn-primary"
                    onClick={guardarEmpresa}
                >
                    Guardar
                </button>

            </div>

            {/* TABLA */}

            <div className="card p-3">

                <DataTable
                    data={empresas}
                    columns={columns}
                />

            </div>

        </div>

    );

}

export default CatalogoEmpresas;