
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

class UploadManager {
  constructor() {
    this.dropzone = document.getElementById("dropzone");
    this.fileInput = document.getElementById("file-input");
    this.currentFile = null;

    this.auth = window.firebaseAuth;
    this.db = window.firebaseDB;
    this.storage = window.firebaseStorage;

    this.init();
  }

  init() {
    this.dropzone.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.dropzone.addEventListener("dragleave", (e) => this.handleDragLeave(e));
    this.dropzone.addEventListener("drop", (e) => this.handleDrop(e));

    document.getElementById("browse-files").addEventListener("click", () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener("change", (e) =>
      this.handleFileSelect(e)
    );

    document
      .getElementById("patient-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.analyzeReport();
      });

    document
      .querySelectorAll("#patient-form input, #patient-form select")
      .forEach((input) => {
        input.addEventListener("input", () =>
          this.toggleAnalyzeButton()
        );
      });
  }

  handleDragOver(e) {
    e.preventDefault();
    this.dropzone.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.dropzone.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.dropzone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) this.handleFile(file);
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) this.handleFile(file);
  }

  handleFile(file) {
    if (!this.isValidFile(file)) {
      alert("Upload PDF or Image (max 10MB)");
      return;
    }

    this.currentFile = file;
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("file-size").textContent =
      this.formatFileSize(file.size);

    document.getElementById("upload-details").classList.remove("hidden");
    this.dropzone.style.display = "none";
    this.toggleAnalyzeButton();
  }

  isValidFile(file) {
    const valid = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    return valid.includes(file.type) && file.size <= 10 * 1024 * 1024;
  }

  formatFileSize(bytes) {
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  }

  toggleAnalyzeButton() {
    const form = document.getElementById("patient-form");
    document.getElementById("analyze-btn").disabled =
      !form.checkValidity() || !this.currentFile;
  }

  async analyzeReport() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const btn = document.getElementById("analyze-btn");
      btn.disabled = true;

      // 🔹 Upload file to Firebase Storage
      const storageRef = ref(
        this.storage,
        `reports/${user.uid}/${Date.now()}_${this.currentFile.name}`
      );

      await uploadBytes(storageRef, this.currentFile);
      const fileUrl = await getDownloadURL(storageRef);

      // 🔹 Fake AI extraction (replace later with Gemini)
      const extractedData = this.extractBloodValues();
      const recommendations =
        this.generateRecommendations(extractedData);

      // 🔹 Save to Firestore
      const docRef = await addDoc(
        collection(this.db, "reports"),
        {
          userId: user.uid,
          fileUrl,
          extractedData,
          recommendations,
          status: "complete",
          createdAt: serverTimestamp(),
        }
      );

      this.showResults({
        extractedData,
        recommendations,
        id: docRef.id,
      });
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  extractBloodValues() {
    // 🔴 Replace with OCR / AI later
    return {
      glucose: 115,
      hba1c: 6.1,
    };
  }

  generateRecommendations(data) {
    if (data.hba1c >= 5.7 && data.hba1c <= 6.4) {
      return `
## 🩺 Pre-Diabetes Detected

### 🥗 Diet
- Increase fiber-rich foods
- Avoid refined sugar
- Include oats, sprouts, leafy vegetables

### 🏃 Exercise
- 30 min brisk walk daily
- Yoga or light cardio

### ⚠️ Advice
- Monitor blood sugar every 3 months
- Consult a doctor if HbA1c increases
`;
    }
    return "All values look normal. Maintain a healthy lifestyle.";
  }

  showResults(data) {
    const container = document.getElementById("results-container");
    container.innerHTML = `
      <h2>✨ Personalized Health Plan</h2>
      <p><strong>Glucose:</strong> ${data.extractedData.glucose} mg/dL</p>
      <p><strong>HbA1c:</strong> ${data.extractedData.hba1c}%</p>
      <div>${this.renderMarkdown(data.recommendations)}</div>
    `;
    container.classList.remove("hidden");
  }

  renderMarkdown(text) {
    return text
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/\n/g, "<br>");
  }
}

window.uploadManager = new UploadManager();
