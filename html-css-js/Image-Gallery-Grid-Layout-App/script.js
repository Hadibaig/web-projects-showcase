/*Project:    Impact Gallery - Responsive Image Showcase
  Developer:  Mirza Hadi
  Role:        Full Stack Developer & Technical Problem Solver
  Email:       mirzahadi@hotmail.com 
  Website:     hadi-mirza.com
  LinkedIn:    linkedin.com/in/hadibaig
  GitHub:      github.com/Hadibaig
  Newsletter:  DCXherald — 4,000+ subscribers*/

/* =========================================================
   Impact Gallery - JavaScript
   Features:
   - Lightbox
   - Carousel thumbnail switch
   - Mobile menu (basic toggle ready)
========================================================= */

/* ================= LIGHTBOX WITH NEXT/PREV ================= */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-img");
const closeBtn = document.querySelector(".lightbox .close");

const prevBtn = document.querySelector(".lightbox .prev");
const nextBtn = document.querySelector(".lightbox .next");

const gridImages = document.querySelectorAll(".image-grid img");

let currentIndex = 0;

// Open lightbox
gridImages.forEach((img, index) => {
  img.addEventListener("click", () => {
    currentIndex = index;
    openLightbox();
  });
});

function openLightbox() {
  lightbox.style.display = "flex";
  updateImage();
}

// Update image based on index
function updateImage() {
  lightboxImg.src = gridImages[currentIndex].src;
}

// Next image
function nextImage() {
  currentIndex = (currentIndex + 1) % gridImages.length;
  updateImage();
}

// Previous image
function prevImage() {
  currentIndex =
    (currentIndex - 1 + gridImages.length) % gridImages.length;
  updateImage();
}

// Buttons
nextBtn.addEventListener("click", nextImage);
prevBtn.addEventListener("click", prevImage);

// Close
closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});

// Click outside
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.style.display = "none";
  }
});

// ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.style.display = "none";
  }

  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});

// ESC key close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.style.display = "none";
  }
});

/* ================= CAROUSEL ================= */
const featuredImage = document.getElementById("featuredImage");
const thumbnails = document.querySelectorAll(".thumb");

thumbnails.forEach(thumb => {
  thumb.addEventListener("click", () => {
    // Update main image
    featuredImage.src = thumb.src.replace("/200/120", "/800/500");

    // Active state
    thumbnails.forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
  });
});

/* ================= MOBILE MENU (BASIC READY) ================= */
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

hamburger.addEventListener("click", () => {
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
});