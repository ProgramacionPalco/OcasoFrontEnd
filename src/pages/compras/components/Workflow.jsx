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
            responsable: workflow.responsableRecepcion
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
        if (indice <= ultimoCompletado)
            estado = "completado";
        else if (indice === ultimoCompletado + 1)
            estado = "actual";
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
                <div
                 className="workflow-progress"
                style={{ width: `${Math.max(0, porcentaje)}%` }}
            ></div>
                {

                    pasosConEstado.map((paso, index) => (

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
                                            : paso.estado === "actual"
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