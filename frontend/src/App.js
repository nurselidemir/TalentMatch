import React, { useState } from "react";
import CVUpload from "./components/CVUpload";
import CVList from "./components/CVList";
import JobList from "./components/JobList";
import JobMatchForm from "./components/JobMatchForm";

function App() {
  const [selectedDescription, setSelectedDescription] = useState("");

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>TalentMatch Dashboard</h1>

      <section style={{ marginBottom: "40px" }}>
        <h2>Upload CVs</h2>
        <CVUpload />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>Uploaded CV List</h2>
        <CVList />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <JobList onSelect={setSelectedDescription} />
      </section>

      <section>
        <h2>Match Job Description</h2>
        <JobMatchForm selectedDescription={selectedDescription} />
      </section>
    </div>
  );
}

export default App;
