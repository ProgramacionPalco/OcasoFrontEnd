import { useEffect } from "react";

/*
 * Prepara las tablas del contenedor para mostrarse como tarjetas en celular.
 *
 * Copia el texto de cada encabezado al atributo data-label de sus celdas,
 * y responsive.css usa ese atributo para mostrar "Etiqueta: valor" en cada fila.
 *
 * Funciona con:
 *  - <table className="table"> de Bootstrap
 *  - react-data-table-component (.rdt_Table)
 *
 * Para excluir una tabla agregue la clase "no-cards" (en el <table> o en un contenedor).
 * Solo agrega atributos; no modifica datos, eventos ni la estructura que maneja React.
 */

const EXCLUIR = ".no-cards, .productos-table";

function textoEncabezado(el) {
    return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function prepararTablaHtml(tabla) {
    if (tabla.closest(EXCLUIR)) return;

    const filaEncabezado = tabla.tHead?.rows?.[tabla.tHead.rows.length - 1];
    if (!filaEncabezado) return;

    // Encabezados con colspan/rowspan complejos: no se convierten
    const ths = Array.from(filaEncabezado.cells);
    if (tabla.tHead.rows.length > 1 || ths.some(th => th.colSpan > 1)) return;

    const etiquetas = ths.map(textoEncabezado);

    tabla.classList.add("tabla-cards");

    Array.from(tabla.tBodies).forEach(tbody => {
        Array.from(tbody.rows).forEach(tr => {
            const celdas = Array.from(tr.cells);

            // Fila de "sin datos" / mensaje que abarca toda la tabla
            if (celdas.length === 1 && celdas[0].colSpan > 1) {
                tr.classList.add("tabla-cards-mensaje");
                return;
            }

            let indice = 0;
            celdas.forEach(td => {
                const etiqueta = etiquetas[indice] ?? "";
                if (td.getAttribute("data-label") !== etiqueta) {
                    td.setAttribute("data-label", etiqueta);
                }
                indice += td.colSpan || 1;
            });
        });
    });
}

function prepararTablaRdt(tabla) {
    if (tabla.closest(EXCLUIR)) return;

    const etiquetas = {};
    tabla
        .querySelectorAll(".rdt_TableHeadRow [data-column-id]")
        .forEach(col => {
            const id = col.getAttribute("data-column-id");
            if (id && !(id in etiquetas)) etiquetas[id] = textoEncabezado(col);
        });

    tabla
        .querySelectorAll(".rdt_TableRow .rdt_TableCell[data-column-id]")
        .forEach(celda => {
            const etiqueta = etiquetas[celda.getAttribute("data-column-id")] ?? "";
            if (celda.getAttribute("data-label") !== etiqueta) {
                celda.setAttribute("data-label", etiqueta);
            }
        });

    tabla.classList.add("rdt-cards");
}

function prepararTodo(raiz) {
    raiz.querySelectorAll("table").forEach(prepararTablaHtml);
    raiz.querySelectorAll(".rdt_Table").forEach(prepararTablaRdt);
}

export default function useTablasResponsivas(ref) {
    useEffect(() => {
        const raiz = ref.current;
        if (!raiz) return;

        let pendiente = null;

        const programar = () => {
            if (pendiente) return;
            pendiente = requestAnimationFrame(() => {
                pendiente = null;
                prepararTodo(raiz);
            });
        };

        prepararTodo(raiz);

        // Solo observa altas/bajas de nodos y texto: poner data-label no vuelve a disparar el observador
        const observer = new MutationObserver(programar);
        observer.observe(raiz, { childList: true, subtree: true, characterData: true });

        return () => {
            observer.disconnect();
            if (pendiente) cancelAnimationFrame(pendiente);
        };
    }, [ref]);
}
