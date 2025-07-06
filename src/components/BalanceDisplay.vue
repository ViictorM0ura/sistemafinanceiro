<script setup>
import { defineProps } from 'vue';

// Define as propriedades (props) que este componente pode receber
const props = defineProps({
  balance: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <div class="balance-container">
    <h2>Saldo Total: R$ {{ props.balance.toFixed(2) }}</h2>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
.balance-container {
  background-color: #e0f2f7;
  padding: 20px; /* Ajustado */
  border-radius: 8px; /* Consistente com .card */
}

.balance-container h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 2em; /* Tamanho maior para o saldo */
}

/* Media Queries para responsividade - ajustar apenas para este componente se necessário */
@media (max-width: 900px) {
  .balance-container h2 {
    font-size: 1.8em;
  }
  .balance-container {
    padding: 18px;
  }
}

@media (max-width: 600px) {
  .balance-container h2 {
    font-size: 1.3em;
  }
  .balance-container {
    padding: 15px;
  }
}
</style>