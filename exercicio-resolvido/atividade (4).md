# Pra onde foi meu dinheiro? — ordenar, salvar e datar

Hoje, o controle de gastos vai ganhar:

- um campo para **ordenar** o histórico: por valor, por descrição ou na ordem
  em que os gastos entraram;
- a lista de gastos **salva no navegador**: recarregou a página, os gastos
  continuam lá;
- o filtro e a ordem **lembrados** também;
- uma **data** em cada gasto, para ordenar também pelos mais recentes.

## Antes de começar: o ponto de partida

Copie a pasta `controle-de-gastos-ponto-de-partida`. Ela tem tudo o que fizemos
até segunda: as cores, o filtro, o resumo do filtro, a validação e o gráfico.

Adicione a sequência de teste de sempre:

| descrição | valor | categoria |
|---|---|---|
| lanche | 12.50 | Alimentação |
| ônibus | 4.35 | Transporte |
| cinema | 30 | Lazer |
| pipoca | 12.50 | Alimentação |

O total deve dar **R$ 59,35**. (É a última vez que você vai precisar digitar
essa sequência depois de recarregar a página.)

---

## Passo 1 — ordenar o histórico

Ao lado do filtro, um campo **Ordenar**, com as opções:

| opção | `value` |
|---|---|
| Ordem em que entraram | `chegada` |
| Maior valor primeiro | `maior` |
| Menor valor primeiro | `menor` |
| Descrição (A–Z) | `descricao` |

**No HTML e no CSS:** coloque o filtro e a ordem lado a lado, dentro de uma
`<div class="controles">`, com `display: grid` e duas colunas.

**A ordem escolhida fica numa variável**, `ordemEscolhida`, que começa em
`'chegada'`. Quando o campo muda, a variável muda e a tela é desenhada de novo,
como o filtro.

**Crie a `ordenarGastos(gastos, ordem)`.** Ela devolve uma lista **nova**,
ordenada, com o `toSorted()`. A lista `gastos` não muda.

- Para os valores, a comparação é uma conta: `(a, b) => b.valor - a.valor`
  coloca o maior primeiro.
- Para a descrição, use o `localeCompare`:
  `(a, b) => a.descricao.localeCompare(b.descricao)`.
- Para `'chegada'`, ela devolve a própria lista, sem ordenar.

| no console | a ordem das descrições |
|---|---|
| `ordenarGastos(gastos, 'maior')` | cinema, lanche, pipoca, ônibus |
| `ordenarGastos(gastos, 'menor')` | ônibus, lanche, pipoca, cinema |
| `ordenarGastos(gastos, 'descricao')` | cinema, lanche, ônibus, pipoca |
| `gastos` | lanche, ônibus, cinema, pipoca (não mudou) |

**Na `renderizarHistorico()`:** a tabela passa a mostrar uma lista nova,
filtrada e depois ordenada:

```js
const mostrados = ordenarGastos(filtrarGastos(gastos, categoriaEscolhida), ordemEscolhida);
```

O `for` passa por essa lista, e não mais pela `gastos`.

**E o botão de apagar?** Com a tabela ordenada, a posição na tela não é mais a
posição na lista `gastos`. A `criarLinhaDoHistorico()` passa a receber só o
gasto, e o botão procura onde ele está **na hora do clique**:

```js
gastos.splice(gastos.indexOf(gasto), 1);
```

O número da coluna `#` também vem do `indexOf`: `gastos.indexOf(gasto) + 1`.
Assim, cada gasto continua com o seu número, em qualquer ordem.

**Funcionou se:**

- cada opção do campo deixa a tabela na ordem da tabela acima;
- com "Só Alimentação" e "Maior valor primeiro", aparecem lanche e pipoca, com
  os números 1 e 4, e o rodapé dá R$ 25,00;
- com a tabela ordenada, apagando a pipoca, sai a pipoca, e não outro gasto;
- no console, `gastos` continua na ordem em que os gastos entraram.

---

## Passo 2 — salvar no navegador

O `localStorage` guarda textos no navegador, e eles continuam lá depois de
recarregar a página. Mas ele só guarda **texto**: a lista de gastos precisa
virar texto para ser salva, com o `JSON.stringify`, e voltar a ser lista ao ser
lida, com o `JSON.parse`.

**Crie uma constante com a chave**, o nome com que os gastos ficam guardados:

```js
const CHAVE_GASTOS = 'controle-de-gastos';
```

Use a constante nos dois lugares, para não escrever o nome errado em um deles.

**Crie a `salvarGastos(gastos)`**, que guarda a lista com
`localStorage.setItem`, e a `carregarGastos()`, que lê com
`localStorage.getItem` e devolve a lista. Na primeira vez, não há nada salvo, e
o `getItem` devolve `null`: nesse caso, a `carregarGastos()` devolve uma lista
vazia.

