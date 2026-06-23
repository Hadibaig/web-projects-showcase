// =====================
// DOM ELEMENTS
// =====================
const passwordOutput = document.getElementById("passwordOutput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");

const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const excludeSimilarEl = document.getElementById("excludeSimilar");

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

const historyList = document.getElementById("historyList");
const toast = document.getElementById("toast");

// Store last 5 generated passwords (session only)
let passwordHistory = [];


// =====================
// CHARACTER SETS
// =====================
// These are the pools used to generate random passwords
const charSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  // characters that are visually confusing
  similar: "ilLIoO0"
};


// =====================
// SLIDER UPDATE (LIVE UI)
// =====================
// When user moves slider, update displayed length value
lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;
});


// =====================
// PASSWORD GENERATION
// =====================
generateBtn.addEventListener("click", generatePassword);

function generatePassword() {

  // Step 1: Build allowed character pool
  let chars = "";

  if (uppercaseEl.checked) chars += charSets.uppercase;
  if (lowercaseEl.checked) chars += charSets.lowercase;
  if (numbersEl.checked) chars += charSets.numbers;
  if (symbolsEl.checked) chars += charSets.symbols;

  // Step 2: Remove similar-looking characters if selected
  if (excludeSimilarEl.checked) {
    chars = chars
      .split("")
      .filter(c => !charSets.similar.includes(c))
      .join("");
  }

  // Safety check: if no option selected
  if (!chars) {
    alert("Please select at least one option!");
    return;
  }

  // Step 3: Generate random password
  let password = "";
  const length = Number(lengthSlider.value);

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  // Step 4: Show password in UI
  passwordOutput.value = password;

  // Step 5: Update UI features
  updateStrength(password);
  addToHistory(password);
}


// =====================
// PASSWORD STRENGTH CHECKER
// =====================
// Simple scoring system based on complexity rules
function updateStrength(password) {
  let strength = 0;

  // length-based scoring
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // character variety scoring
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  // UI updates based on strength score
  if (strength <= 2) {
    strengthBar.style.width = "25%";
    strengthBar.style.background = "#ef4444"; // red
    strengthText.textContent = "Weak";
    strengthText.style.color = "#ef4444";
  } 
  else if (strength <= 4) {
    strengthBar.style.width = "60%";
    strengthBar.style.background = "#facc15"; // yellow
    strengthText.textContent = "Medium";
    strengthText.style.color = "#facc15";
  } 
  else {
    strengthBar.style.width = "100%";
    strengthBar.style.background = "#22c55e"; // green
    strengthText.textContent = "Very Strong";
    strengthText.style.color = "#22c55e";
  }
}


// =====================
// COPY PASSWORD TO CLIPBOARD
// =====================
copyBtn.addEventListener("click", async () => {
  const password = passwordOutput.value;

  if (!password) return;

  // modern browser API for clipboard access
  await navigator.clipboard.writeText(password);

  showToast();
});


// =====================
// TOAST NOTIFICATION
// =====================
// Small popup message after copying password
function showToast() {
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


// =====================
// PASSWORD HISTORY (LAST 5)
// =====================
function addToHistory(password) {
  passwordHistory.unshift(password); // add newest at top

  // keep only last 5 passwords
  if (passwordHistory.length > 5) {
    passwordHistory.pop();
  }

  renderHistory();
}


// Render history list in UI
function renderHistory() {
  historyList.innerHTML = "";

  passwordHistory.forEach(pass => {
    const li = document.createElement("li");
    li.textContent = pass;
    historyList.appendChild(li);
  });
}


// =====================
// INITIAL PASSWORD ON LOAD
// =====================
// Automatically generate first password when app opens
generatePassword();