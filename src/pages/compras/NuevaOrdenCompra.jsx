import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    obtenerRequisicion,
    obtenerProductosDisponiblesOC,
    crearOrdenCompra
} from "../../services/api";
import {
    FaClipboardList,
    FaBuilding,
    FaUser,
    FaCalendarAlt,
    FaTags,
    FaFileInvoiceDollar,
    FaHashtag,
    FaTruck,
    FaBoxOpen,
    FaSave
} from "react-icons/fa";

function NuevaOrdenCompra() {

    const { idRequisicion } = useParams();
    const navigate = useNavigate();

    const [requisicion, setRequisicion] = useState(null);
    const [productos, setProductos] = useState([]);
    const [numeroOC, setNumeroOC] = useState("");
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


        // Validar número OC
        if (numeroOC.trim() === "") {
            alert("Capture el número de Orden de Compra.");
            return;
        }


        // Validar proveedor
        if (nombreProveedor.trim() === "") {
            alert("Capture el proveedor.");
            return;
        }


        // Validar productos
        if (productosSeleccionados.length === 0) {
            alert("Seleccione al menos un producto.");
            return;
        }


        // DTO QUE SE ENVÍA AL API
        const dto = {
            idRequisicion: Number(idRequisicion),
            numeroOC: numeroOC.trim(),
            nombreProveedor: nombreProveedor.trim(),
            observaciones,
            productos: productosSeleccionados
        };


        try {

            setGuardando(true);

            await crearOrdenCompra(dto);

            alert("Orden de Compra creada correctamente.");

            navigate(`/compras/orden-compra/${idRequisicion}`);

        }
        catch (e) {

            console.error(e);

            alert("Ocurrió un error al guardar.");

        }
        finally {

            setGuardando(false);

        }

    };

    const moneda = (valor) =>
        Number(valor || 0).toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
        });

    const seleccionados = productos.filter(x => x.seleccionado).length;

    const req = requisicion?.requisicion;

    const RESUMEN = req
        ? [
            { label: "Empresa", valor: req.razonSocial, icono: <FaBuilding /> },
            { label: "Solicitante", valor: req.solicitanteNombre, icono: <FaUser /> },
            { label: "Fecha", valor: req.fecha ? new Date(req.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "", icono: <FaCalendarAlt /> },
            { label: "Categoría", valor: req.categoria, icono: <FaTags /> }
        ]
        : [];

    return (

        <div className="container-fluid dash">

            {/* ========================= */}
            {/* ENCABEZADO */}
            {/* ========================= */}

            <div className="dash-hero mb-4">

                <div className="dash-hero-texto">
                    <span className="dash-eyebrow">Compras</span>
                    <h2 className="dash-titulo">Nueva orden de compra</h2>
                    <div className="dash-contexto">
                        <span><FaClipboardList /> Requisición REQ-{idRequisicion}</span>
                    </div>
                </div>

                <div className="nr-hero-total">
                    <span>Total de la orden</span>
                    <strong>{moneda(totalGeneral)}</strong>
                </div>

            </div>

            {/* ========================= */}
            {/* DATOS DE LA REQUISICIÓN */}
            {/* ========================= */}

            {req && (
                <div className="dash-panel nc-form p-0 overflow-hidden mb-4">

                    <div className="nc-form-header">
                        <span className="nc-form-icono"><FaClipboardList /></span>
                        <div>
                            <h3 className="nc-form-titulo">Datos de la requisición</h3>
                            <div className="nc-form-sub">Información de origen (solo lectura)</div>
                        </div>
                    </div>

                    <div className="nc-form-cuerpo">

                        <div className="oc-resumen">
                            {RESUMEN.map((r) => (
                                <div className="oc-resumen-item" key={r.label}>
                                    <span className="oc-resumen-icono">{r.icono}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <small>{r.label}</small>
                                        <span className="text-break">{r.valor || "—"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {req.descripcion && (
                            <div className="oc-descripcion">
                                <small>Descripción</small>
                                <p className="mb-0">{req.descripcion}</p>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* ========================= */}
            {/* DATOS DE LA ORDEN */}
            {/* ========================= */}

            <div className="dash-panel nc-form p-0 overflow-hidden mb-4">

                <div className="nc-form-header">
                    <span className="nc-form-icono"><FaFileInvoiceDollar /></span>
                    <div>
                        <h3 className="nc-form-titulo">Datos de la orden</h3>
                        <div className="nc-form-sub">Número de OC, proveedor y observaciones</div>
                    </div>
                </div>

                <div className="nc-form-cuerpo">
                    <div className="row g-3">

                        <div className="col-md-4">

                            <label className="form-label">
                                Número de orden de compra <span className="text-danger">*</span>
                            </label>

                            <div className="nr-input-icono">
                                <FaHashtag />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej. OC-12345"
                                    value={numeroOC}
                                    onChange={(e) =>
                                        setNumeroOC(e.target.value)
                                    }
                                />
                            </div>

                        </div>

                        <div className="col-md-4">

                            <label className="form-label">
                                Proveedor <span className="text-danger">*</span>
                            </label>

                            <div className="nr-input-icono">
                                <FaTruck />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nombre del proveedor"
                                    value={nombreProveedor}
                                    onChange={(e) =>
                                        setNombreProveedor(e.target.value)
                                    }
                                />
                            </div>

                        </div>

                        <div className="col-md-4">

                            <label className="form-label">
                                Observaciones
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Opcional"
                                value={observaciones}
                                onChange={(e) =>
                                    setObservaciones(e.target.value)
                                }
                            />

                        </div>

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
                        <div className="nc-form-sub">Marque los productos que incluirá esta orden</div>
                    </div>
                    <span className="nc-form-paso">
                        {seleccionados} de {productos.length} seleccionados
                    </span>
                </div>

                {productos.length === 0 ? (

                    <div className="dash-vacio">
                        <FaBoxOpen />
                        <span>No hay productos disponibles para esta requisición.</span>
                    </div>

                ) : (

                <div className="table-responsive">

                    <table className="table align-middle docs-tabla tabla-cards productos-table oc-tabla">

                        <thead>

                            <tr>

                                <th style={{ width: 50 }}></th>

                                <th>Concepto</th>

                                <th className="text-center" style={{ width: 120 }}>
                                    Disponible
                                </th>

                                <th style={{ width: 140 }}>
                                    Cantidad
                                </th>

                                <th style={{ width: 180 }}>
                                    Precio unitario
                                </th>

                                <th className="text-end" style={{ width: 150 }}>
                                    Total
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                productos.map((p, i) => (

                                    <tr
                                        key={p.idDetalleRequisicion}
                                        className={p.seleccionado ? "oc-fila-sel" : "oc-fila"}
                                    >

                                        <td>

                                            <input
                                                type="checkbox"
                                                className="form-check-input oc-check"
                                                checked={p.seleccionado}
                                                onChange={() => seleccionarProducto(i)}
                                                aria-label={`Seleccionar ${p.descripcion}`}
                                            />

                                        </td>

                                        <td
                                            className="oc-concepto"
                                            onClick={() => seleccionarProducto(i)}
                                        >

                                            {p.descripcion}

                                        </td>

                                        <td className="text-center">

                                            <span className="rd-contador rd-contador-cero">
                                                {p.cantidadDisponible}
                                            </span>

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

                                            <div className="nr-input-moneda">
                                                <span>$</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={p.precioUnitario}
                                                    disabled={!p.seleccionado}
                                                    onChange={(e) =>
                                                        cambiarPrecio(i, e.target.value)
                                                    }
                                                />
                                            </div>

                                        </td>

                                        <td className="text-end nr-monto fw-semibold">

                                            {moneda(p.cantidad * p.precioUnitario)}

                                        </td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                </div>

                )}

                <div className="nr-productos-pie">
                    <span className="listado-contador">
                        Solo se suman los productos seleccionados
                    </span>
                    <div className="nr-total">
                        <span>Total</span>
                        <strong>{moneda(totalGeneral)}</strong>
                    </div>
                </div>

            </div>

            {/* ========================= */}
            {/* ACCIONES */}
            {/* ========================= */}

            <div className="nr-acciones mb-4">

                <div className="nr-acciones-total">
                    <span>Total</span>
                    <strong>{moneda(totalGeneral)}</strong>
                </div>

                <div className="d-flex gap-2 nr-acciones-botones">

                    <button
                        className="btn btn-outline-secondary np-btn"
                        onClick={() => navigate(-1)}
                    >

                        Cancelar

                    </button>

                    <button
                        className="btn btn-primary np-btn"
                        disabled={guardando}
                        onClick={guardar}
                    >

                        {guardando
                            ? <><span className="spinner-border spinner-border-sm" role="status" /> Guardando...</>
                            : <><FaSave /> Guardar orden de compra</>}

                    </button>

                </div>

            </div>

        </div>

    );

}

export default NuevaOrdenCompra;