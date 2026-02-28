# 💰 Cash Billing – Sistema de Gestão de Clientes e Faturamento

Sistema web desenvolvido para controle de clientes, vendas e faturamento mensal automático, utilizando Firebase como backend.

Projeto focado em performance, organização de dados e aplicação de regra de negócio real (controle financeiro incremental).

---

## 🌐 Visão Geral

O Cash Billing é um sistema voltado para pequenos estabelecimentos que precisam:

- Controlar clientes
- Registrar compras
- Gerenciar pagamentos parciais
- Acompanhar faturamento mensal

O sistema calcula automaticamente o faturamento com base apenas no aumento real da dívida do cliente, evitando duplicações e inconsistências financeiras.

---

## 🚀 Principais Funcionalidades

### 👤 Gestão de Clientes

- Cadastro e edição de clientes
- Registro de múltiplas compras
- Controle automático do total devedor
- Pagamentos parciais com histórico em observações
- Atualização automática da data da última modificação

---

### 🛒 Gestão de Produtos

- Cadastro de produtos
- Edição e exclusão
- Ordenação automática em ordem alfabética
- Seleção dinâmica no momento da compra

---

### 📊 Dashboard Inteligente

- Listagem dinâmica de clientes
- Pesquisa em tempo real
- Ordenação por última atualização
- Renderização otimizada (melhoria de performance)
- Exibição automática do faturamento mensal

---

## 💵 Regra de Negócio Aplicada (Diferencial Técnico)

Ao salvar alterações de um cliente:

1. O sistema busca o valor anterior no Firestore
2. Calcula o novo total
3. Compara os valores
4. Soma apenas a diferença positiva ao faturamento do mês

Isso evita:

- Duplicidade de receita
- Contagem incorreta ao editar pedidos
- Problemas de consistência financeira

Cada mês gera automaticamente um novo documento.

---

## 🛠 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Bootstrap 5
- Firebase
- Firestore Database

---

## 🧠 Conceitos Aplicados

- Manipulação eficiente do DOM
- Estrutura modular com ES Modules
- Integração com banco NoSQL
- Uso de `increment()` para operações atômicas
- Regra de negócio empresarial
- Organização por coleções
- Performance otimizada no dashboard

---

## 🔮 Possíveis Evoluções

- Sistema de autenticação
- Controle de estoque
- Relatório mensal detalhado
- Exportação em PDF
- Gráficos de faturamento
- Paginação no dashboard

---

## 👨‍💻 Desenvolvido por

**Peterson Lima**

Projeto desenvolvido como prática avançada de JavaScript com Firebase e aplicação de regra de negócio real.

---

## 📌 Objetivo

Demonstrar capacidade de:

- Criar sistema completo com backend real
- Aplicar lógica financeira consistente
- Estruturar código de forma escalável
- Trabalhar com banco de dados em tempo real

O Site está **hospedado e disponível para visualização pública** no link abaixo 👇

👉 **Acesse aqui:** [🌎 SofNet](https://petersonlima104.github.io/CashBilling/)

---

🖥️ **Desenvolvido por [Peterson Lima](https://portfoliopetersonlima.wuaze.com/)**
