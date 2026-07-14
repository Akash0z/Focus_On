const CIRCUMFERENCE = 2 * Math.PI * 120; // matches r=120 on the SVG circle

const MODE_LABELS = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

const el = {
  app: document.querySelector(".app"),
  progress: document.getElementById("dial-progress"),
  ticks: document.getElementById("ticks"),
  modeLabel: document.getElementById("mode-label"),
  time: document.getElementById("time-display"),
  cycleLabel: document.getElementById("cycle-label"),
  startBtn: document.getElementById("start-btn"),
  dots: document.getElementById("dots"),
};

export function buildTicks(count = 60) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const isMajor = i % 5 === 0;
    const rOuter = 120;
    const rInner = isMajor ? 110 : 115;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 150 + rOuter * Math.cos(angle));
    line.setAttribute("y1", 150 + rOuter * Math.sin(angle));
    line.setAttribute("x2", 150 + rInner * Math.cos(angle));
    line.setAttribute("y2", 150 + rInner * Math.sin(angle));
    frag.appendChild(line);
  }
  el.ticks.appendChild(frag);
}

export function buildDots(longBreakEvery) {
  el.dots.innerHTML = "";
  for (let i = 0; i < longBreakEvery; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    el.dots.appendChild(dot);
  }
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function render(state, settings) {
  el.app.dataset.mode = state.mode;
  el.modeLabel.textContent = MODE_LABELS[state.mode];
  el.time.textContent = formatTime(state.secondsLeft);
  el.startBtn.textContent = state.isRunning ? "pause" : "start";

  const duration = state.mode === "focus"
    ? settings.focus * 60
    : state.mode === "shortBreak"
      ? settings.shortBreak * 60
      : settings.longBreak * 60;
  const fraction = duration === 0 ? 0 : state.secondsLeft / duration;
  el.progress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));

  const cycleInLongBreak = state.completedFocusSessions % settings.longBreakEvery;
  el.cycleLabel.textContent = state.mode === "focus"
    ? `Session ${cycleInLongBreak + 1} of ${settings.longBreakEvery}`
    : "On break";

  const dots = el.dots.querySelectorAll(".dot");
  dots.forEach((dot, i) => dot.classList.toggle("done", i < cycleInLongBreak));
}

export function setDialCircumference() {
  el.progress.style.strokeDasharray = String(CIRCUMFERENCE);
}
