import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./Majorbreakdown.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const MajorBreakdown = () => {
  const [majors, setMajors] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setMajors(majorCounts);
        setError(null);
      } catch (error) {
        console.error("Error fetching majors: ", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

  // Function to generate dynamic background colors
  const generateBackgroundColors = (count: number) => {
    const colors = [
      "#1e90ff",
      "#6610f2",
      "#8a2be2",
      "#ff69b4",
      "#ff4d4f",
      "#ffa500",
      "#ffec3d",
      "#52c41a",
      "#20c997",
      "#13c2c2",
      "#ffffff",
      "#adb5bd",
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
          color: "#545454", // Legend font color
          font: {
            size: 16, // Legend font size
            family: "'alibaba-sans', sans-serif", // Font family as a string
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#333333", // Tooltip background color
        titleColor: "#ffffff", // Tooltip title color
        bodyColor: "#ffffff", // Tooltip body color
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
