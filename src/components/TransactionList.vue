<script setup>
// FINALIDADE: Componente responsável por exibir a lista de transações financeiras e os controles de filtro.
// Ele interage diretamente com o composable para obter dados filtrados e gerenciar a interface do filtro.

import { defineProps, defineEmits, ref, watch } from 'vue';
import { useTransactions } from '../composables/useTransactions';

// ============================================================================
// PROPRIEDADES (PROPS)
// ============================================================================

// Define as propriedades que este componente `TransactionList` espera receber do seu pai (App.vue).
const props = defineProps({
  transactions: { // Lista COMPLETA de transações (para msg de "Nenhuma transação adicionada")
    type: Array,
    required: true
  },
  filteredTransactions: { // Lista de transações JÁ FILTRADAS
    type: Array,
    required: true
  },
  filterType: { // Tipo de filtro selecionado
    type: String,
    required: true
  },
  filterValue: { // Valor do filtro
    type: String,
    required: true
  },
  updateFilter: { // Função para atualizar o filtro
    type: Function,
    required: true
  }
});

// ============================================================================
// EVENTOS (EMITS)
// ============================================================================

// Define os eventos que este componente pode emitir para o seu componente pai (`App.vue`).
const emit = defineEmits([
  'edit-transaction',
  'delete-transaction',
  'show-details' // NOVO: Evento para mostrar detalhes da transação.
]);

// ============================================================================
// LÓGICA DE DADOS (USO DO COMPOSABLE)
// ============================================================================

// Acessa as variáveis e funções de filtro do composable `useTransactions`.
const {
  transactions: allTransactionsFromComposble, // Para o v-if inicial
  filteredTransactions: filteredTransactionsFromComposble,
  filterType: filterTypeFromComposble,
  filterValue: filterValueFromComposble,
  updateFilter: updateFilterFromComposble
} = useTransactions();

// Variável local para obter a data atual no formato YYYY-MM-DD.
const today = new Date().toISOString().split('T')[0];
console.log('TransactionList: Valor de today calculado:', today); // DIAGNÓSTICO

// Variável reativa local para o input de data no filtro.
const currentFilterDate = ref(props.filterValue || today);

// ============================================================================
// FUNÇÕES DE MANUSEIO DE EVENTOS E FORMATAÇÃO
// ============================================================================

/**
 * Lida com o clique no botão "Editar" de uma transação.
 * @param {object} transaction - O objeto da transação a ser editada.
 */
const handleEdit = (transaction) => {
  emit('edit-transaction', transaction);
};

/**
 * Lida com o clique no botão "Excluir" de uma transação.
 * @param {number} id - O ID da transação a ser excluída.
 */
const handleDelete = (id) => {
  emit('delete-transaction', id);
};

/**
 * Lida com o clique no botão "Detalhes" de uma transação.
 * @param {object} transaction - O objeto da transação a ser exibida em detalhes.
 */
const handleShowDetails = (transaction) => {
  emit('show-details', transaction);
};

/**
 * Formata uma string de data (YYYY-MM-DD) para o formato local (DD/MM/AAAA),
 * garantindo que o fuso horário seja respeitado e evite o "deslocamento de dia".
 * @param {string} dateString - A string de data no formato 'YYYY-MM-DD'.
 * @returns {string} A data formatada ou 'Data Inválida'.
 */
const formatTransactionDate = (dateString) => {
  if (!dateString) {
    return 'Data Inválida';
  }
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  if (isNaN(localDate.getTime())) {
    return 'Data Inválida';
  }
  return localDate.toLocaleDateString('pt-BR');
};

/**
 * Lida com a mudança no tipo de filtro selecionado (Dia, Mês, Ano, Nenhum).
 * Define um valor padrão para o `filterValue` e atualiza o filtro no composable.
 * @param {Event} event - O evento de mudança do select.
 */
const handleFilterTypeChange = (event) => {
  const newType = event.target.value;
  let newFilterValue = '';
  if (newType === 'day') {
    newFilterValue = today;
  } else if (newType === 'month') {
    newFilterValue = today.substring(0, 7);
  } else if (newType === 'year') {
    newFilterValue = today.substring(0, 4);
  }
  props.updateFilter(newType, newFilterValue);
  currentFilterDate.value = newFilterValue;
};

/**
 * Lida com a mudança no valor do filtro (data, mês, ano).
 * Chama a função `updateFilter` recebida via props.
 * @param {Event} event - O evento de mudança do input.
 */
const handleFilterValueChange = (event) => {
  props.updateFilter(props.filterType, event.target.value);
};

// ============================================================================
// DIAGNÓSTICO: Observando `filteredTransactions` (para confirmar reatividade)
// ============================================================================

// Observa a prop `filteredTransactions` para confirmar se está atualizando neste componente.
watch(() => props.filteredTransactions, (newVal) => {
  console.log('TransactionList: filteredTransactions ATUALIZADO NESTE COMPONENTE!', newVal);
}, { deep: true });
</script>

