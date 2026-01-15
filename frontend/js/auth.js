import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";


const auth = window.firebaseAuth;
const loginPage = document.getElementById("login-page");
const uploadPage = document.getElementById("upload-page");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account");


signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      return updateProfile(cred.user, { displayName: name });
    })
    .then(() => {
      signupError.classList.add("hidden");
      signupForm.reset();
    })
    .catch((error) => {
      signupError.textContent = error.message;
      signupError.classList.remove("hidden");
    });
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginError.classList.add("hidden");
      loginForm.reset();
    })
    .catch((error) => {
      loginError.textContent = error.message;
      loginError.classList.remove("hidden");
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginPage.classList.remove("active");
    loginPage.classList.add("hidden");

    uploadPage.classList.remove("hidden");
    document.getElementById("account-name").textContent =
      user.displayName || "User";
    document.getElementById("account-email").textContent = user.email;
  } else {
    loginPage.classList.add("active");
    loginPage.classList.remove("hidden");

    uploadPage.classList.add("hidden");
  }
});
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});
deleteAccountBtn.addEventListener("click", () => {
  const user = auth.currentUser;

  if (confirm("Are you sure you want to delete your account?")) {
    deleteUser(user)
      .then(() => {
        alert("Account deleted successfully");
      })
      .catch((error) => {
        alert("Re-login required to delete account");
        console.error(error);
      });
  }
});
