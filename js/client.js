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
      <option 
        value="${docSnap.id}" 
        data-name="${data.name}"
        data-price="${data.price}">
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
  return clientData.purchases.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

// 🔥 RENDERIZAR COM BOTÃO DE EXCLUIR
// renderPurchases atualizado
function renderPurchases() {
  purchaseList.innerHTML = "";

  let total = 0;

  clientData.purchases.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    purchaseList.innerHTML += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <strong>${item.name}</strong><br>
          <small>
            R$ ${item.price.toFixed(2)} x ${item.quantity}
          </small>
        </div>

        <div class="d-flex align-items-center gap-2">

          <button onclick="changeQuantity(${index}, -1)"
                  class="btn btn-sm btn-outline-secondary">
            -
          </button>

          <span>${item.quantity}</span>

          <button onclick="changeQuantity(${index}, 1)"
                  class="btn btn-sm btn-outline-secondary">
            +
          </button>

          <button onclick="removeProduct(${index})"
                  class="btn btn-sm btn-danger">
            ✕
          </button>

        </div>
      </div>
    `;
  });

  totalDebt.innerText = `R$ ${total.toFixed(2)}`;
}

//Alterar quantidade
window.changeQuantity = (index, change) => {
  clientData.purchases[index].quantity += change;

  if (clientData.purchases[index].quantity <= 0) {
    clientData.purchases.splice(index, 1);
  }

  renderPurchases();
};

// 🔥 ADICIONAR PRODUTO
document.getElementById("addPurchaseBtn").onclick = () => {
  const selectedOption = productSelect.options[productSelect.selectedIndex];

  const productId = selectedOption.value;
  const productName = selectedOption.dataset.name;
  const productPrice = parseFloat(selectedOption.dataset.price);

  // 🔎 Verifica se produto já existe
  const existingProduct = clientData.purchases.find(
    (item) => item.id === productId,
  );

  if (existingProduct) {
    // 🔥 Apenas aumenta quantidade
    existingProduct.quantity += 1;
  } else {
    // 🔥 Cria novo produto com quantidade 1
    clientData.purchases.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
    });
  }

  renderPurchases();
};

// 🔥 REMOVER PRODUTO
window.removeProduct = (index) => {
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
