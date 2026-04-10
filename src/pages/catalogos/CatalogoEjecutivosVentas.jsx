import { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";

function CatalogoEjecutivosVentas() {

const [ejecutivos, setEjecutivos] = useState([]);

const [ejecutivoForm, setEjecutivoForm] = useState({
    id: null,
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: ""
});

const obtenerEjecutivos = async () => {
    try {
        const res = await api.get("/catalogos/ejecutivosVentas");
        setEjecutivos(res.data);
    } catch (error) {
        console.error("Error cargando ejecutivos ventas", error);
    }
};

useEffect(() => {
    obtenerEjecutivos();
}, []);

const guardarEjecutivo = async () => {

    if (!ejecutivoForm.nombre || !ejecutivoForm.correo) {
        alert("Nombre y correo son obligatorios");
        return;
    }

    try {

        if (ejecutivoForm.id) {

            const payload = {
                id: ejecutivoForm.id,
                nombre: ejecutivoForm.nombre,
                apellidoPaterno: ejecutivoForm.apellidoPaterno,
                apellidoMaterno: ejecutivoForm.apellidoMaterno,
                correo: ejecutivoForm.correo
            };

            await api.put("/catalogos/ejecutivosVentas", payload);

        } else {

            const payload = {
                nombre: ejecutivoForm.nombre,
                apellidoPaterno: ejecutivoForm.apellidoPaterno,
                apellidoMaterno: ejecutivoForm.apellidoMaterno,
                correo: ejecutivoForm.correo
            };

            await api.post("/catalogos/ejecutivosVentas", payload);

        }

        setEjecutivoForm({
            id: null,
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            correo: ""
        });

        obtenerEjecutivos();

    } catch (error) {
        console.error(error);
        alert("Error al guardar ejecutivo");
    }
};

const editarEjecutivo = (ejecutivo) => {

    setEjecutivoForm({
        id: ejecutivo.id,
        nombre: ejecutivo.nombre || "",
        apellidoPaterno: ejecutivo.apellidoPaterno || "",
        apellidoMaterno: ejecutivo.apellidoMaterno || "",
        correo: ejecutivo.correo || ""
    });

};

const eliminarEjecutivo = async (id) => {

    if (!window.confirm("¿Eliminar ejecutivo?")) return;

    try {

        await api.delete(`/catalogos/ejecutivosVentas/${id}`);

        obtenerEjecutivos();

    } catch (error) {

        console.error(error);

        alert("Error al eliminar");

    }

};

const columns = [

    {
    header:"Nombre",
    render:(row)=>`${row.nombre} ${row.apellidoPaterno ?? ""} ${row.apellidoMaterno ?? ""}`
    },

    {
    header:"Correo",
    field:"correo"
    },

    {
    header:"Acciones",
    render:(row)=>(
        <>
        <button
            className="btn btn-sm btn-warning me-2"
            onClick={()=>editarEjecutivo(row)}
        >
        Editar
        </button>

        <button
            className="btn btn-sm btn-danger"
            onClick={()=>eliminarEjecutivo(row.id)}
        >
        Eliminar
        </button>
        </>
        )
    }

];

return (
    <div className="container-fluid">

        <h2 className="mb-4">Catálogo Ejecutivos de Ventas</h2>

        <div className="card shadow-sm p-4 mb-4">

            <h5 className="mb-3">
                {ejecutivoForm.id ? "Editar Ejecutivo" : "Nuevo Ejecutivo"}
            </h5>

            <div className="row">

                <div className="col-md-6">
                    <input
                        className="form-control mb-3"
                        placeholder="Nombre"
                        value={ejecutivoForm.nombre}
                        onChange={(e) =>
                            setEjecutivoForm({
                                ...ejecutivoForm,
                                nombre: e.target.value
                            })
                        }
                    />
                </div>

                <div className="col-md-6">
                    <input
                        className="form-control mb-3"
                        placeholder="Apellido paterno"
                        value={ejecutivoForm.apellidoPaterno}
                        onChange={(e) =>
                            setEjecutivoForm({
                                ...ejecutivoForm,
                                apellidoPaterno: e.target.value
                            })
                        }
                    />
                </div>

                <div className="col-md-6">
                    <input
                        className="form-control mb-3"
                        placeholder="Apellido materno"
                        value={ejecutivoForm.apellidoMaterno}
                        onChange={(e) =>
                            setEjecutivoForm({
                                ...ejecutivoForm,
                                apellidoMaterno: e.target.value
                            })
                        }
                    />
                </div>

                <div className="col-md-6">
                    <input
                        className="form-control mb-3"
                        placeholder="Correo"
                        value={ejecutivoForm.correo}
                        onChange={(e) =>
                            setEjecutivoForm({
                                ...ejecutivoForm,
                                correo: e.target.value
                            })
                        }
                    />
                </div>

            </div>

            <button
                className="btn btn-primary w-100"
                onClick={guardarEjecutivo}
            >
                Guardar Ejecutivo
            </button>

        </div>

        <div className="card shadow-sm p-3">

            <DataTable
                data={ejecutivos}
                columns={columns}
            />

        </div>

    </div>
);


}

export default CatalogoEjecutivosVentas;
