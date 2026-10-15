import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    obtenerDetalleOrdenCompra,
    registrarRecepcion
} from "../../services/api";

function DetalleOrdenCompra() {

    const { idOrdenCompra } = useParams();
    const navigate = useNavigate();

    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);

    const [mostrarRecepcion, setMostrarRecepcion] = useState(false);
    const [observacionesRecepcion, setObservacionesRecepcion] =
        useState("");
    const [cantidadesRecibidas, setCantidadesRecibidas] =
        useState({});
    const [guardandoRecepcion, setGuardandoRecepcion] =
        useState(false);

    useEffect(() => {
        cargar();
    }, [idOrdenCompra]);

    const cambiarCantidadRecibida = (idDetalle, valor) => {

        setCantidadesRecibidas(prev => ({
            ...prev,
            [idDetalle]: valor
        }));
    };

    const guardarRecepcion = async () => {

        const productos = (orden.productos ?? [])
            .map(producto => ({
                idOrdenCompraDetalle:
                    producto.idOrdenCompraDetalle,

                cantidadRecibida:
                    Number(
                        cantidadesRecibidas[
                            producto.idOrdenCompraDetalle
                        ] || 0
                    )
            }))
            .filter(x => x.cantidadRecibida > 0);


        if (productos.length === 0) {

            alert(
                "Captura la cantidad recibida de al menos un producto."
            );

            return;
        }


        const dto = {

            idOrdenCompra: Number(idOrdenCompra),

            observaciones:
                observacionesRecepcion,

            productos
        };


        try {

            setGuardandoRecepcion(true);

            const { data } =
                await registrarRecepcion(dto);

            alert(
                data.message ||
                "Recepción registrada correctamente."
            );


            setMostrarRecepcion(false);

            setCantidadesRecibidas({});

            setObservacionesRecepcion("");

            await cargar();

        }
        catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "No fue posible registrar la recepción."
            );

        }
        finally {

            setGuardandoRecepcion(false);

        }
    };

    const cargar = async () => {

        try {

            const { data } =
                await obtenerDetalleOrdenCompra(idOrdenCompra);

            setOrden(data);

        }
        catch (error) {

            console.error(error);

            alert("No fue posible cargar la Orden de Compra.");

        }
        finally {

            setLoading(false);

        }
    };


    if (loading) {

        return (
            <div className="container-fluid py-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="mt-3">
                    Cargando Orden de Compra...
                </p>

            </div>
        );
    }


    if (!orden) {

        return (
            <div className="container-fluid">

                <div className="alert alert-warning">
                    No se encontró la Orden de Compra.
                </div>

            </div>
        );
    }


    const totalOrden = (orden.productos ?? [])
        .reduce(
            (total, producto) =>
                total + Number(producto.total ?? 0),
            0
        );


    return (

        <div className="container-fluid">

            {/* ENCABEZADO */}
            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start">

                        <div>

                            <h3 className="mb-1">
                                Orden de Compra
                            </h3>

                            <h4 className="text-primary mb-0">
                                {orden.numeroOC}
                            </h4>

                        </div>

                        <div className="d-flex gap-2">

                            <button
                                className="btn btn-success"
                                onClick={() =>
                                    setMostrarRecepcion(true)
                                }
                            >
                                Registrar recepción
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate(
                                        `/compras/orden-compra/${orden.idRequisicion}`
                                    )
                                }
                            >
                                Regresar
                            </button>

                        </div>
                        

                    </div>

                    <hr />

                    <div className="row">

                        <div className="col-md-3 mb-3">

                            <strong>Requisición</strong>

                            <div>
                                REQ-{orden.idRequisicion}
                            </div>

                        </div>


                        <div className="col-md-3 mb-3">

                            <strong>Proveedor</strong>

                            <div>
                                {orden.nombreProveedor || "--"}
                            </div>

                        </div>


                        <div className="col-md-3 mb-3">

                            <strong>Fecha</strong>

                            <div>
                                {orden.fecha
                                    ? new Date(
                                        orden.fecha
                                    ).toLocaleDateString("es-MX")
                                    : "--"}
                            </div>

                        </div>


                        <div className="col-md-3 mb-3">

                            <strong>Total OC</strong>

                            <div className="fs-5 text-success fw-bold">

                                $
                                {totalOrden.toLocaleString(
                                    "es-MX",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="mt-2">

                        <strong>Observaciones</strong>

                        <div>
                            {orden.observaciones || "Sin observaciones"}
                        </div>

                    </div>

                </div>

            </div>


            {/* PRODUCTOS */}
            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-4">
                        Productos
                    </h4>

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Concepto</th>
                                    <th className="text-center">Comprado</th>
                                    <th className="text-center">Recibido</th>
                                    <th className="text-center">Pendiente</th>
                                    <th className="text-end">Precio Unitario</th>
                                    <th className="text-end">Total</th>
                                </tr>
                            </thead>

                            <tbody>

                                {(orden.productos ?? []).map(
                                    (producto, index) => (

                                        <tr key={producto.idOrdenCompraDetalle}>

                                            <td>
                                                {producto.concepto}
                                            </td>

                                            <td className="text-center">
                                                {producto.cantidad}
                                            </td>

                                            <td className="text-center">
                                                {producto.cantidadRecibida}
                                            </td>

                                            <td className="text-center">
                                                <strong>
                                                    {producto.cantidadPendiente}
                                                </strong>
                                            </td>

                                            <td className="text-end">
                                                $
                                                {Number(producto.precioUnitario)
                                                    .toLocaleString("es-MX", {
                                                        minimumFractionDigits: 2
                                                    })}
                                            </td>

                                            <td className="text-end fw-bold">
                                                $
                                                {Number(producto.total)
                                                    .toLocaleString("es-MX", {
                                                        minimumFractionDigits: 2
                                                    })}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>


                            <tfoot>

                                <tr>

                                    <td
                                        colSpan="3"
                                        className="text-end fw-bold"
                                    >
                                        Total Orden de Compra:
                                    </td>

                                    <td className="text-end fw-bold fs-5 text-success">

                                        $
                                        {totalOrden.toLocaleString(
                                            "es-MX",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )}

                                    </td>

                                </tr>

                            </tfoot>

                        </table>

                    </div>

                </div>

            </div>

            {/* Recepción */}
            {mostrarRecepcion && (

                <div className="card shadow-sm mt-4">

                    <div className="card-body">

                        <div
                            className="
                                d-flex
                                justify-content-between
                                align-items-center
                                mb-4
                            "
                        >

                            <h4 className="mb-0">
                                Registrar recepción
                            </h4>

                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                    setMostrarRecepcion(false)
                                }
                            >
                                Cancelar
                            </button>

                        </div>


                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead className="table-light">
                                    <tr>
                                        <th>Producto</th>

                                        <th width="150">
                                            Pendiente por recibir
                                        </th>

                                        <th width="200">
                                            Cantidad recibida
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {(orden.productos ?? []).map(producto => (

                                        <tr key={producto.idOrdenCompraDetalle}>

                                            <td>
                                                {producto.concepto}
                                            </td>

                                            <td>
                                                {producto.cantidadPendiente}
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={producto.cantidadPendiente}
                                                    step="1"
                                                    className="form-control"
                                                    value={
                                                        cantidadesRecibidas[
                                                            producto.idOrdenCompraDetalle
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        cambiarCantidadRecibida(
                                                            producto.idOrdenCompraDetalle,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                        <div className="mt-3">

                            <label className="form-label fw-bold">
                                Observaciones
                            </label>

                            <textarea
                                className="form-control"
                                rows="3"
                                value={observacionesRecepcion}
                                onChange={(e) =>
                                    setObservacionesRecepcion(
                                        e.target.value
                                    )
                                }
                                placeholder="Observaciones de la recepción..."
                            />

                        </div>


                        <div className="text-end mt-4">

                            <button
                                className="btn btn-success"
                                disabled={guardandoRecepcion}
                                onClick={guardarRecepcion}
                            >

                                {guardandoRecepcion
                                    ? "Guardando..."
                                    : "Guardar recepción"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default DetalleOrdenCompra;