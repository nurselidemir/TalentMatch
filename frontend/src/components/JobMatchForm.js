import React, { useState, useEffect } from "react";

const JobMatchForm = ({ selectedDescription }) => {
  const [description, setDescription] = useState("");
  const [threshold, setThreshold] = useState("0.5");
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (selectedDescription) {
      setDescription(selectedDescription);
    }
  }, [selectedDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/match-job/?threshold=${threshold}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_description: description }),
      });

      const data = await response.json();
      setResults(data.matched_candidates);
    } catch (error) {
      console.error("Eşleştirme hatası:", error);
      alert("Eşleştirme başarısız oldu.");
    }
  };

  const handleJobSave = async () => {
    if (!description.trim()) {
      alert("Lütfen bir iş ilanı girin.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/submit-job/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_description: description }),
      });

      if (response.ok) {
        alert("İş ilanı başarıyla kaydedildi.");
      } else {
        alert("İş ilanı kaydedilemedi.");
      }
    } catch (error) {
      console.error("İş ilanı gönderimi hatası:", error);
      alert("Gönderim sırasında hata oluştu.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          cols={60}
          placeholder="Paste job description here..."
          required
        />
        <br />
        <label>
          Similarity Threshold (0.0 - 1.0):{" "}
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            style={{ width: "80px", margin: "10px 0" }}
          />
        </label>
        <br />
        <button type="submit" style={{ marginRight: "10px" }}>
          Find Matching CVs
        </button>
        <button type="button" onClick={handleJobSave}>
          Save Job Description
        </button>
      </form>

      {results && (
        <div>
          <h3>Matched Candidates:</h3>
          <ul>
            {results.map((candidate, idx) => (
              <li key={idx} style={{ marginBottom: "20px" }}>
                <strong>{candidate.filename}</strong>
                <br />
                Score: {candidate.similarity_score}
                <br />
                Missing Skills: {candidate.missing_skills.join(", ") || "None"}
                <br />
                <pre>{candidate.text_snippet}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobMatchForm;
