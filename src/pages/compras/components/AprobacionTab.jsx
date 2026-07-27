function AprobacionTab({ aprobacion }) {

    return (

        <div className="card shadow-sm">

            <div className="card-body">

                <h4>Aprobación</h4>

                {
                    !aprobacion ?

                        <div className="alert alert-warning">

                            Pendiente de aprobación

                        </div>

                    :

                        <div className="alert alert-success">

                            Aprobada por <strong>{aprobacion.usuarioNombre}</strong>

                        </div>

                }

            </div>

        </div>

    );

}

export default AprobacionTab;