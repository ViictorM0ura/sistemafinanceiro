<script setup>
// Componente para exibir os gráficos de dados financeiros.
// Ele recebe os dados de transações filtradas e os dados dos gráficos via props.

import { computed, defineProps, watch } from 'vue';
import { Bar, Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

// Registrar os componentes e plugins do Chart.js que vamos usar.
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const props = defineProps({
  expenseData: { type: Object, required: true },
  barData: { type: Object, required: true },
  expenseTypeDistributionData: { type: Object, required: true },
  paymentMethodDistributionData: { type: Object, required: true },
  categoryDistributionData: { type: Object, required: true },
  hasExpenses: { type: Boolean, default: false },
  hasTransactions: { type: Boolean, default: false },
  chartRenderKey: { type: Number, required: true }
});

// Diagnóstico: Observar props para reatividade (remover depois).
watch(() => props.expenseData, (newVal) => { console.log('ChartsDisplay: expenseData ATUALIZADO NESTE COMPONENTE!', newVal); }, { deep: true });
watch(() => props.barData, (newVal) => { console.log('ChartsDisplay: barData ATUALIZADO NESTE COMPONENTE!', newVal); }, { deep: true });
watch(() => props.expenseTypeDistributionData, (newVal) => { console.log('ChartsDisplay: expenseTypeDistributionData ATUALIZADO NESTE COMPONENTE!', newVal); }, { deep: true });
watch(() => props.paymentMethodDistributionData, (newVal) => { console.log('ChartsDisplay: paymentMethodDistributionData ATUALIZADO NESTE COMPONENTE!', newVal); }, { deep: true });
watch(() => props.categoryDistributionData, (newVal) => { console.log('ChartsDisplay: categoryDistributionData ATUALIZADO NESTE COMPONENTE!', newVal); }, { deep: true });

// Função auxiliar para formatar tooltip como porcentagem para gráficos de pizza.
const getPercentageTooltipCallback = (context) => {
  const label = context.label || '';
  const value = context.parsed || 0;
  const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
  const percentage = total === 0 ? '0%' : ((value / total) * 100).toFixed(2) + '%';
  return `${label}: R$ ${value.toFixed(2)} (${percentage})`;
};

// Opções de gráfico para vários gráficos.
const expenseChartOptions = {
  responsive: true, maintainAspectRatio: false, plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Despesas por Categoria' }, // TRADUZIDO
    tooltip: { // NOVO: Configuração do tooltip para porcentagem
      callbacks: {
        label: getPercentageTooltipCallback
      }
    }
  }, animation: false
};

const barChartOptions = {
  responsive: true, maintainAspectRatio: false, plugins: {
    legend: { display: false },
    title: { display: true, text: 'Receitas vs. Despesas' } // TRADUZIDO
  }, scales: { y: { beginAtZero: true } }, animation: false
};

const expenseTypeDistributionChartOptions = {
  responsive: true, maintainAspectRatio: false, plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Despesas por Tipo (Fixa/Variável)' }, // TRADUZIDO
    tooltip: { // NOVO: Configuração do tooltip para porcentagem
      callbacks: {
        label: getPercentageTooltipCallback
      }
    }
  }, animation: false
};

const paymentMethodDistributionChartOptions = {
  responsive: true, maintainAspectRatio: false, plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Despesas por Método de Pagamento' }, // TRADUZIDO
    tooltip: { // NOVO: Configuração do tooltip para porcentagem
      callbacks: {
        label: getPercentageTooltipCallback
      }
    }
  }, animation: false
};

const categoryDistributionChartOptions = {
  responsive: true, maintainAspectRatio: false, plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Distribuição Geral por Categoria' }, // TRADUZIDO
    tooltip: { // NOVO: Configuração do tooltip para porcentagem
      callbacks: {
        label: getPercentageTooltipCallback
      }
    }
  }, animation: false
};
</script>

<template>
  <div class="charts-section">
    <div class="charts-grid">
      <div class="chart-item">
        <h4>Comparativo Receitas vs. Despesas</h4> <div class="chart-canvas-container">
          <Bar v-if="props.hasTransactions" :data="props.barData" :options="barChartOptions" :key="props.chartRenderKey" />
          <p v-else>Adicione transações para ver o comparativo.</p> </div>
      </div>

      <div class="chart-item">
        <h4>Despesas por Categoria</h4> <div class="chart-canvas-container">
          <Pie v-if="props.hasExpenses" :data="props.expenseData" :options="expenseChartOptions" :key="props.chartRenderKey + 'a'" />
          <p v-else>Adicione despesas para ver o gráfico.</p> </div>
      </div>

      <div class="chart-item">
        <h4>Despesas por Tipo (Fixa vs. Variável)</h4> <div class="chart-canvas-container">
          <Pie v-if="props.hasExpenses && props.expenseTypeDistributionData.labels.length > 0"
               :data="props.expenseTypeDistributionData"
               :options="expenseTypeDistributionChartOptions"
               :key="props.chartRenderKey + 'b'" />
          <p v-else>Adicione despesas (Fixa/Variável) para ver o gráfico.</p> </div>
      </div>

      <div class="chart-item">
        <h4>Despesas por Método de Pagamento</h4> <div class="chart-canvas-container">
          <Pie v-if="props.hasExpenses && props.paymentMethodDistributionData.labels.length > 0"
               :data="props.paymentMethodDistributionData"
               :options="paymentMethodDistributionChartOptions"
               :key="props.chartRenderKey + 'c'" />
          <p v-else>Adicione despesas (com forma de pagamento) para ver o gráfico.</p> </div>
      </div>

      <div class="chart-item">
        <h4>Distribuição Geral por Categoria</h4> <div class="chart-canvas-container">
          <Pie v-if="props.hasTransactions && props.categoryDistributionData.labels.length > 0"
               :data="props.categoryDistributionData"
               :options="categoryDistributionChartOptions"
               :key="props.chartRenderKey + 'd'" />
          <p v-else>Adicione transações para ver o gráfico.</p> </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos do componente */
.charts-section {
  padding: 25px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  justify-content: center;
  align-items: start;
}

.chart-item {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 350px;
  transition: transform 0.2s ease-in-out;
}

.chart-item:hover {
  transform: translateY(-3px);
}

.chart-item h4 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4em;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.chart-item p {
  color: #777;
  font-style: italic;
  margin-top: 15px;
}

.chart-canvas-container {
  flex-grow: 1;
  position: relative;
  height: 1px;
  min-height: 200px;
}

.chart-item canvas {
  max-width: 100%;
  max-height: 100%;
}

/* Media Queries */
@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 600px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-item {
    padding: 15px;
    min-height: 300px;
  }

  .chart-item h4 {
    font-size: 1.2em;
  }
}
</style>