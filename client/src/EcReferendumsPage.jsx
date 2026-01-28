import React, { useEffect, useState } from "react";
import api from "./api";

const EcReferendumsPage = () => {
  const [referendums, setReferendums] = useState([]);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRef, setEditingRef] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState("");

  const fetchReferendums = () => {
    setError("");
    api
      .get("/referendums")
      .then((res) => {
        const sorted = [...(res.data || [])].sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(a.createdAt) - new Date(b.createdAt);
          return a._id.localeCompare(b._id);
        });
        setReferendums(sorted);
      })
      .catch(() => setError("Failed to load referendums."));
  };

  useEffect(() => {
    fetchReferendums();
  }, []);

  const startCreate = () => {
    setEditingRef(null);
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setError("");
    setIsFormVisible(true);
  };

  const startEdit = (ref) => {
    setEditingRef(ref);
    setTitle(ref.title || "");
    setDescription(ref.description || "");
    setOptions(ref.options?.length ? ref.options.map((o) => o.text) : ["", ""]);
    setError("");
    setIsFormVisible(true);
  };

  const resetForm = () => {
    setEditingRef(null);
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setError("");
    setIsFormVisible(false);
  };

  const handleOptionChange = (index, value) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddOption = () => setOptions((prev) => [...prev, ""]);
  const handleRemoveOption = (index) => setOptions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setError("");

    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!title.trim() || cleanedOptions.length < 2) {
      setError("Please enter a referendum title and at least two options.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || " ",
      options: cleanedOptions,
    };

    const req = editingRef
      ? api.put(`/referendums/${editingRef._id}`, payload)
      : api.post("/referendums", payload);

    req
      .then(() => {
        resetForm();
        fetchReferendums();
      })
      .catch((err) => {
        setError(err.response?.data?.errors?.form || "Something went wrong. Please try again.");
      });
  };

  const handleStatusChange = (id, status) => {
    api
      .patch(`/referendums/${id}/status`, { status })
      .then(fetchReferendums)
      .catch(() => alert("Failed to update status"));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Referendums</h3>
        <button className="btn btn-primary" onClick={startCreate}>+ Add referendum</button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmitForm} className="mb-4">
          <div className="p-3 bg-white border rounded">
            <small className="text-muted">{editingRef ? "Edit referendum" : "New referendum"}</small>

            <div className="mt-2">
              <input
                className="form-control form-control-lg"
                placeholder="Enter referendum title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mt-2">
              <textarea
                className="form-control"
                rows="2"
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mt-3">
              {options.map((opt, idx) => (
                <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                  <input
                    className="form-control"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveOption(idx)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-link p-0" onClick={handleAddOption}>
                + Add option
              </button>
            </div>

            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                {editingRef ? "Save changes" : "Save referendum"}
              </button>
            </div>
          </div>
        </form>
      )}

      <h5 className="mb-3">Existing referendums</h5>

      {referendums.map((ref, idx) => {
        const canEdit = !ref.hasEverOpened;
        return (
          <div key={ref._id} className="bg-white border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small">Referendum {idx + 1}</div>
                <h6 className="mb-1">{ref.title}</h6>
                {ref.description && <div className="text-muted">{ref.description}</div>}
              </div>

              <span className={`badge ${ref.status === "open" ? "bg-success" : ref.status === "closed" ? "bg-danger" : "bg-secondary"}`}>
                {(ref.status || "NO STATUS").toUpperCase()}
              </span>
            </div>

            <ul className="mt-2 mb-0">
              {(ref.options || []).map((opt) => (
                <li key={opt.option_id}>{opt.text}</li>
              ))}
            </ul>

            <div className="mt-3 d-flex gap-2 flex-wrap">
              {ref.status !== "open" && (
                <button className="btn btn-sm btn-outline-success" onClick={() => handleStatusChange(ref._id, "open")}>
                  Open referendum
                </button>
              )}
              {ref.status === "open" && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusChange(ref._id, "closed")}>
                  Close referendum
                </button>
              )}
              {canEdit && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(ref)}>
                  Edit referendum
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EcReferendumsPage;