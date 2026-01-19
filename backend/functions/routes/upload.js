const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
require("dotenv").config();

admin.initializeApp();

// 1. Simple Test Endpoint
exports.helloWorld = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).send({ message: "Backend is online and working!" });
  });
});

// 2. Main Analysis Endpoint
exports.analyze = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Check for AWS Secrets
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error("Missing AWS Credentials");
        return res.status(500).json({ 
          error: "Server configuration error: Missing AWS Credentials" 
        });
      }

      console.log("Processing request with body:", req.body);

      // --- TODO: Insert your actual AWS Textract/Analysis logic here ---
      // For now, we return mock data so the frontend succeeds
      const mockResponse = {
        success: true,
        message: "Analysis completed successfully (Mock Data)",
        data: {
          glucose_level: 95,
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(mockResponse);

    } catch (error) {
      console.error("Error in analyze function:", error);
      res.status(500).json({ error: error.message });
    }
  });
});