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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Match Job with CVs</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          cols={60}
          placeholder="Enter job description..."
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <br />
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
        >
          Match
        </button>
      </form>

      {results && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Matched Candidates:</h3>
          <ul>
            {results.map((candidate, idx) => (
              <li key={idx} className="mb-6">
                <strong>{candidate.filename}</strong>
                <br />
                Score: {candidate.similarity_score}
                <br />
                Missing Skills: {candidate.missing_skills.join(", ") || "None"}
                <br />
                <pre className="bg-gray-100 p-4">{candidate.text_snippet}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobMatch;
