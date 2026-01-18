
import { 
  getFirestore, collection, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

window.firebaseGetDownloadURL = getDownloadURL;

window.firebaseCollection = collection;
window.firebaseAddDoc = addDoc;
window.firebaseServerTimestamp = serverTimestamp;
