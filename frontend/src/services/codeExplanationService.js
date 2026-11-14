export const CODE_EXPLANATION_MODE = "local-demo";

export const SUPPORTED_CODE_LANGUAGES = [
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "js", label: "JavaScript" },
];

export const EXPLANATION_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGE_NAMES = Object.fromEntries(
  SUPPORTED_CODE_LANGUAGES.map(({ value, label }) => [value, label])
);

const CONCEPT_RULES = [
  {
    id: "variables",
    label: "Variables",
    description: "Named places where a program stores or updates values.",
    test: (line, language) => {
      if (language === "python") return /^\s*[A-Za-z_]\w*\s*=(?!=)/.test(line);
      if (language === "js") return /^\s*(?:const|let|var)\s+[\w$]+/.test(line);
      if (language === "css") return /^\s*--[\w-]+\s*:/.test(line);
      if (["c", "cpp", "java"].includes(language)) {
        return /^\s*(?:(?:const|static|final)\s+)*(?:int|float|double|char|bool|boolean|String|string|long|short|auto)\s+[\w]+\s*(?:[=;,\[]|$)/.test(line);
      }
      return false;
    },
  },
  {
    id: "data-types",
    label: "Data types",
    description: "Types describe what kind of value a variable can hold.",
    test: (line, language) => {
      if (["c", "cpp", "java"].includes(language)) {
        return /\b(?:int|float|double|char|bool|boolean|String|string|long|short|auto)\b/.test(line);
      }
      return /\b(?:int|float|str|bool)\s*\(/.test(line);
    },
  },
  {
    id: "operators",
    label: "Operators",
    description: "Symbols that compare values, combine conditions, or calculate results.",
    test: (line, language) => {
      if (language === "html") return false;
      if (language === "css") return /\bcalc\(|[+*/]\s*[\w.(]/.test(line);
      return /(?:===|!==|==|!=|<=|>=|=>|&&|\|\||\+\+|--|[+\-*/%]=?|[<>])/.test(line);
    },
  },
  {
    id: "conditionals",
    label: "Conditionals",
    description: "A decision point that selects code based on a condition.",
    test: (line) => /\b(?:if|else|elif|switch|case|when)\b/.test(line),
  },
  {
    id: "loops",
    label: "Loops",
    description: "A loop repeats a block of instructions.",
    test: (line, language) =>
      /^\s*(?:for|while|do)\b/.test(line) ||
      (language === "python" && /\bfor\b.+\bin\b/.test(line)),
  },
  {
    id: "functions",
    label: "Functions",
    description: "A named or reusable block of instructions.",
    test: (line, language) => {
      if (language === "python") return /^\s*(?:async\s+)?def\s+\w+\s*\(/.test(line);
      if (language === "js") {
        return /\bfunction\s+[\w$]+\s*\(|(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>/.test(line);
      }
      if (["c", "cpp", "java"].includes(language)) {
        return /^\s*(?:(?:public|private|protected|static|final|inline|virtual)\s+)*(?:[\w:<>*&]+\s+)+[\w~]+\s*\([^;]*\)\s*(?:\{|$)/.test(line);
      }
      return language === "css" && /[\w-]+\s*\([^)]*\)/.test(line);
    },
  },
  {
    id: "arrays",
    label: "Arrays and lists",
    description: "An ordered collection that keeps multiple values together.",
    test: (line, language) => {
      if (["html", "css"].includes(language)) return false;
      if (["c", "cpp", "java"].includes(language)) return /\w+\s*\[\s*\w*\s*\]/.test(line);
      return /\[[^\]]*\]/.test(line);
    },
  },
  {
    id: "objects",
    label: "Objects and maps",
    description: "A group of related values accessed by a name or key.",
    test: (line, language) => {
      if (language === "js") return /\{\s*[\w$]+\s*:/.test(line);
      if (language === "python") return /\{\s*[^{}:]+\s*:/.test(line);
      return /\b(?:Map|HashMap|Dictionary|dict)\b/.test(line);
    },
  },
  {
    id: "classes",
    label: "Classes",
    description: "A reusable definition for creating objects with related data and behavior.",
    test: (line) => /^\s*(?:(?:public|private|protected|abstract|final)\s+)*class\s+\w+/.test(line),
  },
  {
    id: "recursion",
    label: "Recursion",
    description: "A function calls itself to work through a smaller version of a problem.",
    test: () => false,
    findLines: (lines, language) => {
      const definitionPattern = language === "python"
        ? /^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(/
        : language === "js"
          ? /\bfunction\s+([\w$]+)\s*\(/
          : /^\s*(?:(?:public|private|protected|static|final|inline|virtual)\s+)*(?:[\w:<>*&]+\s+)+([\w~]+)\s*\([^;]*\)\s*(?:\{|$)/;
      const definitions = lines.flatMap((line, index) => {
        const name = line.match(definitionPattern)?.[1];
        return name ? [{ name, lineIndex: index }] : [];
      });

      return lines.flatMap((line, index) => {
        const isRecursiveCall = definitions.some(({ name, lineIndex }) =>
          !isCommentLine(line, language) &&
          lineIndex !== index &&
          new RegExp(`\\b${escapeRegExp(name)}\\s*\\(`).test(line)
        );
        return isRecursiveCall ? [index + 1] : [];
      });
    },
  },
  {
    id: "exceptions",
    label: "Exception handling",
    description: "Code that detects or responds to problems while the program runs.",
    test: (line) => /\b(?:try|catch|except|finally|throw|raise)\b/.test(line),
  },
  {
    id: "input-output",
    label: "Input and output",
    description: "Reading information into a program or showing information to a user.",
    test: (line) =>
      /\b(?:input|scanf|cin|Scanner|readLine|prompt|print|printf|println|console\.|System\.out|document\.write)\b|\bcout\s*<</.test(line),
  },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkAborted(signal) {
  if (!signal?.aborted) return;
  const error = new Error("The explanation request was cancelled.");
  error.name = "AbortError";
  throw error;
}

function isCommentLine(line, language) {
  const text = line.trim();
  if (language === "python") return text.startsWith("#");
  if (language === "html") return text.startsWith("<!--");
  return text.startsWith("//") || text.startsWith("/*") || text.startsWith("*");
}

function getConcepts(lines, language) {
  return CONCEPT_RULES.flatMap((rule) => {
    const lineNumbers = rule.findLines
      ? rule.findLines(lines, language)
      : lines.flatMap((line, index) =>
        !isCommentLine(line, language) && rule.test(line, language) ? [index + 1] : []
      );

    return lineNumbers.length
      ? [{
          id: rule.id,
          label: rule.label,
          description: rule.description,
          lineNumbers: [...new Set(lineNumbers)],
        }]
      : [];
  });
}

function getLineExplanation(line, language, level, conceptLabels) {
  const text = line.trim();
  const concepts = conceptLabels.length ? conceptLabels.join(", ") : null;
  let explanation;

  if (!text) return null;

  if (/^(?:\/\/|\/\*|\*|#(?!include)|<!--)/.test(text)) {
    explanation = "This is a comment for people reading the code; it is not an instruction the program runs.";
  } else if (language === "html") {
    if (/^<!doctype/i.test(text)) {
      explanation = "This tells the browser which version of HTML rules to use for this document.";
    } else if (/^<\/?[\w-]+/.test(text)) {
      const tag = text.match(/^<\/?([\w-]+)/)?.[1];
      explanation = `This ${text.startsWith("</") ? "closes" : "creates"} an HTML ${tag} element, which gives the page structure or content.`;
    } else {
      explanation = "This line adds text or an attribute to the page structure.";
    }
  } else if (language === "css") {
    if (text.startsWith("@")) {
      explanation = "This CSS rule applies a special instruction, such as a responsive rule or animation.";
    } else if (text.endsWith("{")) {
      explanation = "This selector chooses which page elements the following style rules will affect.";
    } else if (text === "}") {
      explanation = "This closes the current CSS rule block.";
    } else if (text.includes(":")) {
      const property = text.split(":")[0].trim();
      explanation = `This sets the ${property} style for the elements selected above.`;
    } else {
      explanation = "This line is part of a CSS style rule.";
    }
  } else if (/^(?:#include|import\b|from\b)/.test(text)) {
    explanation = "This makes code or tools from another module available to this program.";
  } else if (/^(?:public\s+)?static\s+void\s+main|^int\s+main\s*\(/.test(text)) {
    explanation = "This declares the program's main starting function.";
  } else if (/^(?:async\s+)?def\s+|^function\b|=>\s*\{/.test(text)) {
    explanation = "This begins a reusable function that can perform a named task.";
  } else if (/\b(?:if|else|elif|switch|case|when)\b/.test(text)) {
    explanation = "This checks a condition and chooses which instructions should run.";
  } else if (/^(?:for|while|do)\b/.test(text)) {
    explanation = language === "js" && /^for\s*\(/.test(text)
      ? "This loop starts with an initial value, repeats while its condition is true, and updates the value after each repetition."
      : "This starts a loop that repeats instructions while its rule allows.";
  } else if (/^(?:return|break|continue)\b/.test(text)) {
    explanation = text.startsWith("return")
      ? "This sends a result back from the current function and ends that function's current run."
      : "This changes which repetition or block of code runs next.";
  } else if (/\b(?:print|printf|println|console\.|System\.out|document\.write)\b|\bcout\s*<</.test(text)) {
    explanation = "This sends text or a value to the program's output.";
  } else if (/\b(?:input|scanf|cin\s*>>|Scanner|readLine|prompt)\b/.test(text)) {
    explanation = "This reads information that the program can use later.";
  } else if (/\b(?:try|catch|except|finally|throw|raise)\b/.test(text)) {
    explanation = "This handles a possible error or signals that something went wrong.";
  } else if (/^[{}()[\];]+$/.test(text)) {
    explanation = "This punctuation groups or separates parts of the code.";
  } else if (/(?:const|let|var)\s+[\w$]+\s*=|^[A-Za-z_]\w*\s*=(?!=)|^\w[\w:<>\s*&]*\s+\w+\s*(?:=|;)/.test(text)) {
    explanation = "This creates or updates a named value so the program can use it later.";
  } else if (/\bclass\s+\w+/.test(text)) {
    explanation = "This defines a class, a reusable shape for related data and behavior.";
  } else {
    explanation = "This instruction contributes to the program's logic or data.";
  }

  if (level === "intermediate" && concepts) {
    explanation += ` It uses ${concepts.toLowerCase()}.`;
  } else if (level === "advanced") {
    explanation += " This explanation is based on the line's visible syntax; runtime behavior can depend on surrounding code and input.";
  }

  return explanation;
}

function summarizePurpose(language, code, concepts, scope, contextConcepts) {
  const labels = concepts.map(({ label }) => label.toLowerCase());
  const languageName = LANGUAGE_NAMES[language];

  if (scope === "selected") {
    const context = contextConcepts.length
      ? ` The surrounding program also contains ${contextConcepts.map(({ label }) => label.toLowerCase()).join(", ")}.`
      : "";
    return `This selected ${languageName} section is part of the larger program. It contains ${labels.length ? labels.join(", ") : "instructions or markup"}; the exact result depends on the surrounding code.${context}`;
  }

  if (language === "html") {
    return "This HTML code describes the structure and content a browser can display as a web page.";
  }

  if (language === "css") {
    return "This CSS code describes how selected elements on a web page should look.";
  }

  const actions = [];
  if (labels.includes("input and output")) actions.push("reads or displays information");
  if (labels.includes("loops")) actions.push("repeats instructions");
  if (labels.includes("conditionals")) actions.push("makes decisions");
  if (labels.includes("functions")) actions.push("organizes work into reusable functions");

  if (!actions.length) actions.push("runs the instructions shown");

  return `This ${languageName} code ${actions.join(", ")}. The detected constructs are based on simple local pattern checks, not code execution.`;
}

function makeExecutionFlow(lines, concepts, language) {
  const firstStep = {
    title: "Program begins",
    description: language === "html" || language === "css"
      ? `The browser reads the ${LANGUAGE_NAMES[language]} content from the top.`
      : "The runtime starts the program and prepares its instructions.",
    lineNumber: 1,
  };

  const stages = [
    {
      id: "variables",
      title: "Values are prepared",
      description: "The code creates or updates named values used by later instructions.",
    },
    {
      id: "input-output",
      title: "Input or output is handled",
      description: "The code reads information or displays a message.",
    },
    {
      id: "conditionals",
      title: "A decision may be made",
      description: "A condition controls which branch of code can run.",
    },
    {
      id: "loops",
      title: "Instructions may repeat",
      description: "A loop repeats its body according to its condition or collection.",
    },
    {
      id: "functions",
      title: "Reusable work is defined or called",
      description: "A function groups instructions so they can be run as one task.",
    },
    {
      id: "exceptions",
      title: "Possible errors are handled",
      description: "The code includes a block for responding to an error.",
    },
  ];

  const detectedStages = stages.flatMap((stage) => {
    const concept = concepts.find(({ id }) => id === stage.id);
    if (!concept) return [];
    return [{
      title: stage.title,
      description: stage.description,
      lineNumber: concept.lineNumbers[0],
    }];
  });

  detectedStages.sort((a, b) => a.lineNumber - b.lineNumber);
  if (concepts.some(({ id }) => id === "input-output")) {
    const outputLine = lines.findIndex((line) =>
      /\b(?:print|printf|println|console\.|System\.out|document\.write)\b|\bcout\s*<</.test(line)
    );
    if (outputLine >= 0) {
      detectedStages.push({
        title: "The program produces a result",
        description: "An output instruction displays text or a value.",
        lineNumber: outputLine + 1,
      });
    }
  }

  return [firstStep, ...detectedStages.sort((a, b) => a.lineNumber - b.lineNumber)]
    .map((step, index) => ({ ...step, order: index + 1 }));
}

function makeExample(language, concepts) {
  const ids = concepts.map(({ id }) => id);
  const hasLoop = ids.includes("loops");
  const hasCondition = ids.includes("conditionals");
  const hasFunction = ids.includes("functions");

  if (language === "html") {
    return {
      title: "A small HTML element",
      code: "<h1>Hello!</h1>",
      expectedOutput: "A large heading that says Hello!",
      analogy: "HTML is like the frame and labels of a page.",
    };
  }

  if (language === "css") {
    return {
      title: "A small style rule",
      code: ".notice {\n  color: #182b49;\n}",
      expectedOutput: "Elements with class=\"notice\" use navy text.",
      analogy: "CSS is like choosing the paint and layout for a room.",
    };
  }

  if (hasLoop) {
    const samples = {
      js: { code: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}", output: "0\n1\n2" },
      python: { code: "for i in range(3):\n    print(i)", output: "0\n1\n2" },
      c: { code: "for (int i = 0; i < 3; i++) {\n  printf(\"%d\\n\", i);\n}", output: "0\n1\n2" },
      cpp: { code: "for (int i = 0; i < 3; i++) {\n  cout << i << endl;\n}", output: "0\n1\n2" },
      java: { code: "for (int i = 0; i < 3; i++) {\n  System.out.println(i);\n}", output: "0\n1\n2" },
    };
    const sample = samples[language] || samples.js;
    return {
      title: "A loop that counts to two",
      code: sample.code,
      expectedOutput: sample.output,
      analogy: "A loop is like checking each item in a short list, one at a time.",
    };
  }

  if (hasCondition) {
    const conditionExamples = {
      c: {
        code: "#include <stdio.h>\nint main() {\n  int score = 8;\n  if (score >= 5) printf(\"Pass\\n\");\n  return 0;\n}",
        expectedOutput: "Pass",
      },
      cpp: {
        code: "#include <iostream>\nint main() {\n  int score = 8;\n  if (score >= 5) std::cout << \"Pass\";\n  return 0;\n}",
        expectedOutput: "Pass",
      },
      java: {
        code: "class Main {\n  public static void main(String[] args) {\n    int score = 8;\n    if (score >= 5) System.out.println(\"Pass\");\n  }\n}",
        expectedOutput: "Pass",
      },
      js: {
        code: "const score = 8;\nif (score >= 5) {\n  console.log(\"Pass\");\n}",
        expectedOutput: "Pass",
      },
      python: {
        code: "score = 8\nif score >= 5:\n    print(\"Pass\")",
        expectedOutput: "Pass",
      },
    };
    const sample = conditionExamples[language] || conditionExamples.js;
    return {
      title: "A simple decision",
      code: sample.code,
      expectedOutput: sample.expectedOutput,
      analogy: "A condition is like a fork in a road: the result decides which path to take.",
    };
  }

  if (hasFunction) {
    const functionExamples = {
      c: "int add(int first, int second) {\n  return first + second;\n}",
      cpp: "int add(int first, int second) {\n  return first + second;\n}",
      java: "static int add(int first, int second) {\n  return first + second;\n}",
      js: "function add(first, second) {\n  return first + second;\n}",
      python: "def add(first, second):\n    return first + second",
    };
    return {
      title: "A reusable addition function",
      code: functionExamples[language] || functionExamples.js,
      expectedOutput: "Calling add(2, 3) returns 5.",
      analogy: "A function is like a small recipe that can be used whenever needed.",
    };
  }

  const simpleExamples = {
    c: {
      code: "#include <stdio.h>\nint main() {\n  int number = 5;\n  printf(\"%d\\n\", number);\n  return 0;\n}",
      expectedOutput: "5",
    },
    cpp: {
      code: "#include <iostream>\nint main() {\n  int number = 5;\n  std::cout << number << std::endl;\n  return 0;\n}",
      expectedOutput: "5",
    },
    java: {
      code: "class Main {\n  public static void main(String[] args) {\n    int number = 5;\n    System.out.println(number);\n  }\n}",
      expectedOutput: "5",
    },
    js: {
      code: "const message = \"Hello\";\nconsole.log(message);",
      expectedOutput: "Hello",
    },
    python: {
      code: "message = \"Hello\"\nprint(message)",
      expectedOutput: "Hello",
    },
  };
  const sample = simpleExamples[language] || simpleExamples.js;
  return {
    title: "A simple value and output",
    code: sample.code,
    expectedOutput: sample.expectedOutput,
    analogy: "A variable is like a labeled container that holds a value.",
  };
}

function findDiagnostics(code, language) {
  const warnings = [];
  let codeWithoutComments = code;

  if (language === "python") {
    codeWithoutComments = codeWithoutComments.replace(/#.*$/gm, "");
  } else if (["js", "c", "cpp", "java", "css"].includes(language)) {
    codeWithoutComments = codeWithoutComments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
  }

  codeWithoutComments = codeWithoutComments
    .replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  for (const [open, close] of [["{", "}"], ["(", ")"], ["[", "]"]]) {
    const openCount = [...codeWithoutComments].filter((character) => character === open).length;
    const closeCount = [...codeWithoutComments].filter((character) => character === close).length;
    if (openCount !== closeCount) {
      warnings.push(`The number of "${open}" and "${close}" characters does not match. Check for an incomplete block or expression.`);
    }
  }

  if (/([=+\-*/]|&&|\|\||->)\s*$/.test(code.trim())) {
    warnings.push("The code ends with an operator, so the final expression may be incomplete.");
  }

  if (language === "python") {
    const lines = code.split("\n");
    const lastBlockLine = lines.reduce(
      (lastIndex, line, index) =>
        /^\s*(?:if|elif|else|for|while|def|class|try|except)\b.*:\s*$/.test(line)
          ? index
          : lastIndex,
      -1
    );
    if (lastBlockLine >= 0 && !lines.slice(lastBlockLine + 1).some((line) => line.trim())) {
      warnings.push("A Python block header appears at the end without an indented body.");
    }
  }

  return warnings;
}

function getExpectedOutput(code, language) {
  if (language === "html") {
    return "The HTML describes content for a browser to render. This local explanation does not render the page.";
  }
  if (language === "css") {
    return "CSS changes how matching page elements look; it does not produce console output by itself.";
  }

  const literalOutput = code.split("\n").flatMap((line) => {
    const match = line.match(/(?:print|printf|println|log|write)\s*\(\s*(["'`])([^"'`]*)\1/) ||
      line.match(/cout\s*<<\s*(["'`])([^"'`]*)\1/);
    return match ? [match[2]] : [];
  });

  if (literalOutput.length) {
    return `The output statements contain this literal text: ${literalOutput.map((text) => `"${text}"`).join(", ")}. Other values may depend on input and runtime execution.`;
  }

  return "The exact output cannot be determined by this local static demo. Run the program in the Code Playground to see its actual result.";
}

export async function explainCode({
  code,
  contextCode = code,
  language,
  level = "beginner",
  scope = "all",
  lineOffset = 0,
  signal,
}) {
  checkAborted(signal);

  if (typeof code !== "string" || !code.trim()) {
    const error = new Error("Enter some code before requesting an explanation.");
    error.code = "EMPTY_CODE";
    throw error;
  }

  if (!Object.prototype.hasOwnProperty.call(LANGUAGE_NAMES, language)) {
    const error = new Error("Select one of the supported programming languages.");
    error.code = "UNSUPPORTED_LANGUAGE";
    throw error;
  }

  if (!EXPLANATION_LEVELS.some((item) => item.value === level)) {
    const error = new Error("Select a valid explanation level.");
    error.code = "UNSUPPORTED_LEVEL";
    throw error;
  }

  await Promise.resolve();
  checkAborted(signal);

  const sourceLines = code.split("\n");
  const contextLines = contextCode.split("\n");
  const concepts = getConcepts(sourceLines, language).map((concept) => ({
    ...concept,
    lineNumbers: concept.lineNumbers.map((lineNumber) => lineNumber + lineOffset),
  }));
  const contextConcepts = scope === "selected"
    ? getConcepts(contextLines, language)
    : concepts;
  const baseOverview = summarizePurpose(language, code, concepts, scope, contextConcepts);
  const overview = level === "intermediate" && concepts.length
    ? `${baseOverview} Key ideas in this snippet include ${concepts.map(({ label }) => label.toLowerCase()).join(", ")}.`
    : level === "advanced"
      ? `${baseOverview} This is a static syntax-pattern pass; it does not build an abstract syntax tree or evaluate runtime state.`
      : baseOverview;
  const lines = sourceLines.flatMap((line, index) => {
    if (!line.trim()) return [];
    const lineConcepts = CONCEPT_RULES
      .filter((rule) => rule.test(line, language))
      .map(({ label }) => label);

    return [{
      lineNumber: index + lineOffset + 1,
      code: line,
      explanation: getLineExplanation(line, language, level, lineConcepts),
    }];
  });

  return {
    mode: CODE_EXPLANATION_MODE,
    language: LANGUAGE_NAMES[language],
    level,
    scope,
    overview,
    lines,
    concepts,
    executionFlow: makeExecutionFlow(sourceLines, concepts, language).map((step) => ({
      ...step,
      lineNumber: step.lineNumber + lineOffset,
    })),
    example: makeExample(language, concepts),
    expectedOutput: getExpectedOutput(code, language),
    warnings: findDiagnostics(code, language),
    disclaimer: "Local demo explanation — rule-based and not AI-generated. Code stays in your browser and is not sent to an AI service.",
  };
}
