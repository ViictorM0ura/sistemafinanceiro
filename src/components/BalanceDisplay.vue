<script setup>
// Componente para exibir o saldo total, total de receitas e total de despesas.

import { defineProps } from 'vue';

const props = defineProps({
  balance: { type: Number, required: true },
  totalIncome: { type: Number, required: true },
  totalExpenses: { type: Number, required: true }
});
</script>

<template>
  <div class="balance-container card">
    <div class="balance-item income">
      <span class="label">Receitas:</span>
      <span class="value">R$ {{ props.totalIncome.toFixed(2) }}</span>
    </div>
    <div class="balance-item expense">
      <span class="label">Despesas:</span>
      <span class="value">R$ {{ props.totalExpenses.toFixed(2) }}</span>
    </div>
    <div class="balance-item total">
      <span class="label">Saldo Líquido:</span>
      <span class="value" :class="props.balance < 0 ? 'negative-balance' : 'positive-balance'">
        R$ {{ props.balance.toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos do componente */
.balance-container {
  background-color: #e0f2f7;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  /* Garante que o container não force scroll externo */
  overflow: hidden; /* Mantido, deve esconder o que está fora */
  position: relative;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Alinha verticalmente os itens */
  padding: 5px 0;
  border-bottom: 1px dashed #c0e0e8;
  /* NOVO: Adiciona overflow hidden para o próprio item, garantindo o corte */
  overflow: hidden;
}

.balance-item:last-child {
  border-bottom: none;
  padding-top: 10px;
}

.balance-item .label, /* Estilo para os labels como "Receitas:", "Despesas:", "Saldo Líquido:" */
.balance-item .value { /* Estilo para os valores como "R$ 130.00" */
  font-size: 1.1em;
  color: #2c3e50;
  white-space: nowrap; /* IMPEDE QUEBRA DE LINHA para o texto */
  flex-shrink: 1; /* NOVO: PERMITE que o texto encolha (mas sem quebrar, por nowrap) */
  min-width: 0; /* NOVO: Permite que o flex item encolha para 0, se necessário */
  box-sizing: border-box; /* Garante que padding/border não causem overflow */
}

.balance-item .label {
  margin-right: 10px; /* Pequeno espaçamento entre label e valor */
  font-weight: bold; /* Manter negrito para o label */
  text-align: left; /* Garante alinhamento esquerdo para o label */
}

.balance-item .value {
  font-weight: bold;
  text-align: right; /* Garante que o valor se alinhe à direita */
}

.balance-item.income .value {
  color: #2ecc71;
}

.balance-item.expense .value {
  color: #e74c3c;
}

/* Estilos específicos para o Saldo Líquido */
.balance-item.total .label {
  font-size: 1.4em;
  font-weight: bold; /* Manter negrito para "Saldo Líquido:" */
}

.balance-item.total .value {
  font-size: 1.6em;
  font-weight: bold;
}

.balance-item.total .positive-balance {
  color: #2ecc71;
}

.balance-item.total .negative-balance {
  color: #e74c3c;
}

/* Media Queries */
@media (max-width: 900px) {
  .balance-item .label, .balance-item .value {
    font-size: 1em;
  }
  .balance-item.total .label {
    font-size: 1.2em;
  }
  .balance-item.total .value {
    font-size: 1.4em;
  }
  .balance-container {
    padding: 18px;
  }
}

@media (max-width: 600px) {
  .balance-item .label, .balance-item .value {
    font-size: 0.9em;
  }
  .balance-item.total .label {
    font-size: 1.1em;
  }
  .balance-item.total .value {
    font-size: 1.3em;
  }
  .balance-container {
    padding: 15px;
  }
  /* Para telas muito pequenas, empilhar se necessário */
  .balance-item {
    flex-wrap: wrap; /* Permite que label e valor quebrem linha SE o espaço for crítico */
    justify-content: flex-start; /* Alinha ao início quando empilha */
  }
  .balance-item .label {
    width: 100%; /* Força o label a ocupar a linha inteira quando quebra */
    margin-bottom: 3px;
  }
  .balance-item .value {
    width: 100%; /* Força o valor a ocupar a linha inteira quando quebra */
    text-align: left; /* Alinha o valor à esquerda quando quebra */
  }
}
</style>