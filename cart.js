let cartItems =
JSON.parse(localStorage.getItem("cartItems")) || [];

const cartContainer =
document.getElementById("cart-items");
const totalElement = document.getElementById("total");
const subtotalElement = document.getElementById("subtotal");
const cartCountElement = document.getElementById("cart-count");

let total = 0;

function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("cartCount", cartItems.length);
}

function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartItems.length;
    }
}

function loadCart() {
    cartContainer.innerHTML = "";
    total = 0;

    if (!cartItems.length) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add a cake or dessert from our menu to see it here.</p>
                <a class="secondary-btn" href="cake.html">Explore Bakery Menu</a>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = "0";
        if (totalElement) totalElement.textContent = "0";
        updateCartCount();
        return;
    }

    cartItems.forEach((item, index) => {
        const price = Number(String(item.price).replace(/[^\d]/g, ""));
        total += price;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-left">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-details">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="cart-price">${item.price}</div>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    if (subtotalElement) subtotalElement.textContent = total;
    if (totalElement) totalElement.textContent = total;
    updateCartCount();
}

function removeItem(index) {
    cartItems.splice(index, 1);
    saveCart();
    loadCart();
}

const checkoutButton = document.querySelector(".checkout-btn");
if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
        if (window.openWhatsAppOrder) {
            window.openWhatsAppOrder(null, cartItems);
        } else {
            const itemNames = cartItems.map(item => item.name).slice(0, 3).join(", ");
            const message = cartItems.length
                ? `I would like to proceed with my order for ${cartItems.length} item(s): ${itemNames}${cartItems.length > 3 ? " and more" : ""}. Please confirm availability and delivery details.`
                : "I would like to place an order. Please help me with availability and delivery details.";

            const whatsappUrl = `https://wa.me/916381570958?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }
    });
}

loadCart();