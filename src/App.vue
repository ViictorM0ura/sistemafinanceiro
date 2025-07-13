<script setup>
// Componente raiz: orquestra o layout e a interação com o composable e os componentes de UI.

import { ref, nextTick } from 'vue';
import { useTransactions } from './composables/useTransactions';
import BalanceDisplay from './components/BalanceDisplay.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionList from './components/TransactionList.vue';
import ChartsDisplay from './components/ChartsDisplay.vue';
import TransactionDetailsModal from './components/TransactionDetailsModal.vue';

const {
  description,
  amount,
  type,
  category,
  date,
  itemDescription,
  expenseType,
  paymentMethod,
  isEditing,
  expenseCategories,
  incomeCategories,
  paymentMethods,
  transactions,
  filteredTransactions,
  totalBalance,
  totalIncome,
  totalExpenses,
  currentMonthTotalExpenses,
  monthlyBudget,
  setMonthlyBudget,
  expenseChartData,
  barChartData,
  expenseTypeDistributionChartData,
  paymentMethodDistributionChartData,
  categoryDistributionChartData,
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

const currentView = ref('overview');

const budgetInput = ref(0);
const showBudgetConfig = ref(false);

const changeView = (view) => {
  currentView.value = view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showMobileMenu.value = false; // Fecha o menu hambúrguer ao selecionar uma opção
};

const handleSubmitTransaction = async (payload) => {
  addOrUpdateTransaction(payload);
  await nextTick();
  changeView('transactions');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDeleteTransaction = (id) => {
  deleteTransaction(id);
};

const handleEditTransaction = async (transaction) => {
  startEditTransaction(transaction);
  await nextTick();
  changeView('add-transaction');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleImportFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    importData(file);
    event.target.value = ''; // Limpar o input de arquivo
  }
};

const handleShowDetails = (transaction) => {
  openDetailsModal(transaction);
};

const openBudgetConfig = () => {
    budgetInput.value = monthlyBudget.value;
    showBudgetConfig.value = true;
};

const handleSetBudget = () => {
    setMonthlyBudget(parseFloat(budgetInput.value));
    showBudgetConfig.value = false; // Fecha a área de configuração após definir.
};

// Estado para controlar a visibilidade do menu móvel (hambúrguer)
const showMobileMenu = ref(false);
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

</script>

<template>
  <div id="app">
    <h1>Sistema Financeiro</h1>

    <button class="hamburger-menu-icon" @click="toggleMobileMenu">
      ☰
    </button>

    <div class="mobile-menu-overlay" :class="{ 'is-open': showMobileMenu }" @click="toggleMobileMenu"></div>

    <nav class="main-nav" :class="{ 'is-open': showMobileMenu }">
      <button :class="{ active: currentView === 'overview' }" @click="changeView('overview')">Visão Geral</button>
      <button :class="{ active: currentView === 'add-transaction' }" @click="changeView('add-transaction')">Adicionar Transação</button>
      <button :class="{ active: currentView === 'transactions' }" @click="changeView('transactions')">Minhas Transações</button>
      <button :class="{ active: currentView === 'charts' }" @click="changeView('charts')">Gráficos</button>
      <button :class="{ active: currentView === 'data-management' }" @click="changeView('data-management')">Gerenciar Dados</button>
    </nav>

    <div class="content-display">
      <div v-if="currentView === 'overview'" class="overview-content card">
        <BalanceDisplay
          :balance="totalBalance"
          :total-income="totalIncome"
          :total-expenses="totalExpenses"
          class="card"
        />

        <div class="monthly-budget-section">
          <h2>Orçamento do Mês</h2>
          <br>
          <button @click="openBudgetConfig" class="config-budget-btn">
            Configurar Gasto do Mês
          </button>

          <div v-if="showBudgetConfig" class="budget-config-area input-group">
            <label for="budgetAmount">Definir Orçamento:</label>
            <input type="number" id="budgetAmount" v-model.number="budgetInput" min="0" step="0.01" />
            <button @click="handleSetBudget" class="set-budget-btn">Definir Orçamento</button>
          </div>

          <div v-if="monthlyBudget > 0" class="spending-bar-container">
            <h3>Gasto do Mês Atual: R$ {{ currentMonthTotalExpenses.toFixed(2) }} / R$ {{ monthlyBudget.toFixed(2) }}</h3>
            <div class="spending-progress-bar">
              <div class="progress-fill" :style="{ width: (currentMonthTotalExpenses / monthlyBudget * 100) + '%' }"
                   :class="{
                     'green': (currentMonthTotalExpenses / monthlyBudget) <= 0.5,
                     'yellow': (currentMonthTotalExpenses / monthlyBudget) > 0.5 && (currentMonthTotalExpenses / monthlyBudget) <= 0.8,
                     'orange': (currentMonthTotalExpenses / monthlyBudget) > 0.8 && (currentMonthTotalExpenses / monthlyBudget) < 1,
                     'red': (currentMonthTotalExpenses / monthlyBudget) >= 1
                   }">
                {{ ((currentMonthTotalExpenses / monthlyBudget) * 100).toFixed(0) }}% 
              </div>
            </div>
            <p class="budget-message"
               :class="{
                 'text-green': (currentMonthTotalExpenses / monthlyBudget) <= 0.5,
                 'text-yellow': (currentMonthTotalExpenses / monthlyBudget) > 0.5 && (currentMonthTotalExpenses / monthlyBudget) <= 0.8,
                 'text-orange': (currentMonthTotalExpenses / monthlyBudget) > 0.8 && (currentMonthTotalExpenses / monthlyBudget) < 1,
                 'text-red': (currentMonthTotalExpenses / monthlyBudget) >= 1
               }">
              <span v-if="(currentMonthTotalExpenses / monthlyBudget) <= 0.5">Ainda pode gastar bastante este mês! 🎉</span>
              <span v-else-if="(currentMonthTotalExpenses / monthlyBudget) > 0.5 && (currentMonthTotalExpenses / monthlyBudget) <= 0.8">Já gastou mais da metade. Atenção! ⚠️</span>
              <span v-else-if="(currentMonthTotalExpenses / monthlyBudget) > 0.8 && (currentMonthTotalExpenses / monthlyBudget) < 1">Perto do limite! Fique de olho. 👀</span>
              <span v-else>Ops! Você atingiu ou ultrapassou o limite do mês. 🛑</span>
            </p>
          </div>
          <p v-else class="no-budget-message">Defina um orçamento mensal para acompanhar seus gastos em tempo real!</p>
        </div>
      </div>

      <TransactionForm
        v-if="currentView === 'add-transaction'"
        :is-editing="isEditing"
        :initial-description="description"
        :initial-amount="amount"
        :initial-type="type"
        :initial-category="category"
        :initial-date="date"
        :initial-item-description="itemDescription"
        :initial-expense-type="expenseType"
        :initial-payment-method="paymentMethod"
        :expense-categories="expenseCategories"
        :income-categories="incomeCategories"
        @submit-transaction="handleSubmitTransaction"
        class="card"
      />

      <TransactionList
        v-if="currentView === 'transactions'"
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
        v-if="currentView === 'charts'"
        :key="chartRenderKey"
        :expense-data="expenseChartData"
        :bar-data="barChartData"
        :expense-type-distribution-data="expenseTypeDistributionChartData"
        :payment-method-distribution-data="paymentMethodDistributionChartData"
        :category-distribution-data="categoryDistributionChartData"
        :has-expenses="filteredTransactions.some(t => t.type === 'expense')"
        :has-transactions="filteredTransactions.length > 0"
        class="card"
      />

      <div v-if="currentView === 'data-management'" class="data-management card">
        <h2>Gerenciamento de Dados</h2>
        <div class="button-group">
          <button @click="exportData" class="export-btn">Exportar Dados</button>
          <label for="importFile" class="import-label">Importar Dados</label>
          <input type="file" id="importFile" accept=".json" @change="handleImportFile" style="display: none;" />
        </div>
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
/* Estilos Globais - Mantenha aqui ou em um arquivo CSS separado globalmente */
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

