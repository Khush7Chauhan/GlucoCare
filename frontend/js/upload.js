
class UploadManager {
  constructor() {
    this.dropzone = document.getElementById("dropzone");
    this.fileInput = document.getElementById("file-input");
    this.currentFile = null;

    this.auth = window.firebaseAuth;

    this.init();
  }

  init() {
    
    this.dropzone.addEventListener("dragover", (e) => this.dragOver(e));
    this.dropzone.addEventListener("dragleave", (e) => this.dragLeave(e));
    this.dropzone.addEventListener("drop", (e) => this.dropFile(e));

    document.getElementById("browse-files").onclick = () =>
      this.fileInput.click();

    this.fileInput.onchange = (e) =>
      this.handleFile(e.target.files[0]);

    
    document.getElementById("patient-form").onsubmit = (e) => {
      e.preventDefault();
      this.analyzeReport();
    };

    document
      .querySelectorAll("#patient-form input, #patient-form select")
      .forEach((el) =>
        el.addEventListener("input", () =>
          this.toggleAnalyzeButton()
        )
      );
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
    document.getElementById("file-size").textContent =
      this.formatSize(file.size);

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
    document.getElementById("analyze-btn").disabled =
      !form.checkValidity() || !this.currentFile;
  }

  async analyzeReport() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const token = await user.getIdToken();

      const btn = document.getElementById("analyze-btn");
      btn.disabled = true;
      btn.innerText = "Analyzing...";

      const formData = new FormData();
      formData.append("file", this.currentFile);
      formData.append(
        "patientData",
        JSON.stringify({
          age: document.getElementById("patient-age").value,
          weight: document.getElementById("patient-weight").value,
          activity: document.getElementById("activity-level").value,
          diet: document.getElementById("diet-restrictions").value,
        })
      );

      const res = await fetch(
       "http://127.0.0.1:5001/glucocare-24dc6/us-central1/api/upload"
,
      {
       method: "POST",
       headers: {
       Authorization: `Bearer ${token}`,
     },
     body: formData,
      }
      );

      if (!res.ok) throw new Error("Analysis failed");

      const result = await res.json();
      this.showResults(result);

    } catch (err) {
      alert(err.message);
    } finally {
      document.getElementById("analyze-btn").disabled = false;
      document.getElementById("analyze-btn").innerText = "Analyze Report";
    }
  }

  showResults(data) {
    const container = document.getElementById("results-container");
    container.innerHTML = `
      <h2>✨ Personalized Health Plan</h2>
      <p><strong>Glucose:</strong> ${data.glucose} mg/dL</p>
      <p><strong>HbA1c:</strong> ${data.hba1c}%</p>
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