<template>
  <div class="transactions-list">
    <h3>Histórico de Transações</h3>

    <div class="filter-controls">
      <div class="input-group">
        <label for="filterType">Filtrar por:</label>
        <select id="filterType" :value="props.filterType" @change="handleFilterTypeChange">
          <option value="none">Nenhum</option>
          <option value="day">Dia</option>
          <option value="month">Mês</option>
          <option value="year">Ano</option>
        </select>
      </div>

      <div class="input-group" v-if="props.filterType !== 'none'">
        <label for="filterValue">Valor:</label>
        <input
          v-if="props.filterType === 'day'"
          type="date"
          id="filterValue"
          :value="props.filterValue"
          @change="handleFilterValueChange"
        />
        <input
          v-else-if="props.filterType === 'month'"
          type="month"
          id="filterValue"
          :value="props.filterValue"
          @change="handleFilterValueChange"
        />
        <input
          v-else-if="props.filterType === 'year'"
          type="number"
          id="filterValue"
          :value="props.filterValue"
          placeholder="Ex: 2023"
          @change="handleFilterValueChange"
        />
        <input
          v-else
          type="text"
          id="filterValue"
          :value="props.filterValue"
          disabled
          placeholder="Selecione um tipo de filtro"
        />
      </div>
    </div>
    <ul>
      <li v-if="props.filteredTransactions.length === 0">
        {{ props.transactions.length === 0 ? 'Nenhuma transação adicionada ainda.' : 'Nenhuma transação encontrada para o filtro atual.' }}
      </li>
      
      <li v-else v-for="transaction in props.filteredTransactions" :key="transaction.id" :class="transaction.type">
        <div class="transaction-info">
          <span class="info-description">{{ transaction.description }}</span>
          <span class="info-category">{{ transaction.category ? `(${transaction.category})` : '' }}</span>
          <span class="info-amount">R$ {{ transaction.amount.toFixed(2) }}</span>
          <span class="info-date">
            {{ formatTransactionDate(transaction.date) }}
          </span>
        </div>
        <div class="transaction-actions">
          <button @click="handleShowDetails(transaction)" class="details-btn">Detalhes</button>
          <button @click="handleEdit(transaction)" class="edit-btn">Editar</button>
          <button @click="handleDelete(transaction.id)" class="delete-btn">Excluir</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* ============================================================================
   ESTILOS ESPECÍFICOS DO COMPONENTE TRANSACTIONLIST
   ============================================================================ */

/* Estilos para o título da seção de histórico. */
.transactions-list h3 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.8em;
}

/* Estilos para os controles de filtro */
.filter-controls {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.filter-controls .input-group {
    margin-bottom: 10px;
}

/* Estilos para o input-group, labels, inputs e selects (reutilizados do TransactionForm) */
.filter-controls .input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}
.filter-controls .input-group select,
.filter-controls .input-group input[type="date"],
.filter-controls .input-group input[type="month"],
.filter-controls .input-group input[type="number"],
.filter-controls .input-group input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
}

/* Estilos para a lista não ordenada de transações. */
.transactions-list ul {
  list-style: none;
  padding: 0;
}

/* Estilos para cada item da lista de transações (a linha inteira) */
.transactions-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  font-size: 1em;
  flex-wrap: wrap;
  gap: 10px;
}

.transactions-list li:last-child {
  border-bottom: none;
}

/* Estilos para o container das informações da transação (desc, cat, valor, data) */
.transactions-list .transaction-info {
  display: flex;
  align-items: baseline;
  flex-grow: 1;
  gap: 10px;
  flex-wrap: wrap;
}

/* Estilos individuais para as partes da informação da transação */
.transactions-list .info-description {
  font-weight: bold;
  color: #2c3e50;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.transactions-list .info-category {
  font-size: 0.9em;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
}

.transactions-list .info-amount {
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
}

.transactions-list .info-date {
  font-size: 0.8em;
  color: #777;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Estilos para o container dos botões de ação (Detalhes, Editar, Excluir) */
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

/* Estilos específicos para o botão de detalhes. */
.transactions-list .details-btn {
  background-color: #6c757d; /* Cinza */
  color: white;
  border: none;
}

.transactions-list .details-btn:hover {
  background-color: #5a6268;
}

/* Estilos específicos para o botão de editar. */
.transactions-list .edit-btn {
  background-color: #3498db;
  color: white;
  border: none;
}

.transactions-list .edit-btn:hover {
  background-color: #2980b9;
}

/* Estilos específicos para o botão de excluir. */
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

/* Estilo para a data da transação */
.transactions-list .transaction-date {
  font-size: 0.8em;
  color: #777;
  margin-top: 5px;
}


/* ============================================================================
   MEDIA QUERIES (RESPONSIVIDADE ESPECÍFICA DO COMPONENTE)
   ============================================================================ */

/* Para telas de até 900px (tablets): Ajusta o tamanho do título. */
@media (max-width: 900px) {
    .transactions-list h3 {
        font-size: 1.6em;
    }
}

/* Para telas de até 600px (celulares):
   Ajustes para empilhar os elementos da lista e otimizar o espaçamento. */
@media (max-width: 600px) {
    .transactions-list h3 {
        font-size: 1.2em;
    }
    .transactions-list li {
        flex-direction: column;
        align-items: flex-start;
    }
    .transactions-list .transaction-info {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 10px;
    }
    .transactions-list .transaction-actions {
        width: 100%;
        justify-content: flex-end;
    }

    /* Ajustes específicos para os spans dentro de info-description */
    .transactions-list .info-description,
    .transactions-list .info-category,
    .transactions-list .info-amount,
    .transactions-list .info-date {
        white-space: normal;
        text-overflow: clip;
        overflow: visible;
        max-width: 100%;
        flex-grow: 0;
        width: 100%;
        margin-bottom: 5px;
    }
    .transactions-list .info-date {
        margin-bottom: 0;
    }
    /* Garante que os controles de filtro ocupem 100% da largura e empilhem. */
    .filter-controls {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* Ajuste para inputs dentro dos controles de filtro em mobile */
    .filter-controls .input-group {
        width: 100%;
        margin-bottom: 0;
    }
}

/* Para telas de até 400px (celulares muito pequenos): */
@media (max-width: 400px) {
    /* Não há ajustes adicionais significativos aqui para este componente além dos 600px */
}
</style>