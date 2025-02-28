let pecas = JSON.parse(localStorage.getItem('estoque')) || [];

document.addEventListener("DOMContentLoaded", atualizarTabela);

function atualizarTabela() {
    const tabela = document.getElementById("estoque");
    tabela.innerHTML = "";
    pecas.forEach((peca, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${peca.nome}</td>
                <td>${peca.quantidade}</td>
                <td>
                    <button onclick="alterarQuantidade(${index}, 1)">+1</button>
                    <button onclick="alterarQuantidade(${index}, -1)">-1</button>
                    <button onclick="removerPeca(${index})">Remover</button>
                </td>
            </tr>
        `;
    });
    localStorage.setItem('estoque', JSON.stringify(pecas));
}

function adicionarPeca() {
    const nome = document.getElementById("nomePeca").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    if (nome && quantidade > 0) {
        pecas.push({ nome, quantidade });
        atualizarTabela();
    }
}

function alterarQuantidade(index, valor) {
    pecas[index].quantidade += valor;
    if (pecas[index].quantidade < 0) pecas[index].quantidade = 0;
    atualizarTabela();
}

function removerPeca(index) {
    pecas.splice(index, 1);
    atualizarTabela();
}
