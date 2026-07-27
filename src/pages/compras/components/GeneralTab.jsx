function GeneralTab({ detalle }) {

    return (

        <div className="card shadow-sm">

            <div className="card-body">

                <div className="row">

                    <div className="col-md-6">

                        <p>
                            <strong>Empresa:</strong><br />
                            {detalle.general.razonSocial}
                        </p>

                        <p>
                            <strong>Solicitante:</strong><br />
                            {detalle.general.solicitanteNombre}
                        </p>

                        <p>
                            <strong>Usuario:</strong><br />
                            {detalle.general.usuario}
                        </p>

                        <p>
                            <strong>Departamento:</strong><br />
                            {detalle.general.nombre}
                        </p>

                    </div>

                    <div className="col-md-6">

                        <p>
                            <strong>Fecha:</strong><br />
                            {
                                new Date(detalle.general.fechaRequisicion)
                                    .toLocaleDateString("es-MX")
                            }
                        </p>

                        <p>
                            <strong>Categoría:</strong><br />
                            {detalle.general.categoria}
                        </p>

                        <p>
                            <strong>Clasificación póliza:</strong><br />
                            {detalle.general.poliza}
                        </p>

                        <p>
                            <strong>Estatus:</strong><br />
                            {detalle.general.estatus}
                        </p>

                    </div>

                </div>

                <hr />

                <h6>Descripción</h6>

                <div className="border rounded p-3 bg-light">

                    {detalle.general.descripcion}

                </div>

                <hr />

                <h6>Comentarios</h6>

                <div className="border rounded p-3 bg-light">

                    {detalle.general.comentarios}

                </div>

            </div>

        </div>

    );

}

export default GeneralTab;