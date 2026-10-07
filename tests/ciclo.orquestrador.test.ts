import { test } from "node:test";
import assert from "node:assert/strict";
import { executarCiclo } from "../src/modules/ciclo/ciclo.orquestrador.ts";
import type {
  AgenteEstado,
  DependenciasOrquestrador,
  Simulacao,
} from "../src/modules/ciclo/ciclo.tipos.ts";

// Ambiente falso em memória: conta quantas vezes percepção e decisão (= chamada ao LLM) rodam.
function montar(opcoes: {
  simulacao?: Partial<Simulacao>;
  agentes: AgenteEstado[];
  teto?: number;
  decidir?: (a: AgenteEstado) => Promise<Record<string, unknown>>;
}) {
  const sim: Simulacao = { id: 1, status: "EM_EXECUCAO", cicloAtual: 0, maxCiclos: null, ...opcoes.simulacao };
  const agentes = new Map(opcoes.agentes.map((a) => [a.id, { ...a }]));
  const chamadas = { perceber: [] as number[], decidir: [] as number[] };
  const logs: string[] = [];
  const ciclosAbertos: Array<{ numero: number; situacao: string }> = [];

  const deps: DependenciasOrquestrador = {
    tetoGlobalCiclos: opcoes.teto ?? 100,
    simulacoes: {
      buscar: async () => ({ ...sim }),
      atualizar: async (_id, patch) => void Object.assign(sim, patch),
    },
    ciclos: {
      abrir: async (_s, numero) => {
        ciclosAbertos.push({ numero, situacao: "EM_EXECUCAO" });
        return { id: numero };
      },
      fechar: async (id, situacao) => {
        ciclosAbertos[id - 1]!.situacao = situacao;
      },
    },
    agentes: {
      listarDaSimulacao: async () => [...agentes.values()].map((a) => ({ ...a })),
      salvarEstado: async (a) => void agentes.set(a.id, { ...a }),
    },
    fases: {
      perceber: async (a) => {
        chamadas.perceber.push(a.id);
        return { estado: "ok" };
      },
      decidir: async (a) => {
        chamadas.decidir.push(a.id);
        return opcoes.decidir ? opcoes.decidir(a) : { action: "OCIOSO" };
      },
    },
    log: (m, d) => void logs.push(`${m} ${JSON.stringify(d ?? {})}`),
  };
  return { deps, sim, agentes, chamadas, logs, ciclosAbertos };
}

const ag = (id: number, reputacao: number): AgenteEstado => ({
  id,
  reputacao,
  ciclosSuspensaoRestantes: 0,
  emCicloDeGraca: false,
});

test("ciclo normal: dois agentes passam por percepção e decisão", async () => {
  const { deps, chamadas } = montar({ agentes: [ag(1, 50), ag(2, 50)] });
  const r = await executarCiclo(deps, 1);
  assert.equal(r.executou, true);
  assert.equal(r.numeroCiclo, 1);
  assert.deepEqual(r.participantes.sort(), [1, 2]);
  assert.deepEqual(r.suspensos, []);
  assert.equal(chamadas.decidir.length, 2);
});

test("suspensão: agente com reputação < 10 fica 2 ciclos SEM percepção e SEM decisão (zero chamadas ao LLM)", async () => {
  const { deps, chamadas } = montar({ agentes: [ag(1, 5), ag(2, 50)], simulacao: { maxCiclos: 10 } });

  const c1 = await executarCiclo(deps, 1);
  const c2 = await executarCiclo(deps, 1);
  // Nos ciclos 1 e 2 o agente 1 não pode ter gerado nenhuma chamada
  assert.deepEqual(c1.suspensos, [1]);
  assert.deepEqual(c2.suspensos, [1]);
  assert.equal(chamadas.perceber.filter((id) => id === 1).length, 0);
  assert.equal(chamadas.decidir.filter((id) => id === 1).length, 0);
  // O agente saudável jogou normalmente nos dois
  assert.equal(chamadas.decidir.filter((id) => id === 2).length, 2);

  // Ciclo 3: agente 1 retorna (ciclo de graça) e volta a consumir chamadas
  const c3 = await executarCiclo(deps, 1);
  assert.deepEqual(c3.suspensos, []);
  assert.equal(chamadas.decidir.filter((id) => id === 1).length, 1);
});

test("suspensão: o estado do agente é persistido a cada etapa", async () => {
  const { deps, agentes } = montar({ agentes: [ag(1, 5)] });
  await executarCiclo(deps, 1);
  assert.equal(agentes.get(1)!.ciclosSuspensaoRestantes, 1);
  await executarCiclo(deps, 1);
  assert.equal(agentes.get(1)!.ciclosSuspensaoRestantes, 0);
  assert.equal(agentes.get(1)!.emCicloDeGraca, true);
});

test("suspensão: ciclo com todos os agentes suspensos ainda fecha normalmente", async () => {
  const { deps, chamadas, ciclosAbertos } = montar({ agentes: [ag(1, 1), ag(2, 2)] });
  const r = await executarCiclo(deps, 1);
  assert.equal(r.executou, true);
  assert.equal(chamadas.perceber.length + chamadas.decidir.length, 0);
  assert.equal(ciclosAbertos[0]!.situacao, "CONCLUIDO");
});

