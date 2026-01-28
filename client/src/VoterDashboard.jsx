import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from "./api";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/ecLayout.css";

const VoterDashboard = () => {
  const [referendums, setReferendums] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  
  const fetchReferendums = () => {
    setLoading(true);
    setFormError('');
    setFormSuccess('');
    api
      .get("/voter/referendums")
      .then((res) => {
        setReferendums(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFormError('Failed to load referendums.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReferendums();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("loginEmail");
    if (email) {
      setUserName(email.split("@")[0]);
    }
  }, []);

  const handleOptionSelect = (referendumId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [referendumId]: optionId,
    }));
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  const handleSubmitAll = async () => {
    setFormError('');
    setFormSuccess('');

    const votesToSubmit = referendums
      .filter((ref) => {
        const referendumId = ref._id;
        const isOpen = ref.status === 'open';
        const alreadyVoted = ref.alreadyVoted;
        const selectedOptionId = selectedOptions[referendumId];

        return isOpen && !alreadyVoted && selectedOptionId;
      })
      .map((ref) => ({
        referendumId: ref._id,
        optionId: selectedOptions[ref._id],
      }));

    if (votesToSubmit.length === 0) {
      setFormError(
        'You have already submitted your votes to all the referendums.'
      );
      return;
    }

    try {
      await Promise.all(
        votesToSubmit.map((vote) =>
          api.post("/vote", {
            referendumId: vote.referendumId,
            optionId: vote.optionId,
          })
        )
      );

      setFormSuccess('Your votes have been submitted successfully.');
      fetchReferendums();
    } catch (err) {
      console.error(err);
      if (
        err.response &&
        err.response.data &&
        err.response.data.errors &&
        err.response.data.errors.form
      ) {
        setFormError(err.response.data.errors.form);
      } else {
        setFormError('Some votes could not be submitted. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h3>Voter Dashboard</h3>
        <p>Loading referendums...</p>
      </div>
    );
  }

  const hasPendingVotes = referendums.some((ref) => {
    const isOpen = ref.status === "open";
    const alreadyVoted = ref.alreadyVoted;
    return isOpen && !alreadyVoted;
  });

  return (
    <div>
    <Header
        title="MSLR"
        onLogout={handleLogout}
        showLogout={true}
      />
    <div className="container py-4">
      <h3 className="mb-3">Voter Dashboard</h3>
      <h4 className="mt-4 mb-2">Hi {userName.toUpperCase()}! </h4>
      <p className="text-muted">
        Browse all referendums that have been opened by the Election Commission.
        You can only vote in those that are currently open.
      </p>

      {formError && (
        <div className="alert alert-danger" role="alert">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="alert alert-success" role="alert">
          {formSuccess}
        </div>
      )}

      {referendums.length === 0 && (
        <p className="text-muted">No referendums available at the moment.</p>
      )}

      {referendums.map((ref, idx) => {
        const referendumId = ref._id;
        const userAlreadyVoted = ref.alreadyVoted;
        const isOpen = ref.status === 'open';
        const canVote = isOpen && !userAlreadyVoted;

        return (
          <div key={referendumId} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 className="card-title mb-1">
                    Referendum {idx + 1}: {ref.title}
                  </h5>
                  {ref.description && (
                    <p className="card-text text-muted mb-1">
                      {ref.description}
                    </p>
                  )}
                </div>

                {ref.status && (
                  <span
                    className={`badge ${
                      ref.status === 'open'
                        ? 'bg-success'
                        : 'bg-danger'
                    }`}
                  >
                    {ref.status.toUpperCase()}
                  </span>
                )}
                {!ref.status && (
                  <span className="badge bg-secondary">NO STATUS</span>
                )}
              </div>

              <div className="mb-3">
                {ref.options.map((opt) => {
                  const optKey = `${referendumId}-${opt.option_id}`;
                  const inputId = `ref-${referendumId}-opt-${opt.option_id}`;

                  return (
                    <div className="form-check" key={optKey}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`ref-${referendumId}`}
                        id={inputId}
                        value={opt.option_id}
                        disabled={!canVote}
                        checked={Number(selectedOptions[referendumId]) === Number(opt.option_id)}
                        onChange={() => handleOptionSelect(referendumId, Number(opt.option_id))}
                      />
                      <label className="form-check-label" htmlFor={`ref-${referendumId}-opt-${opt.option_id}`}>
                        {opt.text}
                      </label>
                    </div>
                  );
                })}

              </div>

              {userAlreadyVoted ? (
                <p className="text-success mb-0">
                  You have already voted in this referendum.
                </p>
              ) : !isOpen ? (
                <p className="text-muted mb-0">
                  This referendum is closed. You cannot vote on it.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}

      {referendums.length > 0 && (
        <div className="mt-4">
          {!hasPendingVotes && (
            <div className="alert alert-info mb-3" role="alert">
              You have already submitted votes for all available referendums.
              New referendums will appear here once opened by the Election Commission.
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleSubmitAll}
            disabled={!hasPendingVotes}
          >
            Submit all votes
          </button>
        </div>
      )}


    </div>
    <Footer />
    </div>
  );
};

export default VoterDashboard;
