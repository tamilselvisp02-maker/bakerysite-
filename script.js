console.log("Lavanya's Home Bakery Loaded Successfully");

function getStoredCartItems() {
    try {
        return JSON.parse(localStorage.getItem("cartItems")) || [];
    } catch (error) {
        return [];
    }
}

function saveCartItems(cartItems) {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("cartCount", cartItems.length);
}

function updateCartBadge() {
    const cartNumber = document.getElementById("cart-count");
    if (cartNumber) {
        cartNumber.textContent = getStoredCartItems().length;
    }
}

updateCartBadge();

const WHATSAPP_NUMBER = "916381570958";

function buildWhatsAppOrderMessage(product, items = null) {
    const selectedItems = Array.isArray(items) ? items.slice() : [];

    if (product) {
        const alreadyAdded = selectedItems.some(item =>
            item && item.name && product.name && item.name === product.name && item.price === product.price
        );

        if (!alreadyAdded) {
            selectedItems.push(product);
        }
    }

    const validItems = selectedItems.filter(Boolean);
    const total = validItems.reduce((sum, item) => {
        const priceValue = Number(String(item.price || "0").replace(/[^\d]/g, ""));
        return sum + (Number.isFinite(priceValue) ? priceValue : 0);
    }, 0);

    const itemLines = validItems.map((item, index) => {
        const name = item.name || "Bakery Item";
        const price = item.price || "Price on request";
        const description = item.description ? `\n   ${item.description}` : "";
        return `${index + 1}. ${name} — ${price}${description}`;
    });

    return [
        "Hello Lavanya's Home Bakery! I would like to place an order.",
        "",
        "Order details:",
        ...itemLines,
        "",
        `Total items: ${validItems.length}`,
        `Estimated total: ₹${total}`,
        "",
        "Please confirm availability, customization options, and delivery details."
    ].join("\n");
}

function openWhatsAppOrder(product, items = null) {
    const message = buildWhatsAppOrderMessage(product, items);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

window.buildWhatsAppOrderMessage = buildWhatsAppOrderMessage;
window.openWhatsAppOrder = openWhatsAppOrder;

function saveOrderIntent() {
    const cartItems = getStoredCartItems();
    const itemCount = cartItems.length;
    const pageName = document.title || "our bakery";
    const itemNames = cartItems.map(item => item.name).slice(0, 3).join(", ");
    const message = itemCount > 0
        ? `I would like to place an order for ${itemCount} item(s): ${itemNames}${itemCount > 3 ? " and more" : ""}. Please help me with availability, customization, and delivery details.`
        : `I would like to place a custom order for a cake or dessert. Please help me with availability, customization, and delivery details.`;

    localStorage.setItem("orderIntent", JSON.stringify({
        message,
        page: pageName,
        itemCount
    }));

    return message;
}

function getProductData(button) {
    const container = button.closest("[data-name], .product-card, .gallery-card, .category-card");

    if (container && container.dataset.name) {
        return {
            name: container.dataset.name || "Bakery Item",
            image: container.dataset.image || container.querySelector("img")?.src || "",
            price: container.dataset.price || container.querySelector("p:last-of-type")?.textContent || "",
            description: container.dataset.description || container.querySelector("p")?.textContent || "Crafted fresh for you.",
            rating: container.dataset.rating || container.querySelector(".rating")?.textContent || ""
        };
    }

    const parent = button.parentElement;
    const heading = parent?.querySelector("h3, h2, .product-title")?.textContent?.trim() || "Bakery Item";
    const image = parent?.querySelector("img")?.src || "";
    const priceText = parent?.querySelector("p:last-of-type")?.textContent?.trim() || "";

    return {
        name: heading,
        image: image,
        price: priceText,
        description: "Crafted fresh for you.",
        rating: ""
    };
}

const cartButtons = document.querySelectorAll(".add-cart-btn");

cartButtons.forEach(button => {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        const cake = getProductData(button);
        const cartItems = getStoredCartItems();
        const updatedCartItems = cartItems.some(item => item && item.name && cake.name && item.name === cake.name && item.price === cake.price)
            ? cartItems
            : [...cartItems, cake];

        saveCartItems(updatedCartItems);
        updateCartBadge();

        const originalText = button.textContent;
        button.textContent = "Opening WhatsApp...";
        button.disabled = true;

        openWhatsAppOrder(cake);

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    });
});

const orderButtons = document.querySelectorAll(".order-btn:not([type='submit'])");

orderButtons.forEach(button => {
    button.addEventListener("click", function (event) {
        event.preventDefault();
        saveOrderIntent();

        const targetId = button.dataset.scrollTarget || "best-sellers";
        const scrollTarget = document.getElementById(targetId);

        if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        window.location.href = "index.html#best-sellers";
    });
});

