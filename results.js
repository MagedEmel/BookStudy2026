import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig, COLLECTION_NAME } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const list = document.getElementById("list");
const empty = document.getElementById("emptyState");
const modal = document.getElementById("confirmModal");
const modalName = document.getElementById("modalName");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");
const stageFilter = document.getElementById("stageFilter");

let pendingId = null;
let allEntries = []; // كل المشاركين بالترتيب، من غير فلترة

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  const selected = stageFilter.value;
  const entries = selected === "all"
    ? allEntries
    : allEntries.filter((e) => e.stage === selected);

  list.innerHTML = "";

  if (entries.length === 0) {
    empty.style.display = "block";
    empty.textContent = allEntries.length === 0 ? "لسه محدش سجّل 👀" : "مفيش حد في الفرقة دي لسه 👀";
    return;
  }
  empty.style.display = "none";

  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "entry";
    li.innerHTML = `
      <span class="entry-num">${index + 1}</span>
      <span class="entry-name">${escapeHtml(entry.name)}</span>
      <span class="entry-stage">${escapeHtml(entry.stage)}</span>
      <button class="delete-btn" title="مسح" data-id="${entry.id}" data-name="${escapeHtml(entry.name)}">🗑</button>
    `;
    list.appendChild(li);
  });
}

const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
  allEntries = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return { id: docSnap.id, name: data.name || "", stage: data.stage || "" };
  });
  render();
});

stageFilter.addEventListener("change", render);

list.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  pendingId = btn.dataset.id;
  modalName.textContent = btn.dataset.name;
  modal.classList.add("open");
});

cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.classList.remove("open");
  pendingId = null;
}

confirmBtn.addEventListener("click", async () => {
  if (!pendingId) return;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, pendingId));
  } catch (err) {
    console.error(err);
  }
  closeModal();
});