test("limite: simulação com maxCiclos=3 roda 3 ciclos e vira CONCLUIDA logo no 3º", async () => {
  const { deps, sim, chamadas } = montar({ agentes: [ag(1, 50)], simulacao: { maxCiclos: 3 } });

  const c1 = await executarCiclo(deps, 1);
  const c2 = await executarCiclo(deps, 1);
  assert.equal(c1.simulacaoConcluida, false);
  assert.equal(c2.simulacaoConcluida, false);
  assert.equal(sim.status, "EM_EXECUCAO");

  const c3 = await executarCiclo(deps, 1);
  assert.equal(c3.executou, true);
  assert.equal(c3.simulacaoConcluida, true);
  assert.equal(sim.status, "CONCLUIDA");
  assert.equal(sim.cicloAtual, 3);
  assert.equal(chamadas.decidir.length, 3);
});

test("limite: depois de CONCLUIDA, novos disparos não executam nada nem consomem chamadas", async () => {
  const { deps, sim, chamadas } = montar({ agentes: [ag(1, 50)], simulacao: { maxCiclos: 2 } });
  await executarCiclo(deps, 1);
  await executarCiclo(deps, 1);
  const antes = chamadas.decidir.length;

  const extra = await executarCiclo(deps, 1);
  assert.equal(extra.executou, false);
  assert.equal(extra.motivo, "SIMULACAO_NAO_ESTA_EM_EXECUCAO");
  assert.equal(extra.simulacaoConcluida, true);
  assert.equal(sim.cicloAtual, 2);
  assert.equal(chamadas.decidir.length, antes);
});

test("limite: se a simulação ainda estiver EM_EXECUCAO com limite já batido, é encerrada sem rodar ciclo", async () => {
  const { deps, sim, chamadas } = montar({
    agentes: [ag(1, 50)],
    simulacao: { cicloAtual: 5, maxCiclos: 5 },
  });
  const r = await executarCiclo(deps, 1);
  assert.equal(r.executou, false);
  assert.equal(r.motivo, "LIMITE_DE_CICLOS_ATINGIDO");
  assert.equal(sim.status, "CONCLUIDA");
  assert.equal(chamadas.perceber.length, 0);
});

test("limite: o teto global manda mesmo se a simulação pedir mais ciclos", async () => {
  const { deps, sim } = montar({ agentes: [ag(1, 50)], simulacao: { maxCiclos: 1000 }, teto: 2 });
  await executarCiclo(deps, 1);
  await executarCiclo(deps, 1);
  assert.equal(sim.status, "CONCLUIDA");
  assert.equal(sim.cicloAtual, 2);
});

test("simulação PAUSADA ou inexistente não executa ciclo", async () => {
  const pausada = montar({ agentes: [ag(1, 50)], simulacao: { status: "PAUSADA" } });
  const r = await executarCiclo(pausada.deps, 1);
  assert.equal(r.executou, false);
  assert.equal(r.motivo, "SIMULACAO_NAO_ESTA_EM_EXECUCAO");

  const inexistente = montar({ agentes: [] });
  inexistente.deps.simulacoes.buscar = async () => null;
  const r2 = await executarCiclo(inexistente.deps, 99);
  assert.equal(r2.motivo, "SIMULACAO_NAO_ENCONTRADA");
});

test("falha na decisão: agente fica inativo no ciclo, ciclo fecha e o log NÃO vaza a instrução", async () => {
  const SEGREDO = "INSTRUCAO_ESTRATEGICA_SECRETA_123";
  const { deps, logs, ciclosAbertos } = montar({
    agentes: [ag(1, 50), ag(2, 50)],
    decidir: async (a) => {
      if (a.id === 1) throw new Error(`falha do provedor com prompt: ${SEGREDO}`);
      return { action: "OCIOSO" };
    },
  });
  const r = await executarCiclo(deps, 1);
  assert.deepEqual(r.falhas, [1]);
  assert.deepEqual(r.participantes, [2]);
  assert.equal(ciclosAbertos[0]!.situacao, "CONCLUIDO");
  assert.ok(logs.some((l) => l.startsWith("agente_falha_no_ciclo")));
  assert.equal(logs.join("\n").includes(SEGREDO), false);
});

test("concorrência: dois disparos simultâneos não abrem o mesmo ciclo nem furam o limite", async () => {
  const { deps, sim, chamadas } = montar({ agentes: [ag(1, 50)], simulacao: { maxCiclos: 1 } });
  // deixa a decisão lenta para os dois disparos se sobreporem
  const original = deps.fases.decidir;
  deps.fases.decidir = async (a, r) => {
    await new Promise((res) => setTimeout(res, 20));
    return original(a, r);
  };
  const [r1, r2] = await Promise.all([executarCiclo(deps, 1), executarCiclo(deps, 1)]);
  const executaram = [r1, r2].filter((r) => r.executou).length;
  assert.equal(executaram, 1);
  assert.equal([r1, r2].find((r) => !r.executou)!.motivo, "CICLO_JA_EM_EXECUCAO");
  assert.equal(chamadas.decidir.length, 1);
  assert.equal(sim.cicloAtual, 1);
});

test("falha de banco no meio do ciclo: o bloqueio é liberado e o próximo disparo funciona", async () => {
  const { deps } = montar({ agentes: [ag(1, 50)] });
  const salvar = deps.agentes.listarDaSimulacao;
  deps.agentes.listarDaSimulacao = async () => {
    throw new Error("banco fora do ar");
  };
  await assert.rejects(() => executarCiclo(deps, 1), /banco fora do ar/);
  deps.agentes.listarDaSimulacao = salvar;
  const r = await executarCiclo(deps, 1);
  assert.equal(r.executou, true);
});
