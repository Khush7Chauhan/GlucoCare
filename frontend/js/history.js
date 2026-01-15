
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

class HistoryManager {
  constructor() {
    this.historyList = document.getElementById("history-list");
    this.auth = window.firebaseAuth;
    this.db = window.firebaseDB;
    this.init();
  }

  init() {
    const historyPage = document.getElementById("history-page");

    historyPage.addEventListener("transitionend", () => {
      if (!historyPage.classList.contains("hidden")) {
        this.loadHistory();
      }
    });
  }

  async loadHistory() {
    try {
      const user = this.auth.currentUser;
      if (!user) return;

      
      const q = query(
        collection(this.db, "reports"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderHistory(reports);
    } catch (error) {
      console.error("History load error:", error);
      this.showEmptyState("Failed to load history");
    }
  }

  renderHistory(reports) {
    if (!reports.length) {
      this.showEmptyState("No reports yet");
      return;
    }
    this.historyList.innerHTML = reports.map(report => {
      const fileName = report.fileUrl?.split("/").pop() || "Report";

      return `
        <div class="history-item">
          <div class="history-item-header">
            <div>
              <div class="history-date">
                ${this.formatDate(report.createdAt)}
              </div>
              <div class="history-file">${fileName}</div>
            </div>
            <span class="history-status status-${report.status}">
              ${report.status === "complete" ? " Complete" : " Processing"}
            </span>
          </div>

          <div class="history-blood">
            <span>Glucose: ${report.extractedData?.glucose ?? "N/A"} mg/dL</span>
            <span>HbA1c: ${report.extractedData?.hba1c ?? "N/A"}%</span>
          </div>

          <div class="history-actions">
            <a href="${report.fileUrl}" target="_blank" class="btn-secondary">
              <i class="fas fa-eye"></i> View Report
            </a>
            <button
              class="btn-primary"
              onclick='window.uploadManager.showResults(${JSON.stringify(report)})'>
              <i class="fas fa-play"></i> View Plan
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  showEmptyState(message) {
    this.historyList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-history"></i>
        <h3>${message}</h3>
        <p>Upload your first blood report to get started</p>
        <a href="#" onclick="window.sidebarManager.navigate('upload')" class="btn-primary">
          <i class="fas fa-upload"></i> Upload Report
        </a>
      </div>
    `;
  }

  formatDate(timestamp) {
    if (!timestamp) return "Unknown date";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
}


window.historyManager = new HistoryManager();
