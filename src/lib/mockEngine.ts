import type { FeatureSchema } from "./types";
import { makeId } from "./normalize";

// A deterministic, keyword-driven generator used when no ANTHROPIC_API_KEY is set
// (or the API is unreachable). It produces genuinely useful starting features so
// the builder demo works end-to-end offline.

function b<T extends object>(block: T) {
  return { id: makeId(), ...block } as never;
}

function catchDashboard(prompt: string): FeatureSchema {
  return {
    name: "Catch Dashboard",
    description: "Track your catches, top species and best waterbodies at a glance.",
    category: "Dashboard",
    icon: "🎣",
    blocks: [
      b({ type: "heading", text: "Catch Dashboard", level: 1 }),
      b({ type: "text", text: "Your fishing performance this season." }),
      b({
        type: "kpiRow",
        items: [
          { label: "Total Catches", value: 142, trend: 12 },
          { label: "Biggest Fish", value: 8.4, unit: "kg", trend: 4 },
          { label: "Top Species", value: "Bass" },
          { label: "Active Days", value: 37, trend: -3 },
        ],
      }),
      b({
        type: "chart",
        title: "Catches per Month",
        chartType: "line",
        labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        values: [12, 18, 25, 34, 31, 22],
        unit: "fish",
      }),
      b({
        type: "chart",
        title: "Catches by Species",
        chartType: "bar",
        labels: ["Bass", "Pike", "Trout", "Carp", "Perch"],
        values: [48, 29, 24, 25, 16],
      }),
      b({
        type: "table",
        title: "Top Waterbodies",
        columns: ["Waterbody", "Catches", "Avg Weight (kg)"],
        rows: [
          ["Lake Windermere", 41, 3.2],
          ["River Severn", 33, 2.1],
          ["Rutland Water", 28, 4.0],
          ["Chew Valley", 19, 5.1],
        ],
      }),
    ],
  };
}

function baitCalculator(): FeatureSchema {
  return {
    name: "Bait Quantity Calculator",
    description: "Work out how much bait to bring based on session length and swim size.",
    category: "Calculator",
    icon: "🪱",
    blocks: [
      b({ type: "heading", text: "Bait Quantity Calculator", level: 1 }),
      b({ type: "text", text: "Enter your session details to estimate bait needs." }),
      b({ type: "input", label: "Session length", key: "hours", inputType: "number", defaultValue: 6, unit: "hours" }),
      b({ type: "input", label: "Number of rods", key: "rods", inputType: "number", defaultValue: 2 }),
      b({ type: "input", label: "Feeding rate", key: "rate", inputType: "number", defaultValue: 150, unit: "g/hr/rod" }),
      b({
        type: "calculator",
        label: "Recommended Bait",
        formula: "hours * rods * rate / 1000",
        resultLabel: "Total bait to bring",
        resultUnit: "kg",
        decimals: 2,
      }),
      b({
        type: "aiResponse",
        label: "Bait strategy tips",
        prompt: "I'm fishing for {{hours}} hours with {{rods}} rods at {{rate}} g/hr/rod. Suggest a baiting strategy.",
        buttonLabel: "Get AI strategy",
      }),
    ],
  };
}

function tripPlanner(): FeatureSchema {
  return {
    name: "Fishing Trip Planner",
    description: "Plan a session around species, conditions and gear.",
    category: "Planner",
    icon: "🗺️",
    blocks: [
      b({ type: "heading", text: "Fishing Trip Planner", level: 1 }),
      b({ type: "input", label: "Target species", key: "species", inputType: "select", options: ["Bass", "Pike", "Trout", "Carp"], defaultValue: "Pike" }),
      b({ type: "input", label: "Waterbody type", key: "water", inputType: "select", options: ["Lake", "River", "Reservoir", "Canal"], defaultValue: "Lake" }),
      b({ type: "input", label: "Water temperature", key: "temp", inputType: "number", defaultValue: 14, unit: "°C" }),
      b({
        type: "aiResponse",
        label: "Session plan",
        prompt: "Plan a fishing session targeting {{species}} on a {{water}} at {{temp}}°C. Suggest tactics, bait/lures, and best time windows.",
        buttonLabel: "Generate plan",
      }),
      b({
        type: "table",
        title: "Gear Checklist",
        columns: ["Item", "Qty"],
        rows: [["Rod & reel", 2], ["Landing net", 1], ["Bait", 1], ["Unhooking mat", 1], ["Weigh sling", 1]],
      }),
    ],
  };
}

