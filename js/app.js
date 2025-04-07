/* js/app.js */
// --- Data Storage and Utility Functions ---
const Storage = {
  get: function (key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const Data = {
  promptParts: Storage.get("promptParts", {
    persona: [],
    goal: [],
    context: [],
    tone: [],
  }),
  templates: Storage.get("templates", []),
  agents: Storage.get("agents", []),
  promptHistory: Storage.get("promptHistory", []),
};

function saveAll() {
  Storage.set("promptParts", Data.promptParts);
  Storage.set("templates", Data.templates);
  Storage.set("agents", Data.agents);
  Storage.set("promptHistory", Data.promptHistory);
}

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// --- Theme Toggle ---
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
});

// --- Routing ---
function renderPage() {
  const hash = window.location.hash || "#prompt-builder";
  switch (hash) {
    case "#prompt-builder":
      renderPromptBuilder();
      break;
    case "#template-library":
      renderTemplateLibrary();
      break;
    case "#agent-factory":
      renderAgentFactory();
      break;
    case "#library":
      renderLibrary();
      break;
    default:
      renderPromptBuilder();
  }
}
window.addEventListener("hashchange", renderPage);
renderPage();

// --- Prompt Builder Page ---
function renderPromptBuilder() {
  const content = document.getElementById("content");
  content.innerHTML = `
      <h2>Prompt Builder</h2>
      <div class="row">
        <div class="col-md-4">
          <h4>Prompt Parts Library</h4>
          <div id="prompt-parts-library">
            ${renderPromptPartsLibrary()}
          </div>
          <hr>
          <h5>Add New Prompt Part</h5>
          <form id="new-prompt-part-form">
            <div class="mb-3">
              <label for="part-type" class="form-label">Type</label>
              <select id="part-type" class="form-select" required>
                <option value="">Select type</option>
                <option value="persona">Persona</option>
                <option value="goal">Goal</option>
                <option value="context">Context</option>
                <option value="tone">Tone</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="part-nickname" class="form-label">Nickname</label>
              <input type="text" id="part-nickname" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="part-text" class="form-label">Full Text</label>
              <textarea id="part-text" class="form-control" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Add Part</button>
          </form>
        </div>
        <div class="col-md-8">
          <h4>Your Prompt</h4>
          <div id="prompt-builder-dropzone" class="drop-zone mb-3">
            <p>Drag and drop prompt parts here</p>
          </div>
          <button id="generate-prompt-btn" class="btn btn-success mb-3">Generate Prompt</button>
          <button id="copy-prompt-btn" class="btn btn-secondary mb-3">Copy to Clipboard</button>
          <h5>Generated Prompt:</h5>
          <pre id="generated-prompt" style="background: #f0f0f0; padding: 10px;"></pre>
        </div>
      </div>
  `;

  setupDragAndDrop();

  document
    .getElementById("new-prompt-part-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const type = document.getElementById("part-type").value;
      const nickname = document.getElementById("part-nickname").value;
      const text = document.getElementById("part-text").value;
      if (type && nickname && text) {
        Data.promptParts[type].push({ id: generateId(), nickname, text });
        saveAll();
        renderPromptBuilder();
      }
    });

  document
    .getElementById("generate-prompt-btn")
    .addEventListener("click", function () {
      const dropzone = document.getElementById("prompt-builder-dropzone");
      const items = dropzone.querySelectorAll(".draggable-item");
      let promptText = "";
      items.forEach((item) => {
        promptText += item.getAttribute("data-text") + "\n";
      });
      document.getElementById("generated-prompt").innerText = promptText;
      Data.promptHistory.push({
        id: generateId(),
        content: promptText,
        timestamp: new Date(),
      });
      saveAll();
    });

  document
    .getElementById("copy-prompt-btn")
    .addEventListener("click", function () {
      const text = document.getElementById("generated-prompt").innerText;
      navigator.clipboard.writeText(text);
      alert("Prompt copied to clipboard!");
    });
}

