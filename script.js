// Referência ao Firestore
const db = firebase.firestore();

// Atualiza a Tabela de Estoque
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

// Adiciona uma nova peça
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

        const reader = new FileReader();
        reader.onloadend = function () {
            const imagemBase64 = reader.result;

            db.collection("pecas").add({
                codigo, nome, quantidade, imagem: imagemBase64
            }).then(() => {
                atualizarTabela();
                alert("Peça cadastrada com sucesso!");
            }).catch(error => console.error("Erro ao adicionar peça:", error));
        };

        reader.readAsDataURL(imagemFile);
    }).catch(error => console.error("Erro ao verificar código existente:", error));
}

// Altera quantidade de uma peça
function alterarQuantidade(id, valor) {
    db.collection("pecas").doc(id).get().then(doc => {
        if (doc.exists) {
            const novaQuantidade = Math.max(doc.data().quantidade + valor, 0);
            return db.collection("pecas").doc(id).update({ quantidade: novaQuantidade });
        }
    }).then(() => atualizarTabela())
    .catch(error => console.error("Erro ao alterar quantidade:", error));
}

// Remove uma peça do inventário
function removerPeca(id) {
    db.collection("pecas").doc(id).delete().then(() => {
        atualizarTabela();
    }).catch(error => console.error("Erro ao remover peça:", error));
}

// Atualiza a tabela ao carregar
atualizarTabela();
