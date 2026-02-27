import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const clientsList = document.getElementById("clientsList");
const searchInput = document.getElementById("searchClient");

let allClients = [];

/* ================================
   🔥 CARREGAR CLIENTES
================================ */
async function loadClients() {
  const q = query(collection(db, "clients"), orderBy("updatedAt", "desc"));

  const snapshot = await getDocs(q);

  allClients = [];

  snapshot.forEach((docSnap) => {
    const client = docSnap.data();

    allClients.push({
      id: docSnap.id,
      ...client,
    });
  });

  renderClients(allClients);
}

/* ================================
   🔥 RENDERIZAR CLIENTES
================================ */
function renderClients(clients) {
  clientsList.innerHTML = "";

  if (clients.length === 0) {
    clientsList.innerHTML = `
      <div class="text-center mt-4">
        <p class="text-muted">Nenhum cliente encontrado.</p>
      </div>
    `;
    return;
  }

  const now = new Date();

  const sections = {
    hoje: [],
    ontem: [],
    semana: [],
    mes: [],
    antigos: [],
  };

  clients.forEach((client) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clientDay = new Date(client.updatedAt || Date.now());
    clientDay.setHours(0, 0, 0, 0);

    const diffTime = today - clientDay;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      sections.hoje.push(client);
    } else if (diffDays === 1) {
      sections.ontem.push(client);
    } else if (diffDays <= 7) {
      sections.semana.push(client);
    } else if (diffDays <= 30) {
      sections.mes.push(client);
    } else {
      sections.antigos.push(client);
    }
  });

  function renderSection(title, data) {
    if (data.length === 0) return;

    clientsList.innerHTML += `
      <div class="col-12 mt-4">
        <h5 class="border-bottom pb-2">${title}</h5>
      </div>
    `;

    data.forEach((client) => {
      const clientDate = new Date(client.updatedAt);

      clientsList.innerHTML += `
        <div class="col-md-4 fade-in">
          <div class="card shadow p-3 h-100">
            <h5>${client.name}</h5>
            <p>Atualizado: ${clientDate.toLocaleDateString()}</p>
            <h6 class="text-danger">
              R$ ${(client.totalDebt || 0).toFixed(2)}
            </h6>
            <div class="d-flex gap-2 mt-2">
              <a href="client.html?id=${client.id}"
                 class="btn btn-primary btn-sm w-100">
                 Abrir
              </a>
              <button onclick="deleteClient('${client.id}')"
                      class="btn btn-danger btn-sm w-100">
                 Excluir
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }

  renderSection("🟢 Hoje", sections.hoje);
  renderSection("🟡 Ontem", sections.ontem);
  renderSection("🔵 Esta Semana", sections.semana);
  renderSection("🟣 Este Mês", sections.mes);
  renderSection("⚫ Antigos", sections.antigos);
}

/* ================================
   🔥 PESQUISA EM TEMPO REAL
================================ */
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();

  const filtered = allClients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm),
  );

  renderClients(filtered);
});

/* ================================
   🔥 NOVO CLIENTE
================================ */
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

/* ================================
   🔥 EXCLUIR CLIENTE
================================ */
window.deleteClient = async (id) => {
  if (!confirm("Deseja excluir este cliente?")) return;

  await deleteDoc(doc(db, "clients", id));
  loadClients();
};

/* ================================
   🔥 LOGOUT
================================ */
document.getElementById("logoutBtn").onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

/* ================================
   🚀 INICIAR
================================ */
loadClients();
