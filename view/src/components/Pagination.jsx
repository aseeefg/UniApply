export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1rem" }}>
      <button
        type="button"
        className="btn-outline"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          style={{
            minWidth: 32,
            padding: "0.4rem 0.6rem",
            fontSize: "0.82rem",
            borderRadius: 4,
            border: `1px solid ${p === page ? "var(--seal)" : "var(--border)"}`,
            background: p === page ? "var(--seal)" : "transparent",
            color: p === page ? "#fff" : "var(--ink-soft)",
            cursor: "pointer",
            fontWeight: p === page ? 600 : 400,
          }}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="btn-outline"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}
      >
        Next
      </button>
    </div>
  );
}
