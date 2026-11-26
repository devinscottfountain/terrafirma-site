// The sim's random numbers (dirt, sparks, the dig game's jitter). Math.random by default. ?solseed=N switches to a private seeded
// stream (QA only): the build runs in slices, so the order in which the page's other scripts and the sim draw from the global
// Math.random depends on timing; a private stream makes screenshots comparable whatever the interleaving.
let gen = Math.random;
export const rand = () => gen();
export function seedRand(seed) {   // mulberry32
  let a = seed | 0;
  gen = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
