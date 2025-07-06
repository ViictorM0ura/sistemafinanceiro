<script setup>
// FINALIDADE: Componente raiz que orquestra o layout geral e a interação entre a lógica de dados (composable)
// e os componentes visuais da aplicação.

// ============================================================================
// IMPORTAÇÕES
// ============================================================================

// Importa a lógica central de transações e cálculos.
import { useTransactions } from './composables/useTransactions';

// Importa os componentes de interface do usuário.
import BalanceDisplay from './components/BalanceDisplay.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionList from './components/TransactionList.vue';
import ChartsDisplay from './components/ChartsDisplay.vue';

// Importa função para garantir que a DOM seja atualizada antes de rolar a página.
import { nextTick } from 'vue';

// ============================================================================
// LÓGICA DA APLICAÇÃO (USO DO COMPOSABLE)
// ============================================================================

// Acessa todas as variáveis reativas e funções do composable `useTransactions`.
const {
  description,    // Usado para preencher o formulário na edição
  amount,
  type,
  category,
  isEditing,      // Estado atual de edição
  transactions,   // Lista de todas as transações
  totalBalance,   // Saldo total calculado
  expenseChartData, // Dados para o gráfico de despesas
  barChartData,   // Dados para o gráfico de receitas vs. despesas
  addOrUpdateTransaction, // Adiciona ou atualiza uma transação
  deleteTransaction,    // Exclui uma transação
  startEditTransaction  // Prepara o formulário para edição
} = useTransactions();

// ============================================================================
// FUNÇÕES DE MANUSEIO DE EVENTOS (PONTES ENTRE UI E LÓGICA)
// ============================================================================

// Lida com a submissão do formulário (adição ou atualização de transação).
// Inclui rolagem suave para o topo após a operação.
const handleSubmitTransaction = async (payload) => {
  addOrUpdateTransaction(payload);
  await nextTick(); // Espera a DOM ser atualizada
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo
};

// Lida com a exclusão de uma transação.
const handleDeleteTransaction = (id) => {
  deleteTransaction(id);
};

// Lida com o início do processo de edição de uma transação.
// Inclui rolagem suave para o topo para exibir o formulário preenchido.
const handleEditTransaction = async (transaction) => {
  startEditTransaction(transaction);
  await nextTick(); // Espera a DOM ser atualizada
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo
};

</script>

<template>
  <div id="app">
    <h1>Sistema Financeiro</h1>

    <BalanceDisplay :balance="totalBalance" class="card" />

    <div class="main-content">
      <div class="left-column">
        <TransactionForm
          :is-editing="isEditing"
          :initial-description="description"
          :initial-amount="amount"
          :initial-type="type"
          :initial-category="category"
          @submit-transaction="handleSubmitTransaction"
          class="card"
        />
      </div>

      <div class="right-column">
        <TransactionList
          :transactions="transactions"
          @edit-transaction="handleEditTransaction"
          @delete-transaction="handleDeleteTransaction"
          class="card"
        />

        <ChartsDisplay
          :expense-data="expenseChartData"
          :bar-data="barChartData"
          :has-expenses="transactions.filter(t => t.type === 'expense').length > 0"
          :has-transactions="transactions.length > 0"
        />
      </div>
    </div>
  </div>
</template>

<style>
/* ============================================================================
   ESTILOS GLOBAIS E DE LAYOUT PRINCIPAL
   Define a estrutura geral da aplicação.
   ============================================================================ */

/* Estilos para o corpo da página e HTML: Reseta margens, padding, define altura total
   e impede rolagem horizontal. Adiciona rolagem suave. */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: #f4f7f6;
  scroll-behavior: smooth;
}

/* Estilos para o container principal da aplicação.
   Define fonte, cores, padding e layout flexbox vertical. */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 25px;
  text-align: center;
}

/* Estilos para o título principal da aplicação. */
h1 {
  color: #34495e;
  margin-bottom: 20px;
  font-size: 2.5em;
}

/* Estilo para os blocos de conteúdo visual (cards). */
.card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  text-align: left;
}

/* Estilos para o container principal do layout (grid de colunas). */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr; /* Duas colunas: 1/3 para esq., 2/3 para dir. */
  gap: 25px;
  align-items: start;
  flex-grow: 1;
}

/* Estilos para a coluna da esquerda (formulário). */
.left-column {
  display: flex;
  flex-direction: column;
}

/* Estilos para a coluna da direita (histórico e gráficos). */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* ============================================================================
   MEDIA QUERIES (RESPONSIVIDADE GERAL)
   Adapta o layout a diferentes tamanhos de tela.
   ============================================================================ */

/* Para tablets e notebooks menores (até 900px): muda para layout de uma coluna. */
@media (max-width: 900px) {
  #app {
    padding: 15px;
    gap: 20px;
  }
  .main-content {
    grid-template-columns: 1fr;
  }
  .left-column, .right-column {
    width: 100%;
  }
  h1 {
    font-size: 2.2em;
  }
  .card {
    padding: 18px;
  }
}

/* Para celulares (até 600px): ajustes finos de espaçamento e fonte. */
@media (max-width: 600px) {
  #app {
    padding: 10px;
    gap: 15px;
  }
  h1 {
    font-size: 1.6em;
    margin-bottom: 5px;
  }
  .card {
    padding: 15px;
  }
}

/* Para celulares muito pequenos (até 400px): handled pelos componentes filhos. */
@media (max-width: 400px) {
  /* Estilos específicos de responsividade para esta largura são gerenciados pelos componentes individuais. */
}
</style>