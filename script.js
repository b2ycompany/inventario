// script.js - Sistema de Inventário

let pecas = JSON.parse(localStorage.getItem('inventario')) || [];

function atualizarTabela() {
    const tabela = document.getElementById("estoque");
    tabela.innerHTML = "";
    pecas.forEach((peca, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${peca.codigo}</td>
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
    localStorage.setItem('inventario', JSON.stringify(pecas));
}

function adicionarPeca() {
    const codigo = document.getElementById("codigoPeca").value;
    const nome = document.getElementById("nomePeca").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    if (codigo && nome && quantidade > 0) {
        pecas.push({ codigo, nome, quantidade });
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

function buscarPeca() {
    const codigoBusca = document.getElementById("buscarCodigo").value;
    const resultado = pecas.find(peca => peca.codigo === codigoBusca);
    
    if (resultado) {
        document.getElementById("resultadoBusca").innerText = `Peça: ${resultado.nome}, Quantidade: ${resultado.quantidade}`;
    } else {
        document.getElementById("resultadoBusca").innerText = "Peça não encontrada no inventário.";
    }
}

function gerarRelatorio() {
    let relatorio = "Relatório de Inventário:\n";
    pecas.forEach(peca => {
        relatorio += `Código: ${peca.codigo}, Peça: ${peca.nome}, Quantidade: ${peca.quantidade}\n`;
    });
    document.getElementById("relatorio").innerText = relatorio;
}

atualizarTabela();
