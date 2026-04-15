const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/events", eventRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
