import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./Majorbreakdown.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const MajorBreakdown = () => {
  const [majors, setMajors] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchMajors = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, "users");

      try {
        const querySnapshot = await getDocs(usersCollection);
        const majorCounts: Record<string, number> = {};
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.major) {
            majorCounts[data.major] = (majorCounts[data.major] || 0) + 1;
          }
        });

        // Sort majors alphabetically
        const sortedMajors = Object.keys(majorCounts)
          .sort()
          .reduce(
            (acc, key) => {
              acc[key] = majorCounts[key];
              return acc;
            },
            {} as Record<string, number>
          );

        setMajors(sortedMajors);
      } catch (error) {
        console.error("Error fetching majors: ", error);
      }
    };

    fetchMajors();
  }, []);

  // Function to generate dynamic background colors
  const generateBackgroundColors = (count: number) => {
    const colors = [
      "#EF3063",
      "#FDB40D",
      "#353954",
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
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const data = {
    labels: Object.keys(majors),
    datasets: [
      {
        label: "Number of Students",
        data: Object.values(majors),
        backgroundColor: generateBackgroundColors(Object.keys(majors).length),
        hoverBackgroundColor: generateBackgroundColors(
          Object.keys(majors).length
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#545454",
          font: {
            size: 16,
            family: "'alibaba-sans', sans-serif",
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#333333",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
  };

  return (
    <div className="major-breakdown">
      <h3>Major Breakdown</h3>
      <div className="graph-container">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default MajorBreakdown;
