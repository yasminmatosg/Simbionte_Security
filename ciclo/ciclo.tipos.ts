// Tipos do módulo de ciclo (Subgrupo D - Ana Luiza).
// Sem enums/parameter properties por causa do "erasableSyntaxOnly" do tsconfig.

export type StatusSimulacao = "AGUARDANDO" | "EM_EXECUCAO" | "PAUSADA" | "CONCLUIDA";

// Situação de um ciclo (Etapa 5: aguardando, em execução, concluído).
export type SituacaoCiclo = "AGUARDANDO" | "EM_EXECUCAO" | "CONCLUIDO";

export interface Simulacao {
  id: number;
  status: StatusSimulacao;
  /** Quantidade de ciclos JÁ concluídos nesta simulação. */
  cicloAtual: number;
  /** Limite definido para esta simulação. null/undefined = usa só o teto global. */
  maxCiclos?: number | null;
}

export interface AgenteEstado {
  id: number;
  /** Reputação (TrustScore), escala 0-100. */
  reputacao: number;
  /** Quantos ciclos de suspensão ainda faltam cumprir (0 = não suspenso). */
  ciclosSuspensaoRestantes: number;
  /** true logo após cumprir a suspensão: o agente joga 1 ciclo antes de ser reavaliado. */
  emCicloDeGraca: boolean;
}

export type EventoSuspensao =
  | "NENHUM"
  | "SUSPENSAO_INICIADA"
  | "SUSPENSAO_EM_ANDAMENTO"
  | "SUSPENSAO_ENCERRADA"
  | "CICLO_DE_GRACA";

export interface AvaliacaoAgente {
  participa: boolean;
  agente: AgenteEstado;
  evento: EventoSuspensao;
}

// ---- Portas (interfaces) que os Subgrupos A e C implementam/ligam ----

/** Relatório de percepção. O formato é definido pelo Subgrupo A; aqui é opaco. */
export type RelatorioPercepcao = Record<string, unknown>;

/** Decisão do agente. O formato/validação é do Subgrupo C; aqui é opaco. */
export type DecisaoAgente = Record<string, unknown>;

export interface SimulacaoRepo {
  buscar(id: number): Promise<Simulacao | null>;
  atualizar(id: number, patch: { status?: StatusSimulacao; cicloAtual?: number }): Promise<void>;
}

export interface CicloRepo {
  abrir(simulacaoId: number, numero: number): Promise<{ id: number }>;
  fechar(cicloId: number, situacao: SituacaoCiclo): Promise<void>;
}

export interface AgenteRepo {
  listarDaSimulacao(simulacaoId: number): Promise<AgenteEstado[]>;
  salvarEstado(agente: AgenteEstado): Promise<void>;
}

export interface FasesCiclo {
  /** Fase de percepção: consulta o banco e monta o relatório do agente. */
  perceber(agente: AgenteEstado, numeroCiclo: number): Promise<RelatorioPercepcao>;
  /** Fase de decisão: envia relatório + instrução ao módulo de conexão (LLM). */
  decidir(agente: AgenteEstado, relatorio: RelatorioPercepcao): Promise<DecisaoAgente>;
}

export interface DependenciasOrquestrador {
  simulacoes: SimulacaoRepo;
  ciclos: CicloRepo;
  agentes: AgenteRepo;
  fases: FasesCiclo;
  /** Teto global de ciclos por simulação (env MAX_CICLOS_POR_SIMULACAO). */
  tetoGlobalCiclos: number;
  /** Log seguro. Nunca receber relatório, instrução estratégica ou chaves aqui. */
  log?: (mensagem: string, dados?: Record<string, string | number | boolean>) => void;
}

export type MotivoNaoExecutou =
  | "SIMULACAO_NAO_ENCONTRADA"
  | "SIMULACAO_NAO_ESTA_EM_EXECUCAO"
  | "LIMITE_DE_CICLOS_ATINGIDO"
  | "CICLO_JA_EM_EXECUCAO";

export interface ResultadoCiclo {
  executou: boolean;
  motivo?: MotivoNaoExecutou;
  numeroCiclo?: number;
  simulacaoConcluida: boolean;
  /** Agentes que passaram por percepção + decisão neste ciclo. */
  participantes: number[];
  /** Agentes suspensos neste ciclo (sem percepção, sem decisão, sem chamada ao LLM). */
  suspensos: number[];
  /** Agentes que participaram mas cuja decisão falhou (ficam inativos no ciclo). */
  falhas: number[];
  decisoes: Array<{ agenteId: number; decisao: DecisaoAgente }>;
}
