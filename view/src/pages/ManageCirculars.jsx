import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const emptyForm = {
  programName: "",
  department: "",
  degreeLevel: "",
  seatsAvailable: "",
  minRequirements: "",
  applicationFee: "",
  deadline: "",
};

export default function ManageCirculars() {
  const [circulars, setCirculars] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await api.get("/circulars/mine");
    setCirculars(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      seatsAvailable: Number(form.seatsAvailable),
      applicationFee: Number(form.applicationFee),
    };
    if (editingId) {
      await api.patch(`/circulars/${editingId}`, payload);
      setMessage("Circular updated.");
    } else {
      await api.post("/circulars", payload);
      setMessage("Circular posted.");
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const startEdit = (circular) => {
    setEditingId(circular._id);
    setForm({
      programName: circular.programName,
      department: circular.department,
      degreeLevel: circular.degreeLevel || "",
      seatsAvailable: circular.seatsAvailable,
      minRequirements: circular.minRequirements,
      applicationFee: circular.applicationFee,
      deadline: circular.deadline?.slice(0, 10) || "",
    });
  };

  const remove = async (id) => {
    await api.delete(`/circulars/${id}`);
    load();
  };

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
      <p className="eyebrow">University Office</p>
      <h1>Manage Admission Circulars</h1>
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit} className="stacked-form">
        <h3>{editingId ? "Edit circular" : "Post a new circular"}</h3>
        <label>Program name</label>
        <input name="programName" value={form.programName} onChange={handleChange} required />

        <label>Department</label>
        <input name="department" value={form.department} onChange={handleChange} required />

        <label>Degree level</label>
        <input name="degreeLevel" value={form.degreeLevel} onChange={handleChange} />

        <label>Seats available</label>
        <input
          name="seatsAvailable"
          type="number"
          value={form.seatsAvailable}
          onChange={handleChange}
          required
        />

        <label>Minimum requirements</label>
        <input name="minRequirements" value={form.minRequirements} onChange={handleChange} required />

        <label>Application fee</label>
        <input
          name="applicationFee"
          type="number"
          value={form.applicationFee}
          onChange={handleChange}
          required
        />

        <label>Deadline</label>
        <input name="deadline" type="date" value={form.deadline} onChange={handleChange} required />

        <button type="submit">{editingId ? "Save changes" : "Post circular"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            Cancel edit
          </button>
        )}
      </form>

      <h2>Your circulars</h2>
      <div className="card-list">
        {circulars.map((c) => (
          <div key={c._id} className="card">
            <h3>{c.programName}</h3>
            <p>{c.department} — {c.seatsAvailable} seats</p>
            <p>Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
            <div className="card-actions">
              <button onClick={() => startEdit(c)}>Edit</button>
              <button className="btn-danger" onClick={() => remove(c._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
