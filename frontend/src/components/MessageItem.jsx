export default function MessageItem({ message }) {
  return (
    <article className="message-item">
      <p className="message-meta">
        {message.sender?.name || "Unknown"} · {new Date(message.createdAt).toLocaleString()}
      </p>
      <p>{message.text}</p>
    </article>
  );
}
