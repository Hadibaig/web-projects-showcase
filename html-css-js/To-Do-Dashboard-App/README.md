# ✅ To-Do Dashboard App

A clean, responsive task management dashboard built with vanilla HTML, CSS, and JavaScript. Features full CRUD operations, color-coded task labels, due dates, and persistent localStorage — no frameworks, no dependencies.

--

---

## ✨ Features

- ➕ Add tasks with title, description, due date, and color label
- ✏️ Edit existing tasks inline via modal
- 🗑️ Delete tasks with a single click
- 🎨 5 color labels for visual task organization
- 💾 Persistent storage via localStorage — data survives page refresh
- 📱 Fully responsive — mobile hamburger menu, horizontal task tabs on small screens
- ⚡ Zero dependencies — pure HTML, CSS, and JavaScript

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Semantic structure |
| CSS3 | Responsive layout, animations, media queries |
| JavaScript (ES6) | DOM manipulation, localStorage, event handling |
| Bootstrap Icons CDN | UI icons |

---

## 📁 File Structure

```
To-Do-Dashboard-App/
├── index.html      # App structure and markup
├── style.css       # All styling including responsive breakpoints
├── script.js       # Core business logic (CRUD, localStorage, rendering)
├── mobile.js       # Mobile-only UI enhancements (hamburger, task tabs)
└── README.md       # Project documentation
```

---

## 🚀 Getting Started

No build tools or installation needed.

```bash
# Clone the repository
git clone https://github.com/Hadibaig/web-projects-showcase.git

# Navigate to this project
cd web-projects-showcase/html-css-js/To-Do-Dashboard-App

# Open in browser
open index.html
```

Or simply download the folder and open `index.html` in any modern browser.

---

## 💡 Key Implementation Details

- **localStorage** — tasks are serialized as JSON and persist across sessions
- **MutationObserver** — mobile task tabs stay in sync with the sidebar without touching core logic
- **CSS media queries** — layout shifts at 768px; sidebar hides, horizontal tab bar appears
- **Validation** — task title is required; empty submissions are blocked with a user alert
- **Max 7 tasks** — enforced by the task array limit

---

## 👨‍💻 Developer

**Mirza Hadi** — Full-Stack WordPress Developer & Technical Problem Solver

| | |
|---|---|
| 🌐 Portfolio | [hadi-mirza.com](https://hadi-mirza.com) |
| 💼 LinkedIn | [linkedin.com/in/hadibaig](https://linkedin.com/in/hadibaig) |
| 🐙 GitHub | [github.com/Hadibaig](https://github.com/Hadibaig) |
| 📰 Newsletter | DCXherald — 4,000+ subscribers |

---

## 📄 License

MIT License — free to use and modify with attribution.
