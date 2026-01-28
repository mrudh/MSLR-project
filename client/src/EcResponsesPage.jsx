import React, { useEffect, useState } from "react";
import api from "./api";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import WordCloudCanvas from "./components/WordCloudCanvas";
import { useMemo } from "react";

Chart.register(ArcElement, Tooltip, Legend);

const EcResponsesPage = () => {
  const [referendums, setReferendums] = useState([]);
  const [error, setError] = useState("");

  const fetchReferendums = () => {
    setError("");
    api.get("/referendums")
      .then((res) => setReferendums(res.data || []))
      .catch(() => setError("Failed to load responses."));
  };

  useEffect(() => fetchReferendums(), []);

    const getChartDataForRef = (ref) => {
    const labels = (ref.options || []).map((opt) => opt.text);
    const values = (ref.options || []).map((opt) => opt.votesCount || 0);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#4f6bed',
            '#e83e8c',
            '#20c997',
            '#fd7e14',
            '#6f42c1',
            '#198754',
            '#ffc107',
          ],
        },
      ],
    };
  };


    const buildOptionCloudWords = (refs, { includeReferendumIds } = {}) => {
    const merged = new Map();

    for (const ref of refs || []) {
      const rid = Number(ref.referendum_id);
      if (
        Array.isArray(includeReferendumIds) &&
        includeReferendumIds.length > 0 &&
        !includeReferendumIds.includes(rid)
      ) {
        continue;
      }

      for (const opt of ref.options || []) {
        const text = String(opt.text || "").trim();
        const votes = Number(opt.votesCount || 0);
        if (!text || votes <= 0) continue;

        merged.set(text, (merged.get(text) || 0) + votes);
      }
    }

    return Array.from(merged.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);
  };

  const { overviewWords } = useMemo(() => {
    return {
      overviewWords: buildOptionCloudWords(referendums)
    };
  }, [referendums]);

  const sortedReferendums = useMemo(() => {
    return [...referendums].sort(
      (a, b) => Number(a.referendum_id) - Number(b.referendum_id)
    );
  }, [referendums]);


  return (
    <div>
      <h3 className="mb-3">Responses</h3>
      {error && <div className="alert alert-danger">{error}</div>}


      {sortedReferendums.map((ref, idx) => {
        const totalVotes = (ref.options || []).reduce((s, o) => s + (o.votesCount || 0), 0);

        return (
          <div key={ref._id} className="bg-white border rounded p-3 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div className="text-muted">Question {idx + 1}</div>
                <h5 className="mb-1">{ref.title}</h5>
                {ref.description && <div className="text-muted">{ref.description}</div>}
              </div>
              <span className={`badge ${ref.status === "open" ? "bg-success" : ref.status === "closed" ? "bg-danger" : "bg-secondary"}`}>
                {(ref.status || "NO STATUS").toUpperCase()}
              </span>
            </div>

            <div className="row align-items-center">
              <div className="col-md-5">
                <Doughnut data={getChartDataForRef(ref)} />
              </div>
              <div className="col-md-7">
                <p className="mb-2"><strong>Total votes:</strong> {totalVotes}</p>
                <ul className="mb-0">
                  {(ref.options || []).map((opt) => {
                    const v = opt.votesCount || 0;
                    const pct = totalVotes ? ((v / totalVotes) * 100).toFixed(1) : "0.0";
                    return (
                      <li key={opt.option_id}>
                        {opt.text} <span className="text-muted">- {v} ({pct}%)</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      <div className="bg-white border rounded p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-4">Overview - Highest voted options</h5>
          <small className="text-muted">Size = votes</small>
        </div>

        {overviewWords.length === 0 ? (
          <p className="text-muted mb-0">No votes yet.</p>
        ) : (
          <WordCloudCanvas words={overviewWords} />
        )}
      </div>
    </div>
  );
};

export default EcResponsesPage;
