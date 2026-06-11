/*
═══════════════════════════════════════════════════════════════
 Project:    TalentFlow Recruitment Wizard (Enhanced)
 Developer:  Mirza Hadi
 Version:    2.0
═══════════════════════════════════════════════════════════════
*/

/* =========================================
   STATE
========================================= */

let currentStep = 0;
const TOTAL_STEPS = 5;

let educationEntries = [];   // { id, degree, institution, year, grade }
let certEntries = [];        // { id, name, issuer, year, credentialId }
let workEntries = [];        // { id, title, company, startDate, endDate, current, description }
let skillTagList = [];       // string[]

/* =========================================
   DOM REFERENCES
========================================= */

const steps        = document.querySelectorAll(".form-step");
const indicators   = Array.from({ length: TOTAL_STEPS }, (_, i) =>
                        document.getElementById(`indicator${i + 1}`));
const form         = document.getElementById("applicationForm");
const reviewContent= document.getElementById("reviewContent");
const formSection  = document.getElementById("formSection");
const successSection = document.getElementById("successMessage");
const selectedJobBadge = document.getElementById("selectedJobBadge");
const selectedJobLabel = document.getElementById("selectedJobLabel");
const applyAnotherBtn  = document.getElementById("applyAnotherBtn");

/* =========================================
   INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadSavedData();
    showStep(currentStep);
    initResumePreview();
    initSkillTags();
    initEducationSection();
    initCertSection();
    initWorkSection();
    initJobSelector();
    bindNavButtons();
    bindFormSubmit();
    bindAutoSave();

    // Apply another job
    applyAnotherBtn.addEventListener("click", resetWizard);
});

/* =========================================
   STEP DISPLAY
========================================= */

function showStep(index) {
    steps.forEach(s => s.classList.remove("active-step"));
    steps[index].classList.add("active-step");
    updateProgress(index);

    // Scroll form into view smoothly
    document.getElementById("progressSection")
        .scrollIntoView({ behavior: "smooth", block: "start" });

    saveFormData();
}

/* =========================================
   PROGRESS INDICATOR
========================================= */

function updateProgress(activeIndex) {
    indicators.forEach((ind, i) => {
        ind.classList.remove("active", "completed");
        if (i < activeIndex)  ind.classList.add("completed");
        if (i === activeIndex) ind.classList.add("active");
    });
}

/* =========================================
   NAVIGATION BUTTONS
========================================= */

function bindNavButtons() {
    document.querySelectorAll(".next-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!validateStep(currentStep)) return;
            if (currentStep < TOTAL_STEPS - 1) {
                currentStep++;
                if (currentStep === TOTAL_STEPS - 1) generateReview();
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll(".prev-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });
}

/* =========================================
   JOB SELECTOR
========================================= */

function initJobSelector() {
    const jobSelect = document.getElementById("desiredJob");
    jobSelect.addEventListener("change", () => {
        const val = jobSelect.value;
        if (val) {
            selectedJobBadge.classList.remove("d-none");
            selectedJobLabel.textContent = val;
        } else {
            selectedJobBadge.classList.add("d-none");
        }
        saveFormData();
    });
}

/* =========================================
   RESUME FILE PREVIEW
========================================= */

function initResumePreview() {
    const resumeInput   = document.getElementById("resume");
    const resumePreview = document.getElementById("resumePreview");
    const resumeFileName= document.getElementById("resumeFileName");

    resumeInput.addEventListener("change", function () {
        if (this.files.length > 0) {
            resumeFileName.textContent = this.files[0].name;
            resumePreview.classList.remove("d-none");
        } else {
            resumePreview.classList.add("d-none");
        }
    });
}

/* =========================================
   SKILL TAGS
========================================= */

function initSkillTags() {
    const wrapper   = document.getElementById("skillTagWrapper");
    const input     = document.getElementById("skillInput");
    const hiddenFld = document.getElementById("skills");

    function addTag(value) {
        const tag = value.trim().replace(/,+$/, "");
        if (!tag || skillTagList.includes(tag)) return;
        skillTagList.push(tag);
        renderSkillTags();
        hiddenFld.value = skillTagList.join(", ");
        saveFormData();
    }

    function removeTag(tag) {
        skillTagList = skillTagList.filter(t => t !== tag);
        renderSkillTags();
        hiddenFld.value = skillTagList.join(", ");
        saveFormData();
    }

    function renderSkillTags() {
        const container = document.getElementById("skillTags");
        container.innerHTML = "";
        skillTagList.forEach(tag => {
            const el = document.createElement("span");
            el.className = "skill-tag";
            el.innerHTML = `${escHtml(tag)}<button type="button" aria-label="Remove ${escHtml(tag)}"><i class="bi bi-x"></i></button>`;
            el.querySelector("button").addEventListener("click", () => removeTag(tag));
            container.appendChild(el);
        });
    }

    input.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input.value);
            input.value = "";
        } else if (e.key === "Backspace" && input.value === "" && skillTagList.length > 0) {
            removeTag(skillTagList[skillTagList.length - 1]);
        }
    });

    input.addEventListener("blur", () => {
        if (input.value.trim()) {
            addTag(input.value);
            input.value = "";
        }
    });

    wrapper.addEventListener("click", () => input.focus());

    // expose renderSkillTags for load
    window._renderSkillTags = renderSkillTags;
}

