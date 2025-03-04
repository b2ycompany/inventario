// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SUA_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Configuração do ImgBB
const imgbbApiKey = "SUA_IMGBB_API_KEY";

// Atualizar a tabela com os dados do Firestore
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

// Adicionar nova peça
function adicionarPeca() {
    const codigo = document.getElementById("codigoPeca").value.trim();
    const nome = document.getElementById("nomePeca").value.trim();
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const imagemFile = document.getElementById("imagemPeca").files[0];

    if (!codigo || !nome || quantidade <= 0 || !imagemFile) {
        alert("Preencha todos os campos corretamente!");
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
        return db.collection("pecas").add({ codigo, nome, quantidade, imagem: imagemURL });
    })
    .then(() => {
        atualizarTabela();
        document.getElementById("imagemPreview").style.display = "none";
        alert("Peça cadastrada com sucesso!");
    })
    .catch(error => console.error("Erro ao adicionar peça:", error));
}

// Exibir imagem de pré-visualização antes do upload
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

atualizarTabela();