/* Estilos para a navegação principal */
.main-nav {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.main-nav button {
  background-color: #3498db;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease, transform 0.2s ease;
  flex-grow: 1;
  max-width: 200px;
  text-align: center;
}

.main-nav button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.main-nav button.active {
  background-color: #2ecc71;
  box-shadow: 0 3px 8px rgba(46, 204, 113, 0.4);
  transform: translateY(-1px);
}

/* Ícone Hambúrguer (Desktop: escondido) */
.hamburger-menu-icon {
  display: none;
  background: none;
  border: none;
  font-size: 2em;
  color: #34495e;
  cursor: pointer;
  padding: 10px;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}

/* Overlay do Menu Móvel (Desktop: escondido) */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.mobile-menu-overlay.is-open {
  opacity: 1;
}

/* Estilos para o conteúdo exibido condicionalmente */
.content-display {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 20px;
}

.content-display .card {
  width: 100%;
  max-width: 1200px;
}

/* Estilos para a seção de Orçamento Mensal */
.monthly-budget-section {
  text-align: center;
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 25px;
}

.monthly-budget-section h2 {
  color: #34495e;
  margin-bottom: 20px;
  font-size: 1.8em;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;
  display: inline-block;
  width: auto;
}

.config-budget-btn {
  background-color: #f39c12;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  margin-bottom: 15px;
}

.config-budget-btn:hover {
  background-color: #e67e22;
}

.budget-config-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.budget-config-area label {
  font-weight: bold;
  color: #555;
}

.budget-config-area input[type="number"] {
  width: 100%;
  max-width: 200px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-size: 1.1em;
}

.set-budget-btn {
  background-color: #2ecc71;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.set-budget-btn:hover {
  background-color: #27ae60;
}

.spending-bar-container {
  margin-top: 25px;
  background-color: #e9ecef;
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}

.spending-bar-container h3 {
  font-size: 1.5em;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
}

.spending-progress-bar {
  width: 100%;
  background-color: #ddd;
  border-radius: 15px;
  height: 25px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 12.5px;
  transition: width 0.5s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9em;
}

/* Cores da barra */
.progress-fill.green { background-color: #2ecc71; }
.progress-fill.yellow { background-color: #f1c40f; }
.progress-fill.orange { background-color: #e67e22; }
.progress-fill.red { background-color: #c0392b; }

.budget-message {
  margin-top: 15px;
  font-style: italic;
  font-size: 1.1em;
}

/* Cores da mensagem */
.budget-message .text-green { color: #2ecc71; }
.budget-message .text-yellow { color: #f1c40f; }
.budget-message .text-orange { color: #e67e22; }
.budget-message .text-red { color: #c0392b; }

.no-budget-message {
  margin-top: 25px;
  color: #777;
  font-style: italic;
}

/* Estilos para Gerenciamento de Dados (mantidos, mas agora condicional) */
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
  .container {
    margin: 20px auto;
    padding: 15px;
    gap: 20px;
  }

  header h1 {
    font-size: 2.2em;
  }

  h2 {
    font-size: 1.8em;
  }

  .action-buttons button {
    padding: 10px 20px;
    font-size: 1em;
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

  /* NOVO: Estilos para o menu hambúrguer em mobile */
  .main-nav { /* Transforma em menu lateral */
    position: fixed;
    top: 0;
    left: -250px;
    width: 250px;
    height: 100%;
    background-color: #34495e;
    flex-direction: column;
    padding: 20px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    transition: left 0.3s ease-in-out, visibility 0s linear 0.3s; /* Adiciona transição de visibilidade */
    z-index: 101;
    justify-content: flex-start;
    border-radius: 0;
    visibility: hidden; /* Oculta por padrão */
  }

  .main-nav.is-open {
    left: 0;
    visibility: visible; /* Torna visível quando aberto */
    transition-delay: 0s; /* Remove delay ao abrir */
  }

  .hamburger-menu-icon {
    display: block;
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 102;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 5px 10px;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .mobile-menu-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
    opacity: 0;
    transition: opacity 0.3s ease-in-out, visibility 0s linear 0.3s; /* Adiciona transição de visibilidade */
    visibility: hidden; /* Oculta por padrão */
  }

  .mobile-menu-overlay.is-open {
    opacity: 1;
    visibility: visible;
    transition-delay: 0s; /* Remove delay ao abrir */
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-item h4 {
    font-size: 1.2em;
  }

  .import-group {
    flex-direction: column;
    align-items: stretch;
  }

  .import-file-input, .import-btn {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 400px) {
  .data-management .button-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>