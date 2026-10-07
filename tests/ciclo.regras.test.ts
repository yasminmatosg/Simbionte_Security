import { test } from "node:test";
import assert from "node:assert/strict";
import {
  avaliarAgenteNoCiclo,
  calcularLimiteCiclos,
  limiteAtingido,
  CICLOS_DE_SUSPENSAO,
  REPUTACAO_MINIMA,
} from "../src/modules/ciclo/ciclo.regras.ts";
import type { AgenteEstado } from "../src/modules/ciclo/ciclo.tipos.ts";

const agente = (reputacao: number, extra: Partial<AgenteEstado> = {}): AgenteEstado => ({
  id: 1,
  reputacao,
  ciclosSuspensaoRestantes: 0,
  emCicloDeGraca: false,
  ...extra,
});

test("constantes da regra: reputação mínima 10 e suspensão de 2 ciclos", () => {
  assert.equal(REPUTACAO_MINIMA, 10);
  assert.equal(CICLOS_DE_SUSPENSAO, 2);
});

test("limite: usa o teto global quando a simulação não define o próprio", () => {
  assert.equal(calcularLimiteCiclos(undefined, 100), 100);
  assert.equal(calcularLimiteCiclos(null, 100), 100);
});

test("limite: o valor da simulação vale se for menor que o teto", () => {
  assert.equal(calcularLimiteCiclos(30, 100), 30);
});

test("limite: o valor da simulação NUNCA passa do teto global", () => {
  assert.equal(calcularLimiteCiclos(5000, 100), 100);
});

test("limite: valores inválidos (0, negativo, decimal) caem no teto global", () => {
  assert.equal(calcularLimiteCiclos(0, 100), 100);
  assert.equal(calcularLimiteCiclos(-3, 100), 100);
  assert.equal(calcularLimiteCiclos(2.5, 100), 100);
});

test("limite: teto global inválido é erro de configuração", () => {
  assert.throws(() => calcularLimiteCiclos(10, 0), RangeError);
});

test("limiteAtingido compara ciclos concluídos com o limite", () => {
  assert.equal(limiteAtingido(2, 3), false);
  assert.equal(limiteAtingido(3, 3), true);
  assert.equal(limiteAtingido(4, 3), true);
});

test("suspensão: reputação 10 (igual ao mínimo) NÃO suspende", () => {
  const r = avaliarAgenteNoCiclo(agente(10));
  assert.equal(r.participa, true);
  assert.equal(r.evento, "NENHUM");
});

test("suspensão: reputação 9.99 (abaixo de 10) suspende", () => {
  const r = avaliarAgenteNoCiclo(agente(9.99));
  assert.equal(r.participa, false);
  assert.equal(r.evento, "SUSPENSAO_INICIADA");
});

test("suspensão: dura exatamente 2 ciclos e depois o agente volta (ciclo de graça)", () => {
  let a = agente(5);
  const linha: string[] = [];
  for (let ciclo = 1; ciclo <= 4; ciclo++) {
    const r = avaliarAgenteNoCiclo(a);
    linha.push(`${ciclo}:${r.participa ? "joga" : "suspenso"}:${r.evento}`);
    a = r.agente;
  }
  assert.deepEqual(linha, [
    "1:suspenso:SUSPENSAO_INICIADA",
    "2:suspenso:SUSPENSAO_ENCERRADA",
    "3:joga:CICLO_DE_GRACA",
    "4:suspenso:SUSPENSAO_INICIADA", // reputação continuou < 10: nova suspensão
  ]);
});

test("suspensão: se a reputação se recupera após a graça, o agente segue jogando", () => {
  let a = agente(5);
  for (let i = 0; i < 3; i++) a = avaliarAgenteNoCiclo(a).agente;
  a = { ...a, reputacao: 40 };
  const r = avaliarAgenteNoCiclo(a);
  assert.equal(r.participa, true);
  assert.equal(r.evento, "NENHUM");
});

test("avaliarAgenteNoCiclo não altera o objeto original (função pura)", () => {
  const original = agente(3);
  avaliarAgenteNoCiclo(original);
  assert.deepEqual(original, agente(3));
});
