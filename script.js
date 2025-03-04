// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBZUHSvfX-rCPv0kF3y1jgoxzLjz-xF1zU",
    authDomain: "inventario-82fd5.firebaseapp.com",
    projectId: "inventario-82fd5",
    storageBucket: "inventario-82fd5.appspot.com",
    messagingSenderId: "505042062581",
    appId: "1:505042062581:web:89a491d9394294a76949bc"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Função para atualizar a tabela
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

// Função para adicionar peça
function adicionarPeca() {
    const codigo = document.getElementById("codigoPeca").value.trim();
    const nome = document.getElementById("nomePeca").value.trim();
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const imagemFile = document.getElementById("imagemPeca").files[0];

    if (!codigo || !nome || quantidade <= 0 || !imagemFile) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const imagemBase64 = event.target.result;
        return db.collection("pecas").add({ codigo, nome, quantidade, imagem: imagemBase64 })
            .then(() => {
                atualizarTabela();
                document.getElementById("imagemPreview").style.display = "none";
                alert("Peça cadastrada com sucesso!");
            })
            .catch(error => console.error("Erro ao adicionar peça:", error));
    };
    reader.readAsDataURL(imagemFile);
}

// Função para exibir prévia da imagem
function mostrarImagemPreview() {
    const imagemFile = document.getElementById("imagemPeca").files[0];
    if (imagemFile) {
        const reader = new FileReader();
        reader.onload = event => {
            document.getElementById("imagemPreview").src = event.target.result;
            document.getElementById("imagemPreview").style.display = "block";
        };
        reader.readAsDataURL(imagemFile);
    }
}

// Iniciar atualização da tabela
document.addEventListener("DOMContentLoaded", atualizarTabela);
