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

    const storageRef = storage.ref("imagens/" + imagemFile.name);
    storageRef.put(imagemFile).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(imagemURL => {
        return db.collection("pecas").add({ codigo, nome, quantidade, imagem: imagemURL });
    }).then(() => {
        atualizarTabela();
        alert("Peça cadastrada com sucesso!");
    }).catch(error => console.error("Erro ao adicionar peça:", error));
}

// Alterar quantidade da peça
function alterarQuantidade(id, valor) {
    const pecaRef = db.collection("pecas").doc(id);
    pecaRef.get().then(doc => {
        if (doc.exists) {
            let novaQuantidade = doc.data().quantidade + valor;
            if (novaQuantidade < 0) novaQuantidade = 0;
            return pecaRef.update({ quantidade: novaQuantidade });
        }
    }).then(() => atualizarTabela());
}

// Remover peça
function removerPeca(id) {
    db.collection("pecas").doc(id).delete().then(() => {
        atualizarTabela();
    }).catch(error => console.error("Erro ao remover peça:", error));
}

// Buscar peça
function buscarPeca() {
    const termo = document.getElementById("buscarCodigo").value.trim().toLowerCase();
    db.collection("pecas").get().then(snapshot => {
        const resultado = document.getElementById("resultadoBusca");
        resultado.innerHTML = "";
        snapshot.forEach(doc => {
            const peca = doc.data();
            if (peca.codigo.toLowerCase().includes(termo) || peca.nome.toLowerCase().includes(termo)) {
                resultado.insertAdjacentHTML("beforeend", `
                    <div>
                        <p><strong>${peca.nome}</strong> (${peca.codigo}) - ${peca.quantidade} unidades</p>
                        <img src="${peca.imagem}" class="image-preview">
                    </div>
                `);
            }
        });
    });
}

// Gerar relatório
function gerarRelatorio() {
    db.collection("pecas").get().then(snapshot => {
        let relatorio = "";
        snapshot.forEach(doc => {
            const peca = doc.data();
            relatorio += `${peca.nome} (${peca.codigo}): ${peca.quantidade} unidades\n`;
        });
        document.getElementById("relatorio").textContent = relatorio;
    });
}

// Inicializa a tabela ao carregar a página
atualizarTabela();
