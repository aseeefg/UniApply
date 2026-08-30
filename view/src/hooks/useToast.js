import { useCallback, useRef, useState } from "react";

// Shared toast logic - pair with <Toast toast={toast} /> from components/Toast.jsx
export function useToast() {
  const [toast, setToast] = useState(null); // { message, severity }
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, severity = "success") => {
    clearTimeout(timeoutRef.current);
    setToast({ message, severity });
    timeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  return { toast, showToast };
}
