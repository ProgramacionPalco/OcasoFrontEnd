import { useNavigate } from "react-router-dom";
import {
    FaShieldAlt,
    FaCertificate,
    FaGlobeAmericas,
    FaFolderOpen,
    FaChevronRight,
    FaHome
} from "react-icons/fa";

const PROGRAMAS = [
    {
        nombre: "ISO",
        ruta: "/calidad/iso",
        titulo: "Sistema de Gestión ISO",
        descripcion: "Manuales, procedimientos, formatos y registros del sistema de gestión de calidad.",
        icono: <FaCertificate />,
        tono: "primary"
    },
    {
        nombre: "OEA",
        ruta: "/calidad/oea",
        titulo: "Operador Económico Autorizado",
        descripcion: "Documentación y evidencias de cumplimiento para la certificación OEA.",
        icono: <FaGlobeAmericas />,
        tono: "warning"
    }
];

export default function CalidadExplorador(){

const navigate = useNavigate();

return(

<div className="container-fluid dash">

    {/* ========================= */}
    {/* ENCABEZADO */}
    {/* ========================= */}

    <div className="dash-hero mb-4">
        <div className="dash-hero-texto">
            <span className="dash-eyebrow">Calidad</span>
            <h2 className="dash-titulo">Sistema de Gestión de Calidad</h2>
            <div className="dash-contexto">
                <span><FaShieldAlt /> ISO · OEA</span>
                <span><FaFolderOpen /> Repositorio documental</span>
            </div>
        </div>
    </div>

    {/* Breadcrumb */}

    <nav className="explorador-ruta mb-3" aria-label="Ruta">
        <span className="explorador-ruta-actual">
            <FaHome /> Calidad
        </span>
    </nav>

    {/* ========================= */}
    {/* PROGRAMAS */}
    {/* ========================= */}

    <div className="row g-3">

        {PROGRAMAS.map((p) => (

            <div className="col-12 col-md-6 col-xl-5" key={p.nombre}>

                <div
                    className={`programa-card programa-${p.tono}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(p.ruta)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(p.ruta);
                        }
                    }}
                >

                    <div className="programa-top">
                        <span className={`programa-icono dash-tono-${p.tono}`}>
                            {p.icono}
                        </span>
                        <span className="programa-sigla">{p.nombre}</span>
                    </div>

                    <h5 className="programa-titulo">{p.titulo}</h5>

                    <p className="programa-descripcion">{p.descripcion}</p>

                    <div className="programa-pie">
                        <span className="programa-carpeta">
                            <FaFolderOpen /> Carpeta {p.nombre}
                        </span>
                        <span className="programa-abrir">
                            Abrir documentos <FaChevronRight />
                        </span>
                    </div>

                </div>

            </div>

        ))}

    </div>

</div>

)

}