/* =========================================
   EDUCATION MULTI-ADD
========================================= */

function initEducationSection() {
    document.getElementById("addEducationBtn").addEventListener("click", () => {
        addEducationEntry();
    });
    renderEducationList();
}

function addEducationEntry(data = {}) {
    const id = data.id || "edu_" + Date.now();
    const entry = {
        id,
        degree: data.degree || "",
        institution: data.institution || "",
        year: data.year || "",
        grade: data.grade || ""
    };
    educationEntries.push(entry);
    renderEducationList();
    saveFormData();
}

function removeEducationEntry(id) {
    educationEntries = educationEntries.filter(e => e.id !== id);
    renderEducationList();
    saveFormData();
}

function renderEducationList() {
    const list = document.getElementById("educationList");
    if (educationEntries.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="bi bi-mortarboard"></i>No degrees added yet. Click "Add Degree".</div>`;
        return;
    }
    list.innerHTML = educationEntries.map((e, i) => `
        <div class="entry-card" id="eduCard_${e.id}">
            <div class="entry-card-header">
                <span class="entry-card-title">Degree ${i + 1}</span>
                <button type="button" class="btn-remove" onclick="removeEducationEntry('${e.id}')" title="Remove"><i class="bi bi-trash3"></i></button>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label">Degree / Qualification *</label>
                    <input type="text" class="form-control" value="${escHtml(e.degree)}" placeholder="e.g. Bachelor of Science in CS"
                        oninput="updateEducation('${e.id}','degree',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Institution *</label>
                    <input type="text" class="form-control" value="${escHtml(e.institution)}" placeholder="e.g. FAST NUCES"
                        oninput="updateEducation('${e.id}','institution',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Graduation Year</label>
                    <input type="number" class="form-control" value="${escHtml(e.year)}" placeholder="2022" min="1960" max="2030"
                        oninput="updateEducation('${e.id}','year',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Grade / GPA</label>
                    <input type="text" class="form-control" value="${escHtml(e.grade)}" placeholder="e.g. 3.8 / 4.0 or First Class"
                        oninput="updateEducation('${e.id}','grade',this.value)">
                </div>
            </div>
        </div>
    `).join("");
}

function updateEducation(id, field, value) {
    const entry = educationEntries.find(e => e.id === id);
    if (entry) { entry[field] = value; saveFormData(); }
}

/* =========================================
   CERTIFICATION MULTI-ADD
========================================= */

function initCertSection() {
    document.getElementById("addCertBtn").addEventListener("click", () => {
        addCertEntry();
    });
    renderCertList();
}

function addCertEntry(data = {}) {
    const id = data.id || "cert_" + Date.now();
    certEntries.push({
        id,
        name: data.name || "",
        issuer: data.issuer || "",
        year: data.year || "",
        credentialId: data.credentialId || ""
    });
    renderCertList();
    saveFormData();
}

function removeCertEntry(id) {
    certEntries = certEntries.filter(e => e.id !== id);
    renderCertList();
    saveFormData();
}

function renderCertList() {
    const list = document.getElementById("certList");
    if (certEntries.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="bi bi-patch-check"></i>No certifications added yet. Click "Add Certification".</div>`;
        return;
    }
    list.innerHTML = certEntries.map((c, i) => `
        <div class="entry-card" id="certCard_${c.id}">
            <div class="entry-card-header">
                <span class="entry-card-title">Certification ${i + 1}</span>
                <button type="button" class="btn-remove" onclick="removeCertEntry('${c.id}')" title="Remove"><i class="bi bi-trash3"></i></button>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label">Certification Name *</label>
                    <input type="text" class="form-control" value="${escHtml(c.name)}" placeholder="e.g. AWS Solutions Architect"
                        oninput="updateCert('${c.id}','name',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Issuing Organization *</label>
                    <input type="text" class="form-control" value="${escHtml(c.issuer)}" placeholder="e.g. Amazon Web Services"
                        oninput="updateCert('${c.id}','issuer',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Year Obtained</label>
                    <input type="number" class="form-control" value="${escHtml(c.year)}" placeholder="2024" min="1990" max="2030"
                        oninput="updateCert('${c.id}','year',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Credential ID <span class="text-muted">(optional)</span></label>
                    <input type="text" class="form-control" value="${escHtml(c.credentialId)}" placeholder="e.g. ABC-123456"
                        oninput="updateCert('${c.id}','credentialId',this.value)">
                </div>
            </div>
        </div>
    `).join("");
}

