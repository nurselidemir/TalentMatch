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
      setSentEmails([]);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: description }),
      });

      response.ok
        ? alert("Job description saved successfully.")
        : alert("Failed to save job description.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: description, candidates: results }),
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
    <div style={{
      maxWidth: "700px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#f5ecf1 ",
      borderRadius: "12px",
      boxShadow: "0 0 16px rgba(0,0,0,0.08)",
      fontFamily: "Arial, sans-serif"
    }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", textAlign: "center", color: "#2c3e50" }}>
          Match Job Description
        </h2>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginBottom: "1rem"
          }}
          placeholder="Enter job description here..."
          required
        />

        <label style={{ display: "block", marginBottom: "1rem" }}>
          Similarity Threshold (0.0 - 1.0):{" "}
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            style={{ width: "80px", marginLeft: "10px" }}
          />
        </label>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button type="submit" style={buttonStyle("#618e62" )}>Find Matches</button>
          <button type="button" onClick={handleJobSave} style={buttonStyle("#2980b9")}>Save Job</button>
          <button type="button" onClick={handleSendEmails} style={buttonStyle("#8a5471")}>Send Emails</button>
        </div>
      </form>

      {results && (
        <div>
          <h3>Matched Candidates:</h3>
          <ul>
            {results.map((candidate, idx) => (
              <li key={idx} style={{ marginBottom: "20px", background: "#fff", padding: "1rem", borderRadius: "8px" }}>
                <strong>{candidate.filename}</strong>
                <br />
                Score: {candidate.similarity_score}
                <br />
                Missing Skills: {candidate.missing_skills.join(", ") || "None"}
                <br />
                <pre style={{
                background: "#f4f4f4",
                padding: "0.5rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                borderRadius: "4px"
                }}>
               {candidate.text_snippet}
                </pre>

              </li>
            ))}
          </ul>
        </div>
      )}

      {sentEmails.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Emails Sent To:</h4>
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

const buttonStyle = (bgColor) => ({
  padding: "0.6rem 1.2rem",
  background: bgColor,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "0.95rem"
});

export default JobMatchForm;
