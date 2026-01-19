const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Allow all origins (Fixes CORS)
require("dotenv").config(); // Load secrets safely

admin.initializeApp();

// Test Function to verify connection
exports.helloWorld = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).send({ message: "Connection Successful!" });
  });
});

// Your Main Analysis Function
exports.analyze = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // 1. Check for Secrets
      const awsKey = process.env.AWS_ACCESS_KEY_ID;
      const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;

      if (!awsKey || !awsSecret) {
        throw new Error("AWS Credentials missing in .env file");
      }

      // 2. Log that we received the request (Debug)
      console.log("Request received:", req.body);

      // --- YOUR LOGIC HERE (Simulated for now) ---
      // const result = await someAwsCall(req.body);
      
      const mockResult = { 
        success: true, 
        data: "Analysis complete", 
        timestamp: new Date().toISOString() 
      };
      
      // 3. Send Response
      res.status(200).json(mockResult);

    } catch (error) {
      console.error("Error inside function:", error);
      res.status(500).json({ error: error.message });
    }
  });
});