// src/composables/useTransactions.js

// FINALIDADE: Este composable gerencia toda a lógica de estado e operações das transações financeiras.
// ... (restante do cabeçalho) ...

import { ref, watch, computed, watchEffect } from 'vue';

// Chave única para identificar os dados da aplicação no LocalStorage do navegador.
const LOCAL_STORAGE_KEY = 'my-finance-app-transactions';

export function useTransactions() {
  // ============================================================================
  // ESTADO REATIVO (DADOS DA APLICAÇÃO)
  // ============================================================================

  // Variáveis reativas que refletem o estado atual do formulário de transação.
  const description = ref('');
  const amount = ref(0);
  const type = ref('income'); // 'income' para receita, 'expense' para despesa.
  const category = ref(''); // Armazenará a categoria selecionada (para receita ou despesa).
  const date = ref('');

  // Variáveis para controlar o fluxo de edição de transações.
  const isEditing = ref(false);
  const editingTransactionId = ref(null);

  // Variáveis reativas para o controle de filtro.
  const filterType = ref('none');
  const filterValue = ref('');

  // Chave para forçar o redesenho dos gráficos.
  const chartRenderKey = ref(0);

  // Lista de categorias predefinidas para despesas.
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
  // NOVO: Lista de categorias predefinidas para receitas.
  const incomeCategories = ['Salário', 'Investimentos', 'Freelance', 'Presente', 'Outras Receitas'];

  // Array reativo que armazena todas as transações.
  const transactions = ref(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'));

  // ============================================================================
  // PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
  // ============================================================================

  // Observa profundamente (`deep: true`) qualquer alteração no array `transactions`.
  // ... (watch para LocalStorage permanece o mesmo) ...
  watch(transactions, (newTransactions) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
  }, { deep: true });

  // ============================================================================
  // FUNÇÕES DE AÇÃO (LÓGICA DE NEGÓCIOS)
  // ============================================================================

  /**
   * Adiciona uma nova transação ou atualiza uma transação existente.
   * Contém validações para proteger a integridade dos dados.
   * @param {object} payload - Objeto contendo os dados do formulário: { desc, val, transType, cat, dateStr }
   */
  const addOrUpdateTransaction = (payload) => {
    const { desc, val, transType, cat, dateStr } = payload;

    // === REGRAS DE PROTEÇÃO: VALIDAÇÃO DE ENTRADA ===
    // 1. Verifica se a descrição não está vazia.
    // 2. Garante que o valor seja maior que zero.
    // 3. Se a transação for uma despesa ou receita, exige que uma categoria seja selecionada.
    // 4. Garante que a data não esteja vazia.
    if (!desc.trim()) {
      alert('A descrição da transação não pode estar vazia.');
      return;
    }
    if (val <= 0) {
      alert('O valor da transação deve ser maior que zero.');
      return;
    }
    // ALTERADO: Validação de categoria para AMBOS os tipos, não apenas despesa.
    if (!cat) {
        alert('Por favor, selecione uma categoria para a transação.');
        return;
    }
    if (!dateStr) {
      alert('Por favor, selecione a data da transação.');
      return;
    }
    // === FIM DAS REGRAS DE PROTEÇÃO ===

    const finalAmount = transType === 'expense' ? -Math.abs(val) : Math.abs(val);

    if (isEditing.value) {
      // Lógica para ATUALIZAR uma transação existente.
      const index = transactions.value.findIndex(t => t.id === editingTransactionId.value);
      if (index !== -1) {
            const currentItem = transactions.value[index];
            transactions.value[index] = {
                ...currentItem,
                description: desc,
                amount: finalAmount,
                type: transType,
                category: cat, // ALTERADO: Usa a categoria selecionada para todos os tipos.
                date: dateStr
            };
        }
      isEditing.value = false;
      editingTransactionId.value = null;
    } else {
      // Lógica para ADICIONAR uma nova transação.
      const newTransaction = {
        id: Date.now(),
        description: desc,
        amount: finalAmount,
        type: transType,
        category: cat, // ALTERADO: Usa a categoria selecionada para todos os tipos.
        date: dateStr
      };
      transactions.value.push(newTransaction);
    }
    chartRenderKey.value++; // Incrementa a chave para redesenhar gráficos.

    description.value = '';
    amount.value = 0;
    type.value = 'income'; // Reseta para 'Receita' por padrão.
    category.value = '';  // Limpa a categoria.
    date.value = '';
  };

  /**
   * Exclui uma transação específica do array.
   * @param {number} id - O ID da transação a ser excluída.
   */
  const deleteTransaction = (id) => {
    // ... (corpo da função deleteTransaction permanece o mesmo) ...
    if (confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      transactions.value = transactions.value.filter(t => t.id !== id);
      chartRenderKey.value++; // Incrementa a chave para redesenhar gráficos.
      if (editingTransactionId.value === id) {
        isEditing.value = false;
        editingTransactionId.value = null;
        description.value = '';
        amount.value = 0;
        type.value = 'income';
        category.value = '';
        date.value = '';
      }
    }
  };

  /**
   * Prepara o formulário para editar uma transação existente.
   * @param {object} transaction - O objeto da transação a ser editada.
   */
  const startEditTransaction = (transaction) => {
    isEditing.value = true;
    editingTransactionId.value = transaction.id;

    description.value = transaction.description;
    amount.value = Math.abs(transaction.amount);
    type.value = transaction.type;
    category.value = transaction.category; // ALTERADO: Pega a categoria diretamente.
    date.value = transaction.date;
  };

  /**
   * Atualiza o tipo e o valor do filtro.
   * @param {string} type - O tipo de filtro.
   * @param {string} value - O valor a ser filtrado.
   */
  const updateFilter = (type, value) => {
    filterType.value = type;
    filterValue.value = value;
    chartRenderKey.value++; // Incrementa a chave para redesenhar gráficos ao filtrar.
  };

  // Funções para exportar/importar dados
  const exportData = () => { /* ... */ }; // Conteúdo da função permanece o mesmo
  const importData = (file) => { /* ... */ }; // Conteúdo da função permanece o mesmo

  // ============================================================================
  // PROPRIEDADES COMPUTADAS (DADOS DERIVADOS)
  // ============================================================================

  // Propriedade computada que retorna as transações filtradas.
  const filteredTransactions = computed(() => {
    // ... (corpo de filteredTransactions permanece o mesmo) ...
    if (filterType.value === 'none' || !filterValue.value) {
      return transactions.value;
    }

    return transactions.value.filter(transaction => {
      if (!transaction.date) return false;

      switch (filterType.value) {
        case 'day':
          return transaction.date === String(filterValue.value);
        case 'month':
          return transaction.date.startsWith(String(filterValue.value));
        case 'year':
          return transaction.date.startsWith(String(filterValue.value));
        default:
          return true;
      }
    });
  });

  // Calcula o saldo total líquido.
  const totalBalance = computed(() => {
    return filteredTransactions.value.reduce((sum, transaction) => sum + transaction.amount, 0);
  });

  // Calcula o total de receitas no período filtrado.
  const totalIncome = computed(() => {
    return filteredTransactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  });

  // Calcula o total de despesas no período filtrado.
  const totalExpenses = computed(() => {
    return filteredTransactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  });

  // Prepara os dados para o gráfico de pizza (despesas por categoria).
  const expenseChartData = computed(() => {
    const categories = {};
    filteredTransactions.value.filter(t => t.type === 'expense').forEach(t => {
      if (categories[t.category]) {
        categories[t.category] += Math.abs(t.amount);
      } else {
        categories[t.category] = Math.abs(t.amount);
      }
    });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          backgroundColor: [
            '#41B883', '#E46651', '#00D8FF', '#DD1B16', '#2C3E50', '#F38B00', '#A9A9A9'
          ],
          data: Object.values(categories)
        }
      ]
    };
  });

  // Prepara os dados para o gráfico de barras (comparação Receitas vs. Despesas).
  const barChartData = computed(() => {
    const totalIncomeValue = filteredTransactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenseValue = filteredTransactions.value.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      labels: ['Receitas', 'Despesas'],
      datasets: [
        {
          label: 'Valores',
          backgroundColor: ['#2ecc71', '#e74c3c'],
          data: [totalIncomeValue, totalExpenseValue]
        }
      ]
    };
  });

  // ============================================================================
  // EXPOSIÇÃO DE VARIÁVEIS E FUNÇÕES
  // ============================================================================

  // Retorna todos os estados reativos e funções que outros componentes precisarão.
  return {
    description,
    amount,
    type,
    category,
    date,
    isEditing,
    editingTransactionId,
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
    chartRenderKey
  };
}