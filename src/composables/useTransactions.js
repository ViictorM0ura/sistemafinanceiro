// src/composables/useTransactions.js

// FINALIDADE: Este composable gerencia toda a lógica de estado e operações das transações financeiras.
// Ele é responsável por:
// - Armazenar e persistir as transações no LocalStorage do navegador.
// - Adicionar, editar e excluir transações.
// - Calcular o saldo total.
// - Gerar os dados para os gráficos.
// - Validar as entradas do usuário para garantir a integridade dos dados.

import { ref, watch, computed, watchEffect } from 'vue';

// Chave única para identificar os dados da aplicação no LocalStorage do navegador.
const LOCAL_STORAGE_KEY = 'my-finance-app-transactions';
const LOCAL_STORAGE_CATEGORIES_KEY = 'my-finance-app-categories';
const LOCAL_STORAGE_MONTHLY_BUDGET = 'my-finance-app-monthly-budget'; // NOVA CHAVE

export function useTransactions() {
  // ============================================================================
  // ESTADO REATIVO (DADOS DA APLICAÇÃO)
  // ============================================================================

  // Variáveis reativas que refletem o estado atual do formulário de transação.
  const description = ref(''); // Nome do Item/Produto
  const amount = ref(0);
  const type = ref('income'); // 'income' para receita, 'expense' para despesa.
  const category = ref(''); // Armazenará a categoria selecionada (para receita ou despesa).
  const date = ref(''); // Variável reativa para a data da transação.
  const itemDescription = ref(''); // Descrição DETALHADA da transação.
  const expenseType = ref(''); // Tipo de despesa: 'fixa' ou 'variavel'.
  const paymentMethod = ref(''); // Forma de pagamento (dinheiro, pix, cartão de crédito, cartão de débito)

  // Variáveis para controlar o fluxo de edição de transações.
  const isEditing = ref(false);
  const editingTransactionId = ref(null);

  // Variáveis reativas para o controle de filtro.
  const filterType = ref('none'); // 'none', 'day', 'month', 'year'
  const filterValue = ref('');    // O valor a ser filtrado (data, mês/ano, ano)

  // Chave para forçar o redesenho dos gráficos.
  const chartRenderKey = ref(0);

  // Variáveis reativas para o estado do modal de detalhes da transação.
  const selectedTransactionDetails = ref(null); // Armazena a transação a ser exibida no modal.
  const showDetailsModal = ref(false);       // Booleano: true se o modal de detalhes está aberto.

  // NOVO: Orçamento mensal.
  const monthlyBudget = ref(JSON.parse(localStorage.getItem(LOCAL_STORAGE_MONTHLY_BUDGET) || '0'));

  // ============================================================================
  // CATEGORIAS E FORMAS DE PAGAMENTO (REATIVAS E PERSISTENTES)
  // ============================================================================

  // Define as categorias padrão. Usadas para validação (não podem ser removidas).
  const DEFAULT_EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
  const DEFAULT_INCOME_CATEGORIES = ['Salário', 'Investimentos', 'Freelance', 'Presente', 'Outras Receitas'];

  // Carrega categorias salvas no LocalStorage ou usa valores padrão.
  const savedCategories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY) || '{}');

  const expenseCategories = ref(savedCategories.expense || [...DEFAULT_EXPENSE_CATEGORIES]);
  const incomeCategories = ref(savedCategories.income || [...DEFAULT_INCOME_CATEGORIES]);

  // Lista de formas de pagamento (não precisa ser persistente no LocalStorage, pois é fixa).
  const paymentMethods = ['Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito'];

  // Array reativo que armazena todas as transações.
  // Tenta carregar as transações salvas no LocalStorage ao iniciar; caso contrário, começa vazio.
  const transactions = ref(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'));

  // ============================================================================
  // PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
  // ============================================================================

  // Observa profundamente (`deep: true`) qualquer alteração no array `transactions`.
  watch(transactions, (newTransactions) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
  }, { deep: true });

  // Observa mudanças nas categorias e as salva no LocalStorage.
  watch([expenseCategories, incomeCategories], ([newExpenseCats, newIncomeCats]) => {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify({
      expense: newExpenseCats,
      income: newIncomeCats
    }));
  }, { deep: true });

  // NOVO: Observa mudanças no orçamento mensal e o salva no LocalStorage.
  watch(monthlyBudget, (newBudget) => {
    localStorage.setItem(LOCAL_STORAGE_MONTHLY_BUDGET, JSON.stringify(newBudget));
  });


  // ============================================================================
  // FUNÇÕES DE AÇÃO (LÓGICA DE NEGÓCIOS)
  // ============================================================================

  /**
   * Adiciona uma nova transação ou atualiza uma transação existente.
   * Contém validações para proteger a integridade dos dados.
   * @param {object} payload - Objeto contendo os dados do formulário:
   * { desc, val, transType, cat, dateStr, itemDesc, expType, payMethod }
   */
  const addOrUpdateTransaction = (payload) => {
    const { desc, val, transType, cat, dateStr, itemDesc, expType, payMethod } = payload;

    // === REGRAS DE PROTEÇÃO: VALIDAÇÃO DE ENTRADA ===
    if (!desc.trim()) { alert('O Nome do Item/Produto não pode estar vazio.'); return; }
    if (val <= 0) { alert('O valor da transação deve ser maior que zero.'); return; }
    if (!cat) { alert('Por favor, selecione uma categoria para a transação.'); return; }
    if (!dateStr) { alert('Por favor, selecione a data da transação.'); return; }
    if (!itemDesc.trim()) { alert('A Descrição detalhada da transação não pode estar vazia.'); return; }
    if (transType === 'expense' && !expType) { alert('Por favor, selecione se a despesa é Fixa ou Variável.'); return; }
    if (transType === 'expense' && !payMethod) { alert('Por favor, selecione a forma de pagamento.'); return; }
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
                category: cat,
                date: dateStr,
                productName: desc.trim(),
                itemDescription: itemDesc.trim(),
                expenseType: transType === 'expense' ? expType : '',
                paymentMethod: transType === 'expense' ? payMethod : ''
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
        category: cat,
        date: dateStr,
        productName: desc.trim(),
        itemDescription: itemDesc.trim(),
        expenseType: transType === 'expense' ? expType : '',
        paymentMethod: transType === 'expense' ? payMethod : ''
      };
      transactions.value.push(newTransaction);
    }
    chartRenderKey.value++;

    // Limpa as variáveis locais do formulário após a operação ser concluída com sucesso.
    description.value = ''; amount.value = 0; type.value = 'income'; category.value = '';
    date.value = ''; itemDescription.value = ''; expenseType.value = ''; paymentMethod.value = '';
  };

  /**
   * Exclui uma transação específica do array.
   * @param {number} id - O ID da transação a ser excluída.
   */
  const deleteTransaction = (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      transactions.value = transactions.value.filter(t => t.id !== id);
      chartRenderKey.value++;
      if (editingTransactionId.value === id) {
        isEditing.value = false; editingTransactionId.value = null;
        description.value = ''; amount.value = 0; type.value = 'income'; category.value = '';
        date.value = ''; itemDescription.value = ''; expenseType.value = ''; paymentMethod.value = '';
      }
    }
  };

  /**
   * Prepara o formulário para editar uma transação existente.
   * @param {object} transaction - O objeto da transação a ser editada.
   */
  const startEditTransaction = (transaction) => {
    isEditing.value = true; editingTransactionId.value = transaction.id;
    description.value = transaction.description; amount.value = Math.abs(transaction.amount);
    type.value = transaction.type; category.value = transaction.category; date.value = transaction.date;
    itemDescription.value = transaction.itemDescription || ''; expenseType.value = transaction.expenseType || '';
    paymentMethod.value = transaction.paymentMethod || '';
  };

  /**
   * Adiciona uma nova categoria à lista de categorias de despesa ou receita.
   * @param {string} newCategory - A nova categoria a ser adicionada.
   * @param {string} categoryType - O tipo de categoria ('income' ou 'expense').
   */
  const addCustomCategory = (newCategory, categoryType) => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) { alert('A categoria não pode ser vazia.'); return; }
    if (categoryType === 'expense') {
      if (!expenseCategories.value.includes(trimmedCategory)) { expenseCategories.value.push(trimmedCategory); alert(`Categoria de despesa "${trimmedCategory}" adicionada!`); }
      else { alert(`A categoria de despesa "${trimmedCategory}" já existe.`); }
    } else if (categoryType === 'income') {
      if (!incomeCategories.value.includes(trimmedCategory)) { incomeCategories.value.push(trimmedCategory); alert(`Categoria de receita "${trimmedCategory}" adicionada!`); }
      else { alert(`A categoria de receita "${trimmedCategory}" já existe.`); }
    }
  };

  /**
   * Remove uma categoria personalizada da lista de categorias.
   * Não permite remover categorias padrão.
   * @param {string} categoryToRemove - A categoria a ser removida.
   * @param {string} categoryType - O tipo de categoria ('income' ou 'expense').
   */
  const removeCustomCategory = (categoryToRemove, categoryType) => {
    const trimmedCategory = categoryToRemove.trim();
    if (!trimmedCategory) { alert('Por favor, digite o nome da categoria que deseja remover.'); return; }
    if (categoryType === 'expense') {
      if (DEFAULT_EXPENSE_CATEGORIES.includes(trimmedCategory)) { alert(`A categoria "${trimmedCategory}" é padrão e não pode ser removida.`); return; }
      const index = expenseCategories.value.indexOf(trimmedCategory);
      if (index !== -1) { expenseCategories.value.splice(index, 1); alert(`Categoria de despesa "${trimmedCategory}" removida!`); }
      else { alert(`A categoria de despesa "${trimmedCategory}" não foi encontrada.`); }
    } else if (categoryType === 'income') {
      if (DEFAULT_INCOME_CATEGORIES.includes(trimmedCategory)) { alert(`A categoria "${trimmedCategory}" é padrão e não pode ser removida.`); return; }
      const index = incomeCategories.value.indexOf(trimmedCategory);
      if (index !== -1) { incomeCategories.value.splice(index, 1); alert(`Categoria de receita "${trimmedCategory}" removida!`); }
      else { alert(`A categoria de receita "${trimmedCategory}" não foi encontrada.`); }
    }
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

  /**
   * NOVO: Define o orçamento mensal.
   * @param {number} amount - O valor do orçamento.
   */
  const setMonthlyBudget = (amount) => {
    if (amount >= 0) {
      monthlyBudget.value = amount;
      alert(`Orçamento mensal definido para R$ ${amount.toFixed(2)}.`);
    } else {
      alert('O orçamento mensal deve ser um valor positivo ou zero.');
    }
  };

  /**
   * Abre o modal de detalhes, exibindo a transação fornecida.
   * @param {object} transaction - A transação a ser exibida no modal.
   */
  const openDetailsModal = (transaction) => {
    selectedTransactionDetails.value = transaction;
    showDetailsModal.value = true;
  };

  /**
   * Fecha o modal de detalhes.
   */
  const closeDetailsModal = () => {
    selectedTransactionDetails.value = null;
    showDetailsModal.value = false;
  };

  // Funções para exportar/importar dados
  const exportData = () => {
    const dataToExport = {
      transactions: transactions.value,
      categories: {
        expense: expenseCategories.value,
        income: incomeCategories.value
      },
      monthlyBudget: monthlyBudget.value // NOVO: Incluindo orçamento mensal na exportação
    };
    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `meu_sistema_financeiro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Dados exportados com sucesso! Verifique sua pasta de downloads.');
  };

  const importData = (file) => {
    if (!file) {
      alert('Nenhum arquivo selecionado para importação.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedContent = JSON.parse(e.target.result);

        // === REGRA DE PROTEÇÃO: VALIDAÇÃO DE DADOS IMPORTADOS ===
        if (
          !importedContent ||
          !Array.isArray(importedContent.transactions) ||
          !importedContent.transactions[0].description ||
          !importedContent.transactions[0].amount ||
          !importedContent.transactions[0].type ||
          !importedContent.transactions[0].date
        ) {
          alert('Formato de arquivo JSON inválido ou dados inesperados. Certifique-se de que é um arquivo de exportação válido.');
          return;
        }
        // === FIM DAS REGRAS DE PROTEÇÃO ===

        transactions.value = importedContent.transactions;
        // Importa também as categorias e o orçamento mensal, se existirem no arquivo
        if (importedContent.categories) {
          expenseCategories.value = importedContent.categories.expense || expenseCategories.value;
          incomeCategories.value = importedContent.categories.income || incomeCategories.value;
        }
        if (typeof importedContent.monthlyBudget === 'number') { // NOVO: Importando orçamento mensal
            monthlyBudget.value = importedContent.monthlyBudget;
        }
        alert('Dados importados com sucesso! O histórico, categorias e orçamento foram atualizados.');
      } catch (error) {
        alert('Erro ao ler ou parsear o arquivo. Certifique-se de que é um arquivo JSON válido.');
        console.error('Erro ao importar dados:', error);
      }
    };
    reader.readAsText(file);
  };

  // ============================================================================
  // PROPRIEDADES COMPUTADAS (DADOS DERIVADOS)
  // ============================================================================

  // Propriedade computada que retorna as transações filtradas.
  const filteredTransactions = computed(() => {
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

  // NOVO: Calcula o total de despesas APENAS para o mês atual (independente do filtro do usuário).
  const currentMonthTotalExpenses = computed(() => {
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    return transactions.value // Usa 'transactions' completo, não o filtrado pelo usuário.
      .filter(t => t.type === 'expense' && t.date.startsWith(currentYearMonth))
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
            '#41B883', '#E46651', '#00D8FF', '#DD1B16', '#2C3E50', '#F38B00', '#' // Fix: missing color
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

  // Dados para o gráfico de distribuição de despesas por tipo (Fixa/Variável)
  const expenseTypeDistributionChartData = computed(() => {
    const expenseTypes = { 'Fixa': 0, 'Variável': 0 };
    filteredTransactions.value
      .filter(t => t.type === 'expense' && (t.expenseType === 'fixa' || t.expenseType === 'variavel'))
      .forEach(t => {
        if (t.expenseType === 'fixa') {
          expenseTypes['Fixa'] += Math.abs(t.amount);
        } else if (t.expenseType === 'variavel') {
          expenseTypes['Variável'] += Math.abs(t.amount);
        }
      });

    const labels = Object.keys(expenseTypes).filter(key => expenseTypes[key] > 0);
    const data = Object.values(expenseTypes).filter(value => value > 0);

    return {
      labels: labels,
      datasets: [
        {
          backgroundColor: ['#FF6384', '#36A2EB'],
          data: data
        }
      ]
    };
  });

  // Dados para o gráfico de distribuição de despesas por método de pagamento
  const paymentMethodDistributionChartData = computed(() => {
    const methods = {};
    filteredTransactions.value
      .filter(t => t.type === 'expense' && t.paymentMethod)
      .forEach(t => {
        if (methods[t.paymentMethod]) {
          methods[t.paymentMethod] += Math.abs(t.amount);
        } else {
          methods[t.paymentMethod] = Math.abs(t.amount);
        }
      });

    const labels = Object.keys(methods);
    const data = Object.values(methods);

    const backgroundColors = [
      '#FFCD56', '#4BC0C0', '#9966FF', '#FF9966', '#C9CBCF', '#A1C3D1', '#F7CAC9', '#92A8D1'
    ];

    return {
      labels: labels,
      datasets: [
        {
          backgroundColor: backgroundColors.slice(0, labels.length),
          data: data
        }
      ]
    };
  });

  // Dados para o gráfico de distribuição de transações por categoria (receitas e despesas juntas)
  const categoryDistributionChartData = computed(() => {
    const categories = {};
    filteredTransactions.value.forEach(t => {
      if (categories[t.category]) {
        categories[t.category] += Math.abs(t.amount);
      } else {
        categories[t.category] = Math.abs(t.amount);
      }
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9966', '#C9CBCF', '#A1C3D1',
      '#F7CAC9', '#92A8D1', '#B5EAD7', '#FFDAC1', '#E2F0CB', '#B2EBF2', '#FAD2E1', '#D4A5A5'
    ];

    return {
      labels: labels,
      datasets: [
        {
          backgroundColor: backgroundColors.slice(0, labels.length),
          data: data
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
    itemDescription,
    expenseType,
    paymentMethod,
    isEditing,
    editingTransactionId,
    expenseCategories,
    incomeCategories,
    paymentMethods,
    transactions,
    filteredTransactions,
    totalBalance,
    totalIncome,
    totalExpenses,
    currentMonthTotalExpenses, // NOVO: Expondo despesas do mês atual
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
    addCustomCategory,
    removeCustomCategory,
    updateFilter,
    setMonthlyBudget, // NOVO: Expondo função para definir orçamento
    monthlyBudget,    // NOVO: Expondo o orçamento mensal
    exportData,
    importData,
    chartRenderKey,
    selectedTransactionDetails,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal
  };
}