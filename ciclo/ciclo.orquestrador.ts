// Orquestrador de UM ciclo de simulação (percepção + decisão).
// Subgrupo D - Ana Luiza: aplica (1) trava de limite de ciclos e (2) suspensão automática.
//
// Quem agenda o intervalo entre ciclos (Subgrupo A) chama executarCiclo() a cada tick.
import { avaliarAgenteNoCiclo, calcularLimiteCiclos, limiteAtingido } from "./ciclo.regras.ts";
import type {
  AgenteEstado,
  DependenciasOrquestrador,
  ResultadoCiclo,
} from "./ciclo.tipos.ts";

function vazio(parcial: Partial<ResultadoCiclo>): ResultadoCiclo {
  return {
    executou: false,
    simulacaoConcluida: false,
    participantes: [],
    suspensos: [],
    falhas: [],
    decisoes: [],
    ...parcial,
  };
}

// Bloqueio por simulação (em memória, vale para 1 instância do servidor).
// Evita dois ciclos simultâneos da mesma simulação, que furariam o limite e gastariam API a mais.
// Com várias instâncias, trocar por lock distribuído (ex.: Redis) - Subgrupo A.
const emExecucao = new Set<number>();

export async function executarCiclo(
  deps: DependenciasOrquestrador,
  simulacaoId: number,
): Promise<ResultadoCiclo> {
  if (emExecucao.has(simulacaoId)) {
    return vazio({ motivo: "CICLO_JA_EM_EXECUCAO" });
  }
  emExecucao.add(simulacaoId);
  try {
    return await executarCicloInterno(deps, simulacaoId);
  } finally {
    emExecucao.delete(simulacaoId); // libera mesmo se o banco falhar no meio do ciclo
  }
}

async function executarCicloInterno(
  deps: DependenciasOrquestrador,
  simulacaoId: number,
): Promise<ResultadoCiclo> {
  const log = deps.log ?? (() => {});

  const simulacao = await deps.simulacoes.buscar(simulacaoId);
  if (!simulacao) {
    return vazio({ motivo: "SIMULACAO_NAO_ENCONTRADA" });
  }
  if (simulacao.status !== "EM_EXECUCAO") {
    return vazio({
      motivo: "SIMULACAO_NAO_ESTA_EM_EXECUCAO",
      simulacaoConcluida: simulacao.status === "CONCLUIDA",
    });
  }

  // TRAVA DE LIMITE: checada ANTES de abrir o ciclo, para nunca gastar chamadas a mais.
  const limite = calcularLimiteCiclos(simulacao.maxCiclos, deps.tetoGlobalCiclos);
  if (limiteAtingido(simulacao.cicloAtual, limite)) {
    await deps.simulacoes.atualizar(simulacaoId, { status: "CONCLUIDA" });
    log("simulacao_concluida_por_limite", { simulacaoId, limite });
    return vazio({ motivo: "LIMITE_DE_CICLOS_ATINGIDO", simulacaoConcluida: true });
  }

  const numeroCiclo = simulacao.cicloAtual + 1;
  const ciclo = await deps.ciclos.abrir(simulacaoId, numeroCiclo);

  const resultado = vazio({ executou: true, numeroCiclo });
  const agentes = await deps.agentes.listarDaSimulacao(simulacaoId);

  // 1) Suspensão automática: decide quem joga ANTES de qualquer percepção/decisão.
  const participantes: AgenteEstado[] = [];
  for (const agente of agentes) {
    const avaliacao = avaliarAgenteNoCiclo(agente);
    if (avaliacao.evento !== "NENHUM") {
      await deps.agentes.salvarEstado(avaliacao.agente);
      log("agente_suspensao", {
        simulacaoId,
        numeroCiclo,
        agenteId: agente.id,
        evento: avaliacao.evento,
      });
    }
    if (avaliacao.participa) {
      participantes.push(avaliacao.agente);
    } else {
      resultado.suspensos.push(agente.id); // pulou percepção e decisão: zero chamadas ao LLM
    }
  }

  // 2) Percepção + decisão só para quem participa.
  // Atenção: NUNCA logar relatório, instrução estratégica ou o objeto do erro
  // (pode carregar o prompt). Só ids e o nome do tipo do erro.
  await Promise.all(
    participantes.map(async (agente) => {
      try {
        const relatorio = await deps.fases.perceber(agente, numeroCiclo);
        const decisao = await deps.fases.decidir(agente, relatorio);
        resultado.participantes.push(agente.id);
        resultado.decisoes.push({ agenteId: agente.id, decisao });
      } catch (erro) {
        resultado.falhas.push(agente.id);
        log("agente_falha_no_ciclo", {
          simulacaoId,
          numeroCiclo,
          agenteId: agente.id,
          tipoErro: erro instanceof Error ? erro.name : "desconhecido",
        });
      }
    }),
  );

  await deps.ciclos.fechar(ciclo.id, "CONCLUIDO");
  await deps.simulacoes.atualizar(simulacaoId, { cicloAtual: numeroCiclo });

  // Bateu o limite neste ciclo: encerra já, sem esperar o próximo tick.
  if (limiteAtingido(numeroCiclo, limite)) {
    await deps.simulacoes.atualizar(simulacaoId, { status: "CONCLUIDA" });
    resultado.simulacaoConcluida = true;
    log("simulacao_concluida_por_limite", { simulacaoId, limite });
  }

  return resultado;
}