const contactForm = document.getElementById("contact-form");
const orderIntentBanner = document.getElementById("order-intent-banner");

if (contactForm) {
    const messageField = document.getElementById("message");
    const storedIntent = JSON.parse(localStorage.getItem("orderIntent") || "null");

    if (storedIntent?.message && messageField && !messageField.value.trim()) {
        messageField.value = storedIntent.message;
    }

    if (orderIntentBanner && storedIntent?.message) {
        orderIntentBanner.hidden = false;
        orderIntentBanner.innerHTML = `We have prepared your order request. Please complete the details below and we will get back to you shortly.`;
    }

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const nameField = document.getElementById("name");
        const successName = nameField?.value?.trim() || "there";

        if (orderIntentBanner) {
            orderIntentBanner.hidden = false;
            orderIntentBanner.classList.add("success");
            orderIntentBanner.innerHTML = `<strong>Thank you, ${successName}!</strong> Your request has been received. Our team will contact you shortly.`;
        }

        contactForm.reset();
        localStorage.removeItem("orderIntent");
    });
}

const productImages = document.querySelectorAll(".product-card img");
productImages.forEach(image => {
    image.addEventListener("click", () => {
        const productCard = image.closest(".product-card");
        const cakeName = productCard.dataset.name;

        if (cakeName === "Chocolate Cake") {
            window.location.href = "chocolate-cakes.html";
            return;
        }

        const cakeData = {
            name: productCard.dataset.name,
            image: productCard.dataset.image || image.src,
            description: productCard.dataset.description || productCard.dataset.name,
            price: productCard.dataset.price || productCard.querySelector("p:last-of-type").textContent,
            rating: productCard.dataset.rating || productCard.querySelector(".rating").textContent
        };
        localStorage.setItem("selectedCake", JSON.stringify(cakeData));
        window.location.href = "cake-detail.html";
    });
});

const searchBox = document.getElementById("searchBox");
const products = document.querySelectorAll(".product-card");
const categoryLinks = document.querySelectorAll(".category-link");

const searchRoutes = [
    { keywords: ["chocolate", "choco"], page: "chocolate-cakes.html" },
    { keywords: ["wedding"], page: "wedding-cakes.html" },
    { keywords: ["birthday"], page: "birthday-cakes.html" },
    { keywords: ["anniversary"], page: "anniversary-cakes.html" },
    { keywords: ["daughter"], page: "daughter-cakes.html" },
    { keywords: ["designer"], page: "designer-cakes.html" },
    { keywords: ["genz", "gen z"], page: "genz-cakes.html" },
    { keywords: ["husband"], page: "husband.html" },
    { keywords: ["kids", "kid"], page: "kids-cakes.html" },
    { keywords: ["wife"], page: "wife.html" },
    { keywords: ["strawberry"], page: "strawberry-cakes.html" },
    { keywords: ["1 year", "first year", "firstyear", "one year", "baby"], page: "1yr-cakes.html" },
    { keywords: ["cake"], page: "cake.html" },
    { keywords: ["dessert", "desserts"], page: "desserts.html" },
    { keywords: ["cookie", "cookies"], page: "cookies.html" },
    { keywords: ["cupcake", "cupcakes"], page: "cupcakes.html" },
    { keywords: ["donut", "donuts"], page: "donuts.html" }
];

function normalizeSearchText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getSearchTarget(query) {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
        return null;
    }

    return searchRoutes.find(route => route.keywords.some(keyword => normalizedQuery.includes(keyword)))?.page || null;
}

function filterProducts(query) {
    const searchText = normalizeSearchText(query);

    products.forEach(function (product) {
        const cakeName = normalizeSearchText(product.dataset.name);
        product.style.display = cakeName.includes(searchText) ? "block" : "none";
    });
}

categoryLinks.forEach(link => {
    link.addEventListener("click", () => {
        const targetPage = link.dataset.target;
        if (targetPage) {
            window.location.href = targetPage;
        }
    });
});

if (searchBox) {
    let searchTimeout;

    searchBox.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const targetPage = getSearchTarget(searchBox.value);
            if (targetPage) {
                window.location.href = targetPage;
            }
        }
    });

    searchBox.addEventListener("input", function () {
        clearTimeout(searchTimeout);
        const targetPage = getSearchTarget(searchBox.value);

        if (targetPage) {
            searchTimeout = setTimeout(() => {
                window.location.href = targetPage;
            }, 350);
            return;
        }

        searchTimeout = setTimeout(() => {
            filterProducts(searchBox.value);
        }, 200);
    });
}