**A lista começa com o que estava salvo:**

```js
const gastos = carregarGastos();
```

**E quando salvar?** Toda vez que a lista muda. Toda mudança termina chamando a
`renderizar()`: é só chamar a `salvarGastos(gastos)` no começo dela.

**Funcionou se:**

- você adiciona a sequência de teste, recarrega a página, e os quatro gastos
  continuam lá, com o total de R$ 59,35;
- você apaga um gasto, recarrega, e ele continua apagado;
- no DevTools, na aba **Application**, em **Local Storage**, aparece a chave
  `controle-de-gastos`, com a lista escrita como texto;
- numa janela anônima, a lista começa vazia: o que fica salvo é de cada
  navegador.

**Para começar do zero:** na aba Application, clique com o botão direito na
chave e apague, ou use o botão de limpar.

---

## Passo 3 — lembrar o filtro e a ordem

Recarregando a página, o filtro e a ordem voltam para "Todas" e "Ordem em que
entraram". Agora eles também ficam guardados.

- Cada um tem a sua chave: `'controle-de-gastos-filtro'` e
  `'controle-de-gastos-ordem'`.
- Eles já são texto, então **não** precisam de JSON.
- Salve no ouvinte do `change` de cada campo.
- Ao abrir a página, as variáveis começam com o que estava salvo. Se não houver
  nada salvo, começam com `'Todas'` e `'chegada'`.
- Os campos da tela precisam mostrar a escolha salva:
  `campoFiltro.value = categoriaEscolhida;`.

**Funcionou se:** você escolhe "Só Alimentação" e "Maior valor primeiro",
recarrega, e a página abre com os dois já escolhidos e a tabela de acordo.

---

## Passo 4 — a data de cada gasto

Cada gasto passa a ter uma data.

**Antes de começar:** os gastos que já estão salvos não têm data. Apague a
chave `controle-de-gastos` na aba Application, para começar do zero.

**No formulário:** um campo de data, entre o valor e a categoria, com
`required`:

```html
<input type="date" id="data" class="campo-data" required>
```

**No objeto do gasto:** uma propriedade `data`, com o valor do campo. Teste no
console: o valor de um campo de data é sempre um texto no formato
**ano-mês-dia**, como `'2026-10-19'`, não importa como o navegador mostra na
tela.

**Na tabela:** uma coluna **Data**, entre o `#` e a Descrição. A tabela ganhou
uma coluna: o `colspan` do rodapé precisa acompanhar.

**Crie a `formatarData(data)`**, que transforma o texto do campo no formato que
usamos no Brasil. O `split('-')` corta o texto em cada traço e devolve as
partes num array:

| no console | deve devolver |
|---|---|
| `'2026-10-19'.split('-')` | `['2026', '10', '19']` |
| `formatarData('2026-10-19')` | `'19/10/2026'` |

**No campo Ordenar:** duas opções novas, "Mais recentes primeiro" (`recentes`)
e "Mais antigos primeiro" (`antigos`). Para comparar as datas, use o mesmo
`localeCompare` da descrição: no formato ano-mês-dia, a ordem alfabética é a
ordem das datas.

Use estas datas na sequência de teste:

| descrição | valor | data | categoria |
|---|---|---|---|
| lanche | 12.50 | 19/10/2026 | Alimentação |
| ônibus | 4.35 | 20/10/2026 | Transporte |
| cinema | 30 | 18/10/2026 | Lazer |
| pipoca | 12.50 | 21/10/2026 | Alimentação |

**Funcionou se:**

- sem data, o gasto não entra;
- a tabela mostra as datas como 19/10/2026;
- "Mais recentes primeiro" dá pipoca, ônibus, lanche, cinema;
- "Mais antigos primeiro" dá cinema, lanche, ônibus, pipoca;
- recarregando a página, as datas continuam lá.

---

## Se sobrar tempo

- **Apagar tudo.** Um botão que apaga todos os gastos de uma vez. Dica: o
  `splice` sabe tirar vários itens de uma vez, a partir da posição 0.
- **Só datas até hoje.** O campo de data aceita o atributo `max`. Faça o
  JavaScript preencher o `max` com a data de hoje, no formato ano-mês-dia,
  para ninguém registrar um gasto no futuro.
- **O desempate.** Com "Maior valor primeiro", o lanche e a pipoca empatam em
  R$ 12,50. Faça o empate ser desfeito pela descrição.
- **Com os métodos de segunda.** Reescreva a `filtrarGastos()` com o `filter`,
  e a `calcularTotal()` com o `reduce`. Os testes do console precisam continuar
  dando os mesmos resultados.

---

## Para entregar

Faça o commit e envie para o GitHub, mesmo que incompleto.
