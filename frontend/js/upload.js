class UploadManager {
  constructor() {
    this.dropzone = document.getElementById("dropzone");
    this.fileInput = document.getElementById("file-input");
    this.currentFile = null;
    this.auth = window.firebaseAuth; // Ensure firebase.js is loaded before this
    this.init();
  }

  init() {
    if (this.dropzone) {
      this.dropzone.addEventListener("dragover", (e) => this.dragOver(e));
      this.dropzone.addEventListener("dragleave", (e) => this.dragLeave(e));
      this.dropzone.addEventListener("drop", (e) => this.dropFile(e));
    }

    const browseBtn = document.getElementById("browse-files");
    if (browseBtn) {
      browseBtn.onclick = () => this.fileInput.click();
    }

    if (this.fileInput) {
      this.fileInput.onchange = (e) => this.handleFile(e.target.files[0]);
    }

    const form = document.getElementById("patient-form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.analyzeReport();
      };

      document.querySelectorAll("#patient-form input, #patient-form select")
        .forEach((el) =>
          el.addEventListener("input", () => this.toggleAnalyzeButton())
        );
    }
  }

  dragOver(e) {
    e.preventDefault();
    this.dropzone.classList.add("dragover");
  }

  dragLeave(e) {
    e.preventDefault();
    this.dropzone.classList.remove("dragover");
  }

  dropFile(e) {
    e.preventDefault();
    this.dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  handleFile(file) {
    if (!this.isValidFile(file)) {
      alert("Only PDF / Image files (max 10MB)");
      return;
    }

    this.currentFile = file;
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("file-size").textContent = this.formatSize(file.size);

    document.getElementById("upload-details").classList.remove("hidden");
    this.dropzone.style.display = "none";
    this.toggleAnalyzeButton();
  }

  isValidFile(file) {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    return (
      allowed.includes(file.type) &&
      file.size <= 10 * 1024 * 1024
    );
  }

  formatSize(bytes) {
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  }

  toggleAnalyzeButton() {
    const form = document.getElementById("patient-form");
    const btn = document.getElementById("analyze-btn");
    if (form && btn) {
      btn.disabled = !form.checkValidity() || !this.currentFile;
    }
  }

  async analyzeReport() {
    try {
      const btn = document.getElementById("analyze-btn");
      
      // 1. Get Auth Token
      const user = this.auth?.currentUser;
      if (!user) throw new Error("Please log in to analyze reports.");
      const token = await user.getIdToken();

      // 2. UI Loading State
      btn.disabled = true;
      btn.innerText = "Analyzing...";

      // 3. Prepare Data
      const formData = new FormData();
      formData.append("file", this.currentFile);
      formData.append("patientData", JSON.stringify({
          age: document.getElementById("patient-age").value,
          weight: document.getElementById("patient-weight").value,
          activity: document.getElementById("activity-level").value,
          diet: document.getElementById("diet-restrictions").value,
      }));

      // 4. Determine Correct Backend URL (Local vs Cloud)
      // We use the Project ID you provided: glucocare-24dc6
      const PROJECT_ID = "glucocare-24dc6"; 
      const REGION = "us-central1";
      const FUNCTION_NAME = "analyze"; // Matches the backend export

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      
      const API_URL = isLocal
        ? `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}/${FUNCTION_NAME}`
        : `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}`;

      console.log(`Sending request to: ${API_URL}`); // For debugging

      // 5. Send Request
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do NOT set Content-Type header when sending FormData. 
          // The browser sets it automatically with the boundary.
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server Error (${res.status}): ${errorText}`);
      }

      const result = await res.json();
      this.showResults(result);

    } catch (err) {
      console.error(err);
      alert("Analysis Failed: " + err.message);
    } finally {
      const btn = document.getElementById("analyze-btn");
      if(btn) {
        btn.disabled = false;
        btn.innerText = "Analyze Report";
      }
    }
  }

  showResults(data) {
    const container = document.getElementById("results-container");
    
    // Handle case where data might be nested or plain
    const displayData = data.data || data; 

    container.innerHTML = `
      <h2>✨ Personalized Health Plan</h2>
      <div class="result-card">
        <p><strong>Glucose Level:</strong> ${displayData.glucose_level || "N/A"} mg/dL</p>
        <p><strong>HbA1c:</strong> ${displayData.hba1c || "N/A"}%</p>
        <hr>
        <div class="markdown-body">
            ${this.renderMarkdown(displayData.message || displayData.recommendations || "Analysis complete.")}
        </div>
      </div>
    `;
    container.classList.remove("hidden");
    
    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth' });
  }

  renderMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/^## (.*$)/gm, "<h3>$1</h3>")
      .replace(/^# (.*$)/gm, "<h2>$1</h2>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }
}

// Ensure DOM is ready before initializing
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});