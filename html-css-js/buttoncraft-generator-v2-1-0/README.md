# ButtonCraft Generator

A modern Button Generator built with HTML, CSS, JavaScript and Bootstrap.

ButtonCraft allows developers, WordPress users, designers, and beginners to visually create custom buttons and instantly generate reusable HTML and CSS code.

---

## Features

### Ready-to-Use Button Presets

* Primary Button
* Secondary Button
* Outline Button
* CTA Button
* Neon Button
* Glass Button
* Circle Button
* Contact Button
* Join Button
* Demo Button

Click any preset and it automatically loads into the generator for customization.

---

## Button Customization Options

Users can customize:

* Button Text
* Width
* Height
* Font Size
* Background Color
* Text Color
* Border Width
* Border Color
* Border Radius
* Padding
* Hover Background Color
* Hover Text Color

---

## Built-In Animations

* Pulse
* Bounce
* Glow
* Shake
* Float
* Heartbeat

Animations can be applied instantly and previewed live.

---

## Accessibility Defaults

Every button ButtonCraft generates ships with accessible behavior out of the box — no toggle required:

* **Real interactive elements** — output is a genuine `<button>` or `<a>`, never a styled `<div>`, so screen readers and keyboard users recognize it correctly.
* **Visible keyboard focus** — a `:focus-visible` outline is included alongside `:hover`, so Tab-key users can always see which button is focused.
* **Reduced motion support** — all animations are wrapped in `@media (prefers-reduced-motion: reduce)`, so visitors who've asked their OS for less motion won't get pulses, shakes, or bounces.

These same rules are applied to the live preview button on this page too, so you can see the accessible behavior before you copy the code.

---

## v2.1 additions

* **Auto link detection** — leave the Link URL field empty for a `<button>`, type a URL (or just `#`) and it generates a real, clickable `<a>` instead. No manual toggle needed.
* **Icons** — add a built-in inline-SVG icon (no external dependency) or paste any icon/image CDN URL, positioned left, right, above, or below the text.
* **Browser preview frame** — the live preview now sits inside a mock browser window so it's easier to picture how the button will look on a real page.
* **Override-proof exported CSS** — the plain HTML/CSS and React exports now use `!important` on the visual properties, so the button keeps its shape (border-radius, padding, etc.) even when pasted into a host theme or page builder (Elementor, Gutenberg, etc.) that ships its own conflicting button styles.
* **Fixed a real bug**: exported code referencing an animation (e.g. `pulse`) never actually included the `@keyframes` definition, so pasted buttons with animation enabled silently didn't animate anywhere but this page. Keyframes are now included in every export format.

---

## Live Preview

Every change updates the preview button in real time.

No page refresh required.

---

## Code Export

Generate:

* HTML Code
* CSS Code

Copy:

* HTML Only
* CSS Only
* HTML + CSS Together

Perfect for:

* WordPress Elementor
* Gutenberg Editor
* Custom HTML Widgets
* Landing Pages
* Business Websites

---

## Technologies Used

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Bootstrap 5

---

## Mobile Responsive

The project is fully responsive and optimized for:

* Desktop
* Tablet
* Mobile Devices

---

## Project Structure

```text
ButtonCraft-Generator/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## Future Improvements

* Gradient Builder
* Box Shadow Generator
* Icon Buttons
* Download HTML File
* Download CSS File
* Local Storage Presets
* Dark Mode
* WordPress Export Templates

---

## Developer

Mirza Hadi

Full Stack Developer & Technical Problem Solver

Portfolio:
https://hadi-mirza.com

LinkedIn:
https://www.linkedin.com/in/hadi-mirza

GitHub:
https://github.com/hadibaig

Credly:
https://www.credly.com/users/hadimirza

---

## License

Open Source — Free to use for learning and portfolio purposes.