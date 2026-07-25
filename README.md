# 🔒 Simbionte — Subgrupo D | Segurança e Regras

Repositório oficial do **Subgrupo D – Segurança e Regras** da Iniciação Científica **Projeto Simbionte – Simulação de Ecossistema de Influência Digital**.

Este repositório reúne os documentos e artefatos técnicos produzidos pelo Subgrupo D durante o desenvolvimento da pesquisa, com foco na definição, análise e validação dos mecanismos de segurança da aplicação, incluindo autenticação, governança, privacidade e qualidade da API.

---

# 📌 Entregas do Subgrupo D

Durante esta etapa da pesquisa, o Subgrupo D foi responsável pela elaboração de documentos técnicos e pela validação dos mecanismos de segurança implementados na API desenvolvida pelo Subgrupo A. As principais entregas foram:

- Relatório Técnico de Governança, Segurança e Privacidade;
- Proposta de Regras, Fluxos Operacionais e Diretrizes de Conduta do ecossistema Simbionte;
- Documento de Configuração do Ambiente e Validação da Implementação da Autenticação;
- Módulo demonstrativo de criptografia em JavaScript utilizando **bcrypt**, desenvolvido para exemplificar o processo de geração e verificação de hashes de senhas;
- Documentação do contrato da API de autenticação, alinhada à implementação disponibilizada pelo Subgrupo A;
- Elaboração da matriz de testes de segurança (Quality Assurance), contemplando cenários de autenticação, autorização e tratamento de exceções;
- Coleção de testes em **Postman** utilizada para validação dos principais fluxos de autenticação da API.

---

# 📂 Estrutura do Repositório

```text
.
.
├── documentos/
│   ├── simbionte_projeto_pesquisa.pdf
│   ├── subgrupo_D_relatorio_tecnico_governanca_e_seguranca.pdf
│   ├── subgrupo_D_proposta_de_regras_e_fluxos_operacionais.pdf
│   └── subgrupo_D_config_ambiente_autenticacao_validacao_seguranca.pdf
│
├── postman/
│   └── JSON_testes_sub_grupoD.json
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

---

# 📄 Documentação

A pasta **documentos/** reúne os principais artefatos produzidos pelo Subgrupo D durante esta etapa da Iniciação Científica, incluindo:

- Relatório Técnico de Governança, Segurança e Privacidade;
- Proposta de Regras e Fluxos Operacionais;
- Documento de Configuração do Ambiente e Validação da Implementação da Autenticação.

Os documentos contemplam aspectos relacionados à governança do ecossistema, classificação de dados, requisitos de segurança, autenticação, contratos da API e validação da implementação.

---

# 🔐 Módulo de Criptografia

A pasta **seguranca/** contém um módulo demonstrativo desenvolvido pelo Subgrupo D utilizando a biblioteca **bcrypt**.

O objetivo do módulo é ilustrar boas práticas para armazenamento seguro de credenciais, contemplando:

- geração de hashes de senhas;
- validação de credenciais por comparação de hashes;
- utilização de variáveis de ambiente para configuração;
- exemplo de utilização das funções implementadas.

Este módulo possui caráter demonstrativo e foi desenvolvido como apoio técnico às atividades de pesquisa relacionadas à autenticação.

---

# 🧪 Validação de Segurança

Durante esta etapa da pesquisa foram analisados e documentados os principais mecanismos de segurança empregados na implementação da API, dentre eles:

- Hash de senhas com **bcrypt**;
- Autenticação baseada em **JSON Web Tokens (JWT)**;
- Proteção de rotas por middleware de autenticação;
- Gerenciamento de segredos por variáveis de ambiente;
- Refresh Tokens com rotação;
- Rate Limiting;
- Utilização do **Helmet** para configuração de cabeçalhos HTTP de segurança;
- Tratamento padronizado de erros;
- Matriz de testes de exceção (*caminho triste*);
- Coleção de testes automatizados em Postman.

---

# 📚 Tecnologias Utilizadas

- Node.js
- JavaScript
- bcrypt
- dotenv
- Postman
- Git
- GitHub

---

# 👥 Integrantes

- Ana Luiza
- Vitor
- Yasmin

---

# 📖 Sobre o Projeto

Este repositório corresponde exclusivamente às entregas desenvolvidas pelo **Subgrupo D – Segurança e Regras** da Iniciação Científica **Projeto Simbionte – Simulação de Ecossistema de Influência Digital**.

As implementações da API de autenticação utilizadas como objeto de validação pertencem ao repositório do **Subgrupo A (Backend)**, enquanto este repositório reúne a documentação técnica, o módulo demonstrativo de criptografia e os artefatos de validação produzidos pelo Subgrupo D.
