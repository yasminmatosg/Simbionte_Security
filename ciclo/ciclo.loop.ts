// Controle do loop de ciclos com intervalo configurável (para o Subgrupo B consumir).
// Subgrupo D - Ana Luiza.
import { executarCiclo } from "./ciclo.orquestrador.ts";
import type { DependenciasOrquestrador, ResultadoCiclo } from "./ciclo.tipos.ts";

export interface OpcoesLoop {
  /** Intervalo entre o FIM de um ciclo e o INÍCIO do próximo, em ms. */
  intervaloMs: number;
  /** Chamado após cada ciclo executado (ex.: para emitir evento por WebSocket). */
  aoFinalizarCiclo?: (resultado: ResultadoCiclo) => void | Promise<void>;
  /** Injetável para testes. */
  esperar?: (ms: number) => Promise<void>;
}

export interface ControleLoop {
  /** Pede parada; o loop termina ao fim do ciclo em andamento. */
  parar(): void;
  /** Resolve quando o loop terminou, com o motivo. */
  terminou: Promise<"CONCLUIDA" | "PARADO" | "NAO_EXECUTOU">;
}

const esperarPadrao = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function iniciarLoopDeCiclos(
  deps: DependenciasOrquestrador,
  simulacaoId: number,
  opcoes: OpcoesLoop,
): ControleLoop {
  if (!Number.isFinite(opcoes.intervaloMs) || opcoes.intervaloMs < 0) {
    throw new RangeError("intervaloMs precisa ser um número >= 0");
  }
  const esperar = opcoes.esperar ?? esperarPadrao;
  let parar = false;

  const terminou = (async () => {
    while (!parar) {
      const r = await executarCiclo(deps, simulacaoId);
      if (!r.executou) return r.simulacaoConcluida ? "CONCLUIDA" : "NAO_EXECUTOU";
      await opcoes.aoFinalizarCiclo?.(r);
      if (r.simulacaoConcluida) return "CONCLUIDA"; // limite atingido: não espera nem roda mais
      if (!parar) await esperar(opcoes.intervaloMs);
    }
    return "PARADO";
  })();

  return { parar: () => void (parar = true), terminou };
}
