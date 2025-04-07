/* js/app.js */
document.addEventListener("DOMContentLoaded", () => {
  // --- Data Storage and Utility Functions ---
  const Storage = {
    get(key, defaultValue) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    },
    set(key, value) {
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
      <div class="row">
        <!-- Prompt Parts Section -->
        <div class="col-lg-4">
          <div class="card p-3">
            <h4 class="card-title">Prompt Parts Library</h4>
            <div id="prompt-parts-library">
              ${renderPromptPartsLibrary()}
            </div>
            <hr>
            <h5>Add / Edit Prompt Part</h5>
            <form id="new-prompt-part-form">
              <input type="hidden" id="part-id">
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
              <button type="submit" class="btn btn-primary w-100">Add Part</button>
            </form>
          </div>
        </div>
        <!-- Prompt Builder Section -->
        <div class="col-lg-8">
          <div class="card p-3">
            <h4 class="card-title">Your Prompt</h4>
            <div id="prompt-builder-dropzone" class="drop-zone mb-3">
              <p class="text-muted">Drag and drop prompt parts here</p>
            </div>
            <button id="generate-prompt-btn" class="btn btn-success me-2">Generate Prompt</button>
            <button id="copy-prompt-btn" class="btn btn-secondary">Copy to Clipboard</button>
            <hr>
            <h5>Generated Prompt:</h5>
            <pre id="generated-prompt"></pre>
          </div>
        </div>
      </div>
    `;

    setupDragAndDrop();

    // Handle add/edit prompt part form
    document
      .getElementById("new-prompt-part-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const type = document.getElementById("part-type").value;
        const nickname = document.getElementById("part-nickname").value;
        const text = document.getElementById("part-text").value;
        const partId = document.getElementById("part-id").value;

        if (partId) {
          // Remove any existing part with this ID from all types
          for (const t in Data.promptParts) {
            Data.promptParts[t] = Data.promptParts[t].filter(
              (p) => p.id !== partId
            );
          }
          Data.promptParts[type].push({ id: partId, nickname, text });
        } else {
          Data.promptParts[type].push({ id: generateId(), nickname, text });
        }
        saveAll();
        // Reset form
        document.getElementById("part-id").value = "";
        document.getElementById("part-type").value = "";
        document.getElementById("part-nickname").value = "";
        document.getElementById("part-text").value = "";
        document.querySelector(
          "#new-prompt-part-form button[type=submit]"
        ).innerText = "Add Part";
        renderPromptBuilder();
      });

    setupPromptPartsListeners();

    // Generate prompt functionality
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

    // Copy to clipboard functionality
    document
      .getElementById("copy-prompt-btn")
      .addEventListener("click", function () {
        const text = document.getElementById("generated-prompt").innerText;
        navigator.clipboard.writeText(text);
        alert("Prompt copied to clipboard!");
      });
  }

  // Render prompt parts library with edit/delete options
  function renderPromptPartsLibrary() {
    let html = "";
    for (const type in Data.promptParts) {
      html += `<h5>${type.charAt(0).toUpperCase() + type.slice(1)}</h5>`;
      html += '<ul class="list-group mb-2">';
      Data.promptParts[type].forEach((part) => {
        html += `
          <li class="list-group-item draggable-item" draggable="true" data-id="${part.id}" data-text="${part.text}">
            <span><strong>${part.nickname}</strong></span>
            <span>
              <button class="btn btn-sm btn-warning edit-part-btn" data-type="${type}" data-id="${part.id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-part-btn" data-type="${type}" data-id="${part.id}">Delete</button>
            </span>
          </li>
        `;
      });
      html += "</ul>";
    }
    return html;
  }

  // Set up edit and delete event listeners for prompt parts
  function setupPromptPartsListeners() {
    const editButtons = document.querySelectorAll(".edit-part-btn");
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        const id = this.getAttribute("data-id");
        const part = Data.promptParts[type].find((p) => p.id === id);
        if (part) {
          document.getElementById("part-id").value = part.id;
          document.getElementById("part-type").value = type;
          document.getElementById("part-nickname").value = part.nickname;
          document.getElementById("part-text").value = part.text;
          document.querySelector(
            "#new-prompt-part-form button[type=submit]"
          ).innerText = "Update Part";
        }
      });
    });
    const deleteButtons = document.querySelectorAll(".delete-part-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        const id = this.getAttribute("data-id");
        Data.promptParts[type] = Data.promptParts[type].filter(
          (p) => p.id !== id
        );
        saveAll();
        renderPromptBuilder();
      });
    });
  }

  // --- Drag & Drop Setup ---
  function setupDragAndDrop() {
    const draggables = document.querySelectorAll(".draggable-item");
    draggables.forEach((item) => {
      item.addEventListener("dragstart", dragStart);
    });
    const dropzone = document.getElementById("prompt-builder-dropzone");
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
    if (draggedItem) {
      const dropzone = document.getElementById("prompt-builder-dropzone");
      // Clone the dragged item to allow reuse
      const clone = draggedItem.cloneNode(true);
      clone.removeAttribute("draggable");
      dropzone.appendChild(clone);
    }
  }

  // --- Template Library Page ---
  function renderTemplateLibrary() {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="card p-3">
        <h2 class="card-title">Template Library</h2>
        <div class="row">
          <div class="col-lg-6">
            <h5>Saved Templates</h5>
            <ul id="templates-list" class="list-group mb-3">
              ${Data.templates
                .map(
                  (t) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><strong>${t.name}</strong></span>
                  <span>
                    <button class="btn btn-sm btn-primary" onclick="loadTemplate('${t.id}')">Load</button>
                    <button class="btn btn-sm btn-warning" onclick="editTemplate('${t.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTemplate('${t.id}')">Delete</button>
                  </span>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          <div class="col-lg-6">
            <h5>Create / Edit Template</h5>
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
              <button type="submit" class="btn btn-primary w-100">Save Template</button>
              <button type="button" class="btn btn-secondary w-100 mt-2" onclick="clearTemplateForm()">Clear</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("template-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const template = {
          id: document.getElementById("template-id").value || generateId(),
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
          part.charAt(0).toUpperCase() +
          ": " +
          template[part].substring(0, 20) +
          "...";
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
      <div class="card p-3">
        <h2 class="card-title">Agent Factory</h2>
        <div class="row">
          <div class="col-lg-6">
            <h5>Saved Agents</h5>
            <ul id="agents-list" class="list-group mb-3">
              ${Data.agents
                .map(
                  (a) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><strong>${a.name}</strong></span>
                  <span>
                    <button class="btn btn-sm btn-primary" onclick="loadAgent('${a.id}')">Load</button>
                    <button class="btn btn-sm btn-warning" onclick="editAgent('${a.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAgent('${a.id}')">Delete</button>
                  </span>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          <div class="col-lg-6">
            <h5>Create / Edit Agent</h5>
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
                  ${Data.templates
                    .map(
                      (t) => `<option value="${t.id}">${t.name}</option>`
                    )
                    .join("")}
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">Save Agent</button>
              <button type="button" class="btn btn-secondary w-100 mt-2" onclick="clearAgentForm()">Clear</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("agent-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const agent = {
          id: document.getElementById("agent-id").value || generateId(),
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

  // --- Library Page ---
  function renderLibrary() {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="card p-3">
        <h2 class="card-title">Library</h2>
        <div class="mb-3">
          <button class="btn btn-outline-primary" onclick="exportData()">Export Data</button>
          <input type="file" id="importFile" style="display:none" accept=".json" />
          <button class="btn btn-outline-secondary" onclick="document.getElementById('importFile').click()">Import Data</button>
        </div>
        <div class="row">
          <div class="col-lg-6">
            <h5>Prompt Parts</h5>
            ${renderPromptPartsLibrary()}
          </div>
          <div class="col-lg-6">
            <h5>Templates</h5>
            <ul class="list-group mb-3">
              ${Data.templates
                .map(
                  (t) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><strong>${t.name}</strong></span>
                  <span>
                    <button class="btn btn-sm btn-warning" onclick="editTemplate('${t.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTemplate('${t.id}')">Delete</button>
                  </span>
                </li>
              `
                )
                .join("")}
            </ul>
            <h5>Agents</h5>
            <ul class="list-group mb-3">
              ${Data.agents
                .map(
                  (a) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><strong>${a.name}</strong></span>
                  <span>
                    <button class="btn btn-sm btn-warning" onclick="editAgent('${a.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAgent('${a.id}')">Delete</button>
                  </span>
                </li>
              `
                )
                .join("")}
            </ul>
            <h5>Prompt History</h5>
            <ul class="list-group">
              ${Data.promptHistory
                .map(
                  (h) => `
                <li class="list-group-item">
                  <small>${new Date(h.timestamp).toLocaleString()}</small>
                  <pre class="mb-1">${h.content.substring(0, 50)}...</pre>
                  <button class="btn btn-sm btn-primary" onclick="restoreHistory('${h.id}')">Restore</button>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
    document
      .getElementById("importFile")
      .addEventListener("change", importData);
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

  // Expose some functions to the global scope for inline onclick events
  window.loadTemplate = loadTemplate;
  window.editTemplate = editTemplate;
  window.deleteTemplate = deleteTemplate;
  window.loadAgent = loadAgent;
  window.editAgent = editAgent;
  window.deleteAgent = deleteAgent;
  window.exportData = exportData;
  window.restoreHistory = restoreHistory;
});
