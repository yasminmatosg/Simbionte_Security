// Regras puras do ciclo (sem banco, sem rede) - fáceis de testar.
// Subgrupo D - Ana Luiza.
import type { AgenteEstado, AvaliacaoAgente } from "./ciclo.tipos.ts";

/** Agente com reputação ABAIXO deste valor é suspenso. */
export const REPUTACAO_MINIMA = 10;
/** Duração da suspensão, em ciclos. */
export const CICLOS_DE_SUSPENSAO = 2;

/**
 * Limite efetivo de ciclos de uma simulação.
 * O valor da simulação nunca pode passar do teto global; sem valor próprio, vale o teto.
 */
export function calcularLimiteCiclos(
  maxDaSimulacao: number | null | undefined,
  tetoGlobal: number,
): number {
  if (!Number.isInteger(tetoGlobal) || tetoGlobal < 1) {
    throw new RangeError("tetoGlobal precisa ser um inteiro >= 1");
  }
  if (maxDaSimulacao == null || !Number.isInteger(maxDaSimulacao) || maxDaSimulacao < 1) {
    return tetoGlobal;
  }
  return Math.min(maxDaSimulacao, tetoGlobal);
}

/** true quando já foram concluídos ciclos suficientes para atingir o limite. */
export function limiteAtingido(ciclosConcluidos: number, limite: number): boolean {
  return ciclosConcluidos >= limite;
}

/**
 * Decide se o agente participa do ciclo que está começando e devolve o novo estado.
 *
 * - O ciclo em que a reputação é detectada < 10 já conta como o 1º de 2 ciclos suspensos.
 * - Ao terminar a suspensão o agente ganha 1 ciclo de graça (joga mesmo com reputação
 *   baixa), senão ele nunca teria chance de se recuperar e seria suspenso para sempre.
 *   (Decisão de projeto: confirmar com o grupo.)
 */
export function avaliarAgenteNoCiclo(agente: AgenteEstado): AvaliacaoAgente {
  if (agente.ciclosSuspensaoRestantes > 0) {
    const restantes = agente.ciclosSuspensaoRestantes - 1;
    return {
      participa: false,
      evento: restantes === 0 ? "SUSPENSAO_ENCERRADA" : "SUSPENSAO_EM_ANDAMENTO",
      agente: { ...agente, ciclosSuspensaoRestantes: restantes, emCicloDeGraca: restantes === 0 },
    };
  }

  if (agente.emCicloDeGraca) {
    return {
      participa: true,
      evento: "CICLO_DE_GRACA",
      agente: { ...agente, emCicloDeGraca: false },
    };
  }

  if (agente.reputacao < REPUTACAO_MINIMA) {
    return {
      participa: false,
      evento: "SUSPENSAO_INICIADA",
      agente: { ...agente, ciclosSuspensaoRestantes: CICLOS_DE_SUSPENSAO - 1, emCicloDeGraca: false },
    };
  }

  return { participa: true, evento: "NENHUM", agente };
}
