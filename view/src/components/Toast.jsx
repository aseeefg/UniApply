// Pure rendering - pair with useToast() from hooks/useToast.js
export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.severity}`} role="status">
      {toast.message}
    </div>
  );
}
