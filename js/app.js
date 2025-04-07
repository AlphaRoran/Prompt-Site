// --- Render Prompt Parts Library with Edit/Delete Buttons ---
function renderPromptPartsLibrary() {
  let html = "";
  for (const type in Data.promptParts) {
    html += `<h5>${type.charAt(0).toUpperCase() + type.slice(1)}</h5>`;
    html += '<ul class="list-group mb-2">';
    Data.promptParts[type].forEach((part) => {
      html += `
        <li class="list-group-item draggable-item" draggable="true" data-id="${part.id}" data-text="${part.text}">
          <strong>${part.nickname}</strong>
          <div class="float-end">
            <button class="btn btn-sm btn-warning edit-part-btn" data-type="${type}" data-id="${part.id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-part-btn" data-type="${type}" data-id="${part.id}">Delete</button>
          </div>
        </li>
      `;
    });
    html += "</ul>";
  }
  return html;
}

// --- Setup Event Listeners for Edit and Delete Buttons ---
function setupPromptPartsListeners() {
  const editButtons = document.querySelectorAll('.edit-part-btn');
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      const id = this.getAttribute("data-id");
      // Find the part within its type array
      const parts = Data.promptParts[type];
      const part = parts.find((p) => p.id === id);
      if (part) {
        // Pre-fill the form for editing
        document.getElementById("part-id").value = part.id;
        document.getElementById("part-type").value = type;
        document.getElementById("part-nickname").value = part.nickname;
        document.getElementById("part-text").value = part.text;
        // Update button text to indicate editing
        document.querySelector("#new-prompt-part-form button[type=submit]").innerText = "Update Part";
      }
    });
  });

  const deleteButtons = document.querySelectorAll('.delete-part-btn');
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      const id = this.getAttribute("data-id");
      // Remove the part from its type array
      Data.promptParts[type] = Data.promptParts[type].filter((p) => p.id !== id);
      saveAll();
      renderPromptBuilder();
    });
  });
}

// --- Prompt Builder Page ---
function renderPromptBuilder() {
  const content = document.getElementById("content");
  content.innerHTML = `
      <h2>Prompt Builder</h2>
      <div class="row">
        <!-- Left: Prompt Parts Library and Form -->
        <div class="col-md-4">
          <h4>Prompt Parts Library</h4>
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
            <button type="submit" class="btn btn-primary">Add Part</button>
          </form>
        </div>
        <!-- Right: Prompt Builder Dropzone and Generated Prompt -->
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

  // Initialize drag and drop functionality
  setupDragAndDrop();

  // Handle form submission for adding/updating a prompt part
  document.getElementById("new-prompt-part-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const type = document.getElementById("part-type").value;
    const nickname = document.getElementById("part-nickname").value;
    const text = document.getElementById("part-text").value;
    const idField = document.getElementById("part-id");
    const partId = idField.value;
    
    if (partId) {
      // Remove the existing part from all type arrays in case type changed
      for (const t in Data.promptParts) {
        Data.promptParts[t] = Data.promptParts[t].filter(p => p.id !== partId);
      }
      // Add the updated part in the selected type
      Data.promptParts[type].push({ id: partId, nickname, text });
    } else {
      // Create a new part
      Data.promptParts[type].push({ id: generateId(), nickname, text });
    }
    
    saveAll();
    
    // Clear the form fields and reset button text
    document.getElementById("part-id").value = "";
    document.getElementById("part-type").value = "";
    document.getElementById("part-nickname").value = "";
    document.getElementById("part-text").value = "";
    document.querySelector("#new-prompt-part-form button[type=submit]").innerText = "Add Part";
    
    renderPromptBuilder();
  });

  // Set up edit/delete listeners for the prompt parts
  setupPromptPartsListeners();

  // (Other code for generating the prompt, copy-to-clipboard, etc., remains unchanged.)
}
