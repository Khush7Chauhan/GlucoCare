import { getStorage, ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

import { 
  getFirestore, collection, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

window.firebaseStorage = getStorage();
window.firebaseStorageRef = ref;
window.firebaseUploadBytes = uploadBytes;
window.firebaseGetDownloadURL = getDownloadURL;

window.firebaseCollection = collection;
window.firebaseAddDoc = addDoc;
window.firebaseServerTimestamp = serverTimestamp;
