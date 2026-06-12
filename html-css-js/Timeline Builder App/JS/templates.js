const Themes = {
  light: "light",
  dark: "dark",
  corporate: "corporate",
  startup: "startup"
};

const Layouts = {
  standard: "standard",
  alternating: "alternating",
  compact: "compact"
};

function applyTheme(theme) {
  document.body.className = theme;
}

function applyLayout(layout) {
  const timeline = document.getElementById("timeline");
  timeline.className = `timeline ${layout}`;
}