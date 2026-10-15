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

export default function GraficaClientes() {
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
        label: "Prospectos registrados",
        data: [12, 19, 8, 15, 22, 30, 18, 25, 28, 35, 20, 16],
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