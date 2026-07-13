import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function BrowseCirculars() {
  const [circulars, setCirculars] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await api.get("/circulars");
    setCirculars(data);
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (circularId) => {
    try {
      await api.post("/applications", { circularId });
      setMessage("Application submitted!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not apply");
    }
  };

  return (
    <div className="page">
      <Link to="/dashboard">&larr; Back to dashboard</Link>
      <h1>Open Admission Circulars</h1>
      {message && <p className="success">{message}</p>}

      <div className="card-list">
        {circulars.map((c) => (
          <div key={c._id} className="card">
            <h3>{c.programName}</h3>
            <p>{c.university?.universityProfile?.universityName || c.university?.name}</p>
            <p>{c.department} — {c.seatsAvailable} seats</p>
            <p>Fee: {c.applicationFee}</p>
            <p>Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
            <button onClick={() => apply(c._id)}>Apply</button>
          </div>
        ))}
      </div>
    </div>
  );
}
