// script.js - Sistema de Inventário com Firebase + ImgBB

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBZUHSvfX-rCPv0kF3y1jgoxzLjz-xF1zU",
    authDomain: "inventario-82fd5.firebaseapp.com",
    projectId: "inventario-82fd5",
    storageBucket: "inventario-82fd5.firebasestorage.app",
    messagingSenderId: "505042062581",
    appId: "1:505042062581:web:89a491d9394294a76949bc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Configuração do ImgBB
const imgbbApiKey = "c7150786eeb1856121e2fb3568c8e44a";

function atualizarTabela() {
    db.collection("pecas").get().then(snapshot => {
        const tabela = document.getElementById("estoque");
        tabela.innerHTML = "";
        snapshot.forEach(doc => {
            const peca = doc.data();
            tabela.innerHTML += `
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
            `;
        });
    });
}

function adicionarPeca() {
    const codigo = document.getElementById("codigoPeca").value;
    const nome = document.getElementById("nomePeca").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const imagemFile = document.getElementById("imagemPeca").files[0];

    if (!codigo || !nome || quantidade <= 0 || !imagemFile) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    db.collection("pecas").where("codigo", "==", codigo).get().then(snapshot => {
        if (!snapshot.empty) {
            alert(`O código ${codigo} já está cadastrado.`);
            return;
        }
        
        const formData = new FormData();
        formData.append("image", imagemFile);
        
        fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const imagemURL = data.data.url;
            db.collection("pecas").add({ codigo, nome, quantidade, imagem: imagemURL }).then(() => {
                atualizarTabela();
                limparCampos();
            });
        })
        .catch(error => console.error("Erro no upload da imagem:", error));
    });
}

function alterarQuantidade(id, valor) {
    db.collection("pecas").doc(id).get().then(doc => {
        if (doc.exists) {
            const novaQuantidade = doc.data().quantidade + valor;
            db.collection("pecas").doc(id).update({ quantidade: Math.max(novaQuantidade, 0) }).then(() => {
                atualizarTabela();
            });
        }
    });
}

function removerPeca(id) {
    db.collection("pecas").doc(id).delete().then(() => {
        atualizarTabela();
    });
}

function buscarPeca() {
    const termoBusca = document.getElementById("buscarCodigo").value.toLowerCase();
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
                    <img src="${resultado.imagem}" class="image-preview">
                    <p><strong>Código:</strong> ${resultado.codigo}</p>
                    <p><strong>Nome:</strong> ${resultado.nome}</p>
                    <p><strong>Quantidade:</strong> ${resultado.quantidade}</p>
                </div>
            `;
        } else {
            document.getElementById("resultadoBusca").innerText = "Peça não encontrada no inventário.";
        }
    });
}

function limparCampos() {
    document.getElementById("codigoPeca").value = "";
    document.getElementById("nomePeca").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("imagemPeca").value = "";
}

atualizarTabela();
