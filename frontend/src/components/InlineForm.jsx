import { useRef } from "react";

export default function InlineForm({ onSubmit, placeholder }) {
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (!text) return;
    onSubmit(text);
    inputRef.current.value = "";
  }

  return (
    <form className="sticky-form" onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" maxLength={500} placeholder={placeholder} required />
      <button type="submit" className="btn btn-primary">Send</button>
    </form>
  );
}
