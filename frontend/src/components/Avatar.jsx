function getInitials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function Avatar({ user, size = "lg" }) {
  return (
    <div className={`avatar avatar-${size}`}>
      {user?.thumbnailUrl
        ? <img src={user.thumbnailUrl} alt="" className="avatar-img" />
        : <span className="avatar-initials">{getInitials(user?.name || "?")}</span>}
    </div>
  );
}
