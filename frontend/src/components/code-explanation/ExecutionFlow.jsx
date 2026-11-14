import { ArrowDown, CornerDownRight } from "lucide-react";

export default function ExecutionFlow({ steps, onSelectLine }) {
  if (!steps.length) {
    return (
      <p className="code-explanation-muted">
        There is not enough code for the local demo to infer an execution flow.
      </p>
    );
  }

  return (
    <ol className="code-explanation-flow">
      {steps.map((step, index) => (
        <li key={`${step.order}-${step.title}-${step.lineNumber}`}>
          <span className="code-explanation-flow-index">{index + 1}</span>
          <div className="code-explanation-flow-copy">
            <strong>{step.title}</strong>
            <p>{step.description}</p>
            <button type="button" onClick={() => onSelectLine(step.lineNumber)}>
              <CornerDownRight size={13} />
              Source line {step.lineNumber}
            </button>
          </div>
          {index < steps.length - 1 && <ArrowDown className="code-explanation-flow-arrow" size={15} />}
        </li>
      ))}
    </ol>
  );
}
