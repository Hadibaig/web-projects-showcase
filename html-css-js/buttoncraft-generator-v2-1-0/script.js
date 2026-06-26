/*
════════════════════════════════════════
  Project:    ButtonCraft Generator
  Developer:  Mirza Hadi
  Brand:      HS3Dev
════════════════════════════════════════
*/

const previewButton =
document.getElementById("previewButton");

const btnText =
document.getElementById("btnText");

const fontSize =
document.getElementById("fontSize");

const btnWidth =
document.getElementById("btnWidth");

const btnHeight =
document.getElementById("btnHeight");

const bgColor =
document.getElementById("bgColor");

const textColor =
document.getElementById("textColor");

const borderWidth =
document.getElementById("borderWidth");

const borderColor =
document.getElementById("borderColor");

const borderRadius =
document.getElementById("borderRadius");

const padding =
document.getElementById("padding");

const hoverBg =
document.getElementById("hoverBg");

const hoverText =
document.getElementById("hoverText");

const animationType =
document.getElementById("animationType");

const htmlCode =
document.getElementById("htmlCode");

const cssCode =
document.getElementById("cssCode");

const linkUrl =
document.getElementById("linkUrl");

const previewLink =
document.getElementById("previewLink");

const browserAddressBar =
document.getElementById("browserAddressBar");

const useIcon =
document.getElementById("useIcon");

const iconBuiltin =
document.getElementById("iconBuiltin");

const iconUrl =
document.getElementById("iconUrl");

const iconPosition =
document.getElementById("iconPosition");

const useGradient =
document.getElementById("useGradient");

const gradientColor1 =
document.getElementById("gradientColor1");

const gradientColor2 =
document.getElementById("gradientColor2");

const gradientAngle =
document.getElementById("gradientAngle");

const useShadow =
document.getElementById("useShadow");

const shadowX =
document.getElementById("shadowX");

const shadowY =
document.getElementById("shadowY");

const shadowBlur =
document.getElementById("shadowBlur");

const shadowColor =
document.getElementById("shadowColor");

const shadowOpacity =
document.getElementById("shadowOpacity");

/* =========================
   TOAST
========================= */

function showToast(message){

    const toast =
    document.createElement("div");

    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.right = "20px";
    toast.style.bottom = "20px";
    toast.style.background = "#22c55e";
    toast.style.color = "#fff";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "9999";
    toast.style.fontWeight = "600";

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 2000);
}

/* =========================
   ANIMATION KEYFRAMES LOOKUP
   (needed so copy-pasted code still
   animates on a site that doesn't
   already define these keyframes)
========================= */

const ANIMATION_KEYFRAMES = {

    pulse:
"@keyframes pulse{\n    0%{transform:scale(1);}\n    50%{transform:scale(1.08);}\n    100%{transform:scale(1);}\n}",

    bounce:
"@keyframes bounce{\n    0%,100%{transform:translateY(0);}\n    50%{transform:translateY(-12px);}\n}",

    glow:
"@keyframes glow{\n    0%,100%{box-shadow:0 0 10px #38bdf8;}\n    50%{box-shadow:0 0 30px #38bdf8;}\n}",

    shake:
"@keyframes shake{\n    0%,100%{transform:translateX(0);}\n    25%{transform:translateX(-4px);}\n    75%{transform:translateX(4px);}\n}",

    float:
"@keyframes float{\n    0%,100%{transform:translateY(0);}\n    50%{transform:translateY(-10px);}\n}",

    heartbeat:
"@keyframes heartbeat{\n    0%,100%{transform:scale(1);}\n    25%{transform:scale(1.1);}\n    50%{transform:scale(1);}\n    75%{transform:scale(1.15);}\n}"

};

/* =========================
   BACKGROUND (solid or gradient)
========================= */

function getBackgroundValue(){

    if(useGradient.checked){

        return (
            "linear-gradient(" +
            gradientAngle.value + "deg, " +
            gradientColor1.value + ", " +
            gradientColor2.value +
            ")"
        );
    }

    return bgColor.value;
}

/* =========================
   BOX SHADOW
========================= */

