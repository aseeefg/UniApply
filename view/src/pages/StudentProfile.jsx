import { useEffect, useState } from "react";
import api from "../api/axios";
import Alert from "../components/Alert";

const DEGREE_LEVELS = ["Undergraduate", "Postgraduate", "Doctorate"];

const SUBJECT_CATEGORIES = {
  "Mathematics & Natural Sciences (MNS)": [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Statistics",
    "Environmental Science",
    "Neuroscience",
  ],
  "Languages & Communication": [
    "Linguistics",
    "English & Literature",
    "Journalism",
    "Spanish",
    "French",
    "Public Relations",
  ],
  "Social & Behavioral Sciences": [
    "Psychology",
    "Sociology",
    "Political Science",
    "Economics",
    "Anthropology",
    "Criminal Justice",
  ],
  "Arts & Humanities": ["History", "Philosophy", "Fine Arts", "Graphic Design", "Music", "Film & Media"],
  "Computer Science & Technology": [
    "Computer Science",
    "Data Science",
    "Information Technology",
    "Cybersecurity",
    "Software Engineering",
  ],
  Business: ["Business Administration", "Finance", "Accounting", "Marketing", "Supply Chain Management"],
  Engineering: [
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Biomedical Engineering",
  ],
  "Health Sciences": ["Nursing", "Public Health", "Kinesiology", "Health Administration"],
};

const MAX_SUBJECTS = 3;
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const findCategoryFor = (subjects) =>
  Object.keys(SUBJECT_CATEGORIES).find((category) =>
    SUBJECT_CATEGORIES[category].some((s) => subjects.includes(s))
  ) || "";

