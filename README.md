# 📊 Sistema Financeiro Básico com Vue.js

[![Built with Vue.js](https://img.shields.io/badge/Built%20with-Vue.js-42b983.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um sistema financeiro básico e responsivo construído com Vue.js 3, projetado para ajudar no gerenciamento simples de receitas e despesas. Os dados são persistidos localmente no navegador (LocalStorage), garantindo que as informações não sejam perdidas ao recarregar a página.

---

## ✨ Funcionalidades

- **Adição de Transações**
- **Seleção de Tipo (Receita/Despesa)**
- **Categorização de Despesas**
- **Listagem e Histórico**
- **Cálculo de Saldo Total**
- **Edição de Transações**
- **Exclusão de Transações**
- **Gráficos Visuais**:
  - Gráfico de Pizza
  - Gráfico de Barras
- **Persistência de Dados Local**
- **Design Responsivo**
- **Validação de Entrada**

---

## 🛠️ Tecnologias Utilizadas

- [Vue.js 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/) + [Vue Chart.js](https://vue-chartjs.org/)
- [LocalStorage](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)
- [Git](https://git-scm.com/)
- [Vercel](https://vercel.com/)

---

## 🏗️ Estrutura do Projeto

```plaintext
sistemafinanceiro/
├── public/                 # Arquivos estáticos (favicon, etc.)
├── src/
│   ├── assets/             # Imagens e fontes
│   ├── components/         # Componentes reutilizáveis
│   │   ├── BalanceDisplay.vue
│   │   ├── TransactionForm.vue
│   │   ├── TransactionList.vue
│   │   └── ChartsDisplay.vue
│   ├── composables/
│   │   └── useTransactions.js
│   ├── App.vue
│   └── main.js
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Como Rodar o Projeto Localmente

Siga estes passos para configurar e executar o projeto em sua máquina:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/ViictorM0ura/sistemafinanceiro.git](https://github.com/ViictorM0ura/sistemafinanceiro.git)
    ```
2.  **Navegue até o diretório do projeto:**
    ```bash
    cd sistemafinanceiro
    # Certifique-se de estar dentro da pasta 'vue-project' se ela for a raiz do seu projeto Vue
    # Ex: cd sistemafinanceiro/vue-project
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:5173/` (ou uma porta diferente, se 5173 estiver em uso).

---
## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir "issues" para relatar bugs ou sugerir novas funcionalidades, ou enviar "pull requests" com melhorias.

1.  Faça um "fork" do repositório.
2.  Crie uma nova "branch" (`git checkout -b feature/sua-feature`).
3.  Faça suas alterações e "commite" (`git commit -m 'feat: Adiciona nova funcionalidade X'`).
4.  Envie suas alterações para o "fork" (`git push origin feature/sua-feature`).
5.  Abra um "Pull Request" detalhando suas mudanças.

---
**Desenvolvido por:** Victor Moura
---
