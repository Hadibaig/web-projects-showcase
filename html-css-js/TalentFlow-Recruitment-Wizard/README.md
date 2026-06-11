# TalentFlow Recruitment Wizard 🚀

**A modern, multi-step recruitment application form — built as a GitHub portfolio showcase.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📌 Overview

TalentFlow Recruitment Wizard is a fully client-side, multi-step job application form designed to simulate a real-world HR intake workflow. It requires no backend — everything runs in the browser. Built to demonstrate modern form UX, modular JavaScript, and responsive design.

---

## ✨ Features (v2.0 Enhanced)

### 🧭 5-Step Application Wizard
| Step | Title | Description |
|------|-------|-------------|
| 1 | **Personal Info** | Name, contact, location, LinkedIn, photo, CV upload |
| 2 | **Education** | Multiple degree entries + certifications |
| 3 | **Experience** | Work history entries + employment details |
| 4 | **Skills** | Tag-based skill input, portfolio, GitHub, bio |
| 5 | **Review & Submit** | Full application summary before final submission |

### 💼 IT Job Selector (15 Roles)
Pick from a curated dropdown of IT positions including:
- Software / Frontend / Backend / Full Stack Engineer
- DevOps, Cloud Architect, Data Scientist
- Machine Learning Engineer, Cybersecurity Analyst
- DBA, UI/UX Designer, Mobile Developer
- QA Engineer, IT Project Manager, Network Engineer

### 🎓 Education — Multi-Add
- Add multiple degrees dynamically
- Fields: Degree, Institution, Graduation Year, Grade/GPA
- Individual remove button per entry

### 🏆 Certifications — Multi-Add
- Add multiple certifications dynamically
- Fields: Certification Name, Issuing Org, Year, Credential ID
- Individual remove button per entry

### 🏢 Work History — Multi-Add
- Add multiple roles dynamically
- Fields: Job Title, Company, Start/End Date, "Currently working here" checkbox, Responsibilities
- Month picker for accurate date ranges

### 🏷️ Skill Tag Input
- Type a skill and press **Enter** or **comma** to add it as an interactive tag
- Tags are removable with a single click
- Backspace removes the last tag when input is empty

### 📋 Smart Review Screen
- Fully summarises every step before submission
- Grouped sections: Position, Personal, Education, Certifications, Experience, Skills
- Clickable links for Portfolio, GitHub, LinkedIn

### ✅ Post-Submission Flow
- Personalised success screen (name, applied role, email)
- Summary pills (location, availability, experience)
- **"Apply for Another Job"** button — resets entire wizard cleanly

### 💾 Auto-Save
- All form data (including multi-add entries and skill tags) persists in `localStorage`
- Resuming mid-session restores your exact step and all entered data

### 📱 Fully Responsive
- Mobile-first layout using Bootstrap 5 grid
- Stacked buttons and full-width fields on small screens
- Accessible focus states and ARIA-aware markup

---

## 🗂️ File Structure

```
TalentFlow Recruitment Wizard/
├── index.html      ← All markup, 5-step wizard, success screen
├── style.css       ← Custom styles, CSS variables, animations
├── script.js       ← All JS logic (state, validation, multi-add, save/load)
└── README.md       ← This file
```

---

## 🚀 Getting Started

1. **Clone or download** this repository
2. Open `index.html` directly in your browser — no server needed
3. Or deploy to any static host: **GitHub Pages**, **Netlify**, **Vercel**

### GitHub Pages Deployment
```bash
# In your repo settings → Pages → Source: main branch, root folder
# Your form will be live at: https://<username>.github.io/<repo-name>/
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup, form structure |
| CSS3 | Custom design system, animations, responsive layout |
| Bootstrap 5.3 | Grid, utilities, base components |
| Bootstrap Icons 1.13 | UI iconography |
| Vanilla JavaScript | State management, DOM manipulation, validation |
| localStorage API | Client-side form auto-save |

---

## 🔄 v1 → v2 Changes

| Feature | v1 | v2 |
|---------|----|----|
| Steps | 4 | 5 |
| Job selector | ❌ | ✅ 15 IT roles |
| Education section | ❌ | ✅ Multi-add |
| Certifications | ❌ | ✅ Multi-add |
| Work history | ❌ | ✅ Multi-add with date ranges |
| Skill input | Plain textarea | ✅ Tag-based interactive input |
| CV preview | Browser alert | ✅ Inline file preview badge |
| Validation feedback | Browser alert | ✅ Toast notifications |
| Post-submit flow | Static message | ✅ Personalised + Apply Another Job |
| Review screen | Basic text | ✅ Structured sections with links |
| Auto-save | Basic fields | ✅ All state incl. multi-add entries |
| Header job badge | ❌ | ✅ Sticky indicator of selected role |

---

## 👤 Developer

**Mirza Hadi** — Full Stack Developer & Technical Problem Solver

| | |
|---|---|
| 📧 Email | [mirzahadi@hotmail.com](mailto:mirzahadi@hotmail.com) |
| 🌐 Portfolio | [hadi-mirza.com](https://hadi-mirza.com) |
| 💼 LinkedIn | [linkedin.com/in/hadi-mirza](https://www.linkedin.com/in/hadi-mirza) |
| 🐙 GitHub | [github.com/Hadibaig](https://github.com/Hadibaig) |
| 📰 Newsletter | DCXherald — 4,000+ subscribers |

---

## 📄 License

This project is open source and available for portfolio and educational purposes.
