import * as allure from 'allure-js-commons';
import assert from 'node:assert/strict';
import { ApiResponse } from '../api/types';

const SHAPES = new Map<string, RegExp>([
  ['<uuid>', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i],
  ['<fecha-iso>', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/],
  ['<texto>', /^.+$/s],
]);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Reemplaza valores dinámicos reales por su marcador si cumplen la forma esperada. */
function applyShapes(actual: unknown, expected: unknown): unknown {
  if (typeof expected === 'string') {
    const shape = SHAPES.get(expected);
    if (shape && typeof actual === 'string' && shape.test(actual)) return expected;
    return actual;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    return actual.map((v, i) => applyShapes(v, expected[i]));
  }
  if (isRecord(expected) && isRecord(actual)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(actual)) out[k] = applyShapes(v, expected[k]);
    return out;
  }
  return actual;
}

export function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Falta "${what}": revisa que un paso previo lo haya preparado.`);
  }
  return value;
}

export function bodyOf<T>(res: ApiResponse<unknown>): T {
  return required(res.body, 'cuerpo de la respuesta') as T;
}

/** Compara cuerpo completo (ningún campo de más ni de menos) y adjunta esperado/obtenido a Allure. */
export async function expectJson(title: string, expected: unknown, actual: unknown): Promise<void> {
  await allure.step(title, async () => {
    await allure.attachment('Esperado', JSON.stringify(expected, null, 2), 'application/json');
    await allure.attachment('Obtenido', JSON.stringify(actual, null, 2), 'application/json');
    assert.deepStrictEqual(applyShapes(actual, expected), expected);
  });
}

export async function expectEqual<T>(title: string, expected: T, actual: T): Promise<void> {
  await allure.step(title, async () => {
    await allure.attachment('Esperado', JSON.stringify(expected), 'application/json');
    await allure.attachment('Obtenido', JSON.stringify(actual), 'application/json');
    assert.deepStrictEqual(actual, expected);
  });
}

export const expectStatus = (title: string, expected: number, actual: number) =>
  expectEqual(`${title} (HTTP ${expected})`, expected, actual);
