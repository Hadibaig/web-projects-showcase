/*
═══════════════════════════════════════════════════════════════
 Project: FastBite Restaurant
 Developer: Mirza Hadi
 Brand: HS3Dev
═══════════════════════════════════════════════════════════════
*/

/* ==========================================
   CART SYSTEM
========================================== */

let cart = JSON.parse(localStorage.getItem("fastbiteCart")) || [];

const cartCount =
    document.getElementById("cartCount");

const cartItems =
    document.getElementById("cartItems");

updateCart();

/* ==========================================
   ADD TO CART
========================================== */

document
    .querySelectorAll(".add-cart")
    .forEach(button => {

        button.addEventListener("click", function () {

            const card =
                this.closest(".food-card");

            const productName =
                card.querySelector("h4").innerText;

            const productPrice =
                card.querySelector("h5").innerText;

            cart.push({
                name: productName,
                price: productPrice
            });

            saveCart();
            updateCart();

            alert(productName + " added to cart!");

        });

    });

/* ==========================================
   ORDER NOW
========================================== */

document
    .querySelectorAll(".order-now")
    .forEach(button => {

        button.addEventListener("click", function () {

            document
                .getElementById("order")
                .scrollIntoView({
                    behavior: "smooth"
                });

        });

    });

/* ==========================================
   UPDATE CART
========================================== */

function updateCart() {

    cartCount.innerText = cart.length;

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>No items added yet.</p>";

        return;
    }

    let html = "";

    cart.forEach((item, index) => {

        html += `
            <div class="cart-item">

                <div>
                    <strong>${item.name}</strong>
                    <br>
                    ${item.price}
                </div>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="removeItem(${index})">

                    Remove

                </button>

            </div>
        `;

    });

    cartItems.innerHTML = html;
}

/* ==========================================
   REMOVE ITEM
========================================== */

function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

    updateCart();
}

/* ==========================================
   SAVE CART
========================================== */

function saveCart() {

    localStorage.setItem(
        "fastbiteCart",
        JSON.stringify(cart)
    );
}

/* ==========================================
   LOAD MORE PRODUCTS
========================================== */

const loadMoreBtn =
    document.getElementById("loadMoreBtn");

let loaded = false;

loadMoreBtn.addEventListener("click", function () {

    if (loaded) {

        alert(
            "All products already loaded."
        );

        return;
    }

    const productGrid =
        document.getElementById("productGrid");

    const extraProducts = `

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1550317138-10000687a72b?w=800">
                <h4>Spicy Burger</h4>
                <p>Hot & crispy burger.</p>
                <h5>$11.49</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800">
                <h4>Family Pizza</h4>
                <p>Large family pizza.</p>
                <h5>$18.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800">
                <h4>Chicken Deluxe</h4>
                <p>Premium chicken burger.</p>
                <h5>$13.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800">
                <h4>Cheese Fries</h4>
                <p>Melted cheese fries.</p>
                <h5>$6.49</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800">
                <h4>Mango Juice</h4>
                <p>Fresh mango juice.</p>
                <h5>$4.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800">
                <h4>Triple Burger</h4>
                <p>Ultimate burger stack.</p>
                <h5>$16.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800">
                <h4>Veg Pizza</h4>
                <p>Fresh veggie pizza.</p>
                <h5>$12.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800">
                <h4>Hot Wings</h4>
                <p>Spicy chicken wings.</p>
                <h5>$8.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

        <div class="col-lg-4 col-md-6">
            <div class="food-card">
                <img src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800">
                <h4>Chocolate Shake</h4>
                <p>Rich chocolate shake.</p>
                <h5>$5.99</h5>
                <button class="btn btn-warning add-cart">Add To Cart</button>
                <button class="btn btn-dark order-now">Order Now</button>
            </div>
        </div>

    `;

    productGrid.insertAdjacentHTML(
        "beforeend",
        extraProducts
    );

    loaded = true;

    loadMoreBtn.innerText =
        "All Products Loaded";

    loadMoreBtn.disabled = true;

    location.reload();
});

/* ==========================================
   ORDER FORM
========================================== */

document
    .getElementById("orderForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

        alert(
            "Thank you! Your order has been received."
        );

        this.reset();
    });