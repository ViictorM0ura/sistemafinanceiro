# 📊 Sistema Financeiro Básico com Vue.js

[![Built with Vue.js](https://img.shields.io/badge/Built%20with-Vue.js-42b983.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um sistema financeiro básico e responsivo construído com Vue.js 3, projetado para ajudar no gerenciamento simples de receitas e despesas. Os dados são persistidos localmente no navegador (LocalStorage), garantindo que as informações não sejam perdidas ao recarregar a página.

---

## ✨ Funcionalidades

* **Adição de Transações**: Registre receitas e despesas de forma intuitiva.
* **Seleção de Tipo (Receita/Despesa)**: Botões dedicados para diferenciar o tipo de transação, aplicando automaticamente o sinal correto.
* **Categorização de Despesas**: Classifique suas despesas em categorias predefinidas para melhor organização.
* **Listagem e Histórico**: Visualize todas as transações em um histórico claro.
* **Cálculo de Saldo Total**: Acompanhe o saldo atual de suas finanças em tempo real.
* **Edição de Transações**: Modifique os detalhes de qualquer transação registrada.
* **Exclusão de Transações**: Remova transações indesejadas com confirmação.
* **Gráficos Visuais**:
    * Gráfico de Pizza: Mostra a distribuição das despesas por categoria.
    * Gráfico de Barras: Compara o total de receitas com o total de despesas.
* **Persistência de Dados Local**: Os dados são salvos automaticamente no `LocalStorage` do navegador, persistindo mesmo após o fechamento da aba ou navegador (são perdidos apenas se o cache for limpo).
* **Design Responsivo**: Layout que se adapta a diferentes tamanhos de tela (desktop, tablet, celular), proporcionando uma boa experiência em qualquer dispositivo.
* **Validação de Entrada**: Regras básicas para evitar a inserção de dados inconsistentes (ex: descrição vazia, valor zero/negativo).

---

## 🚀 Últimas Atualizações (Julho de 2025)

Grandes melhorias foram implementadas para aprimorar a usabilidade, o detalhamento das transações e a estabilidade do sistema:

* **Reestruturação Completa da Arquitetura**: Projeto refatorado para uma estrutura modular com Componentes Vue e Composables, facilitando a manutenção e a escalabilidade.
* **Detalhamento da Transação**:
    * Campo "Descrição" renomeado para **"Nome do Item/Produto"**.
    * Adicionado novo campo **"Descrição Detalhada"** (obrigatório), para informações adicionais sobre a transação.
* **Gestão de Datas Aprimorada**:
    * Campo de **Data** adicionado a cada transação.
    * Correção precisa na exibição de datas para lidar com fusos horários.
* **Categorias para Receitas**: Agora é possível categorizar suas transações de **Receita**, com um seletor dinâmico de categorias (Receita/Despesa).
* **Filtro Avançado de Transações**:
    * Implementada funcionalidade de **filtrar transações por Dia, Mês ou Ano**, com controles dedicados.
* **Dashboard Financeiro Detalhado**:
    * Exibição de **Total de Receitas**, **Total de Despesas** e **Saldo Líquido** no cabeçalho, sempre refletindo o período filtrado.
    * Gráficos atualizam automaticamente ao adicionar transações ou aplicar filtros.
* **Modal de Detalhes da Transação**:
    * Botão **"Detalhes"** no histórico que abre um modal com todas as informações pormenorizadas da transação.
* **Exportação e Importação de Dados**:
    * Funcionalidades para **Exportar** todos os dados para um arquivo JSON.
    * Funcionalidades para **Importar** dados de um arquivo JSON, permitindo backup e transferência.
* **Robustez e Estabilidade**:
    * Validações de entrada aprimoradas para garantir a integridade dos dados.
    * Correção de diversos bugs de reatividade, garantindo que o histórico, saldo e gráficos atualizem automaticamente.
    * Resolução de erros de compilação (`ReferenceError`, `TypeError`) e layout responsivo.

---

## 🛠️ Tecnologias Utilizadas

* **[Vue.js 3](https://vuejs.org/)**: Framework JavaScript progressivo para a construção da interface do usuário.
* **[Vite](https://vitejs.dev/)**: Ferramenta de build rápida para desenvolvimento e otimização de produção.
* **[Chart.js](https://www.chartjs.org/) & [Vue Chart.js](https://vue-chartjs.org/)**: Biblioteca para a criação dos gráficos interativos.
* **[LocalStorage](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)**: API do navegador para persistência de dados no lado do cliente.
* **[Git](https://git-scm.com/)**: Sistema de controle de versão.
* **[Vercel](https://vercel.com/)**: Plataforma de hospedagem para deploy rápido e fácil de aplicações front-end.

---

## 🏗️ Estrutura do Projeto

O projeto segue uma arquitetura modular com o uso de componentes Vue e Composition API (Composables) para melhor organização e reusabilidade:

```plaintext
sistemafinanceiro/
├── public/                 # Arquivos estáticos (favicon, etc.)
├── src/
│   ├── assets/             # Ativos como imagens, fontes (não usados neste projeto básico)
│   ├── components/         # Componentes de UI reutilizáveis
│   │   ├── BalanceDisplay.vue    # Exibe o saldo total
│   │   ├── TransactionForm.vue   # Formulário de adição/edição de transações
│   │   ├── TransactionList.vue   # Lista de histórico de transações
│   │   ├── ChartsDisplay.vue     # Componente para exibir os gráficos
│   │   └── TransactionDetailsModal.vue # NOVO: Modal de detalhes da transação
│   ├── composables/        # Lógica de negócio reutilizável (Composition API)
│   │   └── useTransactions.js    # Gerencia todas as operações e estados de transações
│   ├── App.vue             # Componente raiz: orquestra o layout e integra os outros componentes/logic
│   └── main.js             # Ponto de entrada da aplicação Vue
├── .gitignore              # Arquivos e pastas a serem ignorados pelo Git
├── index.html              # Arquivo HTML principal da aplicação
├── package.json            # Metadados do projeto e dependências
├── vite.config.js          # Configuração do Vite
└── README.md               # Este arquivo!
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
