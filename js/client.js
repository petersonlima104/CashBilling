import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  increment,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//  Calcula e atualiza receita mensal no Firestore
async function updateMonthlyRevenueFirestore(amountToAdd) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const monthKey = `${year}-${month}`;

  const monthRef = doc(db, "monthlyRevenue", monthKey);

  const monthSnap = await getDoc(monthRef);

  if (monthSnap.exists()) {
    await updateDoc(monthRef, {
      total: increment(amountToAdd),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(monthRef, {
      total: amountToAdd,
      month,
      year: String(year),
      createdAt: serverTimestamp(),
    });
  }
}

const params = new URLSearchParams(window.location.search);
const clientId = params.get("id");

let clientData = { purchases: [] };

const productSelect = document.getElementById("productSelect");
const purchaseList = document.getElementById("purchaseList");
const totalDebtEl = document.getElementById("totalDebt");
const observationInput = document.getElementById("observation");
const partialPaymentInput = document.getElementById("partialPayment");

// 🔥 CARREGAR PRODUTOS
async function loadProducts() {
  const q = query(collection(db, "products"), orderBy("name", "asc"));

  const snapshot = await getDocs(q);
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

//  REMOVER PRODUTO
window.removeProduct = (index) => {
  clientData.purchases.splice(index, 1);
  renderPurchases();
};

//  Adicionar pagamento parcial
document.getElementById("addPaymentBtn").onclick = () => {
  const paymentValue = parseFloat(partialPaymentInput.value);

  if (!paymentValue || paymentValue <= 0) {
    alert("Digite um valor válido.");
    return;
  }

  const currentTotal = calculateTotal(); // Total antes do pagamento

  if (paymentValue > currentTotal) {
    alert("O valor pago não pode ser maior que o total devido.");
    return;
  }

  // 🔥 Adiciona pagamento como item negativo
  clientData.purchases.push({
    id: "payment_" + Date.now(),
    name: "Pagamento Parcial",
    price: -paymentValue,
    quantity: 1,
  });

  // 🔥 Data formatada
  const now = new Date();
  const dateFormatted =
    now.toLocaleDateString() + " " + now.toLocaleTimeString();

  // 🔥 NOVA OBSERVAÇÃO MELHORADA
  const newObservation = `\n[${dateFormatted}] Pagamento parcial registrado no valor de: R$ ${paymentValue.toFixed(2)} do Total de: R$ ${currentTotal.toFixed(2)}`;

  clientData.observations = (clientData.observations || "") + newObservation;

  observationInput.value = clientData.observations;

  partialPaymentInput.value = "";

  renderPurchases();
};

// 🔥 SALVAR TUDO
document.getElementById("saveClientBtn").onclick = async () => {
  try {
    const clientRef = doc(db, "clients", clientId);

    // Buscar dados atuais do banco (antes da edição)
    const oldSnap = await getDoc(clientRef);

    let oldTotalDebt = 0;

    if (oldSnap.exists()) {
      oldTotalDebt = oldSnap.data().totalDebt || 0;
    }

    // Atualizar dados locais
    clientData.observations = observationInput.value;
    const newTotalDebt = calculateTotal();
    clientData.totalDebt = newTotalDebt;
    clientData.updatedAt = Date.now();

    // Salvar cliente
    await updateDoc(clientRef, clientData);

    // Calcular diferença positiva
    const difference = newTotalDebt - oldTotalDebt;

    if (difference > 0) {
      await updateMonthlyRevenueFirestore(difference);
    }

    // Feedback visual
    const btn = document.getElementById("saveClientBtn");
    btn.innerText = "Salvo ✔";
    btn.disabled = true;

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
