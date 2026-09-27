// Safe arithmetic evaluator for calculator blocks.
// No eval / Function — a tiny tokenizer + shunting-yard + RPN evaluator so that
// AI- or user-authored formulas can never execute arbitrary code.

type Token =
  | { t: "num"; v: number }
  | { t: "var"; v: string }
  | { t: "op"; v: string }
  | { t: "fn"; v: string }
  | { t: "paren"; v: "(" | ")" }
  | { t: "comma" };

const FUNCTIONS: Record<string, (...a: number[]) => number> = {
  min: Math.min,
  max: Math.max,
  round: (x) => Math.round(x),
  floor: Math.floor,
  ceil: Math.ceil,
  abs: Math.abs,
  sqrt: Math.sqrt,
  pow: (a, b) => Math.pow(a, b),
};

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  "^": 3,
  "u-": 4, // unary minus
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const isDigit = (c: string) => c >= "0" && c <= "9";
  const isAlpha = (c: string) => /[a-zA-Z_]/.test(c);

  while (i < input.length) {
    const c = input[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (isDigit(c) || (c === "." && isDigit(input[i + 1]))) {
      let num = "";
      while (i < input.length && (isDigit(input[i]) || input[i] === ".")) {
        num += input[i++];
      }
      tokens.push({ t: "num", v: parseFloat(num) });
      continue;
    }
    if (isAlpha(c)) {
      let name = "";
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        name += input[i++];
      }
      // function if immediately followed by (
      let j = i;
      while (j < input.length && input[j] === " ") j++;
      if (input[j] === "(" && FUNCTIONS[name]) {
        tokens.push({ t: "fn", v: name });
      } else {
        tokens.push({ t: "var", v: name });
      }
      continue;
    }
    if ("+-*/%^".includes(c)) {
      tokens.push({ t: "op", v: c });
      i++;
      continue;
    }
    if (c === "(" || c === ")") {
      tokens.push({ t: "paren", v: c });
      i++;
      continue;
    }
    if (c === ",") {
      tokens.push({ t: "comma" });
      i++;
      continue;
    }
    throw new Error(`Unexpected character "${c}" in formula`);
  }
  return tokens;
}

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | null = null;

  for (const tok of tokens) {
    if (tok.t === "num" || tok.t === "var") {
      output.push(tok);
    } else if (tok.t === "fn") {
      stack.push(tok);
    } else if (tok.t === "comma") {
      while (stack.length && !(stack[stack.length - 1].t === "paren")) {
        output.push(stack.pop()!);
      }
    } else if (tok.t === "op") {
      let op = tok.v;
      // unary minus detection
      if (
        op === "-" &&
        (prev === null ||
          prev.t === "op" ||
          (prev.t === "paren" && prev.v === "(") ||
          prev.t === "comma")
      ) {
        op = "u-";
      }
      const rightAssoc = op === "^" || op === "u-";
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.t === "op" || top.t === "fn") {
          const topPrec = top.t === "fn" ? 99 : PRECEDENCE[top.v];
          if (topPrec > PRECEDENCE[op] || (topPrec === PRECEDENCE[op] && !rightAssoc)) {
            output.push(stack.pop()!);
            continue;
          }
        }
        break;
      }
      stack.push({ t: "op", v: op });
    } else if (tok.t === "paren") {
      if (tok.v === "(") {
        stack.push(tok);
      } else {
        while (stack.length && !(stack[stack.length - 1].t === "paren")) {
          output.push(stack.pop()!);
        }
        stack.pop(); // remove "("
        if (stack.length && stack[stack.length - 1].t === "fn") {
          output.push(stack.pop()!);
        }
      }
    }
    prev = tok;
  }
  while (stack.length) {
    const t = stack.pop()!;
    if (t.t === "paren") throw new Error("Mismatched parentheses");
    output.push(t);
  }
  return output;
}

export function evaluateFormula(
  formula: string,
  vars: Record<string, number>
): number {
  if (!formula || !formula.trim()) return 0;
  const rpn = toRpn(tokenize(formula));
  const stack: number[] = [];

  for (const tok of rpn) {
    if (tok.t === "num") {
      stack.push(tok.v);
    } else if (tok.t === "var") {
      const val = vars[tok.v];
      stack.push(typeof val === "number" && !isNaN(val) ? val : 0);
    } else if (tok.t === "op") {
      if (tok.v === "u-") {
        const a = stack.pop() ?? 0;
        stack.push(-a);
        continue;
      }
      const b = stack.pop() ?? 0;
      const a = stack.pop() ?? 0;
      switch (tok.v) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(b === 0 ? 0 : a / b); break;
        case "%": stack.push(b === 0 ? 0 : a % b); break;
        case "^": stack.push(Math.pow(a, b)); break;
        default: throw new Error(`Unknown operator ${tok.v}`);
      }
    } else if (tok.t === "fn") {
      const fn = FUNCTIONS[tok.v];
      // min/max/pow take 2 args here; single-arg fns take 1. We support up to 2.
      const arity = ["min", "max", "pow"].includes(tok.v) ? 2 : 1;
      const args: number[] = [];
      for (let k = 0; k < arity; k++) args.unshift(stack.pop() ?? 0);
      stack.push(fn(...args));
    }
  }
  const result = stack.pop() ?? 0;
  return isFinite(result) ? result : 0;
}

// Extract variable names referenced by a formula (for the builder UI).
export function formulaVariables(formula: string): string[] {
  try {
    const seen = new Set<string>();
    for (const tok of tokenize(formula)) {
      if (tok.t === "var") seen.add(tok.v);
    }
    return [...seen];
  } catch {
    return [];
  }
}
