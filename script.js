// script.js - Sistema de Inventário com Firebase + ImgBB

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBZUHSvfX-rCPv0kF3y1jgoxzLjz-xF1zU",
    authDomain: "inventario-82fd5.firebaseapp.com",
    projectId: "inventario-82fd5",
    storageBucket: "inventario-82fd5.appspot.com",
    messagingSenderId: "505042062581",
    appId: "1:505042062581:web:89a491d9394294a76949bc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function atualizarTabela() {
    db.collection("pecas").get().then(snapshot => {
        const tabela = document.getElementById("estoque");
        tabela.innerHTML = "";

        snapshot.forEach(doc => {
            const peca = doc.data();
            tabela.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${peca.codigo}</td>
                    <td>${peca.nome}</td>
                    <td><img src="${peca.imagem}" class="image-preview"></td>
                    <td>${peca.quantidade}</td>
                    <td>
                        <button onclick="alterarQuantidade('${doc.id}', 1)">+1</button>
                        <button onclick="alterarQuantidade('${doc.id}', -1)">-1</button>
                        <button onclick="removerPeca('${doc.id}')">Remover</button>
                    </td>
                </tr>
            `);
        });
    }).catch(error => console.error("Erro ao atualizar a tabela:", error));
}

function adicionarPeca() {
    const codigo = document.getElementById("codigoPeca").value.trim();
    const nome = document.getElementById("nomePeca").value.trim();
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (!codigo || !nome || quantidade <= 0) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    db.collection("pecas").where("codigo", "==", codigo).get().then(snapshot => {
        if (!snapshot.empty) {
            alert(`O código ${codigo} já está cadastrado.`);
            return;
        }
        return db.collection("pecas").add({ codigo, nome, quantidade, imagem: "" });
    }).then(() => {
        atualizarTabela();
        alert("Peça cadastrada com sucesso!");
    }).catch(error => console.error("Erro ao adicionar peça:", error));
}

function alterarQuantidade(id, valor) {
    db.collection("pecas").doc(id).get().then(doc => {
        if (doc.exists) {
            const novaQuantidade = Math.max(doc.data().quantidade + valor, 0);
            return db.collection("pecas").doc(id).update({ quantidade: novaQuantidade });
        }
    }).then(() => atualizarTabela())
    .catch(error => console.error("Erro ao alterar quantidade:", error));
}

function removerPeca(id) {
    db.collection("pecas").doc(id).delete().then(() => {
        atualizarTabela();
    }).catch(error => console.error("Erro ao remover peça:", error));
}

function buscarPeca() {
    const termoBusca = document.getElementById("buscarCodigo").value.trim().toLowerCase();
    if (!termoBusca) {
        document.getElementById("resultadoBusca").innerText = "Digite um código ou nome para buscar.";
        return;
    }

    db.collection("pecas").get().then(snapshot => {
        let resultado = null;
        snapshot.forEach(doc => {
            const peca = doc.data();
            if (peca.codigo.toLowerCase() === termoBusca || peca.nome.toLowerCase().includes(termoBusca)) {
                resultado = peca;
            }
        });

        if (resultado) {
            document.getElementById("resultadoBusca").innerHTML = `
                <div class='resultado-card'>
                    <p><strong>Código:</strong> ${resultado.codigo}</p>
                    <p><strong>Nome:</strong> ${resultado.nome}</p>
                    <p><strong>Quantidade:</strong> ${resultado.quantidade}</p>
                </div>
            `;
        } else {
            document.getElementById("resultadoBusca").innerText = "Peça não encontrada no inventário.";
        }
    }).catch(error => console.error("Erro ao buscar peça:", error));
}

atualizarTabela();
