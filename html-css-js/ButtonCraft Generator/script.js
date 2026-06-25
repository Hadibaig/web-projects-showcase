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
   GENERATE
========================= */

function updateButton(){

    previewButton.innerText =
    btnText.value || "Button";

    previewButton.style.fontSize =
    fontSize.value + "px";

    previewButton.style.width =
    btnWidth.value + "px";

    previewButton.style.height =
    btnHeight.value + "px";

    previewButton.style.background =
    bgColor.value;

    previewButton.style.color =
    textColor.value;

    previewButton.style.border =
    borderWidth.value +
    "px solid " +
    borderColor.value;

    previewButton.style.borderRadius =
    borderRadius.value + "px";

    previewButton.style.padding =
    padding.value + "px";

    previewButton.style.animation =
    "none";

    applyAnimation();

    generateCode();
}

/* =========================
   ANIMATION
========================= */

function applyAnimation(){

    const selected =
    animationType.value;

    switch(selected){

        case "pulse":
            previewButton.style.animation =
            "pulse 1.5s infinite";
            break;

        case "bounce":
            previewButton.style.animation =
            "bounce 1.5s infinite";
            break;

        case "glow":
            previewButton.style.animation =
            "glow 2s infinite";
            break;

        case "shake":
            previewButton.style.animation =
            "shake 0.8s infinite";
            break;

        case "float":
            previewButton.style.animation =
            "float 2s infinite";
            break;

        case "heartbeat":
            previewButton.style.animation =
            "heartbeat 1.2s infinite";
            break;

        default:
            previewButton.style.animation =
            "none";
    }
}

/* =========================
   GENERATE CODE
========================= */

function generateCode(){

htmlCode.value =

`<button class="custom-btn">
${btnText.value || "Button"}
</button>`;

cssCode.value =

`.custom-btn{

    background:${bgColor.value};

    color:${textColor.value};

    width:${btnWidth.value}px;

    height:${btnHeight.value}px;

    font-size:${fontSize.value}px;

    padding:${padding.value}px;

    border:${borderWidth.value}px solid ${borderColor.value};

    border-radius:${borderRadius.value}px;

    cursor:pointer;

    transition:all .3s ease;

}

.custom-btn:hover{

    background:${hoverBg.value};

    color:${hoverText.value};

}

/* Animation */

.custom-btn{

    animation:${animationType.value === "none"
? "none"
: animationType.value + " 1.5s infinite"};

}`;
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
animationType

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

updateButton();

showToast(
"Generator Reset!"
);

});

/* =========================
   INITIAL LOAD
========================= */

updateButton();