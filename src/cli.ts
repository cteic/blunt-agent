import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evaluateBluntOutput } from "./evaluate.js";

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (inputPath === undefined || outputPath === undefined) {
    process.stderr.write("Usage: pnpm evaluate <input-file> <output-file>\n");
    process.exitCode = 2;
    return;
  }

  const [input, output] = await Promise.all([
    readFile(resolve(inputPath), "utf8"),
    readFile(resolve(outputPath), "utf8"),
  ]);
  const evaluation = evaluateBluntOutput(input, output);

  process.stdout.write(`${JSON.stringify(evaluation, null, 2)}\n`);

  if (!evaluation.passed) {
    process.exitCode = 1;
  }
}

await main();
