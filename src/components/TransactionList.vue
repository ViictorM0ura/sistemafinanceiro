<script setup>
import { defineProps, defineEmits } from 'vue';

// Define as propriedades (props) que este componente pode receber
const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
});

// Define os eventos (emits) que este componente pode emitir
const emit = defineEmits(['edit-transaction', 'delete-transaction']);

// Função local para emitir o evento de edição
const handleEdit = (transaction) => {
  emit('edit-transaction', transaction);
};

// Função local para emitir o evento de exclusão
const handleDelete = (id) => {
  emit('delete-transaction', id);
};
</script>

<template>
  <div class="transactions-list">
    <h3>Histórico de Transações</h3>
    <ul>
      <li v-if="props.transactions.length === 0">Nenhuma transação adicionada ainda.</li>
      <li v-for="transaction in props.transactions" :key="transaction.id" :class="transaction.type">
        <div class="transaction-details">
          <span>{{ transaction.description }}</span>
          <span class="category-display">{{ transaction.type === 'expense' ? `(${transaction.category})` : '' }}</span>
          <span>R$ {{ transaction.amount.toFixed(2) }}</span>
        </div>
        <div class="transaction-actions">
          <button @click="handleEdit(transaction)" class="edit-btn">Editar</button>
          <button @click="handleDelete(transaction.id)" class="delete-btn">Excluir</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente - Copie da seção .transactions-list do App.vue */
.transactions-list h3 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.8em;
}

.transactions-list ul {
  list-style: none;
  padding: 0;
}

.transactions-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  font-size: 1em;
  flex-wrap: wrap;
  gap: 5px;
}

.transactions-list li:last-child {
  border-bottom: none;
}

.transactions-list .transaction-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
}

.transactions-list .transaction-details span {
  width: 100%;
}

.transactions-list .category-display {
  font-size: 0.9em;
  color: #888;
  margin-top: 2px;
}

.transactions-list .transaction-actions {
  display: flex;
  gap: 8px;
  margin-left: 10px;
  flex-shrink: 0;
}

.transactions-list .transaction-actions button {
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background-color 0.3s ease;
}

.transactions-list .edit-btn {
  background-color: #3498db;
  color: white;
  border: none;
}

.transactions-list .edit-btn:hover {
  background-color: #2980b9;
}

.transactions-list .delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.transactions-list .delete-btn:hover {
  background-color: #c0392b;
}

.transactions-list .expense {
  color: #e74c3c;
  font-weight: bold;
}

.transactions-list .income {
  color: #2ecc71;
  font-weight: bold;
}

/* Media Queries para responsividade - ajustar apenas para este componente se necessário */
@media (max-width: 900px) {
    .transactions-list h3 {
        font-size: 1.6em;
    }
}

@media (max-width: 600px) {
    .transactions-list h3 {
        font-size: 1.2em;
    }
    .transactions-list li {
        font-size: 0.85em;
        padding: 8px 0;
        flex-direction: column; /* Empilha os detalhes e ações */
        align-items: flex-start; /* Alinha tudo à esquerda */
    }
    .transactions-list .transaction-details {
        margin-bottom: 10px; /* Espaço entre detalhes e ações */
    }
    .transactions-list .transaction-actions {
        width: 100%; /* Botões de ação ocupam a largura total */
        justify-content: flex-end; /* Alinha botões à direita */
    }
}
@media (max-width: 400px) {
    .transactions-list li span:last-child {
        text-align: right;
        min-width: fit-content;
    }
}
</style>