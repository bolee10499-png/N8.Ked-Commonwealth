import { mountScaffold } from "./components.js";

const DEFAULT_BRIDGE_URL = "http://localhost:4000";
const bridgeUrl = document.body.dataset.bridgeUrl || DEFAULT_BRIDGE_URL;
const basePath = document.body.dataset.base || "./";
const activePage = document.body.dataset.page || "home";

async function sendPing(message) {
  try {
    const response = await fetch(`${bridgeUrl}/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    if (!response.ok) {
      throw new Error(`Bridge ping ${response.status}`);
    }
    return response.json().catch(() => ({}));
  } catch (error) {
    console.warn("Unable to dispatch ping", error);
    throw error;
  }
}

async function fetchStatus() {
  try {
    const response = await fetch(`${bridgeUrl}/status`);
    if (!response.ok) {
      throw new Error(`Bridge status ${response.status}`);
    }
    const payload = await response.json();
    console.info("Bridge status", payload);
  } catch (error) {
    console.warn("Unable to reach bridge", error);
  }
}

async function loadConstants() {
  const constantsPath = basePath === "./" ? "config/constants.json" : `${basePath}config/constants.json`;
  try {
    const response = await fetch(constantsPath);
    if (!response.ok) {
      throw new Error("Constants file missing");
    }
    const constants = await response.json();
    console.info("Helix constants", constants);
  } catch (error) {
    console.warn("Failed to load constants", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const { navLinks } = mountScaffold({
    headerSelector: "#site-header",
    footerSelector: "#site-footer",
    activePage,
    basePath,
  });

  navLinks.forEach((link) => {
    link.addEventListener("focus", () => link.classList.add("focused"));
    link.addEventListener("blur", () => link.classList.remove("focused"));
  });

  const cartButton = document.getElementById("cartButton");

  if (activePage === "store" && cartButton) {
    try {
      const { postWebhook } = await import("./webhook.js");
      cartButton.addEventListener("click", async () => {
        cartButton.disabled = true;
        try {
          await sendPing("Cart button pressed on local UI");
          await postWebhook(`${bridgeUrl}/relay`, {
            data: { action: "cart-click", timestamp: Date.now() },
          });
        } catch (error) {
          console.warn("Store webhook failed", error);
        } finally {
          cartButton.disabled = false;
        }
      });
    } catch (error) {
      console.warn("Store module load failed", error);
    }
  } else if (cartButton) {
    cartButton.addEventListener("click", () => {
      sendPing("Cart button pressed on local UI").catch(() => {});
    });
  }

  if (activePage === "dashboard") {
    try {
      const [{ registerTransitions }, { initThreeScene }] = await Promise.all([
        import("./gsap-transitions.js"),
        import("./three-scene.js"),
      ]);
      registerTransitions?.();
      const dashboardCanvas = document.getElementById("dashboard-scene");
      initThreeScene?.(dashboardCanvas);
    } catch (error) {
      console.warn("Dashboard modules failed", error);
    }
  }

  fetchStatus();
  loadConstants();
});

export { sendPing };
