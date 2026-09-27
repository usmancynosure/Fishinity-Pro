// The no-code Feature definition. This is the contract the AI generates against,
// the visual builder edits, and the renderer runs. Keep it JSON-serializable.

export type BlockType =
  | "heading"
  | "text"
  | "kpiRow"
  | "input"
  | "calculator"
  | "chart"
  | "table"
  | "scoring"
  | "aiResponse"
  | "button"
  | "image"
  | "divider";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  text: string;
  level: 1 | 2 | 3;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  text: string;
}

export interface KpiItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number; // percent, +/-
}
export interface KpiRowBlock extends BaseBlock {
  type: "kpiRow";
  items: KpiItem[];
}

export interface InputBlock extends BaseBlock {
  type: "input";
  label: string;
  key: string; // variable name used by calculators / ai
  inputType: "number" | "text" | "select";
  placeholder?: string;
  options?: string[]; // for select
  defaultValue?: string | number;
  unit?: string;
}

export interface CalculatorBlock extends BaseBlock {
  type: "calculator";
  label: string;
  // Arithmetic expression referencing input keys, e.g. "weight * 0.45 + depth / 2"
  formula: string;
  resultLabel: string;
  resultUnit?: string;
  decimals?: number;
}

export interface ChartBlock extends BaseBlock {
  type: "chart";
  title: string;
  chartType: "bar" | "line";
  labels: string[];
  values: number[];
  unit?: string;
}

export interface TableBlock extends BaseBlock {
  type: "table";
  title?: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ScoringQuestion {
  text: string;
  options: { label: string; points: number }[];
}
export interface ScoringBand {
  min: number;
  label: string;
  message: string;
}
export interface ScoringBlock extends BaseBlock {
  type: "scoring";
  title: string;
  questions: ScoringQuestion[];
  bands: ScoringBand[]; // evaluated by descending min against total score
}

export interface AiResponseBlock extends BaseBlock {
  type: "aiResponse";
  label: string;
  // Prompt template; {{key}} tokens are replaced with the user's input values.
  prompt: string;
  buttonLabel?: string;
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  label: string;
  style?: "primary" | "secondary";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  emoji?: string;
  url?: string;
  caption?: string;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
}

export type Block =
  | HeadingBlock
  | TextBlock
  | KpiRowBlock
  | InputBlock
  | CalculatorBlock
  | ChartBlock
  | TableBlock
  | ScoringBlock
  | AiResponseBlock
  | ButtonBlock
  | ImageBlock
  | DividerBlock;

export interface FeatureSchema {
  name: string;
  description: string;
  category: string;
  icon: string; // emoji
  blocks: Block[];
}

export const CATEGORIES = [
  "Dashboard",
  "Calculator",
  "Planner",
  "Tracker",
  "Questionnaire",
  "Scoring System",
  "Recommendation",
  "Other",
] as const;
