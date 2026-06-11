// ENV vars: mask values by default
export function maskEnvLine(line: string) {
  const eq = line.indexOf("=");
  if (eq === -1) return line;
  const key = line.slice(0, eq + 1);
  const val = line.slice(eq + 1);
  if (!val) return line;
  return key + "•".repeat(Math.min(val.length, 12));
}
