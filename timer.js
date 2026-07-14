export function createTimer(settings, { onTick, onSessionEnd }) {
  let state = {
    mode: "focus", // "focus" | "shortBreak" | "longBreak"
    secondsLeft: settings.focus * 60,
    isRunning: false,
    completedFocusSessions: 0,
  };

  let intervalId = null;
  let targetTimestamp = null; // when the current countdown should hit 0

  function durationFor(mode) {
    if (mode === "focus") return settings.focus * 60;
    if (mode === "shortBreak") return settings.shortBreak * 60;
    return settings.longBreak * 60;
  }

  function nextMode() {
    if (state.mode !== "focus") return "focus";
    const isLongBreak = (state.completedFocusSessions + 1) % settings.longBreakEvery === 0;
    return isLongBreak ? "longBreak" : "shortBreak";
  }

  function tick() {
    const remainingMs = targetTimestamp - Date.now();
    state.secondsLeft = Math.max(0, Math.round(remainingMs / 1000));
    onTick(state);

    if (remainingMs <= 0) {
      finishSession();
    }
  }

  function finishSession() {
    pause();
    if (state.mode === "focus") state.completedFocusSessions++;
    const upcoming = nextMode();
    state.mode = upcoming;
    state.secondsLeft = durationFor(upcoming);
    onSessionEnd(state);
    onTick(state);
  }

  function start() {
    if (state.isRunning) return;
    state.isRunning = true;
    targetTimestamp = Date.now() + state.secondsLeft * 1000;
    intervalId = setInterval(tick, 250);
    onTick(state);
  }

  function pause() {
    state.isRunning = false;
    clearInterval(intervalId);
    intervalId = null;
    onTick(state);
  }

  function toggle() {
    state.isRunning ? pause() : start();
  }

  function reset() {
    pause();
    state.secondsLeft = durationFor(state.mode);
    onTick(state);
  }

  function skip() {
    pause();
    if (state.mode === "focus") state.completedFocusSessions++;
    state.mode = nextMode();
    state.secondsLeft = durationFor(state.mode);
    onTick(state);
  }

  function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
    if (!state.isRunning) {
      state.secondsLeft = durationFor(state.mode);
      onTick(state);
    }
  }

  function getState() {
    return { ...state };
  }

  return { start, pause, toggle, reset, skip, updateSettings, getState, durationFor };
}
