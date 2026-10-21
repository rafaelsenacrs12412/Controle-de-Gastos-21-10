/* ===========================================================
   Pra onde foi meu dinheiro? — gabarito de 19/10, passo 5: o gráfico de barras

   O que já está pronto:
   - cada gasto é um objeto: descrição, valor e categoria;
   - a lista gastos é a única coisa que o programa lembra;
   - tudo o que a tela mostra é CALCULADO a partir dela:
     total, quantidade, média, maior, menor, orçamento e os
     totais por categoria;
   - o histórico é uma tabela montada com createElement, com
     um botão de apagar em cada linha;
   - a renderizar() desenha a tela inteira, e todo ouvinte
     termina chamando ela.
   =========================================================== */


/* -----------------------------------------------------------
   Funções que só devolvem
   ----------------------------------------------------------- */

function formatarReais(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularMedia(total, quantidade) {
    if (quantidade === 0) {
        return 0;
    }
    return total / quantidade;
}

function montarTextoDoGasto(gasto) {
    return gasto.descricao + ' — ' + formatarReais(gasto.valor);
}

function montarMensagemDoOrcamento(restante) {
    if (restante >= 0) {
        return formatarReais(restante) + ' disponíveis';
    }
    return 'Passou ' + formatarReais(-restante) + ' do orçamento';
}

function passouDoOrcamento(total, orcamento) {
    return total > orcamento;
}

function montarOpcoesDeCategorias(categorias) {
    // Passo 4 — a primeira opção não tem valor: com o required,
    // o navegador não deixa enviar sem escolher uma categoria.
    let opcoes = '<option value="">Escolha a categoria</option>';
    for (let i = 0; i < categorias.length; i++) {
        opcoes = opcoes + `<option value="${i}">${categorias[i].nome}</option>`;
    }
    return opcoes;
}

// calcularTotal([{ valor: 12.5 }, { valor: 30 }]) → 42.5
function calcularTotal(gastos) {
    let total = 0;
    for (let i = 0; i < gastos.length; i++) {
        total = total + gastos[i].valor;
    }
    return total;
}

function calcularMaiorGasto(gastos) {
    let maior = gastos[0];
    for (let i = 1; i < gastos.length; i++) {
        if (gastos[i].valor > maior.valor) {
            maior = gastos[i];
        }
    }
    return maior;
}

function calcularMenorGasto(gastos) {
    let menor = gastos[0];
    for (let i = 1; i < gastos.length; i++) {
        if (gastos[i].valor < menor.valor) {
            menor = gastos[i];
        }
    }
    return menor;
}

function calcularTotalDaCategoria(gastos, nomeDaCategoria) {
    let total = 0;
    for (let i = 0; i < gastos.length; i++) {
        if (gastos[i].categoria === nomeDaCategoria) {
            total = total + gastos[i].valor;
        }
    }
    return total;
}

// Passo 5 — quanto a parte é do total, de 0 a 100.
// calcularPorcentagem(25, 50) → 50
// calcularPorcentagem(0, 0)   → 0   (sem isso, 0 / 0 dá NaN)
function calcularPorcentagem(parte, total) {
    if (total === 0) {
        return 0;
    }
    return parte / total * 100;
}

// Passo 2 — o gasto aparece com este filtro?
// passaNoFiltro({ descricao: 'lanche', valor: 12.5, categoria: 'Alimentação' }, 'Alimentação') → true
// passaNoFiltro({ descricao: 'lanche', valor: 12.5, categoria: 'Alimentação' }, 'Lazer')       → false
// passaNoFiltro({ descricao: 'lanche', valor: 12.5, categoria: 'Alimentação' }, 'Todas')       → true
function passaNoFiltro(gasto, categoria) {
    return categoria === 'Todas' || gasto.categoria === categoria;
}

// Passo 3 — uma lista NOVA, só com os gastos que passam no
// filtro. A lista gastos não muda.
function filtrarGastos(gastos, categoria) {
    const filtrados = [];
    for (let i = 0; i < gastos.length; i++) {
        if (passaNoFiltro(gastos[i], categoria)) {
            filtrados.push(gastos[i]);
        }
    }
    return filtrados;
}

// montarTextoDoFiltro(0, 0) → 'Nenhum gasto ainda'
// montarTextoDoFiltro(1, 1) → '1 gasto'
// montarTextoDoFiltro(4, 4) → 'Todos os 4 gastos'
// montarTextoDoFiltro(2, 4) → 'Mostrando 2 de 4 gastos'
function montarTextoDoFiltro(mostrados, total) {
    if (total === 0) {
        return 'Nenhum gasto ainda';
    }
    if (total === 1 && mostrados === 1) {
        return '1 gasto';
    }
    if (mostrados === total) {
        return 'Todos os ' + total + ' gastos';
    }
    return 'Mostrando ' + mostrados + ' de ' + total + ' gastos';
}

// Passo 4 — o required e o min já barram o campo vazio e o
// valor zero ou negativo. Sobrou só o que o HTML não pega:
// uma descrição feita só de espaços.
function montarErroDoGasto(gasto) {
    if (gasto.descricao === '') {
        return 'Só espaços não vale.';
    }
    return '';
}


/* -----------------------------------------------------------
   Selecionar
   ----------------------------------------------------------- */

const formulario = document.querySelector('.formulario');
const campoDescricao = document.querySelector('.campo-descricao');
const campoValor = document.querySelector('.campo-valor');
const campoCategoria = document.querySelector('.campo-categoria');
const campoFiltro = document.querySelector('.campo-filtro');
const botaoDesfazer = document.querySelector('.botao-desfazer');
const erro = document.querySelector('.erro');

const telaTotal = document.querySelector('.total');
const telaQuantidade = document.querySelector('.quantidade');
const telaMedia = document.querySelector('.media');
const telaMaior = document.querySelector('.maior');
const telaMenor = document.querySelector('.menor');
const telaRestante = document.querySelector('.restante');
const telaHistorico = document.querySelector('.historico');
const telaTotalRodape = document.querySelector('.total-rodape');
const telaLegendaHistorico = document.querySelector('.legenda-historico');
const telaCategorias = document.querySelector('.categorias');
const telaOrdemHistorico = document.querySelector('.campo-ordem');
let ordemHistorico = 'chegada';

/* -----------------------------------------------------------
   Valores fixos e o que precisa ser lembrado
   ----------------------------------------------------------- */

const ORCAMENTO = 50;

const CATEGORIAS = [
    { nome: 'Alimentação' },
    { nome: 'Transporte' },
    { nome: 'Lazer' }
];

const iconeApagar = `
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M6 6 L18 18 M18 6 L6 18"
              stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>`;

// A única coisa que o programa lembra.
const gastos = [];

// Passo 2 — a categoria escolhida no filtro. let, porque muda.
let categoriaEscolhida = 'Todas';


/* -----------------------------------------------------------
   Funções que criam elementos
   ----------------------------------------------------------- */

function criarCelula(texto) {
    const celula = document.createElement('td');
    celula.textContent = texto;
    return celula;
}

// A linha <tr> de um gasto, com o botão de apagar.
function criarLinhaDoHistorico(gasto, posicao) {
    /*
    <tr data-categoria="alimentacao">
        <td>1</td>
        <td>Almoço</td>
        <td>
            <span class="etiqueta">
                alimentacao
            </span>
        </td>
    <tr/>
    

    */
    const linha = document.createElement('tr');

    // Passo 1 — o atributo que o CSS usa para escolher a cor.
    linha.setAttribute('data-categoria', gasto.categoria);

    linha.appendChild(criarCelula(posicao + 1));
    linha.appendChild(criarCelula(gasto.descricao));

    // A categoria escrita, numa etiqueta: a cor sozinha não
    // diz nada para quem não enxerga cores.
    const etiqueta = document.createElement('span');
    etiqueta.classList.add('etiqueta');
    etiqueta.textContent = gasto.categoria;
    const celulaDaCategoria = document.createElement('td');
    celulaDaCategoria.appendChild(etiqueta);
    linha.appendChild(celulaDaCategoria);

    linha.appendChild(criarCelula(formatarReais(gasto.valor)));

    const botaoApagar = document.createElement('button');
    botaoApagar.type = 'button';
    botaoApagar.classList.add('botao-apagar');
    botaoApagar.innerHTML = iconeApagar;
    botaoApagar.setAttribute('aria-label', 'Apagar ' + gasto.descricao);

    botaoApagar.addEventListener('click', function () {
        gastos.splice(posicao, 1);
        renderizar();
    });

    const celulaDoBotao = document.createElement('td');
    celulaDoBotao.appendChild(botaoApagar);
    linha.appendChild(celulaDoBotao);

    return linha;
}


// Passo 5 — uma categoria do gráfico:
// <li data-categoria="Lazer">
//     <div class="legenda-da-barra"><span>Lazer</span><strong>R$ 30,00 (51%)</strong></div>
//     <div class="trilho"><div class="barra" style="width: 50.5%"></div></div>
// </li>
function criarBarraDaCategoria(nomeDaCategoria, totalDaCategoria) {
    const porcentagem = calcularPorcentagem(totalDaCategoria, calcularTotal(gastos));

    const item = document.createElement('li');
    item.setAttribute('data-categoria', nomeDaCategoria);

    const legenda = document.createElement('div');
    legenda.classList.add('legenda-da-barra');

    const nome = document.createElement('span');
    nome.textContent = nomeDaCategoria;

    const valor = document.createElement('strong');
    valor.textContent = formatarReais(totalDaCategoria) + ' (' + Math.round(porcentagem) + '%)';

    legenda.appendChild(nome);
    legenda.appendChild(valor);

    // O trilho é só desenho: o número já está na legenda.
    const trilho = document.createElement('div');
    trilho.classList.add('trilho');
    trilho.setAttribute('aria-hidden', 'true');

    const barra = document.createElement('div');
    barra.classList.add('barra');
    barra.style.width = porcentagem + '%';

    trilho.appendChild(barra);
    item.appendChild(legenda);
    item.appendChild(trilho);
    return item;
}


/* -----------------------------------------------------------
   Desenhar a tela a partir dos dados
   ----------------------------------------------------------- */

function lerCategoriaEscolhida() {
    return CATEGORIAS[Number(campoCategoria.value)];
}

function renderizarResumo() {
    const total = calcularTotal(gastos);

    telaTotal.textContent = formatarReais(total);
    telaQuantidade.textContent = gastos.length;
    telaMedia.textContent = formatarReais(calcularMedia(total, gastos.length));

    if (gastos.length === 0) {
        telaMaior.textContent = '—';
        telaMenor.textContent = '—';
    } else {
        telaMaior.textContent = montarTextoDoGasto(calcularMaiorGasto(gastos));
        telaMenor.textContent = montarTextoDoGasto(calcularMenorGasto(gastos));
    }
}

function ordenarGastos(gastos, ordem) {
    if (ordem === 'descricao-az') {
        return gastos.toSorted((a, b) => {
            const resultadoComparacao = a.descricao.localeCompare(b.descricao);
            console.log(`a = ${a.descricao}, b = ${b.descricao} ---- resultado: ${resultadoComparacao}`);
            return resultadoComparacao;
        });
    }
    if (ordem === 'descricao-za') {
        return gastos.toSorted((a, b) => b.descricao.localeCompare(a.descricao));
    }
    if (ordem === 'menor-para-maior') {
        return gastos.toSorted((a, b) => a.valor - b.valor);
    }
    if (ordem === 'maior-para-menor') {
        return gastos.toSorted((a, b) => b.valor - a.valor);
    }
    // 'chegada': a ordem do próprio array
    return gastos;
}

function renderizarHistorico() {
    telaHistorico.innerHTML = '';

    const gastosFiltrados = [];
    for (let i = 0; i < gastos.length; i++) {
        if (passaNoFiltro(gastos[i], categoriaEscolhida)) {
            gastosFiltrados.push(gastos[i]);
        }
    }
    
    const gastosOrdenados = ordenarGastos(gastosFiltrados, ordemHistorico);

    for (let i = 0; i < gastosOrdenados.length; i++) {
        telaHistorico.appendChild(criarLinhaDoHistorico(gastosOrdenados[i]));
    }

    const mostrados = filtrarGastos(gastos, categoriaEscolhida);
    telaTotalRodape.textContent = formatarReais(calcularTotal(mostrados));
    telaLegendaHistorico.textContent = montarTextoDoFiltro(mostrados.length, gastos.length);
}

function renderizarOrcamento() {
    const total = calcularTotal(gastos);
    telaRestante.textContent = montarMensagemDoOrcamento(ORCAMENTO - total);

    if (passouDoOrcamento(total, ORCAMENTO)) {
        telaTotal.classList.add('estourado');
        telaRestante.classList.add('estourado');
    } else {
        telaTotal.classList.remove('estourado');
        telaRestante.classList.remove('estourado');
    }
}

// Passo 5 — o cartão "Por categoria" vira um gráfico.
// Ele conta TODOS os gastos, com qualquer filtro.
function renderizarCategorias() {
    telaCategorias.innerHTML = '';
    for (let i = 0; i < CATEGORIAS.length; i++) {
        const nome = CATEGORIAS[i].nome;
        const totalDaCategoria = calcularTotalDaCategoria(gastos, nome);
        telaCategorias.appendChild(criarBarraDaCategoria(nome, totalDaCategoria));
    }
}

// A tela inteira. Todo ouvinte termina chamando esta função.
function renderizar() {
    renderizarResumo();
    renderizarHistorico();
    renderizarOrcamento();
    renderizarCategorias();
    botaoDesfazer.disabled = gastos.length === 0;
}

// reset() volta o formulário inteiro ao começo, e o
// :user-invalid não fica vermelho nos campos vazios.
function limparFormulario() {
    formulario.reset();
}

campoCategoria.innerHTML = montarOpcoesDeCategorias(CATEGORIAS);
renderizar();


/* -----------------------------------------------------------
   Escutar
   ----------------------------------------------------------- */

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const gasto = {
        descricao: campoDescricao.value.trim(),
        valor: Number(campoValor.value),
        categoria: lerCategoriaEscolhida().nome
    };

    erro.textContent = montarErroDoGasto(gasto);

    if (erro.textContent === '') {
        gastos.push(gasto);
        limparFormulario();
        renderizar();
    }
});

botaoDesfazer.addEventListener('click', function () {
    gastos.pop();
    renderizar();
});

// Passo 2 — trocou o filtro: muda a variável e desenha de novo.
campoFiltro.addEventListener('change', function () {
    categoriaEscolhida = campoFiltro.value;
    renderizar();
});

telaOrdemHistorico.addEventListener('change', function(){
    ordemHistorico = telaOrdemHistorico.value;
    console.log(`ordemHistórico: ${ordemHistorico}`);
    renderizar();
});
