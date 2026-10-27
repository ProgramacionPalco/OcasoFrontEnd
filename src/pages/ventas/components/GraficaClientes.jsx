import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { useEffect, useState } from "react";

export default function GraficaClientes({clientesAnuales}) {

  const data = {
    labels: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    datasets: [
      {
        label: "Clientes registrados",
        data: [
          Number(clientesAnuales?.enero ?? 0),
          Number(clientesAnuales?.febrero ?? 0),
          Number(clientesAnuales?.marzo ?? 0),
          Number(clientesAnuales?.abril ?? 0),
          Number(clientesAnuales?.mayo ?? 0),
          Number(clientesAnuales?.junio ?? 0),
          Number(clientesAnuales?.julio ?? 0),
          Number(clientesAnuales?.agosto ?? 0),
          Number(clientesAnuales?.septiembre ?? 0),
          Number(clientesAnuales?.octubre ?? 0),
          Number(clientesAnuales?.noviembre ?? 0),
          Number(clientesAnuales?.diciembre ?? 0),
        ],
        backgroundColor: "#198754",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="fw-semibold mb-3">
          Clientes registrados anualmente
        </h5>

        <div style={{ height: "350px" }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}