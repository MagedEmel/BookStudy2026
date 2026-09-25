import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig, COLLECTION_NAME } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("regForm");
const btn = document.getElementById("submitBtn");
const nameInput = document.getElementById("nameInput");
const stageSelect = document.getElementById("stageSelect");
const msg = document.getElementById("formMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const stage = stageSelect.value;
  if (!name || !stage) return;

  btn.disabled = true;
  btn.textContent = "جاري الحفظ...";
  msg.textContent = "";
  msg.className = "form-msg";

  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      name,
      stage,
      timestamp: serverTimestamp()
    });

    form.reset();
    msg.textContent = `تم تسجيل ${name} بنجاح 🎉`;
    msg.className = "form-msg success";
  } catch (err) {
    console.error(err);
    msg.textContent = "حصل خطأ أثناء الحفظ، حاول تاني";
    msg.className = "form-msg error";
  } finally {
    btn.disabled = false;
    btn.textContent = "انضم للمغامرة";
  }
});
