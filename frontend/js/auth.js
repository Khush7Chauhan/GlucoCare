import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

console.log("✅ auth.js loaded");

const auth = window.firebaseAuth;
if (!auth) {
  console.error("❌ firebaseAuth not found. Check firebase.js load order");
}

// DOM elements (SAFE)
const loginPage = document.getElementById("login-page");
const uploadPage = document.getElementById("upload-page");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");

const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account");

/* ---------- SIGN UP ---------- */
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      signupError.classList.add("hidden");
      signupForm.reset();
    } catch (error) {
      signupError.textContent = error.message;
      signupError.classList.remove("hidden");
    }
  });
}

/* ---------- LOGIN ---------- */
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      await signInWithEmailAndPassword(auth, email, password);
      loginError.classList.add("hidden");
      loginForm.reset();
    } catch (error) {
      loginError.textContent = error.message;
      loginError.classList.remove("hidden");
    }
  });
}

/* ---------- AUTH STATE ---------- */
onAuthStateChanged(auth, (user) => {
  console.log("🔐 Auth state:", user);

  if (user) {
    loginPage?.classList.add("hidden");
    uploadPage?.classList.remove("hidden");

    document.getElementById("account-name").textContent =
      user.displayName || "User";
    document.getElementById("account-email").textContent = user.email;
  } else {
    loginPage?.classList.remove("hidden");
    uploadPage?.classList.add("hidden");
  }
});

/* ---------- LOGOUT ---------- */
logoutBtn?.addEventListener("click", () => {
  signOut(auth);
});

/* ---------- DELETE ACCOUNT ---------- */
deleteAccountBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  if (confirm("Are you sure you want to delete your account?")) {
    try {
      await deleteUser(user);
      alert("Account deleted successfully");
    } catch (error) {
      alert("Re-login required to delete account");
      console.error(error);
    }
  }
});
