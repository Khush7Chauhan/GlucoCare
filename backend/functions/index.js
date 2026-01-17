const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const historyRoutes = require("./routes/history");

const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

app.use(cors({ origin: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/history", historyRoutes);

exports.api = functions.https.onRequest(app);
