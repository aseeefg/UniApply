import { useEffect, useState } from "react";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import { useModal } from "../hooks/useModal";

const emptyForm = {
  programName: "",
  department: "",
  degreeLevel: "",
  seatsAvailable: "",
  minRequirements: "",
  minGPA: "",
  applicationFee: "",
  deadline: "",
};

export default function ManageCirculars() {
  const [circulars, setCirculars] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [isLoadingCirculars, setIsLoadingCirculars] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null); // { id, programName }
  const deleteModal = useModal();

  const load = async () => {
    setIsLoadingCirculars(true);
    setError("");
    try {
      const { data } = await api.get("/circulars/mine");
      setCirculars(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load circulars");
    } finally {
      setIsLoadingCirculars(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      seatsAvailable: Number(form.seatsAvailable),
      applicationFee: Number(form.applicationFee),
      minGPA: form.minGPA === "" ? undefined : Number(form.minGPA),
    };

    try {
      if (editingId) {
        await api.patch(`/circulars/${editingId}`, payload);
        setMessage("Circular updated successfully.");
      } else {
        await api.post("/circulars", payload);
        setMessage("Circular posted successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
      load(); // Reload list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit circular.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (circular) => {
    setEditingId(circular._id);
    setForm({
      programName: circular.programName,
      department: circular.department,
      degreeLevel: circular.degreeLevel || "",
      seatsAvailable: circular.seatsAvailable,
      minRequirements: circular.minRequirements,
      minGPA: circular.minGPA ?? "",
      applicationFee: circular.applicationFee,
      deadline: circular.deadline?.slice(0, 10) || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestDelete = (circular) => {
    setPendingDelete({ id: circular._id, programName: circular.programName });
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setError("");
    try {
      await api.delete(`/circulars/${pendingDelete.id}`);
      setMessage("Circular deleted successfully.");
      deleteModal.closeModal();
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete circular.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <p className="eyebrow">University Office</p>
      <h1>Manage Admission Circulars</h1>

      {message && <p className="success" style={{ marginBottom: "1rem" }}>{message}</p>}
      {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}

      <form className="stacked-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Circular" : "Post a New Circular"}</h3>

        <label htmlFor="programName">Program name</label>
        <input id="programName" name="programName" value={form.programName} onChange={handleChange} required />

        <label htmlFor="department">Department</label>
        <input id="department" name="department" value={form.department} onChange={handleChange} required />

        <label htmlFor="degreeLevel">Degree level</label>
        <input id="degreeLevel" name="degreeLevel" value={form.degreeLevel} onChange={handleChange} />

        <label htmlFor="seatsAvailable">Seats available</label>
        <input id="seatsAvailable" name="seatsAvailable" type="number" value={form.seatsAvailable} onChange={handleChange} required />

        <label htmlFor="minRequirements">Minimum requirements</label>
        <textarea id="minRequirements" name="minRequirements" rows={2} value={form.minRequirements} onChange={handleChange} required />

        <label htmlFor="minGPA">Minimum GPA (out of 5.00, optional)</label>
        <input
          id="minGPA"
          name="minGPA"
          type="number"
          min={0}
          max={5}
          step={0.01}
          value={form.minGPA}
          onChange={handleChange}
        />
        <p className="field-hint">
          Set this to power the student Eligibility Checker. Leave blank if there's no single numeric cutoff.
        </p>

        <label htmlFor="applicationFee">Application fee</label>
        <input id="applicationFee" name="applicationFee" type="number" value={form.applicationFee} onChange={handleChange} required />

        <label htmlFor="deadline">Deadline</label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
          required
        />

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : editingId ? "Save changes" : "Post circular"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(emptyForm); }}
              disabled={isSubmitting}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Your Circulars</h2>

      {isLoadingCirculars ? (
        <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
          <span className="spinner" />
        </div>
      ) : circulars.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No circulars posted yet.</p>
      ) : (
        <div className="card-list">
          {circulars.map((c) => (
            <div className="card" key={c._id}>
              <h3>{c.programName}</h3>
              <p>{c.department} - {c.seatsAvailable} seats</p>
              <p>Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
              <div className="card-actions">
                <button onClick={() => startEdit(c)} disabled={isSubmitting || isDeleting}>Edit</button>
                <button className="btn-danger" onClick={() => requestDelete(c)} disabled={isSubmitting || isDeleting}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => { deleteModal.closeModal(); setPendingDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete circular?"
        message={`This permanently deletes "${pendingDelete?.programName}". Students who already applied will keep their application records, but the circular will no longer be visible or editable.`}
        confirmLabel="Delete"
        danger
        isSubmitting={isDeleting}
      />
    </div>
  );
}
