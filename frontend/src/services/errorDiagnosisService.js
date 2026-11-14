const errorTypes = [
  {
    pattern: /\b(?:syntaxerror|parseerror|unexpected token|unexpected end|expected .*token)\b/i,
    title: "Syntax or Parse Error",
    category: "Code structure · Syntax/Parse Error",
    severity: "Syntax error",
    summary: "The code could not be parsed as valid syntax.",
    cause: "A missing delimiter, misspelled keyword, incomplete expression, or unsupported language syntax may be preventing the program from being parsed.",
    checks: [
      "Are quotes, brackets, braces, and parentheses properly paired?",
      "Does the indicated line follow the syntax rules for the selected language?",
      "Is the project using a language version that supports this syntax?",
    ],
  },
  {
    pattern: /\b(?:referenceerror|nameerror|not defined|undefined variable|unboundlocalerror)\b/i,
    title: "Unknown or Unavailable Name",
    category: "Variable or scope · Runtime Error",
    severity: "Runtime error",
    summary: "The program tried to use a name that is not available in its current scope.",
    cause: "The name may be misspelled, declared in another scope, or used before its value has been assigned.",
    checks: [
      "Is the name spelled the same way where it is declared and used?",
      "Is the declaration in scope at the point of use?",
      "Does this execution path assign the value before reading it?",
    ],
  },
  {
    pattern: /\b(?:typeerror|type error|cannot read properties|is not a function|cannot convert|invalid cast)\b/i,
    title: "Type or Value Error",
    category: "Data types · Runtime Error",
    severity: "Runtime error",
    summary: "An operation received a value of a type or shape it could not use.",
    cause: "A value may be null or undefined, have an unexpected type, or not support the operation being attempted.",
    checks: [
      "What value and type reach the failing expression?",
      "Can an input, API response, or conversion produce a different value than expected?",
      "Should the code validate or handle an empty value before using it?",
    ],
  },
  {
    pattern: /\b(?:modulenotfounderror|importerror|module not found|cannot find module|no module named)\b/i,
    title: "Import or Dependency Error",
    category: "Imports · Build or Runtime Error",
    severity: "Import error",
    summary: "The program could not load a module, package, or imported file.",
    cause: "The dependency may be missing from the active environment, or the import name, path, or capitalization may be incorrect.",
    checks: [
      "Is the dependency installed in the environment that runs this program?",
      "Does the imported file exist at the specified path?",
      "Is the import name correct for the package and language?",
    ],
  },
  {
    pattern: /\b(?:failed to fetch|network error|cors|connection refused|http(?: error)?\s*[45]\d\d|status code\s*[45]\d\d)\b/i,
    title: "Network or Request Error",
    category: "Network · Request Error",
    severity: "Network error",
    summary: "A network request could not complete successfully.",
    cause: "The address, server state, network connection, access permissions, or response status may be preventing the request from succeeding.",
    checks: [
      "Does the request URL and HTTP method match the intended endpoint?",
      "Is the server reachable and returning the expected status?",
      "Do the browser Network panel and response headers show a CORS or authentication issue?",
    ],
  },
  {
    pattern: /\b(?:filenotfounderror|enoent|no such file|file not found|access is denied|permission denied|eacces)\b/i,
    title: "File or Permission Error",
    category: "Files · Environment Error",
    severity: "Environment error",
    summary: "The program could not access a file or directory it expected to use.",
    cause: "The path may be incorrect, the file may not exist in the current working directory, or the process may not have permission to access it.",
    checks: [
      "Does the file exist at the path used by the running process?",
      "Is the working directory what the program expects?",
      "Does the current user or process have the required access permissions?",
    ],
  },
  {
    pattern: /\b(?:timeout|timed out|deadline exceeded|operation took too long)\b/i,
    title: "Timeout Error",
    category: "Execution · Timeout",
    severity: "Timeout",
    summary: "An operation did not complete before its time limit.",
    cause: "The operation may be waiting on a slow resource, blocked request, or loop that is not making progress.",
    checks: [
      "Which operation was running when the time limit was reached?",
      "Is the operation waiting on a network or file resource?",
      "Does a loop or retry continue without a clear stopping condition?",
    ],
  },
  {
    pattern: /\b(?:out of memory|heap out of memory|stack overflow|recursionerror|maximum call stack)\b/i,
    title: "Memory or Call-Stack Error",
    category: "Resources · Runtime Error",
    severity: "Runtime error",
    summary: "The program exceeded available memory or call-stack capacity.",
    cause: "A large allocation, unbounded growth, or recursion without a reachable stopping condition may be using too many resources.",
    checks: [
      "Is a collection or buffer growing without a limit?",
      "Does recursive code always move toward its base case?",
      "Can the program process the data in smaller batches?",
    ],
  },
  {
    pattern: /\b(?:assertionerror|assertion failed|test failed|expected .* but (?:got|received))\b/i,
    title: "Assertion or Test Failure",
    category: "Tests · Behavior Mismatch",
    severity: "Test failure",
    summary: "A check or test received a result different from what it expected.",
    cause: "The implementation, test expectation, or test data may not match the behavior being checked.",
    checks: [
      "What exact value did the test expect, and what value did it receive?",
      "Are the test inputs and setup representative of the intended case?",
      "Did a recent change alter the expected behavior?",
    ],
  },
];

const generalChecks = [
  "What exact action triggers the error?",
  "Does the stack trace identify a file and line in your own code?",
  "What changed immediately before the error started?",
];

const generalDocs = [
  {
    label: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
  },
  {
    label: "Stack Overflow",
    url: "https://stackoverflow.com/",
  },
];

export function createGeneralErrorGuide(message) {
  const lines = String(message || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] || "No error details were provided.";
  const excerpt = firstLine.length > 140
    ? `${firstLine.slice(0, 137)}...`
    : firstLine;
  const matchedType = errorTypes.find(({ pattern }) => pattern.test(message));
  const errorName = firstLine.match(/\b[A-Za-z][A-Za-z0-9]*(?:Error|Exception|Failure)\b/);
  const location = String(message).match(
    /[\w./\\-]+\.(?:jsx?|tsx?|mjs|py|java|c|cc|cpp|h|hpp|cs|go|rs|php|rb):\d+(?::\d+)?/i
  );
  const steps = [
    "Start with the first line to identify the exception or failure type.",
    location
      ? `Inspect ${location[0]} and the expression that produced the error.`
      : "Find the file and line number in the stack trace, then inspect the expression that failed.",
    "Check the values, types, inputs, and environment used by that expression.",
    "Review the first stack-trace frame that points to your project rather than a library.",
    "Reproduce the issue with the smallest input that still causes it.",
  ];

  return {
    title: matchedType?.title || errorName?.[0] || "General Code Error Review",
    category: matchedType?.category || "Code · General investigation",
    severity: matchedType?.severity || "Needs investigation",
    summary: `${matchedType?.summary || "The error message identifies a failure, but its exact meaning depends on the language and the code around it."} Message: "${excerpt}"`,
    cause: matchedType?.cause || "Use the exception name, source location, and surrounding code to narrow down the cause. The local demo cannot inspect your project or runtime state, so this is a general triage rather than a confirmed root cause.",
    steps,
    checks: matchedType?.checks || generalChecks,
    code: null,
    docs: generalDocs,
  };
}
