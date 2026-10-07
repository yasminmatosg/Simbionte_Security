// Demonstração (evidência): simulação com limite de 5 ciclos e 2 agentes,
// um deles com reputação 5 (< 10). Rode com: npm run demo:ciclo
import { executarCiclo } from "../src/modules/ciclo/ciclo.orquestrador.ts";
import type { AgenteEstado, DependenciasOrquestrador, Simulacao } from "../src/modules/ciclo/ciclo.tipos.ts";

const sim: Simulacao = { id: 1, status: "EM_EXECUCAO", cicloAtual: 0, maxCiclos: 5 };
const agentes = new Map<number, AgenteEstado>([
  [1, { id: 1, reputacao: 5, ciclosSuspensaoRestantes: 0, emCicloDeGraca: false }],
  [2, { id: 2, reputacao: 50, ciclosSuspensaoRestantes: 0, emCicloDeGraca: false }],
]);
let chamadasLLM = 0;

const deps: DependenciasOrquestrador = {
  tetoGlobalCiclos: 100,
  simulacoes: {
    buscar: async () => ({ ...sim }),
    atualizar: async (_i, p) => void Object.assign(sim, p),
  },
  ciclos: { abrir: async (_s, n) => ({ id: n }), fechar: async () => {} },
  agentes: {
    listarDaSimulacao: async () => [...agentes.values()].map((a) => ({ ...a })),
    salvarEstado: async (a) => void agentes.set(a.id, { ...a }),
  },
  fases: {
    perceber: async () => ({}),
    decidir: async () => {
      chamadasLLM++; // cada decisão = 1 chamada ao provedor
      return { action: "OCIOSO" };
    },
  },
};

const col = (t: string | number, n: number) => String(t).padEnd(n);
console.log(`${col("ciclo", 6)}${col("participaram", 14)}${col("suspensos", 11)}${col("chamadas LLM", 14)}status`);
for (let i = 1; i <= 7; i++) {
  const antes = chamadasLLM;
  const r = await executarCiclo(deps, 1);
  if (!r.executou) {
    console.log(`tentativa ${i}: NÃO executou (${r.motivo}); status=${sim.status}`);
    continue;
  }
  console.log(
    `${col(r.numeroCiclo!, 6)}${col(`[${r.participantes.sort()}]`, 14)}${col(`[${r.suspensos}]`, 11)}${col(chamadasLLM - antes, 14)}${sim.status}`,
  );
}
console.log(`Total de chamadas ao LLM: ${chamadasLLM}`);
