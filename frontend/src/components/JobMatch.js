import React, { useState } from "react";

const JobMatch = () => {
  const [description, setDescription] = useState("");
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/match-job/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_description: description }),
      });

      const data = await response.json();
      setResults(data.matched_candidates);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching matches.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Match Job with CVs</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          cols={60}
          placeholder="Enter job description..."
          required
        />
        <br />
        <button type="submit">Match</button>
      </form>

      {results && (
        <div>
          <h3>Matched Candidates:</h3>
          <ul>
            {results.map((candidate, idx) => (
              <li key={idx} style={{ marginBottom: "20px" }}>
                <strong>{candidate.filename}</strong><br />
                Score: {candidate.similarity_score}<br />
                Missing Skills: {candidate.missing_skills.join(", ") || "None"}<br />
                <pre>{candidate.text_snippet}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobMatch;
