// script.js - Sistema de Inventário

let pecas = JSON.parse(localStorage.getItem('inventario')) || [];
let historico = JSON.parse(localStorage.getItem('historico')) || [];

function atualizarTabela() {
    const tabela = document.getElementById("estoque");
    tabela.innerHTML = "";
    pecas.forEach((peca, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${peca.codigo}</td>
                <td>${peca.nome}</td>
                <td><img src="${peca.imagem}" class="image-preview"></td>
                <td>${peca.quantidade}</td>
                <td>
                    <button onclick="alterarQuantidade(${index}, 1)">+1</button>
                    <button onclick="alterarQuantidade(${index}, -1)">-1</button>
                    <button onclick="removerPeca(${index})">Remover</button>
                </td>
            </tr>
        `;
    });
    atualizarIndicadores();
    localStorage.setItem('inventario', JSON.stringify(pecas));
}

function adicionarPeca() {
    const codigo = document.getElementById("codigoPeca").value;
    const nome = document.getElementById("nomePeca").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const imagem = document.getElementById("imagemPeca").files[0];
    if (codigo && nome && quantidade > 0 && imagem) {
        const reader = new FileReader();
        reader.onload = function (e) {
            pecas.push({ codigo, nome, quantidade, imagem: e.target.result });
            historico.push({ codigo, nome, quantidade, tipo: 'entrada', data: new Date().toLocaleString() });
            localStorage.setItem('historico', JSON.stringify(historico));
            atualizarTabela();
            limparCampos();
        };
        reader.readAsDataURL(imagem);
    }
}

function alterarQuantidade(index, valor) {
    pecas[index].quantidade += valor;
    if (pecas[index].quantidade < 0) pecas[index].quantidade = 0;
    historico.push({ codigo: pecas[index].codigo, nome: pecas[index].nome, quantidade: Math.abs(valor), tipo: valor > 0 ? 'entrada' : 'retirada', data: new Date().toLocaleString() });
    localStorage.setItem('historico', JSON.stringify(historico));
    atualizarTabela();
}

function removerPeca(index) {
    pecas.splice(index, 1);
    atualizarTabela();
}

function buscarPeca() {
    const codigoBusca = document.getElementById("buscarCodigo").value;
    const resultado = pecas.find(peca => peca.codigo === codigoBusca);
    document.getElementById("resultadoBusca").innerText = resultado ? `Peça: ${resultado.nome}, Quantidade: ${resultado.quantidade}` : "Peça não encontrada no inventário.";
}

function gerarRelatorio() {
    let relatorio = "Relatório de Inventário:\n";
    pecas.forEach(peca => {
        relatorio += `Código: ${peca.codigo}, Peça: ${peca.nome}, Quantidade: ${peca.quantidade}\n`;
    });
    document.getElementById("relatorio").innerText = relatorio;
}

function atualizarIndicadores() {
    let maisEstoque = [...pecas].sort((a, b) => b.quantidade - a.quantidade)[0] || { nome: 'Nenhuma', quantidade: 0 };
    let maisRetirada = [...historico.filter(h => h.tipo === 'retirada')].sort((a, b) => b.quantidade - a.quantidade)[0] || { nome: 'Nenhuma', quantidade: 0 };
    let maisEntrada = [...historico.filter(h => h.tipo === 'entrada')].sort((a, b) => b.quantidade - a.quantidade)[0] || { nome: 'Nenhuma', quantidade: 0 };
    
    document.getElementById("indicadorEstoque").innerText = `Mais em estoque: ${maisEstoque.nome} (${maisEstoque.quantidade})`;
    document.getElementById("indicadorRetirada").innerText = `Mais retirado: ${maisRetirada.nome} (${maisRetirada.quantidade})`;
    document.getElementById("indicadorEntrada").innerText = `Mais entrada: ${maisEntrada.nome} (${maisEntrada.quantidade})`;
}

function limparCampos() {
    document.getElementById("codigoPeca").value = "";
    document.getElementById("nomePeca").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("imagemPeca").value = "";
}

atualizarTabela();
