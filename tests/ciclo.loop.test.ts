import { test } from "node:test";
import assert from "node:assert/strict";
import { iniciarLoopDeCiclos } from "../src/modules/ciclo/ciclo.loop.ts";
import type { AgenteEstado, DependenciasOrquestrador, Simulacao } from "../src/modules/ciclo/ciclo.tipos.ts";

function montar(maxCiclos: number) {
  const sim: Simulacao = { id: 7, status: "EM_EXECUCAO", cicloAtual: 0, maxCiclos };
  const agente: AgenteEstado = { id: 1, reputacao: 50, ciclosSuspensaoRestantes: 0, emCicloDeGraca: false };
  let chamadas = 0;
  const deps: DependenciasOrquestrador = {
    tetoGlobalCiclos: 100,
    simulacoes: { buscar: async () => ({ ...sim }), atualizar: async (_i, p) => void Object.assign(sim, p) },
    ciclos: { abrir: async (_s, n) => ({ id: n }), fechar: async () => {} },
    agentes: { listarDaSimulacao: async () => [{ ...agente }], salvarEstado: async () => {} },
    fases: {
      perceber: async () => ({}),
      decidir: async () => {
        chamadas++;
        return {};
      },
    },
  };
  return { deps, sim, chamadas: () => chamadas };
}

test("loop: roda até o limite, espera o intervalo entre ciclos e termina CONCLUIDA", async () => {
  const { deps, sim, chamadas } = montar(3);
  const esperas: number[] = [];
  const ciclos: number[] = [];
  const ctl = iniciarLoopDeCiclos(deps, 7, {
    intervaloMs: 5000,
    esperar: async (ms) => void esperas.push(ms),
    aoFinalizarCiclo: (r) => void ciclos.push(r.numeroCiclo!),
  });
  assert.equal(await ctl.terminou, "CONCLUIDA");
  assert.deepEqual(ciclos, [1, 2, 3]);
  assert.deepEqual(esperas, [5000, 5000]); // sem espera depois do último ciclo
  assert.equal(sim.status, "CONCLUIDA");
  assert.equal(chamadas(), 3);
});

test("loop: parar() interrompe antes do limite, sem concluir a simulação", async () => {
  const { deps, sim, chamadas } = montar(50);
  let ctl!: ReturnType<typeof iniciarLoopDeCiclos>;
  ctl = iniciarLoopDeCiclos(deps, 7, {
    intervaloMs: 0,
    esperar: async () => {},
    aoFinalizarCiclo: (r) => {
      if (r.numeroCiclo === 2) ctl.parar();
    },
  });
  assert.equal(await ctl.terminou, "PARADO");
  assert.equal(sim.cicloAtual, 2);
  assert.equal(sim.status, "EM_EXECUCAO");
  assert.equal(chamadas(), 2);
});

test("loop: simulação pausada não executa nada", async () => {
  const { deps, sim } = montar(5);
  sim.status = "PAUSADA";
  const ctl = iniciarLoopDeCiclos(deps, 7, { intervaloMs: 0, esperar: async () => {} });
  assert.equal(await ctl.terminou, "NAO_EXECUTOU");
});

test("loop: intervalo inválido é rejeitado", () => {
  const { deps } = montar(1);
  assert.throws(() => iniciarLoopDeCiclos(deps, 7, { intervaloMs: -1 }), RangeError);
});
