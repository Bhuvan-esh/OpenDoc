import test from "node:test";
import assert from "node:assert/strict";
import { createGeneralErrorGuide } from "./errorDiagnosisService.js";

test("provides a useful general review for an unfamiliar error message", () => {
  const result = createGeneralErrorGuide(
    "CustomCompilerFailure: invalid operand\nat src/main.cpp:22:6"
  );

  assert.equal(result.title, "CustomCompilerFailure");
  assert.match(result.summary, /invalid operand/);
  assert.match(result.steps[1], /src\/main\.cpp:22:6/);
  assert.ok(result.checks.length > 0);
  assert.doesNotMatch(result.summary, /does not match.*supported demo patterns/i);
});

test("classifies common error families even when the exact message is unfamiliar", () => {
  const result = createGeneralErrorGuide(
    "ReferenceError: configName is not defined"
  );

  assert.equal(result.title, "Unknown or Unavailable Name");
  assert.match(result.category, /scope/i);
  assert.match(result.cause, /misspelled/i);
});

test("keeps oversized messages bounded in the generated summary", () => {
  const result = createGeneralErrorGuide(`UnexpectedBuildFailure: ${"x".repeat(300)}`);

  assert.ok(result.summary.length < 300);
});
