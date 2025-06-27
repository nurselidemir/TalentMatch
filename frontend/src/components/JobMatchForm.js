import React, { useState, useEffect } from "react";

const JobMatchForm = ({ selectedDescription }) => {
  const [description, setDescription] = useState("");
  const [threshold, setThreshold] = useState("0.5");
  const [results, setResults] = useState(null);
  const [sentEmails, setSentEmails] = useState([]);

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
      setSentEmails([]); // reset email list when re-matching
    } catch (error) {
      console.error("Match error:", error);
      alert("Matching failed.");
    }
  };

  const handleJobSave = async () => {
    if (!description.trim()) {
      alert("Please enter a job description.");
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
        alert("Job description saved successfully.");
      } else {
        alert("Failed to save job description.");
      }
    } catch (error) {
      console.error("Job save error:", error);
      alert("An error occurred while saving the job.");
    }
  };

  const handleSendEmails = async () => {
    if (!results || results.length === 0) {
      alert("Please perform a match first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/send-emails/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: description,
          candidates: results,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSentEmails(data.sent_to || []);
        alert(`Emails sent to:\n\n${data.sent_to.join("\n")}`);
      } else {
        alert("Failed to send emails.");
      }
    } catch (error) {
      console.error("Email sending error:", error);
      alert("An error occurred while sending emails.");
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
          placeholder="Enter job description here..."
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
        <button type="button" onClick={handleJobSave} style={{ marginRight: "10px" }}>
          Save Job Description
        </button>
        <button type="button" onClick={handleSendEmails}>
          Send Emails to Matched Candidates
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

      {sentEmails.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4> Emails Sent To:</h4>
          <ul>
            {sentEmails.map((email, idx) => (
              <li key={idx}>{email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobMatchForm;
