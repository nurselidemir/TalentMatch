import React, { useEffect, useState } from "react";

const CVDetails = ({ filename, onClose }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/cv-details/?filename=${filename}`);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error("Unable to fetch CV details:", error);
      }
    };

    fetchDetails();
  }, [filename]);

  if (!details) return <div>Loading...</div>;

  return (
    <div className="p-6 border border-gray-300 mt-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">{filename} - CV Details</h3>

      <p><strong>Name:</strong> {details.name || "Not Available"}</p>
      <p><strong>Email:</strong> {details.email || "Not Available"}</p>
      <p><strong>Phone:</strong> {details.phone || "Not Available"}</p>

      {details.summary && (
        <div className="mb-4">
          <h4 className="font-semibold">📝 Summary:</h4>
          <pre className="bg-gray-100 p-4">{details.summary}</pre>
        </div>
      )}

      {Object.entries(details.sections || {}).map(([label, content], idx) => (
        <div key={idx} className="mb-4">
          <h4 className="font-semibold">{label}</h4>
          {content.map((text, i) => (
            <pre key={i} className="bg-gray-200 p-4">{text}</pre>
          ))}
        </div>
      ))}

      <button onClick={onClose} className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600">
        Close
      </button>
    </div>
  );
};

export default CVDetails;
