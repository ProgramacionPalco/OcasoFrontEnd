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

export default function GraficaProspectos({prospectosAnuales}) {
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
        data: [
          Number(prospectosAnuales?.enero ?? 0),
          Number(prospectosAnuales?.febrero ?? 0),
          Number(prospectosAnuales?.marzo ?? 0),
          Number(prospectosAnuales?.abril ?? 0),
          Number(prospectosAnuales?.mayo ?? 0),
          Number(prospectosAnuales?.junio ?? 0),
          Number(prospectosAnuales?.julio ?? 0),
          Number(prospectosAnuales?.agosto ?? 0),
          Number(prospectosAnuales?.septiembre ?? 0),
          Number(prospectosAnuales?.octubre ?? 0),
          Number(prospectosAnuales?.noviembre ?? 0),
          Number(prospectosAnuales?.diciembre ?? 0),
        ],
        backgroundColor: "#0D6EFD",
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
          Prospectos registrados anualmente
        </h5>

        <div style={{ height: "350px" }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}