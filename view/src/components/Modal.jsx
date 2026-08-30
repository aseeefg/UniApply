import { useEffect } from "react";
import { XIcon } from "./icons";

export default function Modal({ isOpen, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4"
      style={{ zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full"
        style={{ maxWidth, maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-ink m-0">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            className="text-ink-soft"
          >
            <XIcon width={18} height={18} />
          </button>
        </div>
        <div className="p-5" style={{ overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
