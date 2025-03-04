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

    const storageRef = storage.ref(`imagens/${codigo}`);
    storageRef.put(imagemFile).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(imagemURL => {
        return db.collection("pecas").add({ codigo, nome, quantidade, imagem: imagemURL });
    }).then(() => {
        atualizarTabela();
        document.getElementById("imagemPreview").style.display = "none";
        alert("Peça cadastrada com sucesso!");
    }).catch(error => console.error("Erro ao adicionar peça:", error));
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

// Alterar quantidade de peças
function alterarQuantidade(id, quantidade) {
    const pecaRef = db.collection("pecas").doc(id);
    pecaRef.get().then(doc => {
        if (doc.exists) {
            const novaQuantidade = doc.data().quantidade + quantidade;
            if (novaQuantidade >= 0) {
                return pecaRef.update({ quantidade: novaQuantidade });
            }
        }
    }).then(() => atualizarTabela())
    .catch(error => console.error("Erro ao alterar quantidade:", error));
}

// Remover peça
function removerPeca(id) {
    db.collection("pecas").doc(id).delete()
    .then(() => atualizarTabela())
    .catch(error => console.error("Erro ao remover peça:", error));
}

// Buscar peça pelo código ou nome
function buscarPeca() {
    const termoBusca = document.getElementById("buscarCodigo").value.trim().toLowerCase();
    db.collection("pecas").get().then(snapshot => {
        const resultadoBusca = document.getElementById("resultadoBusca");
        resultadoBusca.innerHTML = "";
        snapshot.forEach(doc => {
            const peca = doc.data();
            if (peca.codigo.toLowerCase().includes(termoBusca) || peca.nome.toLowerCase().includes(termoBusca)) {
                resultadoBusca.insertAdjacentHTML("beforeend", `
                    <div>
                        <strong>${peca.codigo}</strong> - ${peca.nome} (Quantidade: ${peca.quantidade})
                        <img src="${peca.imagem}" class="image-preview">
                    </div>
                `);
            }
        });
    }).catch(error => console.error("Erro ao buscar peça:", error));
}

// Gerar relatório
function gerarRelatorio() {
    db.collection("pecas").get().then(snapshot => {
        let relatorio = "Relatório de Estoque:\n";
        snapshot.forEach(doc => {
            const peca = doc.data();
            relatorio += `Código: ${peca.codigo}, Nome: ${peca.nome}, Quantidade: ${peca.quantidade}\n`;
        });
        document.getElementById("relatorio").textContent = relatorio;
    }).catch(error => console.error("Erro ao gerar relatório:", error));
}

// Atualizar indicadores
function atualizarIndicadores() {
    db.collection("pecas").get().then(snapshot => {
        let maisEstoque = { nome: "Nenhum", quantidade: 0 };
        snapshot.forEach(doc => {
            const peca = doc.data();
            if (peca.quantidade > maisEstoque.quantidade) {
                maisEstoque = { nome: peca.nome, quantidade: peca.quantidade };
            }
        });
        document.getElementById("indicadorEstoque").textContent = `Mais em estoque: ${maisEstoque.nome} (${maisEstoque.quantidade})`;
    }).catch(error => console.error("Erro ao atualizar indicadores:", error));
}

// Inicializa tudo
atualizarTabela();
atualizarIndicadores();
