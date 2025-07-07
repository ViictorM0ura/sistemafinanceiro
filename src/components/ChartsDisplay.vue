<script setup>
// FINALIDADE: Componente responsável por exibir os gráficos de dados financeiros.
// Ele acessa os dados de transações filtradas e os dados dos gráficos diretamente do composable,
// e calcula as condições para exibir ou não os gráficos.

import { computed, defineProps, watch } from 'vue'; // Adicionado 'watch'
import { Bar, Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

import { useTransactions } from '../composables/useTransactions'; // Mantido para demonstrar que não é usado

// Registrar os componentes e plugins do Chart.js que vamos usar
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// ============================================================================
// PROPRIEDADES (PROPS)
// ============================================================================

// Define as propriedades que este componente `ChartsDisplay` espera receber do seu pai (App.vue).
const props = defineProps({
  expenseData: {    // Dados para o gráfico de pizza de despesas
    type: Object,
    required: true
  },
  barData: {        // Dados para o gráfico de barras de receitas vs. despesas
    type: Object,
    required: true
  },
  hasExpenses: {    // Booleano: true se houver despesas para o gráfico de pizza
    type: Boolean,
    default: false
  },
  hasTransactions: { // Booleano: true se houver transações para o gráfico de barras
    type: Boolean,
    default: false
  }
});

// ============================================================================
// DIAGNÓSTICO: Verificando a Reatividade das Props
// ============================================================================

// Observa a prop `expenseData` para ver se ela está sendo atualizada neste componente.
watch(() => props.expenseData, (newVal) => {
  console.log('ChartsDisplay: expenseData ATUALIZADO NESTE COMPONENTE!', newVal);
}, { deep: true }); // `deep: true` para observar mudanças internas no objeto de dados.

// Observa a prop `barData` para ver se ela está sendo atualizada neste componente.
watch(() => props.barData, (newVal) => {
  console.log('ChartsDisplay: barData ATUALIZADO NESTE COMPONENTE!', newVal);
}, { deep: true }); // `deep: true` para observar mudanças internas no objeto de dados.

// ============================================================================
// OPÇÕES DE GRÁFICO (CONFIGURAÇÕES VISUAIS)
// ============================================================================

// Opções de gráfico para o gráfico de pizza
const expenseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      text: 'Despesas por Categoria',
    },
  },
  animation: false
};

// Opções de gráfico para o gráfico de barras
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Receitas vs. Despesas',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    }
  },
  animation: false
};
</script>

<template>
  <div class="charts-section">
    <div class="chart-container">
      <Pie v-if="props.hasExpenses" :data="props.expenseData" :options="expenseChartOptions" />
      <p v-else>Adicione despesas para ver o gráfico por categoria.</p>
    </div>
    <div class="chart-container">
      <Bar v-if="props.hasTransactions" :data="props.barData" :options="barChartOptions" />
      <p v-else>Adicione transações para ver o gráfico de receitas vs. despesas.</p>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   ESTILOS ESPECÍFICOS DO COMPONENTE CHARTSDISPLAY
   ============================================================================ */

/* Estilos para a seção que contém ambos os gráficos. */
.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Estilos para o container individual de cada gráfico. */
.chart-container {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.chart-container p {
  color: #777;
  font-style: italic;
}

/* ============================================================================
   MEDIA QUERIES (RESPONSIVIDADE ESPECÍFICA DO COMPONENTE)
   ============================================================================ */

/* Para telas de até 600px (celulares): Ajusta o padding dos gráficos. */
@media (max-width: 600px) {
    .chart-container {
        padding: 10px;
    }
}
</style>