function renderPromptPartsLibrary() {
  let html = "";
  for (const type in Data.promptParts) {
    html += `<h5>${type.charAt(0).toUpperCase() + type.slice(1)}</h5>`;
    html += '<ul class="list-group mb-2">';
    Data.promptParts[type].forEach((part) => {
      html += `
            <li class="list-group-item draggable-item" draggable="true" data-id="${part.id}" data-text="${part.text}">
              <strong>${part.nickname}</strong>
            </li>
          `;
    });
    html += "</ul>";
  }
  return html;
}

// --- Drag & Drop Functionality ---
function setupDragAndDrop() {
  const draggables = document.querySelectorAll(".draggable-item");
  draggables.forEach((item) => {
    item.addEventListener("dragstart", dragStart);
  });
  const dropzone = document.getElementById("prompt-builder-dropzone");
  dropzone.addEventListener("dragover", dragOver);
  dropzone.addEventListener("drop", drop);
  dropzone.addEventListener("dragstart", dragStart);
  dropzone.addEventListener("dragover", dragOver);
  dropzone.addEventListener("drop", drop);
}

let draggedItem = null;
function dragStart(e) {
  draggedItem = e.target;
  e.dataTransfer.effectAllowed = "move";
}
function dragOver(e) {
  e.preventDefault();
}
function drop(e) {
  e.preventDefault();
  if (draggedItem && e.target.id === "prompt-builder-dropzone") {
    e.target.appendChild(draggedItem.cloneNode(true));
  } else if (
    draggedItem &&
    e.target.classList.contains("drop-zone")
  ) {
    e.target.appendChild(draggedItem.cloneNode(true));
  } else if (
    draggedItem &&
    e.target.classList.contains("draggable-item") &&
    e.target.parentNode.id === "prompt-builder-dropzone"
  ) {
    e.target.parentNode.insertBefore(
      draggedItem.cloneNode(true),
      e.target.nextSibling
    );
  }
}

