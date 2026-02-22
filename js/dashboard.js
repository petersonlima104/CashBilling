import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const clientsList = document.getElementById("clientsList");

async function loadClients() {
  const snapshot = await getDocs(collection(db, "clients"));
  clientsList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    clientsList.innerHTML += `
      <div class="col-md-4">
        <div class="card shadow p-3">
          <h5>${data.name}</h5>
          <p>Atualizado: ${new Date(data.updatedAt).toLocaleDateString()}</p>
          <h6 class="text-danger">R$ ${data.totalDebt.toFixed(2)}</h6>
          <a href="client.html?id=${docSnap.id}" class="btn btn-primary btn-sm">Abrir</a>
          <button onclick="deleteClient('${docSnap.id}')" class="btn btn-danger btn-sm mt-2">Excluir</button>
        </div>
      </div>
    `;
  });
}

window.deleteClient = async (id) => {
  await deleteDoc(doc(db, "clients", id));
  loadClients();
};

document.getElementById("newClientBtn").onclick = async () => {
  const name = prompt("Nome do cliente:");
  if (!name) return;

  await addDoc(collection(db, "clients"), {
    name,
    purchases: [],
    totalDebt: 0,
    observations: "",
    updatedAt: Date.now(),
  });

  loadClients();
};

document.getElementById("logoutBtn").onclick = () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
};

loadClients();
