const bagDrawer = document.getElementById("bagDrawer");
const openBagBtn = document.getElementById("openBagBtn");
const closeBagBtn = document.getElementById("closeBagBtn");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const bagItemsContainer = document.getElementById("bagItems");
const bagSubtotal = document.getElementById("bagSubtotal");
const bagCount = document.getElementById("bagCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const navMenuBtn = document.getElementById("navMenuBtn");
const navLinksWrap = document.getElementById("navLinksWrap");
const cursorGlow = document.getElementById("cursorGlow");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutModalBackdrop = document.getElementById("checkoutModalBackdrop");
const closeCheckoutModalBtn = document.getElementById("closeCheckoutModalBtn");
const checkoutOrderPreview = document.getElementById("checkoutOrderPreview");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSubmitBtn = document.getElementById("checkoutSubmitBtn");
const checkoutSuccess = document.getElementById("checkoutSuccess");
const checkoutError = document.getElementById("checkoutError");

const STORAGE_KEY = "svvvd_bag";
const ORDER_EMAIL = "Svvvdbuisness@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${ORDER_EMAIL}`;

let bag = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/* -------------------------
   HELPERS
------------------------- */
function saveBag() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
}

function formatPrice(value) {
  return `MAD${value}`;
}

function updateBagCount() {
  bagCount.textContent = `[ ${bag.length} ]`;
}