function hexToRgba(hex, alphaPercent){

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = alphaPercent / 100;

    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function getBoxShadowValue(){

    if(!useShadow.checked){
        return "none";
    }

    return (
        shadowX.value + "px " +
        shadowY.value + "px " +
        shadowBlur.value + "px " +
        hexToRgba(shadowColor.value, shadowOpacity.value)
    );
}

/* =========================
   ICON LIBRARY (inline SVG, no
   external dependency so it works
   when pasted into any other site)
========================= */

const ICON_LIBRARY = {

    star:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 14.59 8.36 21.51 9.27 16.45 14.14 17.77 20.9 12 17.6 6.23 20.9 7.55 14.14 2.49 9.27 9.41 8.36"/></svg>',

    heart:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2 4.5-9.5 9-9.5 9z"/></svg>',

    check:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',

    arrow:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',

    download:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',

    cart:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.6L21 8H6"/></svg>'

};

function getIconInnerMarkup(){

    if(!useIcon.checked){
        return "";
    }

    const url =
    iconUrl.value.trim();

    return url
    ? '<img src="' + url + '" alt="">'
    : (ICON_LIBRARY[iconBuiltin.value] || ICON_LIBRARY.star);
}

function getIconPositionClass(){

    switch(iconPosition.value){

        case "right": return "custom-btn--icon-right";
        case "top": return "custom-btn--icon-top";
        case "bottom": return "custom-btn--icon-bottom";
        default: return "custom-btn--icon-left";
    }
}

function getButtonInnerHTML(){

    const icon =
    getIconInnerMarkup();

    if(!icon){
        return btnText.value || "Button";
    }

    return (
        '<span class="custom-btn-icon">' + icon + '</span>' +
        '<span class="custom-btn-text">' + (btnText.value || "Button") + '</span>'
    );
}

function getButtonInnerJSX(){

    const icon =
    getIconInnerMarkup();

    if(!icon){
        return btnText.value || "Button";
    }

    return (
        '<span className="custom-btn-icon">' + icon + '</span>' +
        '<span className="custom-btn-text">' + (btnText.value || "Button") + '</span>'
    );
}

function getIconCSSBlock(){

    return (
        ".custom-btn-icon{\n" +
        "    display:inline-flex!important;\n" +
        "    align-items:center!important;\n" +
        "    justify-content:center!important;\n" +
        "    width:1.2em!important;\n" +
        "    height:1.2em!important;\n" +
        "    flex-shrink:0!important;\n" +
        "}\n\n" +
        ".custom-btn-icon svg,\n" +
        ".custom-btn-icon img{\n" +
        "    width:100%!important;\n" +
        "    height:100%!important;\n" +
        "}\n\n" +
        ".custom-btn--icon-left{flex-direction:row!important;}\n" +
        ".custom-btn--icon-right{flex-direction:row-reverse!important;}\n" +
        ".custom-btn--icon-top{flex-direction:column!important;}\n" +
        ".custom-btn--icon-bottom{flex-direction:column-reverse!important;}"
    );
}

/* =========================
   ELEMENT TYPE (button / link)
   Auto-detected: an empty Link URL
   field means "button". Typing
   anything (even just #) means "link".
========================= */

function isLinkMode(){

    return linkUrl.value.trim() !== "";
}

function getActivePreviewElement(){

    return isLinkMode()
    ? previewLink
    : previewButton;
}

function syncElementTypeVisibility(){

    const active =
    getActivePreviewElement();

    const inactive =
    active === previewButton
    ? previewLink
    : previewButton;

    active.style.display = "inline-flex";
    active.style.alignItems = "center";
    active.style.justifyContent = "center";
    active.style.textAlign = "center";

    inactive.style.display = "none";

    if(isLinkMode()){

        previewLink.href =
        linkUrl.value.trim();

        browserAddressBar.textContent =
        linkUrl.value.trim();

    } else {

        browserAddressBar.textContent =
        "yourwebsite.com";
    }
}

/* =========================
   GENERATE
========================= */

function updateButton(){

    syncElementTypeVisibility();

    const el =
    getActivePreviewElement();

    [
        "custom-btn--icon-left",
        "custom-btn--icon-right",
        "custom-btn--icon-top",
        "custom-btn--icon-bottom"

    ].forEach(cls => {

        previewButton.classList.remove(cls);
        previewLink.classList.remove(cls);
    });

    if(useIcon.checked){
        el.classList.add(getIconPositionClass());
    }

    el.innerHTML =
    getButtonInnerHTML();

    el.style.fontSize =
    fontSize.value + "px";

    el.style.width =
    btnWidth.value + "px";

    el.style.height =
    btnHeight.value + "px";

    el.style.background =
    getBackgroundValue();

    el.style.color =
    textColor.value;

    el.style.border =
    borderWidth.value +
    "px solid " +
    borderColor.value;

    el.style.borderRadius =
    borderRadius.value + "px";

    el.style.padding =
    padding.value + "px";

    el.style.boxShadow =
    getBoxShadowValue();

    el.style.gap =
    "8px";

    el.style.animation =
    "none";

    applyAnimation();

    generateCode();
}

/* =========================
   ANIMATION
========================= */

function applyAnimation(){

    const el =
    getActivePreviewElement();

    const selected =
    animationType.value;

    const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if(prefersReducedMotion){

        el.style.animation =
        "none";

        return;
    }

    switch(selected){

        case "pulse":
            el.style.animation =
            "pulse 1.5s infinite";
            break;

        case "bounce":
            el.style.animation =
            "bounce 1.5s infinite";
            break;

        case "glow":
            el.style.animation =
            "glow 2s infinite";
            break;

        case "shake":
            el.style.animation =
            "shake 0.8s infinite";
            break;

        case "float":
            el.style.animation =
            "float 2s infinite";
            break;

        case "heartbeat":
            el.style.animation =
            "heartbeat 1.2s infinite";
            break;

        default:
            el.style.animation =
            "none";
    }
}

/* =========================
   GENERATE CODE
========================= */

function generateCode(){

const isLink =
isLinkMode();

const tag =
isLink ? "a" : "button";

const hrefAttr =
isLink
? ` href="${linkUrl.value.trim()}"`
: "";

const iconPositionClass =
useIcon.checked
? " " + getIconPositionClass()
: "";

htmlCode.value =

`<${tag} class="custom-btn${iconPositionClass}"${hrefAttr}>
${getButtonInnerHTML()}
</${tag}>`;

const backgroundValue =
getBackgroundValue();

const boxShadowValue =
getBoxShadowValue();

const keyframesBlock =
animationType.value === "none"
? ""
: "\n\n" + ANIMATION_KEYFRAMES[animationType.value];

const iconBlock =
useIcon.checked
? "\n\n" + getIconCSSBlock()
: "";

cssCode.value =

`.custom-btn{

    display:inline-flex!important;

    align-items:center!important;

    justify-content:center!important;

    gap:8px!important;

    text-align:center!important;

    text-decoration:none!important;

    background:${backgroundValue}!important;

    color:${textColor.value}!important;

    width:${btnWidth.value}px!important;

    height:${btnHeight.value}px!important;

    font-size:${fontSize.value}px!important;

    padding:${padding.value}px!important;

    border:${borderWidth.value}px solid ${borderColor.value}!important;

    border-radius:${borderRadius.value}px!important;

    box-shadow:${boxShadowValue}!important;

    cursor:pointer!important;

    transition:all .3s ease;

}

.custom-btn:hover{

    background:${hoverBg.value}!important;

    color:${hoverText.value}!important;

}

/* Accessibility: visible keyboard focus state
   (kept separate from :hover so keyboard/screen-reader
   users get a clear indicator even without a mouse) */

.custom-btn:focus-visible{

    outline:3px solid #2563eb!important;

    outline-offset:3px!important;

}

/* Animation */

.custom-btn{

    animation:${animationType.value === "none"
? "none"
: animationType.value + " 1.5s infinite"}!important;

}

/* Accessibility: respect users who have requested
   reduced motion at the OS/browser level */

@media (prefers-reduced-motion: reduce){

    .custom-btn{

        animation:none!important;

        transition:none!important;

    }

}${iconBlock}${keyframesBlock}`;

generateReactCode(backgroundValue, boxShadowValue, tag);

generateTailwindCode(tag);

}

/* =========================
   REACT EXPORT
========================= */

function generateReactCode(backgroundValue, boxShadowValue, tag){

    const hrefAttr =
    tag === "a"
    ? ' href="' + linkUrl.value.trim() + '"'
    : "";

    const animationDeclaration =
    animationType.value === "none"
    ? "none"
    : animationType.value + " 1.5s infinite";

    const keyframesText =
    animationType.value === "none"
    ? ""
    : "\n        " +
      ANIMATION_KEYFRAMES[animationType.value]
      .split("\n").join("\n        ");

    const iconCSSText =
    useIcon.checked
    ? "\n\n        " +
      getIconCSSBlock().split("\n").join("\n        ")
    : "";

    const iconPositionClass =
    useIcon.checked
    ? " " + getIconPositionClass()
    : "";

    const lines = [
        "function CustomButton(){",
        "",
        "  return (",
        "    <>",
        "      <style>{`",
        "        .custom-btn{",
        "          display:inline-flex!important;",
        "          align-items:center!important;",
        "          justify-content:center!important;",
        "          gap:8px!important;",
        "          text-align:center!important;",
        "          text-decoration:none!important;",
        "          background:" + backgroundValue + "!important;",
        "          color:" + textColor.value + "!important;",
        "          width:" + btnWidth.value + "px!important;",
        "          height:" + btnHeight.value + "px!important;",
        "          font-size:" + fontSize.value + "px!important;",
        "          padding:" + padding.value + "px!important;",
        "          border:" + borderWidth.value + "px solid " + borderColor.value + "!important;",
        "          border-radius:" + borderRadius.value + "px!important;",
        "          box-shadow:" + boxShadowValue + "!important;",
        "          cursor:pointer!important;",
        "          transition:all .3s ease;",
        "        }",
        "        .custom-btn:hover{",
        "          background:" + hoverBg.value + "!important;",
        "          color:" + hoverText.value + "!important;",
        "        }",
        "        .custom-btn:focus-visible{",
        "          outline:3px solid #2563eb!important;",
        "          outline-offset:3px!important;",
        "        }",
        "        .custom-btn{",
        "          animation:" + animationDeclaration + "!important;",
        "        }",
        "        @media (prefers-reduced-motion: reduce){",
        "          .custom-btn{",
        "            animation:none!important;",
        "            transition:none!important;",
        "          }",
        "        }" + keyframesText + iconCSSText,
        "      `}</style>",
        "      <" + tag + " className=\"custom-btn" + iconPositionClass + "\"" + hrefAttr + ">",
        "        " + getButtonInnerJSX(),
        "      </" + tag + ">",
        "    </>",
        "  );",
        "}",
        "",
        "export default CustomButton;"
    ];

    reactCode.value = lines.join("\n");
}

/* =========================
   TAILWIND EXPORT
========================= */

function generateTailwindCode(tag){

    const hrefAttr =
    tag === "a"
    ? ' href="' + linkUrl.value.trim() + '"'
    : "";

    const backgroundClass =
    useGradient.checked
    ? "[background:linear-gradient(" + gradientAngle.value + "deg," +
      gradientColor1.value + "," + gradientColor2.value + ")]"
    : "bg-[" + bgColor.value + "]";

    const shadowRgba =
    hexToRgba(shadowColor.value, shadowOpacity.value)
    .replace(/\s/g, "");

    const boxShadowClass =
    useShadow.checked
    ? "[box-shadow:" + shadowX.value + "px_" + shadowY.value +
      "px_" + shadowBlur.value + "px_" + shadowRgba + "]"
    : "";

    const animationClasses =
    animationType.value === "none"
    ? ""
    : " [animation:" + animationType.value + "_1.5s_infinite] motion-reduce:[animation:none]";

    const iconFlexClass =
    iconPosition.value === "right" ? "flex-row-reverse" :
    iconPosition.value === "top" ? "flex-col" :
    iconPosition.value === "bottom" ? "flex-col-reverse" :
    "flex-row";

    const iconClasses =
    useIcon.checked
    ? " " + iconFlexClass + " gap-2"
    : "";

    const classList = [
        "inline-flex",
        "items-center",
        "justify-center",
        backgroundClass,
        "text-[" + textColor.value + "]",
        "w-[" + btnWidth.value + "px]",
        "h-[" + btnHeight.value + "px]",
        "text-[" + fontSize.value + "px]",
        "p-[" + padding.value + "px]",
        "border-[" + borderWidth.value + "px]",
        "border-[" + borderColor.value + "]",
        "rounded-[" + borderRadius.value + "px]",
        "cursor-pointer",
        "[transition:all_.3s_ease]",
        "hover:bg-[" + hoverBg.value + "]",
        "hover:text-[" + hoverText.value + "]",
        "focus-visible:outline",
        "focus-visible:outline-[3px]",
        "focus-visible:outline-[#2563eb]",
        "focus-visible:outline-offset-[3px]"
    ];

    if(boxShadowClass){
        classList.push(boxShadowClass);
    }

    const classString =
    classList.join(" ") + iconClasses + animationClasses;

    const keyframesNote =
    animationType.value === "none"
    ? ""
    : "\n\n<!-- Tailwind can't generate custom keyframes for you.\n     Add this to your global CSS:\n\n" +
      ANIMATION_KEYFRAMES[animationType.value] +
      "\n-->";

    tailwindCode.value =

    "<" + tag + " class=\"" + classString + "\"" + hrefAttr + ">\n" +
    "  " + getButtonInnerHTML() + "\n" +
    "</" + tag + ">" +
    keyframesNote;
}

/* =========================
   EVENTS
========================= */

[
btnText,
fontSize,
btnWidth,
btnHeight,
bgColor,
textColor,
borderWidth,
borderColor,
borderRadius,
padding,
hoverBg,
hoverText,
animationType,
linkUrl,
useGradient,
gradientColor1,
gradientColor2,
gradientAngle,
useShadow,
shadowX,
shadowY,
shadowBlur,
shadowColor,
shadowOpacity,
useIcon,
iconBuiltin,
iconUrl,
iconPosition

].forEach(element => {

    element.addEventListener(
        "input",
        updateButton
    );

});

/* =========================
   COPY HTML
========================= */

document
.getElementById("copyHtml")
.addEventListener("click", () => {

    navigator.clipboard.writeText(
        htmlCode.value
    );

    showToast(
        "HTML Copied!"
    );

});

/* =========================
   COPY CSS
========================= */

document
.getElementById("copyCss")
.addEventListener("click", () => {

    navigator.clipboard.writeText(
        cssCode.value
    );

    showToast(
        "CSS Copied!"
    );

});

/* =========================
   COPY ALL BUTTON
========================= */

const copyAllBtn =
document.createElement("button");

copyAllBtn.innerText =
"Copy HTML + CSS";

copyAllBtn.className =
"btn btn-primary mt-3";

document
.querySelector(".code-section .container")
.appendChild(copyAllBtn);

copyAllBtn.addEventListener(
"click",
() => {

const allCode =

htmlCode.value +

"\n\n" +

cssCode.value;

navigator.clipboard.writeText(
allCode
);

showToast(
"HTML + CSS Copied!"
);

});

/* =========================
   RESET BUTTON
========================= */

const resetBtn =
document.createElement("button");

resetBtn.innerText =
"Reset";

resetBtn.className =
"btn btn-danger mt-3 ms-2";

document
.querySelector(".code-section .container")
.appendChild(resetBtn);

resetBtn.addEventListener(
"click",
() => {

btnText.value = "Buy Now";

fontSize.value = 18;

btnWidth.value = 180;

btnHeight.value = 55;

bgColor.value = "#2563eb";

textColor.value = "#ffffff";

borderWidth.value = 0;

borderColor.value = "#000000";

borderRadius.value = 10;

padding.value = 15;

hoverBg.value = "#1d4ed8";

hoverText.value = "#ffffff";

animationType.value = "none";

linkUrl.value = "";

useGradient.checked = false;

gradientColor1.value = "#2563eb";

gradientColor2.value = "#9333ea";

gradientAngle.value = 135;

useShadow.checked = false;

shadowX.value = 0;

shadowY.value = 10;

shadowBlur.value = 25;

shadowColor.value = "#000000";

shadowOpacity.value = 35;

useIcon.checked = false;

iconBuiltin.value = "star";

iconUrl.value = "";

iconPosition.value = "left";

updateButton();

showToast(
"Generator Reset!"
);

});

/* =========================
   EXTRA EXPORT: REACT + TAILWIND
========================= */

const exportRow =
document.createElement("div");

exportRow.className =
"row mt-4";

exportRow.innerHTML =

'<div class="col-lg-6">' +
'<h5>React Component</h5>' +
'<textarea id="reactCode" rows="10"></textarea>' +
'<button id="copyReact" class="btn btn-success">Copy React</button>' +
'</div>' +
'<div class="col-lg-6">' +
'<h5>Tailwind Classes</h5>' +
'<textarea id="tailwindCode" rows="10"></textarea>' +
'<button id="copyTailwind" class="btn btn-success">Copy Tailwind</button>' +
'</div>';

document
.querySelector(".code-section .container")
.appendChild(exportRow);

const reactCode =
document.getElementById("reactCode");

const tailwindCode =
document.getElementById("tailwindCode");

document
.getElementById("copyReact")
.addEventListener("click", () => {

    navigator.clipboard.writeText(
        reactCode.value
    );

    showToast(
        "React Component Copied!"
    );

});

document
.getElementById("copyTailwind")
.addEventListener("click", () => {

    navigator.clipboard.writeText(
        tailwindCode.value
    );

    showToast(
        "Tailwind Classes Copied!"
    );

});

/* =========================
   DOWNLOAD HTML / CSS FILES
========================= */

function downloadFile(filename, content){

    const blob =
    new Blob([content], {type: "text/plain"});

    const url =
    URL.createObjectURL(blob);

    const link =
    document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

const downloadBtnGroup =
document.createElement("div");

downloadBtnGroup.className =
"mt-3";

downloadBtnGroup.innerHTML =

'<button id="downloadHtml" class="btn btn-outline-light me-2">Download HTML</button>' +
'<button id="downloadCss" class="btn btn-outline-light">Download CSS</button>';

document
.querySelector(".code-section .container")
.appendChild(downloadBtnGroup);

document
.getElementById("downloadHtml")
.addEventListener("click", () => {

    downloadFile("button.html", htmlCode.value);

    showToast(
        "HTML File Downloaded!"
    );

});

document
.getElementById("downloadCss")
.addEventListener("click", () => {

    downloadFile("button.css", cssCode.value);

    showToast(
        "CSS File Downloaded!"
    );

});

/* =========================
   INITIAL LOAD
========================= */
function loadPreset(type){

    linkUrl.value = "";

    useGradient.checked = false;

    useShadow.checked = false;

    useIcon.checked = false;

    switch(type){

        case "primary":

            btnText.value = "Get Started";
            bgColor.value = "#2563eb";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderColor.value = "#000000";
            borderRadius.value = 8;
            btnWidth.value = 180;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Primary Button";

        break;

        case "secondary":

            btnText.value = "Learn More";
            bgColor.value = "#64748b";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderColor.value = "#000000";
            borderRadius.value = 8;
            btnWidth.value = 180;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Secondary Button";

        break;

        case "outline":

            btnText.value = "Contact Us";
            bgColor.value = "#ffffff";
            textColor.value = "#2563eb";
            borderWidth.value = 2;
            borderColor.value = "#2563eb";
            borderRadius.value = 8;
            btnWidth.value = 180;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Outline Button";

        break;

        case "cta":

            btnText.value = "Buy Now";
            bgColor.value = "#f97316";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderColor.value = "#000000";
            borderRadius.value = 50;
            btnWidth.value = 200;
            btnHeight.value = 60;
            animationType.value = "pulse";

            document.getElementById("currentPreset").innerText =
            "CTA Button";

        break;

        case "gradient":

            btnText.value = "Download";
            bgColor.value = "#06b6d4";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderColor.value = "#000000";
            borderRadius.value = 12;
            btnWidth.value = 200;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Gradient Button";

        break;

        case "neon":

            btnText.value = "Explore";
            bgColor.value = "#111827";
            textColor.value = "#22c55e";
            borderWidth.value = 2;
            borderColor.value = "#22c55e";
            borderRadius.value = 10;
            btnWidth.value = 200;
            btnHeight.value = 55;
            animationType.value = "glow";

            document.getElementById("currentPreset").innerText =
            "Neon Button";

        break;

        case "glass":

            btnText.value = "Glass Button";
            bgColor.value = "#94a3b8";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderRadius.value = 15;
            btnWidth.value = 200;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Glass Button";

        break;

        case "square":

            btnText.value = "Learn More";
            bgColor.value = "#2563eb";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderRadius.value = 0;
            btnWidth.value = 180;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Square Button";

        break;

        case "circle":

            btnText.value = "+";
            bgColor.value = "#ec4899";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderRadius.value = 50;
            btnWidth.value = 70;
            btnHeight.value = 70;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Circle Button";

        break;

        case "contact":

            btnText.value = "Contact Us";
            bgColor.value = "#16a34a";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderRadius.value = 12;
            btnWidth.value = 200;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Contact Button";

        break;

        case "join":

            btnText.value = "Join Now";
            bgColor.value = "#ffffff";
            textColor.value = "#111827";
            borderWidth.value = 0;
            borderRadius.value = 8;
            btnWidth.value = 180;
            btnHeight.value = 55;
            animationType.value = "none";

            document.getElementById("currentPreset").innerText =
            "Join Button";

        break;

        case "demo":

            btnText.value = "View Demo";
            bgColor.value = "#8b5cf6";
            textColor.value = "#ffffff";
            borderWidth.value = 0;
            borderRadius.value = 15;
            btnWidth.value = 200;
            btnHeight.value = 55;
            animationType.value = "float";

            document.getElementById("currentPreset").innerText =
            "Demo Button";

        break;
    }

    updateButton();

    document.getElementById("generator")
    .scrollIntoView({
        behavior:"smooth"
    });
}
updateButton();