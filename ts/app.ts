/* ts/app.ts */
interface PromptPart {
  id: string;
  nickname: string;
  text: string;
}

interface Template {
  id: string;
  name: string;
  persona: string;
  goal: string;
  context: string;
  tone: string;
}

interface Agent {
  id: string;
  name: string;
  personality: string;
  tools: string;
  task: string;
  goal: string;
  templateId?: string;
}

interface PromptHistory {
  id: string;
  content: string;
  timestamp: Date;
}

interface DataStore {
  promptParts: {
    persona: PromptPart[];
    goal: PromptPart[];
    context: PromptPart[];
    tone: PromptPart[];
  };
  templates: Template[];
  agents: Agent[];
  promptHistory: PromptHistory[];
}

class StorageUtil {
  static get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : defaultValue;
  }
  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

const DataTS: DataStore = {
  promptParts: StorageUtil.get("promptParts", { persona: [], goal: [], context: [], tone: [] }),
  templates: StorageUtil.get("templates", []),
  agents: StorageUtil.get("agents", []),
  promptHistory: StorageUtil.get("promptHistory", []),
};

function saveAllTS(): void {
  StorageUtil.set("promptParts", DataTS.promptParts);
  StorageUtil.set("templates", DataTS.templates);
  StorageUtil.set("agents", DataTS.agents);
  StorageUtil.set("promptHistory", DataTS.promptHistory);
}

function generateIdTS(): string {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function exportDataTS(): void {
  const dataStr = JSON.stringify(DataTS, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prompt_data_ts.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
