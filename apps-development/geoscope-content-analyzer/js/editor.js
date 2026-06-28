// editor.js
// Wires up the toolbar (H1-H4, bold, italic, lists, clear formatting) for the
// contenteditable #contentBody box, and sanitizes pasted HTML so formatting
// from Word/Google Docs/web pages is kept for the tags we care about
// (headings, lists, links, bold/italic, tables) but everything else
// (inline styles, scripts, classes, fonts, colors) is stripped.

(function () {
  "use strict";

  const editor = document.getElementById("contentBody");
  const toolbar = document.getElementById("editorToolbar");

  // ---- Toolbar buttons ----
  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest(".ed-btn");
    if (!btn) return;
    e.preventDefault();
    editor.focus();

    const cmd = btn.getAttribute("data-cmd");
    const value = btn.getAttribute("data-value");

    if (cmd) {
      try {
        document.execCommand(cmd, false, value || null);
      } catch (err) {
        console.error("execCommand failed:", cmd, err);
      }
      triggerUpdate();
    }
  });

  document.getElementById("clearFormatBtn").addEventListener("click", (e) => {
    e.preventDefault();
    editor.focus();
    try {
      document.execCommand("removeFormat");
      document.execCommand("formatBlock", false, "P");
    } catch (err) {
      console.error("Clear formatting failed:", err);
    }
    triggerUpdate();
  });

  document.getElementById("insertLinkBtn").addEventListener("click", (e) => {
    e.preventDefault();
    editor.focus();
    const url = prompt("Enter the link URL (including https://):");
    if (!url) return;
    const safeUrl = /^https?:\/\//i.test(url) ? url : "https://" + url;
    try {
      document.execCommand("createLink", false, safeUrl);
    } catch (err) {
      console.error("createLink failed:", err);
    }
    triggerUpdate();
  });

  function triggerUpdate() {
    // Fire a synthetic input event so main.js's listener (AppState._notify + save) runs.
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // ---- Paste sanitization ----
  const ALLOWED_TAGS = new Set([
    "H1","H2","H3","H4","P","BR","B","STRONG","I","EM",
    "UL","OL","LI","A","TABLE","THEAD","TBODY","TR","TD","TH","BLOCKQUOTE"
  ]);

  editor.addEventListener("paste", (e) => {
    e.preventDefault();
    const clipboard = e.clipboardData || window.clipboardData;
    const html = clipboard.getData("text/html");
    const plain = clipboard.getData("text/plain");

    let cleanHtml;
    if (html) {
      cleanHtml = sanitizeHtml(html);
    } else {
      // Plain text fallback: escape and wrap each line as its own paragraph.
      cleanHtml = plain
        .split(/\r?\n/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");
    }

    insertHtmlAtCursor(cleanHtml);
    triggerUpdate();
  });

  function sanitizeHtml(dirtyHtml) {
    const doc = new DOMParser().parseFromString(dirtyHtml, "text/html");
    cleanNode(doc.body);
    return doc.body.innerHTML;
  }

  function cleanNode(node) {
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return;

      if (child.nodeType !== Node.ELEMENT_NODE) {
        node.removeChild(child);
        return;
      }

      // Recurse first so nested disallowed tags are cleaned before we decide on this node.
      cleanNode(child);

      const tag = child.tagName;

      if (!ALLOWED_TAGS.has(tag)) {
        // Unwrap: keep the children (text/allowed inline content) but drop the wrapper tag
        // (this is how we strip <span style="...">, <div>, <font>, etc. while keeping text).
        while (child.firstChild) {
          node.insertBefore(child.firstChild, child);
        }
        node.removeChild(child);
        return;
      }

      // Strip all attributes except href (and only on <a>, and only if it's http/https).
      Array.from(child.attributes).forEach((attr) => {
        if (tag === "A" && attr.name === "href" && /^https?:\/\//i.test(attr.value)) {
          return; // keep safe http(s) links
        }
        child.removeAttribute(attr.name);
      });

      if (tag === "A" && !child.getAttribute("href")) {
        // Link with no safe href left — unwrap it like a disallowed tag.
        while (child.firstChild) {
          node.insertBefore(child.firstChild, child);
        }
        node.removeChild(child);
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function insertHtmlAtCursor(html) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editor.innerHTML += html;
      return;
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
})();
