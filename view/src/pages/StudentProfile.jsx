import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function StudentProfile() {
  const [form, setForm] = useState({
    sscResult: "",
    hscResult: "",
    gpa: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/student/profile");
      if (data.studentProfile) {
        setForm({ ...form, ...data.studentProfile });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.patch("/student/profile", { ...form, gpa: Number(form.gpa) || undefined });
    setMessage("Profile saved.");
  };

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
      <p className="eyebrow">Student Records</p>
      <h1>Student Profile</h1>
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit} className="stacked-form">
        <label>SSC result</label>
        <input name="sscResult" value={form.sscResult || ""} onChange={handleChange} />

        <label>HSC result</label>
        <input name="hscResult" value={form.hscResult || ""} onChange={handleChange} />

        <label>GPA</label>
        <input name="gpa" type="number" step="0.01" value={form.gpa || ""} onChange={handleChange} />

        <label>Phone</label>
        <input name="phone" value={form.phone || ""} onChange={handleChange} />

        <label>Address</label>
        <input name="address" value={form.address || ""} onChange={handleChange} />

        <button type="submit">Save profile</button>
      </form>
    </div>
  );
}
