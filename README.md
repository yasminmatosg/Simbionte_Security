# 🔒 Simbionte — Subgrupo D | Segurança e Regras

Repositório oficial do **Subgrupo D – Segurança e Regras** da Iniciação Científica **Projeto Simbionte – Simulação de Ecossistema de Influência Digital**.

Este repositório reúne os documentos, estudos e artefatos técnicos produzidos pelo grupo durante o desenvolvimento da pesquisa, com foco na definição dos requisitos de segurança, governança, autenticação e validação do sistema.

---

# 🎯 Objetivos

O Subgrupo D foi responsável pelo desenvolvimento das atividades relacionadas à segurança da aplicação, contemplando:

* Elaboração do contrato da API de autenticação;
* Definição dos requisitos de segurança do sistema;
* Desenvolvimento de um módulo de criptografia utilizando **bcrypt**;
* Definição das políticas de governança e privacidade;
* Classificação dos dados públicos e privados da aplicação;
* Definição das regras de conduta do ecossistema;
* Planejamento e documentação dos testes de segurança;
* Produção da documentação técnica das entregas do grupo.

---

# 📂 Estrutura do Repositório

```text
.
├── docs/
│   ├── simbionte_projeto_pesquisa.
│   ├── subgrupo_D_relatório_tecnico_governanca_e_seguranca
│   ├── subgrupo_D_proposta_de_regras_e_fluxos_operacionais
│   └── subgrupo_D_documento_3_config_ambiente_e_autentificacao
│
├── seguranca/
│   ├── seguranca.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

> **Observação:** A organização das pastas poderá sofrer pequenas alterações conforme a evolução da pesquisa.

---

# 📄 Documentação

O diretório **docs/** reúne toda a documentação produzida pelo Subgrupo D ao longo da Iniciação Científica, incluindo:

- Documento técnico sobre Governança e Segurança;
- Proposta de Regras e Fluxos Operacionais;
- Documento de Configuração do Ambiente e Autenticação;
- Módulo de criptografia utilizando bcrypt;
- Contrato da API de autenticação;
- Matriz de testes de segurança.

---

# 🔐 Módulo de Criptografia

O diretório **seguranca/** contém um módulo de criptografia desenvolvido pelo Subgrupo D utilizando a biblioteca **bcrypt**.

O módulo implementa:

* geração segura de hash de senhas;
* validação de credenciais;
* configuração por variáveis de ambiente (.env);
* testes para validação do funcionamento do processo de autenticação.

Seu desenvolvimento teve como objetivo demonstrar a aplicação prática de boas práticas de segurança para armazenamento e verificação de credenciais.

---

# 🧪 Validação de Segurança

Durante esta etapa da pesquisa foram estudados e documentados mecanismos relacionados à segurança da aplicação, incluindo:

* Hash de senhas com **bcrypt**;
* Autenticação baseada em **JSON Web Tokens (JWT)**;
* Proteção das rotas privadas;
* Gerenciamento de variáveis de ambiente;
* Refresh Tokens;
* Rate Limiting;
* Helmet;
* Tratamento padronizado de erros;
* Testes de exceção (caminho triste).

---

# 📚 Tecnologias Utilizadas

* Node.js
* JavaScript
* bcrypt
* dotenv
* JSON
* Git
* GitHub

---

# 👥 Integrantes

* Ana Luiza
* Vitor
* Yasmin

---

# 📖 Sobre o Projeto

Este repositório corresponde exclusivamente às entregas desenvolvidas pelo **Subgrupo D – Segurança e Regras** da Iniciação Científica **Projeto Simbionte – Simulação de Ecossistema de Influência Digital**.

Os documentos e artefatos aqui disponibilizados representam as atividades realizadas pelo grupo durante as diferentes etapas da pesquisa, servindo como apoio ao desenvolvimento e à validação dos mecanismos de segurança do projeto.
