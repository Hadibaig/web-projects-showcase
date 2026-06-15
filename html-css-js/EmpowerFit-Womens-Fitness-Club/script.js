/*
═══════════════════════════════════════════════════════════════
 Project: EmpowerFit Women's Fitness Club
 Developer: Mirza Hadi
 Brand: HS3Dev
═══════════════════════════════════════════════════════════════
*/

/* ==========================================
   BMI CALCULATOR
========================================== */

const calculateBtn =
    document.getElementById("calculateBtn");

const bmiResult =
    document.getElementById("bmiResult");

calculateBtn.addEventListener("click", function () {

    const height =
        parseFloat(
            document.getElementById("height").value
        );

    const weight =
        parseFloat(
            document.getElementById("weight").value
        );

    if (!height || !weight) {

        bmiResult.innerHTML =
            "Please enter both height and weight.";

        return;
    }

    const bmi =
        weight / ((height / 100) * (height / 100));

    let category = "";

    if (bmi < 18.5) {

        category = "Underweight";

    } else if (bmi < 25) {

        category = "Normal Weight";

    } else if (bmi < 30) {

        category = "Overweight";

    } else {

        category = "Obese";
    }

    bmiResult.innerHTML = `
        <strong>
            Your BMI: ${bmi.toFixed(1)}
        </strong>
        <br>
        Category: ${category}
    `;
});

/* ==========================================
   CONTACT FORM
========================================== */

const contactForm =
    document.getElementById("contactForm");

contactForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const inputs =
        contactForm.querySelectorAll(
            "input, textarea"
        );

    let valid = true;

    inputs.forEach(input => {

        if (input.value.trim() === "") {

            valid = false;
        }

    });

    if (!valid) {

        alert(
            "Please complete all fields."
        );

        return;
    }

    alert(
        "Thank you! Your consultation request has been submitted successfully."
    );

    contactForm.reset();
});

/* ==========================================
   SMOOTH SCROLL FOR MENU LINKS
========================================== */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target =
                document.querySelector(
                    this.getAttribute("href")
                );

            if (target) {

                target.scrollIntoView({

                    behavior: "smooth",
                    block: "start"

                });
            }

        });

    });

/* ==========================================
   JOIN NOW BUTTON ENHANCEMENT
========================================== */

document
    .querySelectorAll(".btn-warning")
    .forEach(button => {

        if (
            button.textContent.includes("Join Now")
        ) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .getElementById("contact")
                        .scrollIntoView({

                            behavior: "smooth"

                        });

                }
            );
        }

    });

/* ==========================================
   HERO BUTTON ENHANCEMENT
========================================== */

document
    .querySelectorAll(".btn-primary")
    .forEach(button => {

        if (
            button.textContent.includes(
                "Explore Programs"
            )
        ) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .getElementById("programs")
                        .scrollIntoView({

                            behavior: "smooth"

                        });

                }
            );
        }

    });

/* ==========================================
   ACTIVE NAVIGATION LINK
========================================== */

window.addEventListener("scroll", () => {

    const sections =
        document.querySelectorAll("section");

    const navLinks =
        document.querySelectorAll(".nav-link");

    let current = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 120;

        const sectionHeight =
            section.clientHeight;

        if (
            pageYOffset >= sectionTop &&
            pageYOffset <
            sectionTop + sectionHeight
        ) {

            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + current
        ) {

            link.classList.add("active");
        }

    });

});

/* ==========================================
   SIMPLE FADE-IN EFFECT
========================================== */

const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "show"
                    );

                }

            });

        },

        {
            threshold: 0.15
        }
    );

document
    .querySelectorAll(
        ".feature-card, .program-card, .trainer-card, .price-card"
    )
    .forEach(item => {

        item.classList.add("hidden-card");

        observer.observe(item);

    });

/* ==========================================
   PAGE LOADED
========================================== */

window.addEventListener("load", () => {

    console.log(
        "EmpowerFit Women's Fitness Club Loaded Successfully"
    );

});