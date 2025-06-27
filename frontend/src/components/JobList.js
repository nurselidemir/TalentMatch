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
    <div className="max-w-lg mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Saved Job Descriptions</h2>
      {error && <p className="text-red-500">{error}</p>}
      {jobs.length === 0 && !error && <p>No jobs available.</p>}
      <ul>
        {jobs.map((job) => (
          <li key={job.id} className="mb-3">
            <button
              onClick={() => onSelect(job.description)}
              className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-left"
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
