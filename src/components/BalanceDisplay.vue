<script setup>
// FINALIDADE: Componente responsável por exibir o saldo total, total de receitas e total de despesas.
// Ele recebe esses valores como propriedades do componente pai (App.vue).

import { defineProps } from 'vue';

// ============================================================================
// PROPRIEDADES (PROPS)
// ============================================================================

// Define as propriedades que este componente `BalanceDisplay` espera receber.
const props = defineProps({
  balance: {     // Saldo líquido (Total Receitas - Total Despesas)
    type: Number,
    required: true
  },
  totalIncome: { // Total de todas as receitas no período filtrado
    type: Number,
    required: true
  },
  totalExpenses: { // Total de todas as despesas no período filtrado
    type: Number,
    required: true
  }
});
</script>

<template>
  <div class="balance-container">
    <div class="balance-item income">
      <span>Receitas:</span>
      <span>R$ {{ props.totalIncome.toFixed(2) }}</span>
    </div>
    <div class="balance-item expense">
      <span>Despesas:</span>
      <span>R$ {{ props.totalExpenses.toFixed(2) }}</span>
    </div>
    <div class="balance-item total">
      <h2>Saldo Líquido:</h2>
      <h2 :class="props.balance < 0 ? 'negative-balance' : 'positive-balance'">
        R$ {{ props.balance.toFixed(2) }}
      </h2>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   ESTILOS ESPECÍFICOS DO COMPONENTE BALANCEDISPLAY
   ============================================================================ */
.balance-container {
  background-color: #e0f2f7;
  padding: 20px;
  border-radius: 8px;
  display: flex; /* Usa flexbox para alinhar itens */
  flex-direction: column; /* Empilha os itens verticalmente */
  gap: 10px; /* Espaçamento entre os itens de balanço */
  text-align: left; /* Alinha o texto dentro do container */
}

.balance-item {
  display: flex;
  justify-content: space-between; /* Espaça o label e o valor */
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px dashed #c0e0e8; /* Linha divisória suave */
}

.balance-item:last-child {
  border-bottom: none; /* Remove a linha do último item */
  padding-top: 10px;
}

.balance-item span {
  font-size: 1.1em;
  color: #2c3e50;
}

.balance-item.income span {
  color: #2ecc71; /* Verde para receitas */
  font-weight: bold;
}

.balance-item.expense span {
  color: #e74c3c; /* Vermelho para despesas */
  font-weight: bold;
}

.balance-item.total h2 {
  margin: 0;
  font-size: 1.6em; /* Tamanho maior para o título Saldo Líquido */
}

.balance-item.total .positive-balance {
  color: #2ecc71; /* Verde */
}

.balance-item.total .negative-balance {
  color: #e74c3c; /* Vermelho */
}

/* ============================================================================
   MEDIA QUERIES (RESPONSIVIDADE ESPECÍFICA DO COMPONENTE)
   ============================================================================ */
@media (max-width: 900px) {
  .balance-item span, .balance-item.total h2 {
    font-size: 1em; /* Reduz um pouco o tamanho da fonte em tablets */
  }
  .balance-item.total h2 {
    font-size: 1.4em;
  }
  .balance-container {
    padding: 18px;
  }
}

@media (max-width: 600px) {
  .balance-item span, .balance-item.total h2 {
    font-size: 0.9em; /* Reduz ainda mais em celulares */
  }
  .balance-item.total h2 {
    font-size: 1.2em;
  }
  .balance-container {
    padding: 15px;
  }
}
</style>