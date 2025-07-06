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
  const description = ref('');
  const amount = ref(0);
  const type = ref('income'); // 'income' para receita, 'expense' para despesa.
  const category = ref('');

  // Variáveis para controlar o fluxo de edição de transações.
  const isEditing = ref(false);         // Booleano: true se uma transação está sendo editada.
  const editingTransactionId = ref(null); // ID da transação atualmente em edição.

  // Lista de categorias predefinidas para despesas.
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];

  // Array reativo que armazena todas as transações.
  // Tenta carregar as transações salvas no LocalStorage ao iniciar; caso contrário, começa vazio.
  const transactions = ref(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'));

  // ============================================================================
  // PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
  // ============================================================================

  // Observa profundamente (`deep: true`) qualquer alteração no array `transactions`.
  // Sempre que uma transação é adicionada, editada ou excluída, o array é salvo
  // no LocalStorage, garantindo que os dados persistam após recarregar a página.
  watch(transactions, (newTransactions) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
  }, { deep: true });

  // ============================================================================
  // FUNÇÕES DE AÇÃO (LÓGICA DE NEGÓCIOS)
  // ============================================================================

  /**
   * Adiciona uma nova transação ou atualiza uma transação existente.
   * Contém validações para proteger a integridade dos dados.
   * @param {object} payload - Objeto contendo os dados do formulário: { desc, val, transType, cat }
   */
  const addOrUpdateTransaction = (payload) => {
    const { desc, val, transType, cat } = payload;

    // === REGRAS DE PROTEÇÃO: VALIDAÇÃO DE ENTRADA ===
    // 1. Verifica se a descrição não está vazia.
    // 2. Garante que o valor seja maior que zero. Não permite '0' ou negativos diretos aqui.
    //    (O sinal negativo para despesas é aplicado internamente pelo sistema).
    // 3. Se a transação for uma despesa, exige que uma categoria seja selecionada.
    if (!desc.trim()) { // .trim() remove espaços em branco antes de verificar se está vazia
      alert('A descrição da transação não pode estar vazia.');
      return; // Interrompe a função se a validação falhar.
    }
    if (val <= 0) {
      alert('O valor da transação deve ser maior que zero.');
      return; // Interrompe a função se a validação falhar.
    }
    if (transType === 'expense' && !cat) {
      alert('Por favor, selecione uma categoria para a despesa.');
      return; // Interrompe a função se a validação falhar.
    }
    // === FIM DAS REGRAS DE PROTEÇÃO ===

    // Aplica o sinal negativo ao valor se a transação for uma despesa.
    const finalAmount = transType === 'expense' ? -Math.abs(val) : Math.abs(val);

    if (isEditing.value) {
      // Lógica para ATUALIZAR uma transação existente.
      const index = transactions.value.findIndex(t => t.id === editingTransactionId.value);
      if (index !== -1) {
        transactions.value[index] = {
          ...transactions.value[index], // Mantém outras propriedades originais
          description: desc,
          amount: finalAmount,
          type: transType,
          category: transType === 'expense' ? cat : 'Receita' // Atribui 'Receita' como categoria padrão para entradas.
        };
      }
      // Reseta o estado de edição após a atualização.
      isEditing.value = false;
      editingTransactionId.value = null;
    } else {
      // Lógica para ADICIONAR uma nova transação.
      const newTransaction = {
        id: Date.now(), // Gera um ID único baseado no timestamp atual.
        description: desc,
        amount: finalAmount,
        type: transType,
        category: transType === 'expense' ? cat : 'Receita'
      };
      transactions.value.push(newTransaction); // Adiciona ao array reativo.
    }

    // Limpa as variáveis locais do formulário após a operação ser concluída com sucesso.
    description.value = '';
    amount.value = 0;
    type.value = 'income';
    category.value = '';
  };

  /**
   * Exclui uma transação específica do array.
   * @param {number} id - O ID da transação a ser excluída.
   */
  const deleteTransaction = (id) => {
    // Pede confirmação ao usuário antes de excluir para evitar exclusões acidentais.
    if (confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      // Filtra o array, removendo a transação com o ID correspondente.
      transactions.value = transactions.value.filter(t => t.id !== id);
      // Se a transação excluída era a que estava em modo de edição, reseta o formulário e o estado de edição.
      if (editingTransactionId.value === id) {
        isEditing.value = false;
        editingTransactionId.value = null;
        description.value = '';
        amount.value = 0;
        type.value = 'income';
        category.value = '';
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

    // Preenche as variáveis do formulário com os dados da transação selecionada.
    description.value = transaction.description;
    amount.value = Math.abs(transaction.amount); // Mostra o valor sempre positivo no campo de input.
    type.value = transaction.type;
    category.value = transaction.type === 'expense' ? transaction.category : '';
  };

  // ============================================================================
  // PROPRIEDADES COMPUTADAS (DADOS DERIVADOS)
  // ============================================================================

  // Calcula o saldo total atual da conta.
  const totalBalance = ref(0);
  watchEffect(() => {
    totalBalance.value = transactions.value.reduce((sum, transaction) => sum + transaction.amount, 0);
  });

  // Prepara os dados para o gráfico de pizza (despesas por categoria).
  const expenseChartData = computed(() => {
    const categories = {};
    transactions.value.filter(t => t.type === 'expense').forEach(t => {
      // Soma os valores absolutos das despesas por categoria.
      if (categories[t.category]) {
        categories[t.category] += Math.abs(t.amount);
      } else {
        categories[t.category] = Math.abs(t.amount);
      }
    });

    return {
      labels: Object.keys(categories), // Nomes das categorias
      datasets: [
        {
          backgroundColor: [
            '#41B883', '#E46651', '#00D8FF', '#DD1B16', '#2C3E50', '#F38B00', '#A9A9A9' // Cores para as fatias.
          ],
          data: Object.values(categories) // Valores das despesas por categoria
        }
      ]
    };
  });

  // Prepara os dados para o gráfico de barras (comparação Receitas vs. Despesas).
  const barChartData = computed(() => {
    const totalIncome = transactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.value.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      labels: ['Receitas', 'Despesas'],
      datasets: [
        {
          label: 'Valores',
          backgroundColor: ['#2ecc71', '#e74c3c'], // Verde para receita, Vermelho para despesa.
          data: [totalIncome, totalExpense]
        }
      ]
    };
  });

  // ============================================================================
  // EXPOSIÇÃO DE VARIÁVEIS E FUNÇÕES
  // ============================================================================

  // Retorna todos os estados reativos e funções que outros componentes (App.vue, etc.)
  // precisarão para exibir dados ou interagir com a lógica das transações.
  return {
    description,
    amount,
    type,
    category,
    isEditing,
    editingTransactionId,
    expenseCategories,
    transactions,
    totalBalance,
    expenseChartData,
    barChartData,
    addOrUpdateTransaction,
    deleteTransaction,
    startEditTransaction
  };
}