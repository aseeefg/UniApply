import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../api/axios";

const QUESTIONS = [
  {
    id: "Subjects enjoyed",
    type: "multi",
    label: "Which subjects do you enjoy most? (pick up to 3)",
    options: [
      "Math", "Physics", "Biology", "Chemistry", "Computer Science",
      "Literature & Languages", "History & Social Studies", "Art & Design", "Business & Economics",
    ],
    max: 3,
  },
  {
    id: "Preferred way of working",
    type: "single",
    label: "How do you prefer to work?",
    options: [
      "Hands-on, building or fixing things",
      "Analyzing data and solving logical problems",
      "Creative expression and design",
      "Working directly with and helping people",
      "Organizing, planning, and leading projects",
    ],
  },
  {
    id: "Career impact",
    type: "single",
    label: "What kind of impact do you want your career to have?",
    options: [
      "Building technology",
      "Improving people's health and wellbeing",
      "Creating art or media",
      "Running or growing a business",
      "Understanding how the world works",
      "Not sure yet",
    ],
  },
  {
    id: "Working style",
    type: "single",
    label: "Do you prefer working alone or with others?",
    options: ["Mostly alone, deep focus", "Mostly in a team", "A mix of both"],
  },
  {
    id: "Strongest skill",
    type: "single",
    label: "Which best describes your strongest skill?",
    options: [
      "Math and logic",
      "Writing and communication",
      "Creativity and design",
      "Leadership and organization",
      "Empathy and people skills",
    ],
  },
];

export default function ProgramQuiz() {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState("");

  const answeredCount = QUESTIONS.filter((q) => {
    const a = answers[q.id];
    return q.type === "multi" ? a?.length > 0 : Boolean(a);
  }).length;

  const setSingle = (questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const toggleMulti = (questionId, value, max) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter((v) => v !== value) };
      }
      if (current.length >= max) return prev;
      return { ...prev, [questionId]: [...current, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuggestions(null);
    try {
      const { data } = await api.post("/student/quiz", { answers });
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate suggestions right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const retake = () => {
    setSuggestions(null);
    setError("");
    setAnswers({});
  };

  return (
    <div className="page">
      <p className="eyebrow">Student Portal</p>
      <h1>Which Undergraduate Program Should You Try For?</h1>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem" }}>
        A short quiz - no right or wrong answers. This suggests general fields of study to explore,
        not a prediction of where you'll get in.
      </p>

      {!suggestions && (
        <form className="stacked-form" onSubmit={handleSubmit}>
          {QUESTIONS.map((q) => (
            <div key={q.id} style={{ marginBottom: "1.5rem" }}>
              <h3>{q.label}</h3>
              <div className="chip-grid">
                {q.options.map((option) => {
                  const isMulti = q.type === "multi";
                  const current = answers[q.id];
                  const checked = isMulti ? (current || []).includes(option) : current === option;
                  const disabled = isMulti && !checked && (current || []).length >= q.max;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`tag tag-lg tag-clickable${checked ? " tag-primary tag-filled" : ""}`}
                      disabled={disabled}
                      aria-pressed={checked}
                      onClick={() =>
                        isMulti ? toggleMulti(q.id, option, q.max) : setSingle(q.id, option)
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}

          <button type="submit" disabled={submitting || answeredCount < QUESTIONS.length}>
            {submitting ? "Thinking…" : "Get my results"}
          </button>
          {answeredCount < QUESTIONS.length && (
            <p className="field-hint">Answer all {QUESTIONS.length} questions to continue ({answeredCount}/{QUESTIONS.length}).</p>
          )}
        </form>
      )}

      {suggestions && (
        <>
          <div className="card-list">
            {suggestions.map((s, i) => (
              <div className="card" key={i}>
                <h3>{s.program}</h3>
                <p style={{ fontFamily: "var(--font-body)" }}>{s.reason}</p>
                <div className="card-actions">
                  <RouterLink
                    to={`/circulars?q=${encodeURIComponent(s.program)}`}
                    className="btn-outline"
                  >
                    Browse matching circulars
                  </RouterLink>
                </div>
              </div>
            ))}
          </div>
          <p className="field-hint" style={{ margin: "1rem 0" }}>
            AI-generated suggestions based on your answers - not a guarantee of admission or fit.
          </p>
          <button onClick={retake}>Retake quiz</button>
        </>
      )}
    </div>
  );
}