function updateCert(id, field, value) {
    const entry = certEntries.find(e => e.id === id);
    if (entry) { entry[field] = value; saveFormData(); }
}

/* =========================================
   WORK HISTORY MULTI-ADD
========================================= */

function initWorkSection() {
    document.getElementById("addWorkBtn").addEventListener("click", () => {
        addWorkEntry();
    });
    renderWorkList();
}

function addWorkEntry(data = {}) {
    const id = data.id || "work_" + Date.now();
    workEntries.push({
        id,
        title: data.title || "",
        company: data.company || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        current: data.current || false,
        description: data.description || ""
    });
    renderWorkList();
    saveFormData();
}

function removeWorkEntry(id) {
    workEntries = workEntries.filter(e => e.id !== id);
    renderWorkList();
    saveFormData();
}

function renderWorkList() {
    const list = document.getElementById("workList");
    if (workEntries.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="bi bi-building"></i>No work history added yet. Click "Add Role".</div>`;
        return;
    }
    list.innerHTML = workEntries.map((w, i) => `
        <div class="entry-card" id="workCard_${w.id}">
            <div class="entry-card-header">
                <span class="entry-card-title">Position ${i + 1}</span>
                <button type="button" class="btn-remove" onclick="removeWorkEntry('${w.id}')" title="Remove"><i class="bi bi-trash3"></i></button>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label">Job Title *</label>
                    <input type="text" class="form-control" value="${escHtml(w.title)}" placeholder="e.g. Senior Developer"
                        oninput="updateWork('${w.id}','title',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Company / Organization *</label>
                    <input type="text" class="form-control" value="${escHtml(w.company)}" placeholder="e.g. Systems Limited"
                        oninput="updateWork('${w.id}','company',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Start Date</label>
                    <input type="month" class="form-control" value="${escHtml(w.startDate)}"
                        oninput="updateWork('${w.id}','startDate',this.value)">
                </div>
                <div class="col-md-6">
                    <label class="form-label">End Date</label>
                    <input type="month" class="form-control" value="${escHtml(w.endDate)}" id="endDate_${w.id}"
                        ${w.current ? "disabled" : ""}
                        oninput="updateWork('${w.id}','endDate',this.value)">
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" id="current_${w.id}"
                            ${w.current ? "checked" : ""}
                            onchange="toggleCurrentJob('${w.id}', this.checked)">
                        <label class="form-check-label small" for="current_${w.id}">Currently working here</label>
                    </div>
                </div>
                <div class="col-12">
                    <label class="form-label">Key Responsibilities / Achievements</label>
                    <textarea class="form-control" rows="2" placeholder="Briefly describe your role and impact…"
                        oninput="updateWork('${w.id}','description',this.value)">${escHtml(w.description)}</textarea>
                </div>
            </div>
        </div>
    `).join("");
}

function updateWork(id, field, value) {
    const entry = workEntries.find(e => e.id === id);
    if (entry) { entry[field] = value; saveFormData(); }
}

function toggleCurrentJob(id, checked) {
    const entry = workEntries.find(e => e.id === id);
    if (entry) {
        entry.current = checked;
        if (checked) entry.endDate = "";
        renderWorkList();
        saveFormData();
    }
}

/* =========================================
   STEP VALIDATION
========================================= */

function validateStep(index) {

    const show = (msg) => { showToast(msg, "warning"); return false; };

    if (index === 0) {
        const job   = document.getElementById("desiredJob").value;
        const name  = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const resume= document.getElementById("resume").value;

        if (!job)    return show("Please select a Desired Position.");
        if (!name)   return show("Full Name is required.");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                     return show("Please enter a valid Email address.");
        if (!phone)  return show("Phone Number is required.");
        if (!resume) return show("Please upload your Resume / CV.");
    }

    if (index === 2) {
        const position = document.getElementById("position").value.trim();
        const exp      = document.getElementById("totalExperience").value.trim();
        if (!position) return show("Current / Last Position is required.");
        if (!exp)      return show("Total Years of Experience is required.");
    }

    if (index === 3) {
        if (skillTagList.length === 0)
            return show("Please add at least one technical skill.");
    }

    if (index === 4) {
        const agreed = document.getElementById("agreeTerms").checked;
        if (!agreed) return show("Please confirm your information is accurate before submitting.");
    }

    return true;
}

/* =========================================
   TOAST NOTIFICATIONS
========================================= */

function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
        document.body.appendChild(container);
    }

    const colors = {
        success: "#16a34a",
        warning: "#d97706",
        danger:  "#dc2626",
        info:    "#2563eb"
    };

    const icons = {
        success: "bi-check-circle-fill",
        warning: "bi-exclamation-triangle-fill",
        danger:  "bi-x-circle-fill",
        info:    "bi-info-circle-fill"
    };

    const toast = document.createElement("div");
    toast.style.cssText = `
        background:white;
        border-left:4px solid ${colors[type] || colors.info};
        border-radius:10px;
        padding:12px 18px;
        box-shadow:0 4px 20px rgba(0,0,0,.12);
        font-size:.9rem;
        font-weight:500;
        display:flex;
        align-items:center;
        gap:10px;
        max-width:320px;
        animation:slideInToast .25s ease;
    `;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}" style="color:${colors[type] || colors.info};font-size:1.1rem;"></i> ${message}`;

    if (!document.getElementById("toastStyle")) {
        const s = document.createElement("style");
        s.id = "toastStyle";
        s.textContent = `@keyframes slideInToast{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}`;
        document.head.appendChild(s);
    }

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity .3s";
        setTimeout(() => toast.remove(), 320);
    }, 3500);
}

