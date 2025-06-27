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
        setError("İş ilanları alınamadı.");
        console.error(err);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", background: "#eef2f3", borderRadius: "8px" }}>
      <h2>Kayıtlı İş İlanları</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {jobs.length === 0 && !error && <p>Hiç ilan yok.</p>}
      <ul>
        {jobs.map((job) => (
          <li key={job.id} style={{ marginBottom: "10px" }}>
            <button
              onClick={() => onSelect(job.description)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              {job.description.slice(0, 80)}...
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobList;
