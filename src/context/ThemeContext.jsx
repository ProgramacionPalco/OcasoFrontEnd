import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { Chart as ChartJS } from "chart.js";

const STORAGE_KEY = "tema";

const ThemeContext = createContext({
    tema: "light",
    toggleTema: () => {},
    setTema: () => {}
});

function obtenerTemaInicial() {
    try {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado === "light" || guardado === "dark") return guardado;
    } catch {
        // localStorage no disponible
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function aplicarTemaGraficas(tema) {
    const oscuro = tema === "dark";

    ChartJS.defaults.color = oscuro ? "#ced4da" : "#666";
    ChartJS.defaults.borderColor = oscuro
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.1)";

    // Refresca las gráficas que ya estén montadas
    Object.values(ChartJS.instances).forEach(chart => chart.update());
}

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(obtenerTemaInicial);

    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", tema);
        document.documentElement.style.colorScheme = tema;

        try {
            localStorage.setItem(STORAGE_KEY, tema);
        } catch {
            // localStorage no disponible
        }

        aplicarTemaGraficas(tema);
    }, [tema]);

    const muiTheme = useMemo(
        () => createTheme({ palette: { mode: tema } }),
        [tema]
    );

    const value = useMemo(
        () => ({
            tema,
            setTema,
            toggleTema: () => setTema(t => (t === "dark" ? "light" : "dark"))
        }),
        [tema]
    );

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={muiTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTema = () => useContext(ThemeContext);
