import "../../../styles/Workflow.css";

import {
    FaFileAlt,
    FaCheckCircle,
    FaShoppingCart,
    FaBoxes,
    FaClipboardCheck
} from "react-icons/fa";

function Workflow({ detalle }) {

    const workflow = detalle.workflow;

    const pasos = [

        {
            nombre: "Solicitud",
            icono: <FaFileAlt size={20} />,
            fecha: workflow.fechaSolicitud,
            responsable: workflow.usuarioSolicitud
        },

        {
            nombre: "Aprobación",
            icono: <FaCheckCircle size={20} />,
            fecha: workflow.fechaAprobacion,
            responsable: workflow.usuarioAprobacion
        },

        {
            nombre: "Orden Compra",
            icono: <FaShoppingCart size={20} />,
            fecha: workflow.fechaOrdenCompra,
            responsable: workflow.usuarioOrdenCompra,
            numero: workflow.numeroOC
        },

        {
            nombre: "Recepción",
            icono: <FaBoxes size={20} />,
            fecha: workflow.fechaRecepcion,
            responsable: workflow.responsableRecepcion,
            estatusRecepcion: workflow.estatusRecepcion
        },

        {
            nombre: "Entregada",
            icono: <FaClipboardCheck size={20} />,
            fecha: workflow.fechaEntrega,
            responsable: workflow.responsableEntrega
        }

    ];

    const ultimoCompletado =
    pasos.reduce((ultimo, paso, indice) => {
        if (paso.fecha)
            return indice;
        return ultimo;
    }, -1);

    const pasosConEstado = pasos.map((paso, indice) => {

        let estado = "pendiente";

        // RECEPCIÓN
        if (paso.nombre === "Recepción") {

            if (workflow.estatusRecepcion === 3) {
                estado = "completado";
            }
            else if (workflow.estatusRecepcion === 2) {
                estado = "parcial";
            }
            else {
                estado = "pendiente";
            }
        }

        // ENTREGA
        else if (paso.nombre === "Entregada") {

            if (workflow.entregada === true) {
                estado = "completado";
            }
            else {
                estado = "pendiente";
            }
        }

        // SOLICITUD, APROBACIÓN Y OC
        else {

            if (paso.fecha) {
                estado = "completado";
            }
            else {
                estado = "pendiente";
            }
        }

        return {
            ...paso,
            estado
        };
    });

    const completados =
        pasosConEstado.filter(x => x.estado === "completado").length;

    const porcentaje =
        ((completados - 1) / (pasosConEstado.length - 1)) * 100;
        console.log(pasosConEstado);
    return (

        <div className="workflow-card">

            <div className="workflow">

                <div className="workflow-line"></div>

                    {pasosConEstado.map((paso, index) => (

                        <div
                            key={index}
                            className="workflow-step"
                        >

                            <div
                                className="workflow-circle"
                                style={{
                                    backgroundColor:
                                        paso.estado === "completado"
                                            ? "#198754"
                                            : paso.estado === "parcial"
                                                ? "#ffc107"
                                                : "#adb5bd"
                                }}
                            >
                                {paso.icono}
                            </div>

                            <div className="workflow-title">

                                {paso.nombre}

                            </div>

                            <div className="workflow-date">

                                {
                                    paso.fecha
                                        ? new Date(paso.fecha).toLocaleDateString("es-MX")
                                        : "--"
                                }
                                {paso.estado === "parcial" && (
                                    <div
                                        style={{
                                            color: "#b58100",
                                            fontWeight: "600",
                                            fontSize: "12px"
                                        }}
                                    >
                                        Recepción parcial
                                    </div>
                                )}

                            </div>

                            {
                                paso.responsable &&

                                <div className="workflow-user">

                                    {paso.responsable}

                                </div>
                            }

                            {
                                paso.numero &&

                                <div className="workflow-oc">

                                    OC: {paso.numero}

                                </div>
                            }

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default Workflow;