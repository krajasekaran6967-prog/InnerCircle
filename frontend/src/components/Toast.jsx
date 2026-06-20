import { useEffect, useRef } from "react";

export default function Toast({ message, type }) {
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
  }, [message, type]);

  if (!message) return null;

  return (
    <div className={`toast toast-show toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
