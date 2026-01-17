const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../services/storage");
const { db } = require("../firebase-config");

const router = express.Router();

// Multer config (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ✅ Auth middleware
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No Authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Upload route
router.post("/", verifyAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.uid;

    // Upload to S3
    const fileUrl = await uploadFile(req.file, userId);

    const reportData = {
      fileUrl,
      extractedData: {
        glucose: 110,
        hba1c: 5.9,
      },
      status: "complete",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("reports")
      .add(reportData);

    res.json({
      success: true,
      reportId: docRef.id,
      fileUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