export default function StudentProfile() {
  const [form, setForm] = useState({
    curriculumType: "",
    sscResult: "",
    hscResult: "",
    oLevelResult: "",
    aLevelResult: "",
    phone: "",
    address: "",
    degreeLevel: "",
    preferredLocation: "",
    willingToRelocate: true,
    nctbGroup: "",
    institutionTypePreference: "No preference",
    profileImage: "",
    transcriptUrl: "",
    transcriptName: "",
  });
  const [subjectCategory, setSubjectCategory] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/student/profile");
        const profile = data.studentProfile || {};
        setForm((f) => ({ ...f, ...profile }));
        const savedSubjects = profile.subjectInterests || [];
        const category = findCategoryFor(savedSubjects);
        setSubjectCategory(category);
        setSelectedSubjects(
          category ? savedSubjects.filter((s) => SUBJECT_CATEGORIES[category].includes(s)) : []
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCategoryChange = (e) => {
    setSubjectCategory(e.target.value);
    setSelectedSubjects([]);
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) return prev.filter((s) => s !== subject);
      if (prev.length >= MAX_SUBJECTS) return prev;
      return [...prev, subject];
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be smaller than 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleTranscriptChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingTranscript(true);
    try {
      const formData = new FormData();
      formData.append("transcript", file);
      const { data } = await api.post("/student/profile/transcript", formData);
      setForm((f) => ({ ...f, ...data.studentProfile }));
      setMessage("Transcript uploaded.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload transcript.");
    } finally {
      setUploadingTranscript(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      await api.patch("/student/profile", {
        ...form,
        subjectInterests: selectedSubjects,
      });
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <p className="eyebrow">Student Records</p>
      <h1>Student Profile</h1>

      {message && <p className="success" style={{ marginBottom: "1rem" }}>{message}</p>}
      {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}

      {form.curriculumType === "NCTB" && !form.hscResult && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert variant="warning" title="HSC result missing">
            Add your HSC result below to use the eligibility checker on circulars.
          </Alert>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
            <div className="avatar avatar-lg">
              {form.profileImage ? <img src={form.profileImage} alt="" /> : "👤"}
            </div>
            <label className="btn-outline" style={{ cursor: "pointer" }}>
              {form.profileImage ? "Change photo" : "Add picture"}
              <input type="file" hidden accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>
          </div>

          <div className="form-section">
            <h3>Academic background</h3>
            <div className="form-grid">
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="curriculumType">Curriculum</label>
                <select
                  id="curriculumType"
                  className="select"
                  name="curriculumType"
                  value={form.curriculumType || ""}
                  onChange={handleChange}
                >
                  <option value="">Select curriculum</option>
                  <option value="NCTB">NCTB Curriculum</option>
                  <option value="British">British Curriculum</option>
                </select>
              </div>

              {form.curriculumType === "NCTB" && (
                <>
                  <div className="field">
                    <label htmlFor="nctbGroup">Background (group)</label>
                    <select
                      id="nctbGroup"
                      className="select"
                      name="nctbGroup"
                      value={form.nctbGroup || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select group</option>
                      <option value="Science">Science</option>
                      <option value="Business">Business</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="sscResult">SSC result</label>
                    <input id="sscResult" name="sscResult" placeholder="e.g. GPA 5.00" value={form.sscResult || ""} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label htmlFor="hscResult">HSC result</label>
                    <input id="hscResult" name="hscResult" placeholder="e.g. GPA 4.83" value={form.hscResult || ""} onChange={handleChange} />
                  </div>
                </>
              )}

              {form.curriculumType === "British" && (
                <>
                  <div className="field">
                    <label htmlFor="oLevelResult">O Level result</label>
                    <input id="oLevelResult" name="oLevelResult" placeholder="e.g. 6A 2B" value={form.oLevelResult || ""} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label htmlFor="aLevelResult">A Level result</label>
                    <input id="aLevelResult" name="aLevelResult" placeholder="e.g. 3A" value={form.aLevelResult || ""} onChange={handleChange} />
                  </div>
                </>
              )}
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3>Contact</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone || ""} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={form.address || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3>Preferences</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="degreeLevel">Preferred degree level</label>
                <select
                  id="degreeLevel"
                  className="select"
                  name="degreeLevel"
                  value={form.degreeLevel || ""}
                  onChange={handleChange}
                >
                  <option value="">Select level</option>
                  {DEGREE_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="preferredLocation">Preferred location</label>
                <input
                  id="preferredLocation"
                  name="preferredLocation"
                  placeholder="e.g. Dhaka"
                  value={form.preferredLocation || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="institutionTypePreference">Institution type</label>
                <select
                  id="institutionTypePreference"
                  className="select"
                  name="institutionTypePreference"
                  value={form.institutionTypePreference || "No preference"}
                  onChange={handleChange}
                >
                  <option value="No preference">No preference</option>
                  <option value="Public">Public only</option>
                  <option value="Private">Private only</option>
                </select>
              </div>

              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Willing to study outside your preferred location?</label>
                <div className="tab-toggle" style={{ marginBottom: 0 }}>
                  <button
                    type="button"
                    className={form.willingToRelocate ? "active" : ""}
                    onClick={() => setForm((f) => ({ ...f, willingToRelocate: true }))}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={!form.willingToRelocate ? "active" : ""}
                    onClick={() => setForm((f) => ({ ...f, willingToRelocate: false }))}
                  >
                    No, local only
                  </button>
                </div>
                <p className="field-hint">
                  If "No," recommendations only include universities in your preferred location.
                </p>
              </div>

              <div className="field">
                <label htmlFor="subjectCategory">Category</label>
                <select
                  id="subjectCategory"
                  className="select"
                  value={subjectCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select category</option>
                  {Object.keys(SUBJECT_CATEGORIES).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {subjectCategory && (
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Major / field of study ({selectedSubjects.length}/{MAX_SUBJECTS})</label>
                  <div className="chip-grid">
                    {SUBJECT_CATEGORIES[subjectCategory].map((subject) => {
                      const selected = selectedSubjects.includes(subject);
                      const disabled = !selected && selectedSubjects.length >= MAX_SUBJECTS;
                      return (
                        <button
                          key={subject}
                          type="button"
                          className={`tag tag-lg tag-clickable${selected ? " tag-primary tag-filled" : ""}`}
                          disabled={disabled}
                          aria-pressed={selected}
                          onClick={() => toggleSubject(subject)}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                  <p className="field-hint">Select up to {MAX_SUBJECTS} in this category.</p>
                </div>
              )}
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3>Documents</h3>
            <div className="form-grid">
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Transcript / marksheet</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <label className="btn-outline" style={{ cursor: uploadingTranscript ? "default" : "pointer" }}>
                    {uploadingTranscript ? "Uploading…" : form.transcriptName ? "Replace file" : "Upload file"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,image/jpeg,image/png"
                      onChange={handleTranscriptChange}
                      disabled={uploadingTranscript}
                      style={{ display: "none" }}
                    />
                  </label>
                  {form.transcriptName && <span className="tag">{form.transcriptName}</span>}
                </div>
                <p className="field-hint">PDF, JPG, or PNG, up to 5MB.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-solid" disabled={isSubmitting} style={{ marginTop: "1rem", border: "none" }}>
            {isSubmitting ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
