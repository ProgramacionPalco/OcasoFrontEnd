import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { FaSearch } from "react-icons/fa";

function ClientesInactivos(){

    const [clientes,setClientes] = useState([]);
    const [loading,setLoading] = useState(true);
    const [busqueda,setBusqueda] = useState("");

    const navigate = useNavigate();

    const cargarClientes = async ()=>{

        try{

            const res = await api.get("/altas/clientes/inactivos");

            setClientes(res.data);

        }
        catch(error){

            console.error(error);

            Swal.fire({
                icon:"error",
                title:"Error",
                text:"No se pudieron cargar los clientes"
            });

        }
        finally{

            setLoading(false);

        }

    };

    const activarCliente = async (id)=>{

        const confirm = await Swal.fire({
            title:"Activar cliente",
            text:"¿Desea activar este cliente?",
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"Activar",
            cancelButtonText:"Cancelar"
        });

        if(!confirm.isConfirmed) return;

        try{

            await api.put(`/altas/clientes/${id}/activar`);

            Swal.fire({
                icon:"success",
                title:"Cliente activado"
            });

            cargarClientes();

        }
        catch(error){

            Swal.fire({
                icon:"error",
                title:"Error",
                text:"No se pudo activar el cliente"
            });

        }

    };

    useEffect(()=>{

        cargarClientes();

    },[]);

    const clientesFiltrados = clientes.filter(cliente => {
        const texto = busqueda.toLowerCase();

        return (
            cliente.razonSocial?.toLowerCase().includes(texto) ||
            cliente.rfc?.toLowerCase().includes(texto) ||
            cliente.ejecutivo?.toLowerCase().includes(texto)
        );

    });

    if(loading){
        return <p>Cargando...</p>
    }

    return(

        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="row align-items-center mb-4">

                        <div className="col-md-4">

                            <div className="input-group shadow-sm">

                                <span className="input-group-text bg-white">
                                    <FaSearch />
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar cliente, RFC o ejecutivo..."
                                    value={busqueda}
                                    onChange={(e)=>setBusqueda(e.target.value)}
                                />

                            </div>

                        </div>

                        <div className="col-md-4 text-center">

                            <h3 className="mb-0 fw-bold">
                                Clientes Inactivos
                            </h3>

                        </div>

                        <div className="col-md-4 text-end">

                            <span className="badge bg-danger fs-6 px-3 py-2">
                                {clientes.length} inactivos
                            </span>

                        </div>

                    </div>

                    {clientes.length === 0 ? (

                        <div className="alert alert-success mb-0">
                            No hay clientes inactivos.
                        </div>

                    ) : (

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-dark">
                                <tr>
                                    <th>Cliente</th>
                                    <th>RFC</th>
                                    <th>Ejecutivo</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>

                                {clientesFiltrados.map(cliente=>(

                                    <tr key={cliente.id}>

                                        <td>
                                            {cliente.razonSocial}
                                        </td>

                                        <td>
                                            {cliente.rfc}
                                        </td>

                                        <td>
                                            {cliente.ejecutivo || "-"}
                                        </td>

                                        <td>
                                            {
                                                cliente.fechaCreacion
                                                ? new Date(cliente.fechaCreacion).toLocaleDateString()
                                                : "-"
                                            }
                                        </td>

                                        <td>

                                            <div className="d-flex gap-2">

                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={()=>navigate(`/clientes/${cliente.id}`)}
                                                >
                                                    Ver detalle
                                                </button>

                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={()=>activarCliente(cliente.id)}
                                                >
                                                    Activar
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>

    );

}

export default ClientesInactivos;