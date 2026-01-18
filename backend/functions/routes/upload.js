const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../services/storage");
const { admin, db } = require("../firebase-config"); // ✅ FIX

const router = express.Router();

// Multer config
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
    const decoded = await admin.auth().verifyIdToken(token); // ✅ WORKS

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

    // Upload to AWS S3
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

    await db
      .collection("users")
      .doc(userId)
      .collection("reports")
      .add(reportData);

    // ✅ RESPONSE MATCHES FRONTEND EXPECTATION
    res.json({
      glucose: 110,
      hba1c: 5.9,
      recommendations: `
## Diet Plan
- Reduce sugar intake
- Eat whole grains

## Exercise
- Walk 30 minutes daily
- Light yoga

## Notes
- Monitor glucose weekly
      `,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
