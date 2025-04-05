const defaultOptions = {
  persona: ["Marketing Expert", "AI Strategist", "Startup Founder"],
  goal: ["Create a product idea", "Write landing page copy", "Build a content strategy"],
  context: ["For Gen Z", "With emotional appeal", "Focused on speed and efficiency"],
  tone: ["Professional", "Conversational", "Energetic", "Witty"]
};

function loadOptions() {
  for (let key in defaultOptions) {
    const select = document.getElementById(key);
    if (!select) continue;
    const saved = JSON.parse(localStorage.getItem(key)) || defaultOptions[key];
    select.innerHTML = '';
    saved.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
  }

  loadHistory();
}

function addOption(selectId, inputId) {
  const input = document.getElementById(inputId);
  const value = input.value.trim();
  if (!value) return;
  const currentList = JSON.parse(localStorage.getItem(selectId)) || defaultOptions[selectId];
  if (!currentList.includes(value)) {
    currentList.push(value);
    localStorage.setItem(selectId, JSON.stringify(currentList));
    loadOptions();
  }
  input.value = '';
}

function generatePrompt() {
  const persona = document.getElementById('persona').value;
  const goal = document.getElementById('goal').value;
  const context = document.getElementById('context').value;
  const tone = document.getElementById('tone').value;

  const prompt = `You are a ${persona}. Your task is to ${goal}. Use the following context: ${context}. Speak in a ${tone} tone. Provide the response in a structured and concise format.`;
  document.getElementById('output').value = prompt;
}

function copyPrompt() {
  const output = document.getElementById('output');
  output.select();
  document.execCommand('copy');
  alert("✅ Prompt copied to clipboard!");
}

function saveToHistory() {
  const history = JSON.parse(localStorage.getItem('promptHistory')) || [];
  const prompt = document.getElementById('output').value;
  if (!prompt.trim()) return;
  history.unshift(prompt);
  if (history.length > 10) history.pop(); // limit history to last 10
  localStorage.setItem('promptHistory', JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const history = JSON.parse(localStorage.getItem('promptHistory')) || [];
  list.innerHTML = '';
  history.forEach((p, i) => {
    const item = document.createElement('li');
    item.className = 'p-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700';
    item.textContent = p;
    item.onclick = () => {
      document.getElementById('output').value = p;
    };
    list.appendChild(item);
  });
}

document.getElementById('darkToggle')?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

loadOptions();
