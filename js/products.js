import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productsList = document.getElementById("productsList");
const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("productPrice");
const editProductId = document.getElementById("editProductId");
const cancelEditBtn = document.getElementById("cancelEditBtn");

async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  productsList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    productsList.innerHTML += `
      <div class="card p-2 mb-2 shadow-sm d-flex justify-content-between align-items-center">
        <div>
          <strong>${data.name}</strong>
          <div>R$ ${data.price.toFixed(2)}</div>
        </div>

        <div class="d-flex gap-2">
          <button onclick="editProduct('${docSnap.id}', '${data.name}', ${data.price})"
            class="btn btn-warning btn-sm">
            Editar
          </button>

          <button onclick="deleteProduct('${docSnap.id}')"
            class="btn btn-danger btn-sm">
            Excluir
          </button>
        </div>
      </div>
    `;
  });
}

// 🔥 SALVAR OU ATUALIZAR
document.getElementById("addProductBtn").onclick = async () => {
  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name || isNaN(price)) {
    alert("Preencha corretamente.");
    return;
  }

  // Se estiver editando
  if (editProductId.value) {
    await updateDoc(doc(db, "products", editProductId.value), {
      name,
      price,
    });
  } else {
    await addDoc(collection(db, "products"), {
      name,
      price,
    });
  }

  resetForm();
  loadProducts();
};

// 🔥 EDITAR
window.editProduct = (id, name, price) => {
  editProductId.value = id;
  nameInput.value = name;
  priceInput.value = price;

  cancelEditBtn.classList.remove("d-none");
  nameInput.focus();
};

// 🔥 CANCELAR EDIÇÃO
cancelEditBtn.onclick = () => {
  resetForm();
};

// 🔥 EXCLUIR
window.deleteProduct = async (id) => {
  if (!confirm("Deseja realmente excluir este produto?")) return;

  await deleteDoc(doc(db, "products", id));
  loadProducts();
};

// 🔥 RESET FORM
function resetForm() {
  editProductId.value = "";
  nameInput.value = "";
  priceInput.value = "";
  cancelEditBtn.classList.add("d-none");
  nameInput.focus();
}

loadProducts();
