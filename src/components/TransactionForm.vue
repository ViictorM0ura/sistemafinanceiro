<script setup>
// Componente do formulário para adicionar ou editar transações.
// Gerencia a entrada de dados do usuário e interage com o composable useTransactions.

import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { useTransactions } from '../composables/useTransactions';

const props = defineProps({
  isEditing: { type: Boolean, required: true },
  initialDescription: { type: String, default: '' },
  initialAmount: { type: Number, default: 0 },
  initialType: { type: String, default: 'income' },
  initialCategory: { type: String, default: '' },
  initialDate: { type: String, default: '' },
  initialItemDescription: { type: String, default: '' },
  initialExpenseType: { type: String, default: '' },
  initialPaymentMethod: { type: String, default: '' },
});

const emit = defineEmits(['submit-transaction']);

const {
  expenseCategories,
  incomeCategories,
  paymentMethods,
  addCustomCategory,
  removeCustomCategory,
} = useTransactions();

const description = ref(props.initialDescription);
const amount = ref(props.initialAmount);
const type = ref(props.initialType);
const category = ref(props.initialCategory);
const itemDescription = ref(props.initialItemDescription);
const expenseType = ref(props.initialExpenseType);
const paymentMethod = ref(props.initialPaymentMethod);

const today = new Date().toISOString().split('T')[0];
const date = ref(props.initialDate || today);

const newCategoryInput = ref('');
const selectedCategoryToRemove = ref('');

watch(() => props.initialDescription, (newVal) => description.value = newVal);
watch(() => props.initialAmount, (newVal) => amount.value = newVal);
watch(() => props.initialType, (newVal) => type.value = newVal);
watch(() => props.initialCategory, (newVal) => category.value = newVal);
watch(() => props.initialDate, (newVal) => date.value = newVal || today);
watch(() => props.initialItemDescription, (newVal) => itemDescription.value = newVal);
watch(() => props.initialExpenseType, (newVal) => expenseType.value = newVal);
watch(() => props.initialPaymentMethod, (newVal) => paymentMethod.value = newVal);

const currentCategories = computed(() => {
  return type.value === 'expense' ? expenseCategories.value : incomeCategories.value;
});

const handleSubmit = () => {
  emit('submit-transaction', {
    desc: description.value,
    val: amount.value,
    transType: type.value,
    cat: category.value,
    dateStr: date.value,
    itemDesc: itemDescription.value,
    expType: expenseType.value,
    payMethod: paymentMethod.value,
  });

  description.value = '';
  amount.value = 0;
  type.value = 'income';
  category.value = '';
  date.value = today;
  itemDescription.value = '';
  expenseType.value = '';
  paymentMethod.value = '';
};

const setTransactionType = (newType) => {
  type.value = newType;
  category.value = '';
  expenseType.value = '';
  paymentMethod.value = '';
  selectedCategoryToRemove.value = '';
};

const handleAddCategory = () => {
  if (newCategoryInput.value.trim()) {
    addCustomCategory(newCategoryInput.value, type.value);
    newCategoryInput.value = '';
  } else {
    alert('Por favor, digite um nome para a nova categoria.');
  }
};

const handleRemoveCategory = () => {
  if (selectedCategoryToRemove.value) {
    removeCustomCategory(selectedCategoryToRemove.value, type.value);
    selectedCategoryToRemove.value = '';
  } else {
    alert('Por favor, selecione uma categoria para remover.');
  }
};

</script>

<template>
  <div class="transaction-form">
    <h3>{{ props.isEditing ? 'Editar Transação' : 'Adicionar Nova Transação' }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <label for="description">Nome do Item/Produto:</label>
        <input type="text" id="description" v-model="description" placeholder="Ex: Conta de Luz, Salário Mensal" />
      </div>

      <div class="input-group">
        <label for="itemDescription">Descrição Detalhada:</label>
        <textarea id="itemDescription" v-model="itemDescription" placeholder="Detalhes adicionais da transação, como item comprado, serviço prestado, etc."></textarea>
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

      <div class="input-group add-category-group">
        <label for="newCategory">Adicionar Nova Categoria:</label>
        <div class="add-category-input-btn">
          <input type="text" id="newCategory" v-model="newCategoryInput" placeholder="Ex: Viagem, Bônus" />
          <button type="button" @click="handleAddCategory" class="add-category-btn">Adicionar</button>
        </div>
      </div>

      <div class="input-group remove-category-group">
        <label for="removeCategorySelect">Remover Categoria Personalizada:</label>
        <div class="remove-category-select-btn">
          <select id="removeCategorySelect" v-model="selectedCategoryToRemove">
            <option value="" disabled>Selecione a categoria para remover</option>
            <option v-for="cat in currentCategories.filter(c => !['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros', 'Salário', 'Investimentos', 'Freelance', 'Presente', 'Outras Receitas'].includes(c))" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
          <button type="button" @click="handleRemoveCategory" class="remove-category-btn">Remover</button>
        </div>
      </div>

      <div class="input-group" v-if="type === 'expense'">
        <label for="expenseType">Tipo de Despesa:</label>
        <select id="expenseType" v-model="expenseType">
          <option value="" disabled>Selecione o tipo</option>
          <option value="fixa">Fixa</option>
          <option value="variavel">Variável</option>
        </select>
      </div>

      <div class="input-group" v-if="type === 'expense'">
        <label for="paymentMethod">Forma de Pagamento:</label>
        <select id="paymentMethod" v-model="paymentMethod">
          <option value="" disabled>Selecione a forma de pagamento</option>
          <option v-for="method in paymentMethods" :key="method" :value="method">
            {{ method }}
          </option>
        </select>
      </div>

      <button type="submit">{{ props.isEditing ? 'Atualizar Transação' : 'Adicionar Transação' }}</button>
    </form>
  </div>
</template>

<style scoped>
/* Estilos específicos do componente */
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
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}

.input-group textarea {
    resize: vertical;
    min-height: 60px;
    line-height: 1.5;
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

.add-category-group .add-category-input-btn,
.remove-category-group .remove-category-select-btn {
  display: flex;
  gap: 10px;
}

.add-category-group input,
.remove-category-group select {
  flex-grow: 1;
}

.add-category-btn,
.remove-category-btn {
  background-color: #3498db;
  color: white;
  padding: 12px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.remove-category-btn {
  background-color: #e74c3c;
}

.remove-category-btn:hover {
  background-color: #c0392b;
}

/* Media Queries */
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
    .input-group input, .input-group select,
    .input-group textarea,
    .transaction-type button, form button[type="submit"],
    .add-category-btn, .remove-category-btn {
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
    .add-category-group .add-category-input-btn,
    .remove-category-group .remove-category-select-btn {
      flex-direction: column;
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