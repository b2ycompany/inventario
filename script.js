// Inicializa Firebase (Versão compatível com navegador)
const firebaseConfig = {
    apiKey: "AIzaSyBZUHSvfX-rCPv0kF3y1jgoxzLjz-xF1zU",
    authDomain: "inventario-82fd5.firebaseapp.com",
    projectId: "inventario-82fd5",
    storageBucket: "inventario-82fd5.appspot.com",
    messagingSenderId: "505042062581",
    appId: "1:505042062581:web:89a491d9394294a76949bc"
};

// Configuração e Inicialização do Firebase
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
            if (!data.success) throw new Error("Erro ao enviar imagem para ImgBB.");

            const imagemURL = data.data.url;
            return db.collection("pecas").add({ codigo, nome, quantidade, imagem: imagemURL });
        })
        .then(() => {
            atualizarTabela();
            limparCampos();
            alert("Peça cadastrada com sucesso!");
        })
        .catch(error => console.error("Erro ao adicionar peça:", error));
    }).catch(error => console.error("Erro ao verificar código existente:", error));
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
                    <img src="${resultado.imagem}" class="image-preview">
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
