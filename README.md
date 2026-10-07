# 🔒 Simbionte — Subgrupo D | Segurança, Regras e Orquestração

Repositório oficial do **Subgrupo D – Segurança e Regras** da Iniciação Científica **Projeto Simbionte – Simulação de Ecossistema de Influência Digital**. 

Este repositório reúne os documentos, códigos de middleware, artefatos técnicos e evidências produzidos pelo Subgrupo D, com foco na definição, análise e validação dos mecanismos de segurança, controle de acesso, sanitização de logs e regras de negócio do orquestrador.

---

# 📌 Entregas do Subgrupo D

Durante esta etapa da pesquisa, o Subgrupo D foi responsável por implementar, testar e documentar os seguintes componentes críticos:

- **Controle de Acesso e Titularidade (`owner_id`):** Implementação de middleware restritivo para validação de permissões e bloqueio preventivo (HTTP 403 Forbidden).
- **Sanitização de Logs de Exceção:** Tratamento global de erros com mascaramento automático de dados confidenciais e instruções estratégicas (`[CONTEÚDO PROTEGIDO]`).
- **Regras do Ciclo e Limites do Orquestrador:** Trava de limite máximo de ciclos com transição automática de status para `CONCLUIDA`.
- **Suspensão Automática de Agentes:** Regra de negócio para pausar por 2 ciclos agentes com reputação inferior a 10, otimizando o consumo de chamadas de API.
- **Relatórios Técnicos e Documentação:** Elaboração da documentação de governança, segurança, privacidade e fluxo operacional.
- **Matriz de Testes de Segurança e Evidências:** Validação de cenários de caminho triste e testes automatizados via Postman.

---

# 📂 Estrutura do Repositório

```text
.
├── documentos/
│   ├── simbionte_projeto_pesquisa.pdf
│   ├── subgrupo_D_relatorio_tecnico_governanca_e_seguranca.pdf
│   ├── subgrupo_D_proposta_de_regras_e_fluxos_operacionais.pdf
│   └── subgrupo_D_config_ambiente_autenticacao_validacao_seguranca.pdf
├── evidencias/
│   └── sanitizacao/
│       └── evidencia-sanitizacao.png
├── postman/
│   └── JSON_testes_sub_grupoD.json
├── seguranca/
│   ├── seguranca.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── .gitignore
└── README.md
```

---

## 📄 Documentação e Evidências

A pasta `documentos/` reúne os relatórios técnicos e propostas de regras operacionais desenvolvidas pelo subgrupo. Adicionalmente, a pasta `evidencias/sanitizacao/` armazena os registros visuais e testes práticos que comprovam o correto funcionamento da sanitização de logs e mascaramento de dados sensíveis no terminal do servidor.

## 🔑 Módulos de Segurança e Middlewares

A implementação desenvolvida pelo subgrupo contempla:
* **Validação de propriedade:** Controle de acesso rigoroso baseado em rotas.
* **Sanitização de rastreios:** Proteção de *stack traces* e isolamento de variáveis estratégicas.
* **Criptografia:** Uso de `bcrypt` e gestão segura de segredos via variáveis de ambiente.

## 📚 Tecnologias Utilizadas

* Node.js / TypeScript / JavaScript
* Express.js
* Prisma / PostgreSQL
* Postman
* Git & GitHub

## 👥 Integrantes

* Ana Luiza
* Yasmin Matos

## 📖 Sobre o Projeto

Este repositório corresponde exclusivamente às entregas desenvolvidas pelo **Subgrupo D – Segurança e Regras** do Projeto Simbionte.
