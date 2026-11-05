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
import { getChartTheme } from "@/shared/themes/chartTheme";
import { getMajorCounts } from "@/modules/members";

ChartJS.register(ArcElement, Tooltip, Legend);

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

  const { palette, surface, muted, ink, fontFamily, fontSize, spacing } = useMemo(
    getChartTheme,
    [],
  );

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
          borderColor: surface,
        },
      ],
    }),
    [majors, palette, surface],
  );

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: muted,
          padding: spacing * 4,
          font: { size: fontSize, family: fontFamily },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: ink,
        titleColor: surface,
        bodyColor: surface,
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
