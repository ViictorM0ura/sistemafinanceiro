<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

// Define as propriedades (props) que este componente pode receber
const props = defineProps({
  isEditing: {
    type: Boolean,
    required: true
  },
  // Aqui vamos passar as variáveis do composable para preencher o formulário
  // quando estiver em modo de edição. O App.vue vai passar esses valores.
  initialDescription: { type: String, default: '' },
  initialAmount: { type: Number, default: 0 },
  initialType: { type: String, default: 'income' },
  initialCategory: { type: String, default: '' }
});

// Define os eventos (emits) que este componente pode emitir
const emit = defineEmits(['submit-transaction']);

// Variáveis locais para o formulário dentro deste componente
const description = ref(props.initialDescription);
const amount = ref(props.initialAmount);
const type = ref(props.initialType);
const category = ref(props.initialCategory);

// Array de categorias para despesas
const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];

// Observar mudanças nas props iniciais para atualizar o formulário
// Isso é crucial para quando o usuário clica em "Editar" e os dados vêm do pai
watch(() => props.initialDescription, (newVal) => description.value = newVal);
watch(() => props.initialAmount, (newVal) => amount.value = newVal);
watch(() => props.initialType, (newVal) => type.value = newVal);
watch(() => props.initialCategory, (newVal) => category.value = newVal);

// Função para lidar com a submissão do formulário
const handleSubmit = () => {
  // Emite um evento 'submit-transaction' para o componente pai (App.vue)
  // Passa os valores atuais do formulário como um objeto
  emit('submit-transaction', {
    desc: description.value,
    val: amount.value,
    transType: type.value,
    cat: category.value
  });

  // Limpa o formulário após emitir (a lógica de limpeza está no composable)
  // No modo de edição, o composable já faz o reset.
  // No modo de adição, precisamos limpar aqui, mas o composable também faz.
  // Manter aqui garante que o UI seja resetado visualmente de imediato.
  if (!props.isEditing) { // Só limpa se for uma nova adição
      description.value = '';
      amount.value = 0;
      type.value = 'income';
      category.value = '';
  }
};

// Função para alternar o tipo de transação e limpar/setar categoria
const setTransactionType = (newType) => {
  type.value = newType;
  category.value = newType === 'expense' ? '' : 'Receita';
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

      <div class="input-group transaction-type">
        <label>Tipo:</label>
        <button type="button" :class="{ active: type === 'income' }" @click="setTransactionType('income')">Receita</button>
        <button type="button" :class="{ active: type === 'expense' }" @click="setTransactionType('expense')">Despesa</button>
      </div>

      <div class="input-group" v-if="type === 'expense'">
        <label for="category">Categoria (Despesa):</label>
        <select id="category" v-model="category">
          <option value="" disabled>Selecione uma categoria</option>
          <option v-for="cat in expenseCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <button type="submit">{{ props.isEditing ? 'Atualizar Transação' : 'Adicionar Transação' }}</button>
    </form>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente - Copie da seção .transaction-form do App.vue */
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

/* Media Queries para responsividade - ajustar apenas para este componente se necessário */
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