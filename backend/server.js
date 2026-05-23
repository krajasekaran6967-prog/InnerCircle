const express = require("express");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (isProd && !sessionSecret) {
  throw new Error("SESSION_SECRET is required in production.");
}

app.use(express.json());
app.use(
  session({
    name: "innercircle.sid",
    secret: sessionSecret || "innercircle-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`InnerCircle server running at http://localhost:${PORT}`);
});
