<script setup>
// FINALIDADE: Componente de modal para exibir todos os detalhes de uma transação.
// Recebe o objeto da transação como uma propriedade e emite um evento para fechar o modal.

import { defineProps, defineEmits, computed } from 'vue';

// ============================================================================
// PROPRIEDADES (PROPS)
// ============================================================================

// Propriedade `transaction`: o objeto da transação cujos detalhes serão exibidos.
const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
});

// ============================================================================
// EVENTOS (EMITS)
// ============================================================================

// Define o evento `close` que este componente pode emitir para o pai, para fechar o modal.
const emit = defineEmits(['close']);

// ============================================================================
// FUNÇÕES DE FORMATAÇÃO E LÓGICA
// ============================================================================

/**
 * Formata uma string de data (YYYY-MM-DD) para o formato local (DD/MM/AAAA).
 * @param {string} dateString - A string de data no formato 'YYYY-MM-DD'.
 * @returns {string} A data formatada ou 'N/A' se a string for inválida.
 */
const formatDetailDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  if (isNaN(localDate.getTime())) return 'N/A';
  return localDate.toLocaleDateString('pt-BR');
};

/**
 * Retorna o valor de uma propriedade da transação ou 'N/A' se for vazio/nulo.
 * @param {*} value - O valor da propriedade.
 * @returns {string} O valor formatado ou 'N/A'.
 */
const getDisplayValue = (value) => {
  return value ? value : 'N/A';
};

// ============================================================================
// FUNÇÕES DE MANUSEIO DE EVENTOS
// ============================================================================

/**
 * Lida com o clique no botão de fechar o modal ou fora do conteúdo principal.
 * Emite o evento `close` para o componente pai.
 */
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
/* ============================================================================
   ESTILOS ESPECÍFICOS DO COMPONENTE TRANSACTIONDETAILSMODAL
   ============================================================================ */

/* Estilos para o overlay do modal (fundo escurecido que ocupa toda a tela) */
.modal-overlay {
  position: fixed; /* Fixa o modal na viewport */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Fundo semi-transparente */
  display: flex; /* Para centralizar o conteúdo do modal */
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Garante que o modal esteja acima de outros elementos */
  backdrop-filter: blur(5px); /* Efeito de desfoque no fundo */
}

/* Estilos para o conteúdo principal do modal */
.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  max-width: 500px; /* Largura máxima do modal */
  width: 90%; /* Ocupa 90% da largura disponível, mas não mais que max-width */
  max-height: 90vh; /* Altura máxima para caber na tela */
  overflow-y: auto; /* Adiciona scroll se o conteúdo for muito longo */
  position: relative; /* Para posicionar o botão de fechar */
  animation: fadeIn 0.3s ease-out; /* Animação de entrada */
}

/* Animação para o modal */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos para o título do modal */
.modal-content h2 {
  text-align: center;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.8em;
}

/* Estilos para cada linha de detalhe (label: value) */
.detail-item {
  display: flex;
  justify-content: space-between; /* Espaça o label e o valor */
  align-items: baseline; /* Alinha pela linha de base para textos de tamanhos diferentes */
  margin-bottom: 15px;
  border-bottom: 1px dashed #eee; /* Linha divisória */
  padding-bottom: 8px;
}

.detail-item:last-of-type {
  border-bottom: none; /* Remove a linha do último item de detalhe */
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-item strong {
  color: #555;
  font-weight: 600;
  margin-right: 15px; /* Espaço entre label e valor */
  flex-shrink: 0; /* Impede o encolhimento do label */
}

.detail-item span {
  color: #2c3e50;
  flex-grow: 1; /* Permite que o valor ocupe o espaço restante */
  text-align: right; /* Alinha o valor à direita */
  word-break: break-word; /* Quebra palavras longas */
}

/* Estilos para o botão de fechar */
.close-button {
  background-color: #f44336; /* Vermelho */
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

/* Estilos de texto para tipo de transação */
.income-text {
  color: #2ecc71; /* Verde */
  font-weight: bold;
}

.expense-text {
  color: #e74c3c; /* Vermelho */
  font-weight: bold;
}

/* ============================================================================
   MEDIA QUERIES (RESPONSIVIDADE DO MODAL)
   ============================================================================ */
@media (max-width: 600px) {
  .modal-content {
    padding: 20px;
    width: 95%; /* Um pouco mais largo em celulares */
  }
  .modal-content h2 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }
  .detail-item {
    flex-direction: column; /* Empilha label e valor */
    align-items: flex-start;
    text-align: left;
  }
  .detail-item strong {
    margin-bottom: 5px; /* Espaço entre label e valor empilhado */
    margin-right: 0;
    width: 100%; /* Ocupa a largura total da linha */
  }
  .detail-item span {
    text-align: left; /* Alinha o valor à esquerda quando empilhado */
    width: 100%;
  }
}
</style>