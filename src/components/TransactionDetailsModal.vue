<script setup>
// Componente de modal para exibir todos os detalhes de uma transação.
// Recebe o objeto da transação como uma propriedade e emite um evento para fechar o modal.

import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const formatDetailDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  if (isNaN(localDate.getTime())) return 'N/A';
  return localDate.toLocaleDateString('pt-BR');
};

const getDisplayValue = (value) => {
  return value ? value : 'N/A';
};

const handleCloseModal = () => {
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="handleCloseModal">
    <div class="modal-content">
      <h2>Detalhes da Transação</h2>
      <div class="detail-item">
        <strong>Nome do Item/Produto:</strong> <span>{{ getDisplayValue(props.transaction.description) }}</span>
      </div>
      <div class="detail-item">
        <strong>Descrição Detalhada:</strong> <span>{{ getDisplayValue(props.transaction.itemDescription) }}</span>
      </div>
      <div class="detail-item">
        <strong>Valor:</strong> <span>R$ {{ getDisplayValue(props.transaction.amount?.toFixed(2)) }}</span>
      </div>
      <div class="detail-item">
        <strong>Tipo:</strong> <span :class="props.transaction.type === 'income' ? 'income-text' : 'expense-text'">
          {{ props.transaction.type === 'income' ? 'Receita' : 'Despesa' }}
        </span>
      </div>
      <div class="detail-item">
        <strong>Categoria:</strong> <span>{{ getDisplayValue(props.transaction.category) }}</span>
      </div>
      <div class="detail-item" v-if="props.transaction.type === 'expense'">
        <strong>Tipo de Despesa:</strong> <span>{{ getDisplayValue(props.transaction.expenseType) }}</span>
      </div>
      <div class="detail-item" v-if="props.transaction.type === 'expense'">
        <strong>Forma de Pagamento:</strong> <span>{{ getDisplayValue(props.transaction.paymentMethod) }}</span>
      </div>
      <div class="detail-item">
        <strong>Data:</strong> <span>{{ formatDetailDate(props.transaction.date) }}</span>
      </div>
      <div class="detail-item">
        <strong>ID da Transação:</strong> <span>{{ getDisplayValue(props.transaction.id) }}</span>
      </div>
      
      <button class="close-button" @click="handleCloseModal">Fechar</button>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-content h2 {
  text-align: center;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 15px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 8px;
}

.detail-item:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-item strong {
  color: #555;
  font-weight: 600;
  margin-right: 15px;
  flex-shrink: 0;
}

.detail-item span {
  color: #2c3e50;
  flex-grow: 1;
  text-align: right;
  word-break: break-word;
}

.close-button {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  width: 100%;
  margin-top: 25px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #d32f2f;
}

.income-text {
  color: #2ecc71;
  font-weight: bold;
}

.expense-text {
  color: #e74c3c;
  font-weight: bold;
}

/* Media Queries */
@media (max-width: 600px) {
  .modal-content {
    padding: 20px;
    width: 95%;
  }
  .modal-content h2 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .detail-item strong {
    margin-bottom: 5px;
    margin-right: 0;
    width: 100%;
  }
  .detail-item span {
    text-align: left;
    width: 100%;
  }
}
</style>