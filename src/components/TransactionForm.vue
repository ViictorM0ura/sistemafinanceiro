<script setup>
// FINALIDADE: Componente do formulário para adicionar ou editar transações.
// Gerencia a entrada de dados do usuário e emite um evento para o componente pai
// quando uma transação é submetida (adicionada ou atualizada).

import { ref, watch, computed, defineProps, defineEmits } from 'vue'; // Adicionado 'computed'

// ============================================================================
// PROPRIEDADES (PROPS)
// ============================================================================

// Define as propriedades que este componente `TransactionForm` espera receber do seu pai (App.vue).
const props = defineProps({
  isEditing: {
    type: Boolean,
    required: true
  },
  // Propriedades para preencher o formulário no modo de edição (dados iniciais).
  initialDescription: { type: String, default: '' },
  initialAmount: { type: Number, default: 0 },
  initialType: { type: String, default: 'income' },
  initialCategory: { type: String, default: '' },
  initialDate: { type: String, default: '' },
  // Propriedades para receber as categorias de despesa e receita.
  expenseCategories: {
    type: Array,
    required: true
  },
  incomeCategories: { // NOVO: Prop para receber as categorias de receita.
    type: Array,
    required: true
  }
});

// ============================================================================
// EVENTOS (EMITS)
// ============================================================================

// Define os eventos que este componente pode emitir para o seu componente pai (App.vue).
const emit = defineEmits(['submit-transaction']);

// ============================================================================
// ESTADO LOCAL DO FORMULÁRIO
// ============================================================================

// Variáveis reativas locais que controlam os campos do formulário.
const description = ref(props.initialDescription);
const amount = ref(props.initialAmount);
const type = ref(props.initialType);
const category = ref(props.initialCategory); // Categoria inicial pode vir da prop.

// Variável reativa para o campo de data.
const today = new Date().toISOString().split('T')[0];
const date = ref(props.initialDate || today);

// ============================================================================
// OBSERVAÇÃO DE PROPS (PARA MODO DE EDIÇÃO)
// ============================================================================

// Observa mudanças nas props `initial...` e atualiza as variáveis locais do formulário.
watch(() => props.initialDescription, (newVal) => description.value = newVal);
watch(() => props.initialAmount, (newVal) => amount.value = newVal);
watch(() => props.initialType, (newVal) => type.value = newVal);
watch(() => props.initialCategory, (newVal) => category.value = newVal);
watch(() => props.initialDate, (newVal) => date.value = newVal || today);

// ============================================================================
// PROPRIEDADES COMPUTADAS (LOCAIS DO COMPONENTE)
// ============================================================================

// Propriedade computada que retorna as categorias a serem exibidas no dropdown
// com base no tipo de transação selecionado (Receita ou Despesa).
const currentCategories = computed(() => {
  return type.value === 'expense' ? props.expenseCategories : props.incomeCategories;
});

// ============================================================================
// FUNÇÕES DE MANUSEIO DE EVENTOS
// ============================================================================

/**
 * Lida com a submissão do formulário.
 * Emite um evento `submit-transaction` para o componente pai com os dados do formulário.
 */
const handleSubmit = () => {
  // Emite os dados do formulário como um payload para o componente pai.
  emit('submit-transaction', {
    desc: description.value,
    val: amount.value,
    transType: type.value,
    cat: category.value,
    dateStr: date.value
  });

  // Limpa o formulário localmente apenas se não estiver no modo de edição.
  if (!props.isEditing) {
      description.value = '';
      amount.value = 0;
      type.value = 'income'; // Reseta para 'Receita' por padrão.
      category.value = '';  // Limpa a categoria.
      date.value = today; // Reseta a data para hoje.
  }
};

/**
 * Define o tipo de transação (Receita ou Despesa) e ajusta a categoria.
 * Reseta a categoria selecionada para que o usuário escolha uma nova categoria para o novo tipo.
 * @param {string} newType - O novo tipo de transação ('income' ou 'expense').
 */
const setTransactionType = (newType) => {
  type.value = newType;
  category.value = ''; // Sempre limpa a categoria ao mudar o tipo para forçar uma nova seleção.
};

</script>

<template>
  <div class="transaction-form">
    <h3>{{ props.isEditing ? 'Editar Transação' : 'Adicionar Nova Transação' }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <label for="description">Descrição:</label>
        <input type="text" id="description" v-model="description" placeholder="Ex: Salário, Aluguel" />
      </div>

      <div class="input-group">
        <label for="amount">Valor:</label>
        <input type="number" id="amount" v-model.number="amount" placeholder="Ex: 500.00" min="0.01" step="0.01" />
      </div>

      <div class="input-group">
        <label for="date">Data:</label>
        <input type="date" id="date" v-model="date" />
      </div>

      <div class="input-group transaction-type">
        <label>Tipo:</label>
        <button type="button" :class="{ active: type === 'income' }" @click="setTransactionType('income')">Receita</button>
        <button type="button" :class="{ active: type === 'expense' }" @click="setTransactionType('expense')">Despesa</button>
      </div>

      <div class="input-group">
        <label for="category">Categoria ({{ type === 'income' ? 'Receita' : 'Despesa' }}):</label>
        <select id="category" v-model="category">
          <option value="" disabled>Selecione uma categoria</option>
          <option v-for="cat in currentCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <button type="submit">{{ props.isEditing ? 'Atualizar Transação' : 'Adicionar Transação' }}</button>
    </form>
  </div>
</template>

<style scoped>
/* ============================================================================
   ESTILOS ESPECÍFICOS DO COMPONENTE TRANSACTIONFORM
   ============================================================================ */
.transaction-form h3 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.8em;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.input-group input[type="text"],
.input-group input[type="number"],
.input-group input[type="date"],
.input-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.transaction-type {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.transaction-type label {
  margin-right: 15px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.transaction-type button {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #555;
  font-size: 1em;
  transition: all 0.3s ease;
  min-width: 120px;
  box-sizing: border-box;
}

.transaction-type button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.transaction-type button:hover:not(.active) {
  background-color: #e0e0e0;
}

form button[type="submit"] {
  background-color: #42b983;
  color: white;
  padding: 14px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 10px;
}

form button[type="submit"]:hover {
  background-color: #368a68;
}

/* ============================================================================
   MEDIA QUERIES (RESPONSIVIDADE ESPECÍFICA DO COMPONENTE)
   ============================================================================ */
@media (max-width: 900px) {
    .transaction-form h3 {
        font-size: 1.6em;
    }
}

@media (max-width: 600px) {
    .transaction-form h3 {
        font-size: 1.2em;
    }
    .input-group label, .transaction-type label {
        font-size: 0.9em;
    }
    .input-group input, .input-group select, .transaction-type button, form button[type="submit"] {
        font-size: 0.9em;
        padding: 10px;
    }
    .transaction-type button {
        min-width: unset;
        flex-basis: 48%;
    }
    .transaction-type {
        justify-content: space-around;
    }
}

@media (max-width: 400px) {
    .transaction-type {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
    .transaction-type label {
        margin-bottom: 5px;
        text-align: center;
    }
    .transaction-type button {
        flex-basis: auto;
    }
}
</style>