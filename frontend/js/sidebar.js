import {
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

class SidebarManager {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.overlay = document.getElementById("overlay");
    this.currentPage = "upload";
    this.auth = window.firebaseAuth;
    this.init();
  }

  init() {
    document
      .getElementById("sidebar-toggle")
      .addEventListener("click", () => this.toggleSidebar());

    document.querySelectorAll(".mobile-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => this.toggleSidebar());
    });
    this.overlay.addEventListener("click", () => this.closeSidebar());
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigate(item.dataset.page, item);
      });
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      this.logout();
    });

    document
      .getElementById("delete-account")
      .addEventListener("click", () => {
        if (confirm("Delete account? This cannot be undone.")) {
          this.deleteAccount();
        }
      });
  }

  toggleSidebar() {
    document.body.classList.toggle("sidebar-open");
    this.sidebar.classList.toggle("hidden");
    this.overlay.classList.toggle("hidden");
  }

  closeSidebar() {
    document.body.classList.remove("sidebar-open");
    this.sidebar.classList.add("hidden");
    this.overlay.classList.add("hidden");
  }

  navigate(page, clickedItem) {
    
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.add("hidden"));

    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));

    if (clickedItem) clickedItem.classList.add("active");

    document.getElementById(`${page}-page`).classList.remove("hidden");
    this.currentPage = page;
    
    if (page === "history" && window.historyManager) {
      window.historyManager.loadHistory();
    }

    this.closeSidebar();
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  }

  async deleteAccount() {
    try {
      const user = this.auth.currentUser;
      if (!user) return;

      await deleteUser(user);
      alert("Account deleted successfully");
    } catch (error) {
      alert("Re-login required to delete account");
      console.error(error);
    }
  }
}
window.sidebarManager = new SidebarManager();
