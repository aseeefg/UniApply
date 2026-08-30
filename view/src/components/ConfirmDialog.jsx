import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  danger = false,
  isSubmitting = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={420}>
      <p style={{ color: "var(--ink-soft)", marginBottom: "1.25rem" }}>{message}</p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="button"
          className={danger ? "btn-danger" : "btn-solid"}
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