/* =========================================
   REVIEW GENERATION
========================================= */

function generateReview() {

    const g = id => document.getElementById(id)?.value || "—";

    const resumeInput = document.getElementById("resume");
    const resumeName  = resumeInput?.files?.length > 0
        ? resumeInput.files[0].name
        : g("resumeFileName") || "—";

    const skillsHtml = skillTagList.length > 0
        ? `<div class="review-skill-tags">${skillTagList.map(t => `<span class="review-skill-tag">${escHtml(t)}</span>`).join("")}</div>`
        : "<span class='text-muted'>—</span>";

    const eduHtml = educationEntries.length > 0
        ? educationEntries.map(e => `
            <div class="review-entry">
                <div class="review-entry-title">${escHtml(e.degree) || "—"}</div>
                <div class="text-muted small">${escHtml(e.institution)}${e.year ? " · " + e.year : ""}${e.grade ? " · " + e.grade : ""}</div>
            </div>`).join("")
        : "<p class='text-muted small'>No education entries added.</p>";

    const certHtml = certEntries.length > 0
        ? certEntries.map(c => `
            <div class="review-entry">
                <div class="review-entry-title">${escHtml(c.name) || "—"}</div>
                <div class="text-muted small">${escHtml(c.issuer)}${c.year ? " · " + c.year : ""}${c.credentialId ? " · ID: " + c.credentialId : ""}</div>
            </div>`).join("")
        : "<p class='text-muted small'>No certifications added.</p>";

    const workHtml = workEntries.length > 0
        ? workEntries.map(w => `
            <div class="review-entry">
                <div class="review-entry-title">${escHtml(w.title)} — ${escHtml(w.company)}</div>
                <div class="text-muted small">${w.startDate ? formatMonth(w.startDate) : ""}${w.startDate ? " → " : ""}${w.current ? "Present" : (w.endDate ? formatMonth(w.endDate) : "")}</div>
                ${w.description ? `<p class="mt-1 mb-0 small">${escHtml(w.description)}</p>` : ""}
            </div>`).join("")
        : "<p class='text-muted small'>No work history added.</p>";

    reviewContent.innerHTML = `

        <!-- Position -->
        <div class="mb-3">
            <div class="review-section-title"><i class="bi bi-briefcase-fill"></i> Applying For</div>
            <div class="review-entry" style="border-color:#bfdbfe;background:#eff6ff;">
                <div class="review-entry-title" style="color:var(--primary);font-size:1.05rem;">${escHtml(g("desiredJob"))}</div>
            </div>
        </div>
        <hr class="review-divider">

        <!-- Personal -->
        <div class="mb-3">
            <div class="review-section-title"><i class="bi bi-person-fill"></i> Personal Information</div>
            <div class="review-grid">
                <div class="review-item"><strong>Full Name</strong>${escHtml(g("fullName"))}</div>
                <div class="review-item"><strong>Email</strong>${escHtml(g("email"))}</div>
                <div class="review-item"><strong>Phone</strong>${escHtml(g("phone"))}</div>
                <div class="review-item"><strong>Country</strong>${escHtml(g("country")) || "—"}</div>
                <div class="review-item"><strong>City</strong>${escHtml(g("city")) || "—"}</div>
                <div class="review-item"><strong>LinkedIn</strong>${g("linkedin") !== "—" ? `<a href="${escHtml(g("linkedin"))}" target="_blank">View Profile</a>` : "—"}</div>
                <div class="review-item"><strong>Resume</strong>${escHtml(resumeName)}</div>
            </div>
        </div>
        <hr class="review-divider">

        <!-- Education -->
        <div class="mb-3">
            <div class="review-section-title"><i class="bi bi-mortarboard-fill"></i> Education</div>
            ${eduHtml}
        </div>

        <div class="mb-3">
            <div class="review-section-title"><i class="bi bi-patch-check-fill"></i> Certifications</div>
            ${certHtml}
        </div>
        <hr class="review-divider">

        <!-- Experience -->
        <div class="mb-3">
            <div class="review-section-title"><i class="bi bi-briefcase-fill"></i> Professional Experience</div>
            <div class="review-grid mb-3">
                <div class="review-item"><strong>Current Position</strong>${escHtml(g("position"))}</div>
                <div class="review-item"><strong>Total Experience</strong>${escHtml(g("totalExperience"))} Years</div>
                <div class="review-item"><strong>Status</strong>${escHtml(g("employment"))}</div>
                <div class="review-item"><strong>Expected Salary</strong>${escHtml(g("salary")) || "—"}</div>
            </div>
            ${workHtml}
        </div>
        <hr class="review-divider">

        <!-- Skills -->
        <div class="mb-3">
            <div class="review-section-title"><i class="bi bi-stars"></i> Skills & Portfolio</div>
            <div class="mb-2">${skillsHtml}</div>
            <div class="review-grid">
                <div class="review-item"><strong>Portfolio</strong>${g("portfolio") !== "—" ? `<a href="${escHtml(g("portfolio"))}" target="_blank">View Site</a>` : "—"}</div>
                <div class="review-item"><strong>GitHub</strong>${g("github") !== "—" ? `<a href="${escHtml(g("github"))}" target="_blank">View Profile</a>` : "—"}</div>
                <div class="review-item"><strong>Availability</strong>${escHtml(g("availability"))}</div>
            </div>
            ${g("about") !== "—" ? `<div class="review-item mt-2"><strong>About</strong>${escHtml(g("about"))}</div>` : ""}
        </div>
    `;
}

