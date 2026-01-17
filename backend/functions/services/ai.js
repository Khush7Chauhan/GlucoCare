const tesseract = require("node-tesseract-ocr");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ocrConfig = {
  lang: "eng",
  oem: 1,
  psm: 3,
};
const extractTextFromReport = async (filePath) => {
  try {
    return await tesseract.recognize(filePath, ocrConfig);
  } catch (error) {
    throw new Error("OCR failed");
  }
};

const extractMedicalData = (text) => {
  const glucose = text.match(/glucose\s*[:\-]?\s*(\d+)/i);
  const hba1c = text.match(/hba1c\s*[:\-]?\s*(\d+\.?\d*)/i);

  return {
    glucose: glucose ? Number(glucose[1]) : null,
    hba1c: hba1c ? Number(hba1c[1]) : null,
    rawText: text.slice(0, 2500),
  };
};

const generateAIPlan = async ({
  glucose,
  hba1c,
  age,
  weight,
  activityLevel,
  dietRestrictions,
  rawText,
}) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a healthcare AI assistant.

Patient Data:
- Age: ${age}
- Weight: ${weight} kg
- Activity Level: ${activityLevel}
- Dietary Restrictions: ${dietRestrictions || "None"}

Blood Report:
- Glucose: ${glucose} mg/dL
- HbA1c: ${hba1c} %

OCR Summary:
${rawText}

Tasks:
1. Assess diabetes risk (Normal / Prediabetic / Diabetic)
2. Create a 7-day Indian-friendly diet plan
3. Suggest safe workout routine
4. Mention lifestyle changes
5. Add a medical disclaimer

Format output in clean Markdown.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = {
  extractTextFromReport,
  extractMedicalData,
  generateAIPlan,
};
