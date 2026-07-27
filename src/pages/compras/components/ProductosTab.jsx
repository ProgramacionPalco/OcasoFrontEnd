function ProductosTab({ productos }) {

    return (

        <div className="card shadow-sm">

            <div className="card-body">

                <table className="table table-hover align-middle">

                    <thead>

                        <tr>

                            <th>Cantidad</th>

                            <th>Concepto</th>

                            <th className="text-end">

                                Precio Unitario

                            </th>

                            <th className="text-end">

                                IVA

                            </th>

                            <th className="text-end">

                                Total

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            productos.map(producto => (

                                <tr key={producto.id}>

                                    <td>

                                        {producto.cantidad}

                                    </td>

                                    <td>

                                        {producto.concepto}

                                    </td>

                                    <td className="text-end">

                                        $
                                        {
                                            Number(producto.precioUnitario)
                                                .toLocaleString("es-MX", {
                                                    minimumFractionDigits:2
                                                })
                                        }

                                    </td>

                                    <td className="text-end">

                                        $
                                        {
                                            Number(producto.iva)
                                                .toLocaleString("es-MX", {
                                                    minimumFractionDigits:2
                                                })
                                        }

                                    </td>

                                    <td className="text-end fw-bold">

                                        $
                                        {
                                            Number(producto.total)
                                                .toLocaleString("es-MX", {
                                                    minimumFractionDigits:2
                                                })
                                        }

                                    </td>

                                </tr>

                            ))
                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default ProductosTab;