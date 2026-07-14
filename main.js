import { createTimer } from "./timer.js";
import { loadSettings, saveSettings } from "./storage.js";
import { initNotifications, notifySessionEnd } from "./notifications.js";
import { render, buildTicks, buildDots, setDialCircumference } from "./ui.js";

//these imports are executed first and then the following code runs thus we can say that the main.js actually runs last

const settings = loadSettings();

setDialCircumference();
buildTicks();
buildDots(settings.longBreakEvery);
initNotifications();

const timer = createTimer(settings, {
  onTick: (state) => render(state, settings),
  onSessionEnd: (state) => {
    // state.mode has already flipped to the NEXT mode by the time this fires,
    // so figure out which mode just ended to pick the right message.
    const endedMode = state.mode === "focus" ? "shortBreak" : "focus";
    notifySessionEnd(endedMode, settings.soundEnabled);
  },
});

render(timer.getState(), settings);

// --- controls ---
document.getElementById("start-btn").addEventListener("click", () => timer.toggle());
document.getElementById("reset-btn").addEventListener("click", () => timer.reset());
document.getElementById("skip-btn").addEventListener("click", () => timer.skip());

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    timer.toggle();
  }
});

// --- settings panel ---
const panel = document.getElementById("settings-panel");
const toggleBtn = document.getElementById("settings-toggle");

function openPanel() {
  panel.classList.add("visible");
  panel.setAttribute("aria-hidden", "false");
  toggleBtn.classList.add("open");
  toggleBtn.setAttribute("aria-expanded", "true");
}
function closePanel() {
  panel.classList.remove("visible");
  panel.setAttribute("aria-hidden", "true");
  toggleBtn.classList.remove("open");
  toggleBtn.setAttribute("aria-expanded", "false");
}

toggleBtn.addEventListener("click", () => {
  panel.classList.contains("visible") ? closePanel() : openPanel();
});
document.getElementById("settings-close").addEventListener("click", closePanel);

const focusInput = document.getElementById("focus-input");
const shortInput = document.getElementById("short-input");
const longInput = document.getElementById("long-input");
const intervalInput = document.getElementById("interval-input");
const soundInput = document.getElementById("sound-input");

focusInput.value = settings.focus;
shortInput.value = settings.shortBreak;
longInput.value = settings.longBreak;
intervalInput.value = settings.longBreakEvery;
soundInput.checked = settings.soundEnabled;

function applySettingsFromInputs() {
  const next = {
    focus: clamp(parseInt(focusInput.value, 10), 1, 120),
    shortBreak: clamp(parseInt(shortInput.value, 10), 1, 60),
    longBreak: clamp(parseInt(longInput.value, 10), 1, 60),
    longBreakEvery: clamp(parseInt(intervalInput.value, 10), 2, 12),
    soundEnabled: soundInput.checked,
  };
  const intervalChanged = next.longBreakEvery !== settings.longBreakEvery;
  Object.assign(settings, next);
  saveSettings(settings);
  timer.updateSettings(settings);
  if (intervalChanged) buildDots(settings.longBreakEvery);
  render(timer.getState(), settings);
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

[focusInput, shortInput, longInput, intervalInput, soundInput].forEach((input) => {
  input.addEventListener("change", applySettingsFromInputs);
});