function formatMonth(val) {
    if (!val) return "";
    const [y, m] = val.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m) - 1]} ${y}`;
}

/* =========================================
   FORM SUBMISSION
========================================= */

function bindFormSubmit() {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateStep(4)) return;

        // Populate success screen
        document.getElementById("successName").textContent =
            document.getElementById("fullName").value || "Applicant";
        document.getElementById("successJob").textContent =
            document.getElementById("desiredJob").value || "the position";
        document.getElementById("successEmail").textContent =
            document.getElementById("email").value || "";

        // Pill summary
        const pills = document.getElementById("successPills");
        const pillData = [
            { icon: "bi-geo-alt-fill", text: document.getElementById("city").value || document.getElementById("country").value },
            { icon: "bi-clock-fill", text: document.getElementById("availability").value },
            { icon: "bi-bar-chart-fill", text: (document.getElementById("totalExperience").value || "0") + " yrs experience" }
        ].filter(p => p.text && p.text !== "—");

        pills.innerHTML = pillData.map(p =>
            `<span class="success-pill"><i class="bi ${p.icon}"></i> ${escHtml(p.text)}</span>`
        ).join("");

        // Hide/show
        formSection.style.display = "none";
        document.getElementById("progressSection").style.display = "none";
        document.getElementById("heroSection").style.display = "none";
        successSection.style.display = "block";

        localStorage.removeItem("talentFlowData");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* =========================================
   RESET / APPLY ANOTHER JOB
========================================= */

function resetWizard() {
    // Clear all state
    educationEntries = [];
    certEntries = [];
    workEntries = [];
    skillTagList = [];
    currentStep = 0;

    // Reset form fields
    form.reset();
    document.getElementById("skills").value = "";
    document.getElementById("skillTags").innerHTML = "";
    document.getElementById("resumePreview").classList.add("d-none");
    selectedJobBadge.classList.add("d-none");
    selectedJobLabel.textContent = "—";

    // Re-render multi-add lists
    renderEducationList();
    renderCertList();
    renderWorkList();

    // Uncheck agreement
    document.getElementById("agreeTerms").checked = false;

    // Show form, hide success
    successSection.style.display = "none";
    formSection.style.display = "block";
    document.getElementById("progressSection").style.display = "block";
    document.getElementById("heroSection").style.display = "block";

    showStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================
   AUTO-SAVE & LOCAL STORAGE
========================================= */

function bindAutoSave() {
    document.querySelectorAll("input:not([type=file]), textarea, select")
        .forEach(el => el.addEventListener("input", saveFormData));
}

function saveFormData() {
    const data = {
        desiredJob:      document.getElementById("desiredJob")?.value,
        fullName:        document.getElementById("fullName")?.value,
        email:           document.getElementById("email")?.value,
        phone:           document.getElementById("phone")?.value,
        country:         document.getElementById("country")?.value,
        city:            document.getElementById("city")?.value,
        linkedin:        document.getElementById("linkedin")?.value,
        position:        document.getElementById("position")?.value,
        totalExperience: document.getElementById("totalExperience")?.value,
        employment:      document.getElementById("employment")?.value,
        salary:          document.getElementById("salary")?.value,
        skills:          document.getElementById("skills")?.value,
        portfolio:       document.getElementById("portfolio")?.value,
        github:          document.getElementById("github")?.value,
        about:           document.getElementById("about")?.value,
        availability:    document.getElementById("availability")?.value,
        skillTagList,
        educationEntries,
        certEntries,
        workEntries,
        currentStep
    };
    try {
        localStorage.setItem("talentFlowData", JSON.stringify(data));
    } catch (_) {}
}

function loadSavedData() {
    let saved;
    try {
        saved = JSON.parse(localStorage.getItem("talentFlowData"));
    } catch (_) { return; }
    if (!saved) return;

    const textFields = [
        "desiredJob","fullName","email","phone","country","city","linkedin",
        "position","totalExperience","employment","salary","skills",
        "portfolio","github","about","availability"
    ];

    textFields.forEach(key => {
        const el = document.getElementById(key);
        if (el && saved[key] !== undefined) el.value = saved[key];
    });

    // Restore job badge
    if (saved.desiredJob) {
        selectedJobBadge.classList.remove("d-none");
        selectedJobLabel.textContent = saved.desiredJob;
    }

    // Restore skill tags
    if (Array.isArray(saved.skillTagList)) {
        skillTagList = saved.skillTagList;
        if (window._renderSkillTags) window._renderSkillTags();
    }

    // Restore multi-add arrays
    if (Array.isArray(saved.educationEntries)) educationEntries = saved.educationEntries;
    if (Array.isArray(saved.certEntries))      certEntries      = saved.certEntries;
    if (Array.isArray(saved.workEntries))      workEntries      = saved.workEntries;

    renderEducationList();
    renderCertList();
    renderWorkList();

    // Restore step
    if (typeof saved.currentStep === "number" && saved.currentStep < TOTAL_STEPS) {
        currentStep = saved.currentStep;
    }
}

/* =========================================
   UTILITIES
========================================= */

function escHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
