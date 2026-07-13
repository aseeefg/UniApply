import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function UniversityProfile() {
  const [form, setForm] = useState({
    universityName: "",
    location: "",
    website: "",
    description: "",
    contactInfo: "",
  });
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/university/profile");
      setStatus(data.verificationStatus);
      if (data.universityProfile) {
        setForm({ ...form, ...data.universityProfile });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.patch("/university/profile", form);
    setMessage("Profile saved.");
  };

  return (
    <div className="page">
      <Link to="/dashboard">&larr; Back to dashboard</Link>
      <h1>University Profile</h1>
      <p className={`status-badge status-${status}`}>Verification status: {status}</p>
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit} className="stacked-form">
        <label>University name</label>
        <input name="universityName" value={form.universityName || ""} onChange={handleChange} />

        <label>Location</label>
        <input name="location" value={form.location || ""} onChange={handleChange} />

        <label>Website</label>
        <input name="website" value={form.website || ""} onChange={handleChange} />

        <label>Contact info</label>
        <input name="contactInfo" value={form.contactInfo || ""} onChange={handleChange} />

        <label>Description</label>
        <textarea name="description" rows={4} value={form.description || ""} onChange={handleChange} />

        <button type="submit">Save profile</button>
      </form>
    </div>
  );
}
