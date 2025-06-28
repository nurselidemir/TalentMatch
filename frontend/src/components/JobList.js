import { useEffect, useState } from "react";
import axios from "axios";

function JobList({ onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:8000/saved-jobs/");
        setJobs(response.data);
      } catch (err) {
        setError("Failed to fetch job descriptions.");
        console.error(err);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div style={{
      maxWidth: "700px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#f5ecf1",  // updated background color
      borderRadius: "12px",
      boxShadow: "0 0 16px rgba(0,0,0,0.08)",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", textAlign: "center", color: "#2c3e50" }}>
        Saved Job Descriptions
      </h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {jobs.length === 0 && !error && (
        <p style={{ textAlign: "center", color: "#777" }}>No job descriptions available.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {jobs.map((job) => (
          <li key={job.id} style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => onSelect(job.description)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                background: "#8a5471",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.95rem",
                textAlign: "left",
                boxShadow: "0 0 4px rgba(0,0,0,0.05)"
              }}
            >
              {job.description.slice(0, 100)}...
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobList;
