import type { Block } from "./types";
import { makeId } from "./normalize";

export function createBlock(type: Block["type"]): Block {
  const id = makeId();
  switch (type) {
    case "heading":
      return { id, type, text: "New heading", level: 2 };
    case "text":
      return { id, type, text: "Some descriptive text." };
    case "kpiRow":
      return {
        id,
        type,
        items: [
          { label: "Metric A", value: 42, trend: 5 },
          { label: "Metric B", value: 18, unit: "kg" },
        ],
      };
    case "input":
      return { id, type, label: "New input", key: "field" + Math.floor(Math.random() * 1000), inputType: "number", defaultValue: 0 };
    case "calculator":
      return { id, type, label: "Result", formula: "0", resultLabel: "Result", resultUnit: "", decimals: 1 };
    case "chart":
      return { id, type, title: "New chart", chartType: "bar", labels: ["A", "B", "C"], values: [4, 7, 3] };
    case "table":
      return { id, type, title: "New table", columns: ["Column 1", "Column 2"], rows: [["Row 1", "—"]] };
    case "scoring":
      return {
        id,
        type,
        title: "New assessment",
        questions: [
          { text: "Question 1?", options: [{ label: "Yes", points: 2 }, { label: "No", points: 0 }] },
        ],
        bands: [
          { min: 2, label: "High", message: "Great result." },
          { min: 0, label: "Low", message: "Room to improve." },
        ],
      };
    case "aiResponse":
      return { id, type, label: "Ask the AI", prompt: "Give fishing advice.", buttonLabel: "Ask" };
    case "button":
      return { id, type, label: "Button", style: "primary" };
    case "image":
      return { id, type, emoji: "🐟", caption: "" };
    case "divider":
      return { id, type };
    default:
      return { id, type: "text", text: "" };
  }
}
