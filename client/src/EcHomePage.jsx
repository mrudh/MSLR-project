import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api";
import heroImageSrc from './assets/ec-home.jpg';
import "./styles/ecLayout.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


const EcHomePage = () => {
  const [stats, setStats] = useState({
    totalPopulation: 0,
    eligibleVoters: 0,
    percentVoted: 0,
  });

  const [overview, setOverview] = useState([]);

  useEffect(() => {
    api.get("/ec/overview")
      .then((res) => setOverview(res.data?.overview || []))
      .catch(() => {});
  }, []);


  useEffect(() => {
    api
      .get("/ec/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const barData = {
  labels: overview.map((r) => `Ref ${r.referendum_id}`),
  datasets: [
    {
      label: "Total votes cast",
      data: overview.map((r) => r.totalVotes),

      backgroundColor: "#6495ED", 
      borderColor: "#87CEEB",
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  scales: {
        x: {
      title: {
        display: true,
        text: "Referendums",
        font: {
          size: 14,
          weight: "bold",
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      title: {
        display: true,
        text: "Total Votes Cast",
        font: {
          size: 14,
          weight: "bold",
        },
      },
    },
  },
};


  return (
    <div>
      <h2 className="panel">Election Commission</h2>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="mb-3">
            <img
              src={heroImageSrc}
              alt="Shangri-La"
              style={{
                width: "100%",
                height: 280,
                objectFit: "cover",
                border: "2px solid #d9d9d9",
              }}
            />
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 420 }}>
            The Valley of Shangri-La is at a turning point. A new proposal to expand the valley's boundaries into nearby counties has sparked lively discussion across the community. To ensure everyone has a say in the valley's future, the council is holding a public vote where residents can choose whether to support the expansion or keep things as they are.
          </p>

        </div>

        <div className="col-lg-8">
          <div className="mb-4 panel">
            <div className="row g-4 align-items-center">
              <div className="col-md-8">
                <h3 className="mb-3 fw-normal">
                  Voting status
                </h3>

                {overview.length === 0 ? (
                  <p className="text-muted mb-0">No referendum data available.</p>
                ) : (
                  <Bar data={barData} options={barOptions} />
                )}
              </div>

              <div className="col-md-4 mt-2">
                <div className="statTile">
                  <div className="statLabel">% of people voted</div>
                  <div className="statValue">{stats.percentVoted}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 className="mb-3">
              Quick Links
            </h3>

            <ul style={{ fontSize: 20, lineHeight: 1.8 }}>
              <li className="mb-3">
                <Link to="/ec/referendums" className="ec-home-link">
                  Create and manage Referendums
                </Link>
              </li>

              <li>
                <Link to="/ec/responses" className="ec-home-link">
                  View responses
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcHomePage;
