import { useEffect, useState } from "react";
import api from "../../services/api";

function CatalogoDocumentos() {

const [documentos, setDocumentos] = useState([]);

const [nuevoDoc, setNuevoDoc] = useState({
    nombreDocumento: "",
    personaFisica: false,
    personaMoral: false,
    internacional: false,
    requiereVencimiento: false
});

const obtenerDocumentos = async () => {
    try {

        const res = await api.get("/catalogos/documentos");

        console.log("Respuesta documentos:", res.data);

        const data = Array.isArray(res.data)
            ? res.data
            : res.data.data || [];

        setDocumentos(data);

    } catch (error) {
        console.error("Error cargando catálogo", error);
        setDocumentos([]);
    }
};

useEffect(() => {
    obtenerDocumentos();
}, []);

const guardarDocumento = async () => {
    try{
        const payload = {
            nombreDocumento: nuevoDoc.nombreDocumento,
            personaFisica: nuevoDoc.personaFisica ? 1 : 0,
            personaMoral: nuevoDoc.personaMoral ? 1 : 0,
            internacional: nuevoDoc.internacional ? 1 : 0,
            requiereVencimiento: nuevoDoc.requiereVencimiento ? 1 : 0
        };
        if(nuevoDoc.id){
            await api.put(`/catalogos/documentos/${nuevoDoc.id}`, payload);
        }else{
            await api.post("/catalogos/documentos", payload);
        }

        setNuevoDoc({
            nombreDocumento: "",
            personaFisica:false,
            personaMoral:false,
            internacional:false,
            requiereVencimiento:false
        });
        obtenerDocumentos();
    }catch{
        alert("Error al guardar documento");
    }
};

const eliminarDocumento = async (id) => {
    if(!window.confirm("¿Eliminar documento?"))
        return;
    try{
        await api.delete(`/catalogos/documentos/${id}`);
        obtenerDocumentos();
    }catch{
        alert("Error al eliminar documento");
    }
};

const editarDocumento = (doc) => {
    setNuevoDoc({
        id: doc.id,
        nombreDocumento: doc.nombreDocumento,
        personaFisica: doc.personaFisica === 1,
        personaMoral: doc.personaMoral === 1,
        internacional: doc.internacional === 1,
        requiereVencimiento: doc.requiereVencimiento === 1
    });
};

return (

    <div className="container-fluid">

        <h2 className="mb-4">Catálogo de Documentos</h2>

        {/* FORMULARIO */}
        <div className="card p-3 mb-4">

            <h5>Nuevo Documento</h5>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Nombre del documento"
                value={nuevoDoc.nombreDocumento}
                onChange={(e) =>
                    setNuevoDoc({
                        ...nuevoDoc,
                        nombreDocumento: e.target.value
                    })
                }
            />

            <div className="row mb-3">

                <div className="col-md-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={nuevoDoc.personaFisica}
                        onChange={(e) =>
                            setNuevoDoc({
                                ...nuevoDoc,
                                personaFisica: e.target.checked
                            })
                        }
                    />
                    <label className="form-check-label">
                        Persona Física
                    </label>
                </div>

                <div className="col-md-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={nuevoDoc.personaMoral}
                        onChange={(e) =>
                            setNuevoDoc({
                                ...nuevoDoc,
                                personaMoral: e.target.checked
                            })
                        }
                    />
                    <label className="form-check-label">
                        Persona Moral
                    </label>
                </div>

                <div className="col-md-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={nuevoDoc.internacional}
                        onChange={(e) =>
                            setNuevoDoc({
                                ...nuevoDoc,
                                internacional: e.target.checked
                            })
                        }
                    />
                    <label className="form-check-label">
                        Internacional
                    </label>
                </div>

                <div className="col-md-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={nuevoDoc.requiereVencimiento}
                        onChange={(e) =>
                            setNuevoDoc({
                                ...nuevoDoc,
                                requiereVencimiento: e.target.checked
                            })
                        }
                    />
                    <label className="form-check-label">
                        Requiere fecha de vencimiento
                    </label>
                </div>

            </div>

            <button
                className="btn btn-primary"
                onClick={guardarDocumento}
            >
                Guardar Documento
            </button>

        </div>

        {/* TABLA */}
        <div className="card p-3">

            <h5>Documentos Registrados</h5>

            <table className="table table-bordered table-striped">

                <thead className="table-dark">
                    <tr>
                        <th>Documento</th>
                        <th>PF</th>
                        <th>PM</th>
                        <th>Internacional</th>
                        <th>Vencimiento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>

                    {documentos.map((d) => (
                        <tr key={d.id}>

                            <td>{d.nombreDocumento}</td>

                            <td>{d.personaFisica ? "✔" : "❌"}</td>

                            <td>{d.personaMoral ? "✔" : "❌"}</td>

                            <td>{d.internacional ? "✔" : "❌"}</td>

                            <td>{d.requiereVencimiento ? "Sí" : "No"}</td>

                            <td>
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => editarDocumento(d)}
                                    >
                                    Editar
                                </button>

                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => eliminarDocumento(d.id)}
                                    >
                                    Eliminar
                                </button>

                            </td>
                        </tr>
                    ))}

                </tbody>

            </table>

        </div>

    </div>
);

}

export default CatalogoDocumentos;