function speciesScoring(): FeatureSchema {
  return {
    name: "Bite Conditions Score",
    description: "Answer a few questions to rate how good today's fishing conditions are.",
    category: "Scoring System",
    icon: "🌤️",
    blocks: [
      b({ type: "heading", text: "Bite Conditions Score", level: 1 }),
      b({
        type: "scoring",
        title: "Rate today's conditions",
        questions: [
          { text: "Barometric pressure trend?", options: [{ label: "Falling", points: 3 }, { label: "Steady", points: 2 }, { label: "Rising", points: 1 }] },
          { text: "Cloud cover?", options: [{ label: "Overcast", points: 3 }, { label: "Partly cloudy", points: 2 }, { label: "Clear", points: 1 }] },
          { text: "Wind?", options: [{ label: "Light ripple", points: 3 }, { label: "Flat calm", points: 1 }, { label: "Strong", points: 1 }] },
          { text: "Time of day?", options: [{ label: "Dawn/Dusk", points: 3 }, { label: "Morning", points: 2 }, { label: "Midday", points: 1 }] },
        ],
        bands: [
          { min: 10, label: "🔥 Prime conditions", message: "Drop everything and go — the fish should be feeding hard." },
          { min: 7, label: "👍 Good", message: "Solid window. Fish structure and low-light periods." },
          { min: 4, label: "😐 Average", message: "Workable, but downsize baits and slow your presentation." },
          { min: 0, label: "🥶 Tough", message: "Expect a grind. Fish deep, slow, and stay mobile." },
        ],
      }),
    ],
  };
}

function questionnaire(): FeatureSchema {
  return {
    name: "Angler Profile Questionnaire",
    description: "Capture an angler's experience and goals for tailored coaching.",
    category: "Questionnaire",
    icon: "📋",
    blocks: [
      b({ type: "heading", text: "Angler Profile", level: 1 }),
      b({ type: "input", label: "Your name", key: "name", inputType: "text", placeholder: "Jane Angler" }),
      b({ type: "input", label: "Experience level", key: "level", inputType: "select", options: ["Beginner", "Intermediate", "Advanced"], defaultValue: "Beginner" }),
      b({ type: "input", label: "Main goal", key: "goal", inputType: "select", options: ["Catch my first fish", "Bigger fish", "New species", "Competition"], defaultValue: "Bigger fish" }),
      b({ type: "input", label: "Days fished / month", key: "days", inputType: "number", defaultValue: 4 }),
      b({
        type: "aiResponse",
        label: "Personalised coaching plan",
        prompt: "Create a coaching plan for {{name}}, a {{level}} angler who fishes {{days}} days/month with the goal: {{goal}}.",
        buttonLabel: "Build my plan",
      }),
    ],
  };
}

export function mockGenerate(prompt: string): FeatureSchema {
  const p = prompt.toLowerCase();
  if (/(bait|feed|groundbait|chum|quantit|how much)/.test(p)) return baitCalculator();
  if (/(dashboard|analytic|stats|overview|track my|report)/.test(p)) return catchDashboard(prompt);
  if (/(plan|trip|session|schedule|itinerary)/.test(p)) return tripPlanner();
  if (/(scor|rate|condition|assess|index)/.test(p)) return speciesScoring();
  if (/(question|survey|profile|intake|form|onboard)/.test(p)) return questionnaire();
  if (/(calc|convert|estimat|weight|length)/.test(p)) return baitCalculator();
  // default: a dashboard, the most visually complete example
  return catchDashboard(prompt);
}
