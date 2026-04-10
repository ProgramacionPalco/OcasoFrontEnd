import { useState } from "react";

function DataTable({ data, columns }) {

    const [busqueda,setBusqueda] = useState("");

    const datosFiltrados = data.filter(item =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    return (

        <div>

            {/* BUSCADOR */}

            <input
                className="form-control mb-3"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e)=>setBusqueda(e.target.value)}
            />

            {/* TABLA */}

            <table className="table table-bordered table-striped">

                <thead className="table-dark">
                    <tr>
                        {columns.map((col,index)=>(
                            <th key={index}>{col.header}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>

                    {datosFiltrados.map((row)=>(
                        <tr key={row.id}>

                            {columns.map((col,colIndex)=>(
                                <td key={row.id + "-" + colIndex}>
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

    );
}

export default DataTable;