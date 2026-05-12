const express = require("express");
const cors = require("cors");
require("dotenv").config();
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { attachUser } = require("./middleware/auth");
const { corsOptions, securityHeaders } = require("./middleware/security");

const app = express();

app.use(cors(corsOptions()));
app.use(express.json({ limit: "100kb" }));
app.use(securityHeaders);
app.use(attachUser);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
