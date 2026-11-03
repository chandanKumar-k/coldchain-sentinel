// Central place for the permitted range and severity/risk rules.
export const TEMP_MIN = 2;
export const TEMP_MAX = 8;
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
const distance = (t: number) => (t > TEMP_MAX ? t - TEMP_MAX : TEMP_MIN - t);
export const isExcursion = (t: number) => t < TEMP_MIN || t > TEMP_MAX;
// Severity by distance outside the range (°C)
export function severityFor(t: number): Severity {
  const d = distance(t);
  return d >= 4 ? "CRITICAL" : d >= 2.5 ? "HIGH" : d >= 1 ? "MEDIUM" : "LOW";
}
// Risk 0-100 = distance*10 + minutes*0.5, capped
export const riskScore = (t: number, minutes: number) =>
  Math.max(0, Math.min(100, Math.round(distance(t) * 10 + minutes * 0.5)));