// --- Template Library Page ---
function renderTemplateLibrary() {
  const content = document.getElementById("content");
  content.innerHTML = `
      <h2>Template Library</h2>
      <div class="row">
        <div class="col-md-6">
          <h4>Saved Templates</h4>
          <ul id="templates-list" class="list-group mb-3">
            ${Data.templates
              .map(
                (t) => `
              <li class="list-group-item">
                <strong>${t.name}</strong>
                <button class="btn btn-sm btn-primary ms-2" onclick="loadTemplate('${t.id}')">Load</button>
                <button class="btn btn-sm btn-warning ms-2" onclick="editTemplate('${t.id}')">Edit</button>
                <button class="btn btn-sm btn-danger ms-2" onclick="deleteTemplate('${t.id}')">Delete</button>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
        <div class="col-md-6">
          <h4>Create/Edit Template</h4>
          <form id="template-form">
            <input type="hidden" id="template-id">
            <div class="mb-3">
              <label for="template-name" class="form-label">Template Name</label>
              <input type="text" id="template-name" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="template-persona" class="form-label">Persona</label>
              <textarea id="template-persona" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="template-goal" class="form-label">Goal</label>
              <textarea id="template-goal" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="template-context" class="form-label">Context</label>
              <textarea id="template-context" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="template-tone" class="form-label">Tone</label>
              <textarea id="template-tone" class="form-control" rows="2" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Template</button>
            <button type="button" class="btn btn-secondary" onclick="clearTemplateForm()">Clear</button>
          </form>
        </div>
      </div>
  `;
  document.getElementById("template-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const idField = document.getElementById("template-id");
    const template = {
      id: idField.value || generateId(),
      name: document.getElementById("template-name").value,
      persona: document.getElementById("template-persona").value,
      goal: document.getElementById("template-goal").value,
      context: document.getElementById("template-context").value,
      tone: document.getElementById("template-tone").value,
    };
    const index = Data.templates.findIndex((t) => t.id === template.id);
    if (index > -1) {
      Data.templates[index] = template;
    } else {
      Data.templates.push(template);
    }
    saveAll();
    renderTemplateLibrary();
    clearTemplateForm();
  });
}

function loadTemplate(id) {
  const template = Data.templates.find((t) => t.id === id);
  if (template) {
    const dropzone = document.getElementById("prompt-builder-dropzone");
    dropzone.innerHTML = "";
    ["persona", "goal", "context", "tone"].forEach((part) => {
      const div = document.createElement("div");
      div.className = "draggable-item";
      div.setAttribute("data-text", template[part]);
      div.innerText =
        part.charAt(0).toUpperCase() + part.slice(1) + ": " + template[part].substring(0, 20) + "...";
      dropzone.appendChild(div);
    });
    window.location.hash = "#prompt-builder";
  }
}

function editTemplate(id) {
  const template = Data.templates.find((t) => t.id === id);
  if (template) {
    document.getElementById("template-id").value = template.id;
    document.getElementById("template-name").value = template.name;
    document.getElementById("template-persona").value = template.persona;
    document.getElementById("template-goal").value = template.goal;
    document.getElementById("template-context").value = template.context;
    document.getElementById("template-tone").value = template.tone;
  }
}

function deleteTemplate(id) {
  if (confirm("Are you sure you want to delete this template?")) {
    Data.templates = Data.templates.filter((t) => t.id !== id);
    saveAll();
    renderTemplateLibrary();
  }
}

function clearTemplateForm() {
  document.getElementById("template-id").value = "";
  document.getElementById("template-name").value = "";
  document.getElementById("template-persona").value = "";
  document.getElementById("template-goal").value = "";
  document.getElementById("template-context").value = "";
  document.getElementById("template-tone").value = "";
}

// --- Agent Factory Page ---
function renderAgentFactory() {
  const content = document.getElementById("content");
  content.innerHTML = `
      <h2>Agent Factory</h2>
      <div class="row">
        <div class="col-md-6">
          <h4>Saved Agents</h4>
          <ul id="agents-list" class="list-group mb-3">
            ${Data.agents
              .map(
                (a) => `
              <li class="list-group-item">
                <strong>${a.name}</strong>
                <button class="btn btn-sm btn-primary ms-2" onclick="loadAgent('${a.id}')">Load</button>
                <button class="btn btn-sm btn-warning ms-2" onclick="editAgent('${a.id}')">Edit</button>
                <button class="btn btn-sm btn-danger ms-2" onclick="deleteAgent('${a.id}')">Delete</button>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
        <div class="col-md-6">
          <h4>Create/Edit Agent</h4>
          <form id="agent-form">
            <input type="hidden" id="agent-id">
            <div class="mb-3">
              <label for="agent-name" class="form-label">Agent Name</label>
              <input type="text" id="agent-name" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="agent-personality" class="form-label">Personality</label>
              <textarea id="agent-personality" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="agent-tools" class="form-label">Tools</label>
              <textarea id="agent-tools" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="agent-task" class="form-label">Task</label>
              <textarea id="agent-task" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="agent-goal" class="form-label">Goal</label>
              <textarea id="agent-goal" class="form-control" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label for="agent-template" class="form-label">Link to Template (optional)</label>
              <select id="agent-template" class="form-select">
                <option value="">None</option>
                ${Data.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Save Agent</button>
            <button type="button" class="btn btn-secondary" onclick="clearAgentForm()">Clear</button>
          </form>
        </div>
      </div>
  `;
  document.getElementById("agent-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const idField = document.getElementById("agent-id");
    const agent = {
      id: idField.value || generateId(),
      name: document.getElementById("agent-name").value,
      personality: document.getElementById("agent-personality").value,
      tools: document.getElementById("agent-tools").value,
      task: document.getElementById("agent-task").value,
      goal: document.getElementById("agent-goal").value,
      templateId: document.getElementById("agent-template").value,
    };
    const index = Data.agents.findIndex((a) => a.id === agent.id);
    if (index > -1) {
      Data.agents[index] = agent;
    } else {
      Data.agents.push(agent);
    }
    saveAll();
    renderAgentFactory();
    clearAgentForm();
  });
}

function loadAgent(id) {
  const agent = Data.agents.find((a) => a.id === id);
  if (agent) {
    alert("Agent loaded: " + agent.name);
  }
}

function editAgent(id) {
  const agent = Data.agents.find((a) => a.id === id);
  if (agent) {
    document.getElementById("agent-id").value = agent.id;
    document.getElementById("agent-name").value = agent.name;
    document.getElementById("agent-personality").value = agent.personality;
    document.getElementById("agent-tools").value = agent.tools;
    document.getElementById("agent-task").value = agent.task;
    document.getElementById("agent-goal").value = agent.goal;
    document.getElementById("agent-template").value = agent.templateId;
  }
}

function deleteAgent(id) {
  if (confirm("Are you sure you want to delete this agent?")) {
    Data.agents = Data.agents.filter((a) => a.id !== id);
    saveAll();
    renderAgentFactory();
  }
}

function clearAgentForm() {
  document.getElementById("agent-id").value = "";
  document.getElementById("agent-name").value = "";
  document.getElementById("agent-personality").value = "";
  document.getElementById("agent-tools").value = "";
  document.getElementById("agent-task").value = "";
  document.getElementById("agent-goal").value = "";
  document.getElementById("agent-template").value = "";
}

// --- Overarching Library Page ---
function renderLibrary() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h2>Library</h2>
    <div class="row mb-3">
      <div class="col-md-12">
        <button class="btn btn-outline-primary" onclick="exportData()">Export Data</button>
        <input type="file" id="importFile" style="display:none" accept=".json" />
        <button class="btn btn-outline-secondary" onclick="document.getElementById('importFile').click()">Import Data</button>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <h4>Prompt Parts</h4>
        ${renderPromptPartsLibrary()}
      </div>
      <div class="col-md-6">
        <h4>Templates</h4>
        <ul class="list-group mb-3">
          ${Data.templates
            .map(
              (t) => `
            <li class="list-group-item">
              <strong>${t.name}</strong>
              <button class="btn btn-sm btn-warning ms-2" onclick="editTemplate('${t.id}')">Edit</button>
              <button class="btn btn-sm btn-danger ms-2" onclick="deleteTemplate('${t.id}')">Delete</button>
            </li>
          `
            )
            .join("")}
        </ul>
        <h4>Agents</h4>
        <ul class="list-group mb-3">
          ${Data.agents
            .map(
              (a) => `
            <li class="list-group-item">
              <strong>${a.name}</strong>
              <button class="btn btn-sm btn-warning ms-2" onclick="editAgent('${a.id}')">Edit</button>
              <button class="btn btn-sm btn-danger ms-2" onclick="deleteAgent('${a.id}')">Delete</button>
            </li>
          `
            )
            .join("")}
        </ul>
        <h4>Prompt History</h4>
        <ul class="list-group">
          ${Data.promptHistory
            .map(
              (h) => `
            <li class="list-group-item">
              <small>${new Date(h.timestamp).toLocaleString()}</small>
              <pre>${h.content.substring(0, 50)}...</pre>
              <button class="btn btn-sm btn-primary" onclick="restoreHistory('${h.id}')">Restore</button>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    </div>
  `;
  document.getElementById("importFile").addEventListener("change", importData);
}

function restoreHistory(id) {
  const historyItem = Data.promptHistory.find((h) => h.id === id);
  if (historyItem) {
    const dropzone = document.getElementById("prompt-builder-dropzone");
    dropzone.innerHTML = "";
    historyItem.content.split("\n").forEach((line) => {
      if (line.trim()) {
        const div = document.createElement("div");
        div.className = "draggable-item";
        div.setAttribute("data-text", line);
        div.innerText = line.substring(0, 20) + "...";
        dropzone.appendChild(div);
      }
    });
    window.location.hash = "#prompt-builder";
  }
}

function exportData() {
  const dataStr = JSON.stringify(Data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prompt_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      Object.assign(Data, importedData);
      saveAll();
      renderLibrary();
      alert("Data imported successfully!");
    } catch (err) {
      alert("Error importing data.");
    }
  };
  reader.readAsText(file);
}
