import { useState } from "react";
import { FaSearch, FaInbox } from "react-icons/fa";

/*
 * Tabla simple con buscador.
 * Props:
 *  - data, columns ({ header, field | render, align?, width? })
 *  - placeholder (opcional): texto del buscador
 *  - vacio (opcional): mensaje cuando no hay registros
 */
function DataTable({ data, columns, placeholder = "Buscar...", vacio = "No hay registros para mostrar." }) {

    const [busqueda,setBusqueda] = useState("");

    const datosFiltrados = data.filter(item =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    const alineacion = (col) =>
        col.align === "end" ? "text-end" : col.align === "center" ? "text-center" : "";

    return (

        <div className="tabla-simple">

            {/* BUSCADOR */}

            <div className="listado-toolbar">

                <div className="explorador-buscar listado-buscar">
                    <FaSearch />
                    <input
                        placeholder={placeholder}
                        value={busqueda}
                        onChange={(e)=>setBusqueda(e.target.value)}
                        aria-label="Buscar"
                    />
                </div>

                <span className="listado-contador">
                    Mostrando <strong>{datosFiltrados.length}</strong> de <strong>{data.length}</strong>
                </span>

            </div>

            {/* TABLA */}

            {datosFiltrados.length === 0 ? (

                <div className="dash-vacio">
                    <FaInbox />
                    <span>{data.length ? "Ningún registro coincide con la búsqueda." : vacio}</span>
                </div>

            ) : (

            <div className="table-responsive">
            <table className="table align-middle docs-tabla tabla-cards">

                <thead>
                    <tr>
                        {columns.map((col,index)=>(
                            <th key={index} className={alineacion(col)} style={col.width ? { width: col.width } : undefined}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>

                    {datosFiltrados.map((row)=>(
                        <tr key={row.id}>

                            {columns.map((col,colIndex)=>(
                                <td key={row.id + "-" + colIndex} className={alineacion(col)}>
                                    {col.render
                                        ? col.render(row)
                                        : row[col.field]
                                    }
                                </td>
                            ))}

                        </tr>
                    ))}

                </tbody>

            </table>
            </div>

            )}

        </div>

    );
}

export default DataTable;
