(() => {
  "use strict";

  const STORAGE_KEY = "packtuning-color-scheme-mode";
  const MODES = ["day", "night", "auto", "system"];
  const ICONS = { day: "☀️", night: "🌙", auto: "🕒", system: "⚙️" };
  const root = document.documentElement;
  const systemQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
  let mode = readMode();
  let applying = false;

  if (/^\/Pojas(?:\/|$)/i.test(window.location.pathname)) {
    root.classList.add("pt-theme-pojas");
  }
  root.classList.add("pt-theme-enabled");

  function readMode() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (MODES.includes(saved)) return saved;
    } catch (_) {}
    return "auto";
  }

  function saveMode(nextMode) {
    try { localStorage.setItem(STORAGE_KEY, nextMode); } catch (_) {}
  }

  function resolvedTheme() {
    if (mode === "system") return systemQuery?.matches ? "night" : "day";
    return mode;
  }

  function forceTheme() {
    if (mode === "auto" || applying) return;
    const theme = resolvedTheme();
    applying = true;
    if (root.dataset.theme !== theme) root.dataset.theme = theme;
    root.classList.toggle("day-theme", theme === "day");
    root.classList.toggle("night-theme", theme === "night");
    root.style.colorScheme = theme === "night" ? "dark" : "light";
    queueMicrotask(() => { applying = false; });
  }

  function labels() {
    const russian = (root.lang || "").toLowerCase().startsWith("ru");
    return russian
      ? { group: "Цветовая схема", day: "День", night: "Ночь", auto: "Авто", system: "Система" }
      : { group: "Color scheme", day: "Day", night: "Night", auto: "Auto", system: "System" };
  }

  const control = document.createElement("div");
  control.className = "pt-color-scheme-switcher";
  control.setAttribute("role", "group");

  const buttons = Object.fromEntries(MODES.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mode = item;
    button.addEventListener("click", () => selectMode(item));
    control.appendChild(button);
    return [item, button];
  }));

  function updateControl() {
    const text = labels();
    control.setAttribute("aria-label", text.group);
    control.title = text.group;
    MODES.forEach((item) => {
      buttons[item].textContent = ICONS[item];
      buttons[item].setAttribute("aria-label", text[item]);
      buttons[item].setAttribute("aria-pressed", String(mode === item));
      buttons[item].title = text[item];
    });
  }

  function selectMode(nextMode) {
    if (!MODES.includes(nextMode) || nextMode === mode) return;
    mode = nextMode;
    saveMode(mode);
    updateControl();
    if (mode === "auto") {
      window.location.reload();
      return;
    }
    forceTheme();
  }

  document.body.appendChild(control);
  updateControl();
  forceTheme();

  systemQuery?.addEventListener?.("change", () => {
    if (mode === "system") forceTheme();
  });

  new MutationObserver((changes) => {
    if (changes.some((change) => change.attributeName === "lang")) updateControl();
    if (mode !== "auto") forceTheme();
  }).observe(root, { attributes: true, attributeFilter: ["class", "data-theme", "lang"] });
})();
