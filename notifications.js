let audioCtx = null;

function playChime() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;

  [880, 1320].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}

function requestPermissionOnce() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(mode) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const messages = {
    focus: "Focus session done — take a break.",
    shortBreak: "Break's over — back to it.",
    longBreak: "Break's over — back to it.",
  };
  new Notification("Kitchen timer", { body: messages[mode] || "Time's up." });
}

export function initNotifications() {
  requestPermissionOnce();
}

// `endedMode` is the mode that just FINISHED (before the timer switched to the next one)
export function notifySessionEnd(endedMode, soundEnabled) {
  if (soundEnabled) playChime();
  showBrowserNotification(endedMode);
}
