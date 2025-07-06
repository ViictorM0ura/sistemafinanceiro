<script setup>
import { defineProps } from 'vue';
// Importamos os componentes de gráfico do vue-chartjs
import { Bar, Pie } from 'vue-chartjs';
// Importamos e registramos os elementos do chart.js
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

// Registrar os componentes e plugins do Chart.js que vamos usar
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// Define as propriedades (props) que este componente pode receber
const props = defineProps({
  expenseData: {
    type: Object,
    required: true
  },
  barData: {
    type: Object,
    required: true
  },
  hasExpenses: { // Para mostrar/esconder o gráfico de pizza
    type: Boolean,
    default: false
  },
  hasTransactions: { // Para mostrar/esconder o gráfico de barras
    type: Boolean,
    default: false
  }
});

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
/* Estilos específicos para este componente - Copie da seção .charts-section do App.vue */
.charts-section {
  display: grid;
  grid-template-columns: 1fr; /* Gráficos empilhados na coluna direita */
  gap: 20px;
}

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
  overflow: hidden; /* Garante que o canvas do Chart.js não cause overflow */
}

.chart-container p {
  color: #777;
  font-style: italic;
}

/* Media Queries para responsividade - ajustar apenas para este componente se necessário */
@media (max-width: 600px) {
    .chart-container {
        padding: 10px;
    }
}
</style>