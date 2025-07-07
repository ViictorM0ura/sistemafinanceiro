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

export function useTransactions() {
  // ============================================================================
  // ESTADO REATIVO (DADOS DA APLICAÇÃO)
  // ============================================================================

  // Variáveis reativas que refletem o estado atual do formulário de transação.
  // São usadas para preencher o formulário no modo de edição e para coletar novas entradas.
  const description = ref(''); // Nome do Item/Produto
  const amount = ref(0);
  const type = ref('income'); // 'income' para receita, 'expense' para despesa.
  const category = ref(''); // Armazenará a categoria selecionada (para receita ou despesa).
  const date = ref(''); // Variável reativa para a data da transação.
  const itemDescription = ref(''); // Descrição DETALHADA da transação.

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

  // Lista de categorias predefinidas para despesas.
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
  // Lista de categorias predefinidas para receitas.
  const incomeCategories = ['Salário', 'Investimentos', 'Freelance', 'Presente', 'Outras Receitas'];

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

  // ============================================================================
  // FUNÇÕES DE AÇÃO (LÓGICA DE NEGÓCIOS)
  // ============================================================================

  /**
   * Adiciona uma nova transação ou atualiza uma transação existente.
   * Contém validações para proteger a integridade dos dados.
   * @param {object} payload - Objeto contendo os dados do formulário:
   * { desc, val, transType, cat, dateStr, itemDesc }
   */
  const addOrUpdateTransaction = (payload) => {
    const { desc, val, transType, cat, dateStr, itemDesc } = payload;

    // === REGRAS DE PROTEÇÃO: VALIDAÇÃO DE ENTRADA ===
    // 1. 'desc' (Nome do Item): Não pode ser vazio.
    // 2. 'val' (Valor): Deve ser maior que zero.
    // 3. 'cat' (Categoria): Deve ser selecionada.
    // 4. 'dateStr' (Data): Não pode ser vazia.
    // 5. 'itemDesc' (Descrição Detalhada): NÃO PODE SER VAZIA (agora é obrigatória).
    if (!desc.trim()) {
      alert('O Nome do Item/Produto não pode estar vazio.');
      return;
    }
    if (val <= 0) {
      alert('O valor da transação deve ser maior que zero.');
      return;
    }
    if (!cat) {
        alert('Por favor, selecione uma categoria para a transação.');
        return;
    }
    if (!dateStr) {
      alert('Por favor, selecione a data da transação.');
      return;
    }
    if (!itemDesc.trim()) {
        alert('A Descrição detalhada da transação não pode estar vazia.');
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
                description: desc,       // Nome do item
                amount: finalAmount,
                type: transType,
                category: cat,
                date: dateStr,
                productName: desc.trim(), // Remapeia description para productName para manter compatibilidade em JSON antigo
                itemDescription: itemDesc.trim() // Salva a nova descrição detalhada
            };
        }
      isEditing.value = false;
      editingTransactionId.value = null;
    } else {
      // Lógica para ADICIONAR uma nova transação.
      const newTransaction = {
        id: Date.now(),
        description: desc,       // Nome do item
        amount: finalAmount,
        type: transType,
        category: cat,
        date: dateStr,
        productName: desc.trim(), // Remapeia description para productName para manter compatibilidade em JSON antigo
        itemDescription: itemDesc.trim()
      };
      transactions.value.push(newTransaction); // Adiciona ao array reativo.
    }
    chartRenderKey.value++; // Incrementa a chave para redesenhar gráficos.

    // Limpa as variáveis locais do formulário após a operação ser concluída com sucesso.
    description.value = '';
    amount.value = 0;
    type.value = 'income';
    category.value = '';
    date.value = '';
    itemDescription.value = '';
  };

  /**
   * Exclui uma transação específica do array.
   * @param {number} id - O ID da transação a ser excluída.
   */
  const deleteTransaction = (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      transactions.value = transactions.value.filter(t => t.id !== id);
      chartRenderKey.value++; // Incrementa a chave para redesenhar gráficos.
      // Limpa formulário se a transação editada for excluída.
      if (editingTransactionId.value === id) {
        isEditing.value = false;
        editingTransactionId.value = null;
        description.value = '';
        amount.value = 0;
        type.value = 'income';
        category.value = '';
        date.value = '';
        itemDescription.value = '';
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

    description.value = transaction.description; // Nome do item
    amount.value = Math.abs(transaction.amount);
    type.value = transaction.type;
    category.value = transaction.category;
    date.value = transaction.date;
    itemDescription.value = transaction.itemDescription || ''; // Preenche a descrição detalhada (com fallback)
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
    const jsonData = JSON.stringify(transactions.value, null, 2);
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
        const importedData = JSON.parse(e.target.result);

        // === REGRA DE PROTEÇÃO: VALIDAÇÃO DE DADOS IMPORTADOS ===
        if (
          !Array.isArray(importedData) ||
          importedData.length === 0 ||
          !importedData[0].description ||
          !importedData[0].amount ||
          !importedData[0].type ||
          !importedData[0].date
        ) {
          alert('Formato de arquivo JSON inválido ou dados inesperados. Certifique-se de que é um arquivo de exportação válido.');
          return;
        }
        // === FIM DAS REGRAS DE PROTEÇÃO ===

        transactions.value = importedData;
        alert('Dados importados com sucesso! O histórico foi atualizado.');
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
    itemDescription,
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
    chartRenderKey,
    selectedTransactionDetails,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal
  };
}