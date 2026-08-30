import { useEffect, useState } from "react";
import api from "../api/axios";
import { BuildingIcon } from "../components/icons";

const MAX_LOGO_BYTES = 1.5 * 1024 * 1024;

export default function UniversityProfile() {
  const [form, setForm] = useState({
    universityName: "",
    location: "",
    institutionType: "",
    logo: "",
    website: "",
    description: "",
    contactInfo: "",
  });
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Image must be smaller than 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.patch("/university/profile", form);
    setMessage("Profile saved.");
  };

  return (
    <div className="page">
      <p className="eyebrow">University Office</p>
      <h1>University Profile</h1>
      <p className={`status-badge status-${status}`}>Verification status: {status}</p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="stacked-form">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div className="avatar avatar-lg">
            {form.logo ? <img src={form.logo} alt="" /> : <BuildingIcon width={28} height={28} />}
          </div>
          <label className="btn-outline" style={{ cursor: "pointer" }}>
            {form.logo ? "Change picture" : "Upload picture"}
            <input type="file" hidden accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
          </label>
        </div>

        <label htmlFor="universityName">University name</label>
        <input id="universityName" name="universityName" value={form.universityName || ""} onChange={handleChange} />

        <label htmlFor="location">Location</label>
        <input id="location" name="location" value={form.location || ""} onChange={handleChange} />

        <label htmlFor="institutionType">Institution type</label>
        <select
          id="institutionType"
          className="select"
          name="institutionType"
          value={form.institutionType || ""}
          onChange={handleChange}
        >
          <option value="">Select type</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>

        <label htmlFor="website">Website</label>
        <input id="website" name="website" value={form.website || ""} onChange={handleChange} />

        <label htmlFor="contactInfo">Contact info</label>
        <input id="contactInfo" name="contactInfo" value={form.contactInfo || ""} onChange={handleChange} />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} value={form.description || ""} onChange={handleChange} />

        <label htmlFor="researchAreas">Research areas</label>
        <textarea
          id="researchAreas"
          name="researchAreas"
          rows={3}
          value={form.researchAreas || ""}
          onChange={handleChange}
          placeholder="e.g. Renewable energy, Machine learning, Public health policy"
        />

        <button type="submit">Save profile</button>
      </form>
    </div>
  );
}
