import assert from "node:assert/strict";
import test from "node:test";
import {
  CODE_EXPLANATION_MODE,
  SUPPORTED_CODE_LANGUAGES,
  explainCode,
} from "./codeExplanationService.js";

const samples = {
  c: "#include <stdio.h>\nint main() {\n  int count = 3;\n  printf(\"%d\", count);\n  return 0;\n}",
  cpp: "#include <iostream>\nint main() {\n  int count = 3;\n  std::cout << count;\n  return 0;\n}",
  java: "class Main {\n  public static void main(String[] args) {\n    int count = 3;\n    System.out.println(count);\n  }\n}",
  python: "count = 3\nprint(count)",
  html: "<main>\n  <h1>Hello</h1>\n</main>",
  css: ".card {\n  color: navy;\n}",
  js: "const count = 3;\nconsole.log(count);",
};

test("provides explicitly local explanations for all supported languages", async () => {
  for (const { value, label } of SUPPORTED_CODE_LANGUAGES) {
    const result = await explainCode({ code: samples[value], language: value });
    assert.equal(result.language, label);
    assert.equal(result.mode, CODE_EXPLANATION_MODE);
    assert.ok(result.lines.length > 0);
    assert.match(result.disclaimer, /not AI-generated/i);
    assert.ok(result.example.code.length > 0);
  }
});

test("detects code concepts and orders flow using the source lines", async () => {
  const result = await explainCode({
    code: "const count = 5;\nfor (let i = 0; i < count; i++) {\n  console.log(i);\n}",
    language: "js",
  });

  assert.deepEqual(
    result.concepts.map(({ id }) => id),
    ["variables", "operators", "loops", "input-output"]
  );
  assert.deepEqual(
    result.executionFlow.map(({ lineNumber }) => lineNumber),
    [1, 1, 2, 3, 3]
  );
});

test("maps selected code explanations back to original source lines", async () => {
  const result = await explainCode({
    code: "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}",
    contextCode: samples.js,
    language: "js",
    scope: "selected",
    lineOffset: 6,
  });

  assert.equal(result.scope, "selected");
  assert.equal(result.lines[0].lineNumber, 7);
  assert.match(result.overview, /surrounding program/i);
});

test("detects recursive code and changes detail across explanation levels", async () => {
  const code = "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)";
  const beginner = await explainCode({ code, language: "python", level: "beginner" });
  const intermediate = await explainCode({ code, language: "python", level: "intermediate" });
  const advanced = await explainCode({ code, language: "python", level: "advanced" });

  assert.ok(beginner.concepts.some(({ id }) => id === "recursion"));
  assert.ok(beginner.concepts.some(({ id }) => id === "conditionals"));
  assert.notEqual(beginner.overview, intermediate.overview);
  assert.match(advanced.overview, /abstract syntax tree/);
});

test("rejects empty code and unsupported languages with clear error codes", async () => {
  await assert.rejects(
    explainCode({ code: "  ", language: "js" }),
    (error) => error.code === "EMPTY_CODE"
  );
  await assert.rejects(
    explainCode({ code: "print('hello')", language: "ruby" }),
    (error) => error.code === "UNSUPPORTED_LANGUAGE"
  );
});

test("honors an aborted explanation request", async () => {
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    explainCode({ code: samples.js, language: "js", signal: controller.signal }),
    (error) => error.name === "AbortError"
  );
});
