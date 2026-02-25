import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const clientId = params.get("id");

let clientData = { purchases: [] };

const productSelect = document.getElementById("productSelect");
const purchaseList = document.getElementById("purchaseList");
const totalDebtEl = document.getElementById("totalDebt");
const observationInput = document.getElementById("observation");

// 🔥 CARREGAR PRODUTOS
async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  productSelect.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    productSelect.innerHTML += `
      <option value="${data.price}" data-name="${data.name}">
        ${data.name} - R$ ${data.price.toFixed(2)}
      </option>
    `;
  });
}

// 🔥 CARREGAR CLIENTE
async function loadClient() {
  const docRef = doc(db, "clients", clientId);
  const snap = await getDoc(docRef);

  clientData = snap.data();
  document.getElementById("clientName").innerText = clientData.name;
  observationInput.value = clientData.observations || "";

  renderPurchases();
}

// 🔥 CALCULAR TOTAL
function calculateTotal() {
  return clientData.purchases.reduce((sum, item) => sum + item.price, 0);
}

// 🔥 RENDERIZAR COM BOTÃO DE EXCLUIR
// renderPurchases atualizado
function renderPurchases() {
  purchaseList.innerHTML = "";

  clientData.purchases.forEach((item, index) => {
    const div = document.createElement("div");
    div.className =
      "d-flex justify-content-between align-items-center border-bottom py-2 fade-in";
    div.innerHTML = `
      <div>${item.name} - R$ ${item.price.toFixed(2)}</div>
      <button class="btn btn-sm btn-danger" onclick="removePurchase(${index})">X</button>
    `;
    purchaseList.appendChild(div);
  });

  totalDebtEl.innerText = "R$ " + calculateTotal().toFixed(2);
}

// 🔥 ADICIONAR PRODUTO
document.getElementById("addPurchaseBtn").onclick = () => {
  const selected = productSelect.options[productSelect.selectedIndex];

  const name = selected.dataset.name;
  const price = parseFloat(selected.value);

  clientData.purchases.push({ name, price });

  renderPurchases();
};

// 🔥 REMOVER PRODUTO
window.removePurchase = (index) => {
  clientData.purchases.splice(index, 1);
  renderPurchases();
};

// 🔥 SALVAR TUDO
document.getElementById("saveClientBtn").onclick = async () => {
  try {
    clientData.observations = observationInput.value;
    clientData.totalDebt = calculateTotal();
    clientData.updatedAt = Date.now();

    await updateDoc(doc(db, "clients", clientId), clientData);

    // 🔥 Pequeno feedback visual opcional
    const btn = document.getElementById("saveClientBtn");
    btn.innerText = "Salvo ✔";
    btn.disabled = true;

    // 🔥 Aguarda 500ms para mostrar feedback
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  } catch (err) {
    alert("Erro ao salvar.");
    console.error(err);
  }
};

loadProducts();
loadClient();