function calculateSubtotal() {
  return bag.reduce((sum, item) => sum + item.price, 0);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetCheckoutStatus() {
  checkoutSuccess.style.display = "none";
  checkoutError.style.display = "none";
}

function getOrderItemsText() {
  return bag
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} / Size ${item.size} / MAD${item.price} / ${item.stock}`
    )
    .join("\n");
}

/* -------------------------
   BAG UI
------------------------- */
function renderBag() {
  updateBagCount();

  if (bag.length === 0) {
    bagItemsContainer.innerHTML = `
      <div class="bag-empty">
        Your bag is empty.<br />
        Select a size on a piece from DROP 001 and add it here.
      </div>
    `;
    bagSubtotal.textContent = "MAD0";
    return;
  }

  bagItemsContainer.innerHTML = bag
    .map(
      (item, index) => `
        <div class="bag-item">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
          <div>
            <h3 class="bag-item-name">${escapeHtml(item.name)}</h3>
            <p class="bag-item-meta">
              Size: ${escapeHtml(item.size)}<br />
              Price: MAD${escapeHtml(item.price)}<br />
              Stock: ${escapeHtml(item.stock)}
            </p>
            <button class="remove-btn" data-remove-index="${index}" type="button">Remove</button>
          </div>
          <div class="bag-item-price">MAD${escapeHtml(item.price)}</div>
        </div>
      `
    )
    .join("");

  bagSubtotal.textContent = formatPrice(calculateSubtotal());

  const removeButtons = document.querySelectorAll("[data-remove-index]");
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeIndex);
      bag.splice(index, 1);
      saveBag();
      renderBag();
      renderCheckoutPreview();
    });
  });
}

function openBag() {
  bagDrawer.classList.add("open");
  drawerBackdrop.classList.add("active");
  bagDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeBag() {
  bagDrawer.classList.remove("open");
  drawerBackdrop.classList.remove("active");
  bagDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* -------------------------
   CHECKOUT MODAL
------------------------- */
function renderCheckoutPreview() {
  if (bag.length === 0) {
    checkoutOrderPreview.innerHTML = `<p class="checkout-preview-item">Your bag is empty.</p>`;
    return;
  }

  const itemsHtml = bag
    .map(
      (item, index) => `
        <p class="checkout-preview-item">
          ${index + 1}. ${escapeHtml(item.name)} / Size ${escapeHtml(item.size)} / MAD${escapeHtml(item.price)}
        </p>
      `
    )
    .join("");

  checkoutOrderPreview.innerHTML = `
    ${itemsHtml}
    <p class="checkout-preview-total">Subtotal: MAD${calculateSubtotal()}</p>
  `;
}

function openCheckoutModal() {
  if (bag.length === 0) {
    alert("Your bag is empty.");
    return;
  }

  closeBag();
  resetCheckoutStatus();
  renderCheckoutPreview();
  checkoutModal.classList.add("open");
  checkoutModalBackdrop.classList.add("active");
  checkoutModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("open");
  checkoutModalBackdrop.classList.remove("active");
  checkoutModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* -------------------------
   SIZE SELECTION
------------------------- */
function setupSizeSelectors() {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    const sizeButtons = card.querySelectorAll(".size-btn:not([disabled])");

    sizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        sizeButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  });
}

/* -------------------------
   ADD TO BAG
------------------------- */
function setupAddToBagButtons() {
  const addButtons = document.querySelectorAll(".add-btn");

  addButtons.forEach((button) => {
    if (button.disabled) return;

    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const activeSize = card.querySelector(".size-btn.active");

      if (!activeSize) {
        button.textContent = "Select Size First";
        button.style.background = "rgba(255, 114, 114, 0.12)";
        button.style.borderColor = "rgba(255, 114, 114, 0.45)";
        button.style.color = "#ff7272";

        setTimeout(() => {
          button.textContent = "Add to Bag";
          button.style.background = "";
          button.style.borderColor = "";
          button.style.color = "";
        }, 1200);

        return;
      }

      const item = {
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image,
        stock: button.dataset.stock,
        size: activeSize.dataset.size,
      };

      bag.push(item);
      saveBag();
      renderBag();
      openBag();

      button.textContent = "Added";
      button.style.background = "rgba(124, 255, 173, 0.14)";
      button.style.borderColor = "rgba(124, 255, 173, 0.45)";
      button.style.color = "#7cffad";

      setTimeout(() => {
        button.textContent = "Add to Bag";
        button.style.background = "";
        button.style.borderColor = "";
        button.style.color = "";
      }, 1000);
    });
  });
}

/* -------------------------
   MOBILE MENU
------------------------- */
function setupMobileMenu() {
  navMenuBtn.addEventListener("click", () => {
    navLinksWrap.classList.toggle("open");
  });

  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinksWrap.classList.remove("open");
    });
  });
}

/* -------------------------
   REVEAL ON SCROLL
------------------------- */
function setupReveal() {
  const revealElements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.12,
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

/* -------------------------
   CURSOR GLOW
------------------------- */
function setupCursorGlow() {
  if (!cursorGlow) return;

  window.addEventListener("mousemove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

/* -------------------------
   CHECKOUT SUBMISSION
------------------------- */
function setupCheckout() {
  checkoutBtn.addEventListener("click", openCheckoutModal);
  closeCheckoutModalBtn.addEventListener("click", closeCheckoutModal);
  checkoutModalBackdrop.addEventListener("click", closeCheckoutModal);

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetCheckoutStatus();

    if (bag.length === 0) {
      checkoutError.textContent = "Your bag is empty.";
      checkoutError.style.display = "block";
      return;
    }

    checkoutSubmitBtn.disabled = true;
    checkoutSubmitBtn.textContent = "Sending...";

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const instagramHandle = document.getElementById("instagramHandle").value.trim();
    const country = document.getElementById("country").value.trim();
    const city = document.getElementById("city").value.trim();
    const address = document.getElementById("address").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();
    const notes = document.getElementById("notes").value.trim();

    const formData = new FormData();
    formData.append("name", fullName);
    formData.append("email", email);
    formData.append("_subject", `SVVVD Order Request - ${fullName}`);
    formData.append(
      "message",
      `
SVVVD ORDER REQUEST

CUSTOMER INFORMATION
Full name: ${fullName}
Email: ${email}
Phone number: ${phone}
Instagram handle: ${instagramHandle || "N/A"}

DELIVERY INFORMATION
Country: ${country}
City: ${city}
Address: ${address}
Postal code: ${postalCode || "N/A"}

ORDER
${getOrderItemsText()}

Subtotal: MAD${calculateSubtotal()}

EXTRA NOTES
${notes || "N/A"}
      `.trim()
    );

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        checkoutSuccess.style.display = "block";
        checkoutForm.reset();
        bag = [];
        saveBag();
        renderBag();
        renderCheckoutPreview();

        setTimeout(() => {
          closeCheckoutModal();
        }, 1400);
      } else {
        checkoutError.style.display = "block";
      }
    } catch (error) {
      checkoutError.style.display = "block";
    } finally {
      checkoutSubmitBtn.disabled = false;
      checkoutSubmitBtn.textContent = "Send Order";
    }
  });
}

/* -------------------------
   EVENTS
------------------------- */
openBagBtn.addEventListener("click", openBag);
closeBagBtn.addEventListener("click", closeBag);
drawerBackdrop.addEventListener("click", closeBag);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeBag();
    closeCheckoutModal();
  }
});

/* -------------------------
   INIT
------------------------- */
setupSizeSelectors();
setupAddToBagButtons();
setupMobileMenu();
setupReveal();
setupCursorGlow();
setupCheckout();
renderBag();
renderCheckoutPreview();
