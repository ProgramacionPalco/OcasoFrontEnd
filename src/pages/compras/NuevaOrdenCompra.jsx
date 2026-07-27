import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    obtenerRequisicion,
    obtenerProductosDisponiblesOC,
    crearOrdenCompra
} from "../../services/api";

function NuevaOrdenCompra() {

    const { idRequisicion } = useParams();
    const navigate = useNavigate();

    const [requisicion, setRequisicion] = useState(null);
    const [productos, setProductos] = useState([]);

    const [nombreProveedor, setNombreProveedor] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargar();
    }, []);

     const cargar = async () => {

        try {

            const [req, prod] = await Promise.all([
                obtenerRequisicion(idRequisicion),
                obtenerProductosDisponiblesOC(idRequisicion)
            ]);

            setRequisicion(req.data);
            setProductos(
                prod.data.map(x => ({
                    ...x,
                    seleccionado: false,
                    cantidad: x.cantidadDisponible,
                    precioUnitario: x.precioUnitario
                }))
            );

        }
        catch (e) {

            console.error(e);

        }

    };

    const seleccionarProducto = (indice) => {

        const copia = [...productos];

        copia[indice].seleccionado = !copia[indice].seleccionado;

        setProductos(copia);

    };

    const cambiarCantidad = (indice, valor) => {

        const copia = [...productos];

        let cantidad = Number(valor);

        if (isNaN(cantidad))
            cantidad = 0;

        if (cantidad < 0)
            cantidad = 0;

        if (cantidad > copia[indice].cantidadDisponible)
            cantidad = copia[indice].cantidadDisponible;

        copia[indice].cantidad = cantidad;

        setProductos(copia);

    };

    const cambiarPrecio = (indice, valor) => {

        const copia = [...productos];

        let precio = Number(valor);

        if (isNaN(precio))
            precio = 0;

        copia[indice].precioUnitario = precio;

        setProductos(copia);

    };

    const totalGeneral = useMemo(() => {

        return productos
            .filter(x => x.seleccionado)
            .reduce((a, b) => {

                return a + (b.cantidad * b.precioUnitario);

            }, 0);

    }, [productos]);

    const guardar = async () => {

        const productosSeleccionados = productos
            .filter(x => x.seleccionado)
            .map(x => ({
                idDetalleRequisicion: x.idDetalleRequisicion,
                cantidad: x.cantidad,
                precioUnitario: x.precioUnitario
            }));

        if (nombreProveedor.trim() === "") {

            alert("Capture el proveedor.");

            return;

        }

        if (productosSeleccionados.length === 0) {

            alert("Seleccione al menos un producto.");

            return;

        }

        const dto = {

            idRequisicion: Number(idRequisicion),

            nombreProveedor,

            observaciones,

            productos: productosSeleccionados

        };

        try {

            setGuardando(true);

            await crearOrdenCompra(dto);

            alert("Orden de Compra creada correctamente.");

            navigate(`/compras/${id}/ordenes-compra`);

        }
        catch (e) {

            console.error(e);

            alert("Ocurrió un error al guardar.");

        }
        finally {

            setGuardando(false);

        }

    };

    return (

        <div className="container-fluid">

            <div className="card shadow-sm">

                <div className="card-header">

                    <h3 className="mb-0">
                        Nueva Orden de Compra
                    </h3>

                </div>

                <div className="card-body">

                    {
                        requisicion &&
                        (
                            <>

                                <div className="row mb-4">

                                    <div className="col-md-3">

                                        <label className="form-label fw-bold">
                                            Empresa
                                        </label>

                                        <input
                                            className="form-control"
                                            value={requisicion.requisicion.empresaNombre}
                                            readOnly
                                        />

                                    </div>

                                    <div className="col-md-3">

                                        <label className="form-label fw-bold">
                                            Solicitante
                                        </label>

                                        <input
                                            className="form-control"
                                            value={requisicion.requisicion.solicitanteNombre}
                                            readOnly
                                        />

                                    </div>

                                    <div className="col-md-3">

                                        <label className="form-label fw-bold">
                                            Fecha
                                        </label>

                                        <input
                                            className="form-control"
                                            value={new Date(requisicion.requisicion.fecha).toLocaleDateString()}
                                            readOnly
                                        />

                                    </div>

                                    <div className="col-md-3">

                                        <label className="form-label fw-bold">
                                            Categoría
                                        </label>

                                        <input
                                            className="form-control"
                                            value={requisicion.requisicion.categoriaNombre}
                                            readOnly
                                        />

                                    </div>

                                </div>

                                <div className="mb-3">

                                    <label className="form-label fw-bold">
                                        Descripción
                                    </label>

                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={requisicion.requisicion.descripcion}
                                        readOnly
                                    />

                                </div>

                            </>
                        )
                    }

                    <hr />

                    <div className="row">

                        <div className="col-md-6">

                            <label className="form-label fw-bold">
                                Proveedor
                            </label>

                            <input
                                className="form-control"
                                value={nombreProveedor}
                                onChange={e => setNombreProveedor(e.target.value)}
                            />

                        </div>

                        <div className="col-md-6">

                            <label className="form-label fw-bold">
                                Observaciones
                            </label>

                            <input
                                className="form-control"
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                            />

                        </div>

                    </div>

                    <hr />

                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th></th>

                                    <th>Concepto</th>

                                    <th width="120">
                                        Disponible
                                    </th>

                                    <th width="150">
                                        Cantidad
                                    </th>

                                    <th width="170">
                                        Precio Unitario
                                    </th>

                                    <th width="150">
                                        Total
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {
                                    productos.map((p, i) => (

                                        <tr key={p.idDetalleRequisicion}>

                                            <td>

                                                <input
                                                    type="checkbox"
                                                    checked={p.seleccionado}
                                                    onChange={() => seleccionarProducto(i)}
                                                />

                                            </td>

                                            <td>

                                                {p.descripcion}

                                            </td>

                                            <td>

                                                {p.cantidadDisponible}

                                            </td>

                                            <td>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    max={p.cantidadDisponible}
                                                    value={p.cantidad}
                                                    disabled={!p.seleccionado}
                                                    onChange={(e) =>
                                                        cambiarCantidad(i, e.target.value)
                                                    }
                                                />

                                            </td>

                                            <td>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={p.precioUnitario}
                                                    disabled={!p.seleccionado}
                                                    onChange={(e) =>
                                                        cambiarPrecio(i, e.target.value)
                                                    }
                                                />

                                            </td>

                                            <td className="text-end">

                                                {(
                                                    p.cantidad *
                                                    p.precioUnitario
                                                ).toLocaleString("es-MX", {
                                                    style: "currency",
                                                    currency: "MXN"
                                                })}

                                            </td>

                                        </tr>

                                    ))
                                }

                            </tbody>

                        </table>

                    </div>

                    <div className="row mt-4">

                        <div className="col-md-6">

                            <h4>

                                Total:

                                {" "}

                                <span className="text-primary">

                                    {totalGeneral.toLocaleString("es-MX", {
                                        style: "currency",
                                        currency: "MXN"
                                    })}

                                </span>

                            </h4>

                        </div>

                        <div className="col-md-6 text-end">

                            <button
                                className="btn btn-secondary me-2"
                                onClick={() => navigate(-1)}
                            >

                                Cancelar

                            </button>

                            <button
                                className="btn btn-primary"
                                disabled={guardando}
                                onClick={guardar}
                            >

                                {guardando
                                    ? "Guardando..."
                                    : "Guardar Orden de Compra"}

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default NuevaOrdenCompra;