import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getMajorCounts } from "@/modules/members";

ChartJS.register(ArcElement, Tooltip, Legend);

const palette = [
  "#7f170e",
  "#eab308",
  "#84322c",
  "#672394",
  "#0CB2C0",
  "#F725A0",
  "#3377DC",
  "#FF5E78",
  "#FFC857",
  "#2E2F3A",
  "#7A4EA3",
  "#1DD1A1",
  "#FF5CAF",
  "#3498DB",
];

export function MajorBreakdownChart() {
  const [majors, setMajors] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    void getMajorCounts()
      .then((counts) => {
        if (active) setMajors(counts);
      })
      .catch((error) => console.error("Error fetching major breakdown", error));
    return () => {
      active = false;
    };
  }, []);

  const data = useMemo<ChartData<"doughnut">>(
    () => ({
      labels: Object.keys(majors),
      datasets: [
        {
          label: "Number of Students",
          data: Object.values(majors),
          backgroundColor: Object.keys(majors).map((_, index) => palette[index % palette.length]),
          hoverBackgroundColor: Object.keys(majors).map(
            (_, index) => palette[index % palette.length],
          ),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }),
    [majors],
  );

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#6a615d",
          padding: 16,
          font: { size: 14, family: "'alibaba-sans', sans-serif" },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#241d1b",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
  };

  return (
    <section className="section-muted section">
      <div className="container-page">
        <p className="eyebrow">By the numbers</p>
        <h2 className="section-title mt-3">Major Breakdown</h2>
        <div className="mt-10 h-[60vh] max-h-[32rem] w-full">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

export default MajorBreakdownChart;
