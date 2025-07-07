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
import TransactionDetailsModal from './components/TransactionDetailsModal.vue';

// Importa função para garantir que a DOM seja atualizada antes de rolar a página.
import { nextTick } from 'vue';

// ============================================================================
// LÓGICA DA APLICAÇÃO (USO DO COMPOSABLE)
// ============================================================================

// Acessa todas as variáveis reativas e funções do composable `useTransactions`.
const {
  description,
  amount,
  type,
  category,
  date,
  itemDescription,
  isEditing,
  expenseCategories,
  incomeCategories,
  transactions,
  filteredTransactions,
  totalBalance,
  totalIncome,
  totalExpenses,
  expenseChartData,
  barChartData,
  filterType,
  filterValue,
  addOrUpdateTransaction,
  deleteTransaction,
  startEditTransaction,
  updateFilter,
  exportData,
  importData,
  chartRenderKey,
  selectedTransactionDetails,
  showDetailsModal,
  openDetailsModal,
  closeDetailsModal
} = useTransactions();

// ============================================================================
// FUNÇÕES DE MANUSEIO DE EVENTOS (PONTES ENTRE UI E LÓGICA)
// ============================================================================

// Lida com a submissão do formulário (adição ou atualização de transação).
const handleSubmitTransaction = async (payload) => {
  addOrUpdateTransaction(payload);
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Lida com a exclusão de uma transação.
const handleDeleteTransaction = (id) => {
  deleteTransaction(id);
};

// Lida com o início do processo de edição de uma transação.
const handleEditTransaction = async (transaction) => {
  startEditTransaction(transaction);
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Lida com a seleção de arquivo para importação de dados.
const handleImportFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    importData(file);
    event.target.value = '';
  }
};

// Lida com a solicitação para exibir detalhes de uma transação.
const handleShowDetails = (transaction) => {
  openDetailsModal(transaction); // Chama a função do composable para abrir o modal.
};

</script>

<template>
  <div id="app">
    <h1>Sistema Financeiro</h1>

    <BalanceDisplay
      :balance="totalBalance"
      :total-income="totalIncome"
      :total-expenses="totalExpenses"
      class="card"
    />

    <div class="main-content">
      <div class="left-column">
        <TransactionForm
          :is-editing="isEditing"
          :initial-description="description"
          :initial-amount="amount"
          :initial-type="type"
          :initial-category="category"
          :initial-date="date"
          :initial-item-description="itemDescription"
          :expense-categories="expenseCategories"
          :income-categories="incomeCategories"
          @submit-transaction="handleSubmitTransaction"
          class="card"
        />
      </div>

      <div class="right-column">
        <TransactionList
          :transactions="transactions"
          :filtered-transactions="filteredTransactions"
          :filter-type="filterType"
          :filter-value="filterValue"
          :update-filter="updateFilter"
          @edit-transaction="handleEditTransaction"
          @delete-transaction="handleDeleteTransaction"
          @show-details="handleShowDetails"
          class="card"
        />

        <ChartsDisplay
          :key="chartRenderKey"
          :expense-data="expenseChartData"
          :bar-data="barChartData"
          :has-expenses="filteredTransactions.some(t => t.type === 'expense')"
          :has-transactions="filteredTransactions.length > 0"
          class="card"
        />
      </div>
    </div>

    <div class="data-management card">
      <h2>Gerenciamento de Dados</h2>
      <div class="button-group">
        <button @click="exportData" class="export-btn">Exportar Dados</button>
        <label for="importFile" class="import-label">Importar Dados</label>
        <input type="file" id="importFile" accept=".json" @change="handleImportFile" style="display: none;" />
      </div>
    </div>

    <TransactionDetailsModal
      v-if="showDetailsModal && selectedTransactionDetails"
      :transaction="selectedTransactionDetails"
      @close="closeDetailsModal"
    />
  </div>
</template>

<style>
/* Estilos GLOBAIS - Mantenha aqui ou em um arquivo CSS separado globalmente */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: #f4f7f6;
  scroll-behavior: smooth;
}

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

h1 {
  color: #34495e;
  margin-bottom: 20px;
  font-size: 2.5em;
}

.card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 25px;
  align-items: start;
  flex-grow: 1;
}

.left-column {
  display: flex;
  flex-direction: column;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* NOVO: Estilos para a seção de gerenciamento de dados */
.data-management {
  text-align: center;
}

.data-management h2 {
  color: #34495e;
  margin-bottom: 20px;
  font-size: 1.8em;
}

.data-management .button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.data-management button, .data-management .import-label {
  background-color: #3498db;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.data-management button:hover, .data-management .import-label:hover {
  background-color: #2980b9;
}

/* Media Queries para responsividade geral */
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
  .data-management h2 {
    font-size: 1.5em;
  }
  .data-management button, .data-management .import-label {
    padding: 10px 20px;
    font-size: 1em;
  }
}

@media (max-width: 400px) {
  .data-management .button-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>