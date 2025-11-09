const NAV_ITEMS = [
  { id: "about", label: "About", path: "pages/about.html" },
  { id: "networkai", label: "Network AI", path: "pages/networkai.html" },
  { id: "vision", label: "Vision", path: "pages/vision.html" },
  { id: "projects", label: "Projects", path: "pages/projects.html" },
  { id: "docs", label: "Docs", path: "pages/docs.html" },
  { id: "blog", label: "Blog", path: "pages/blog.html" },
  { id: "lab", label: "Lab", path: "pages/lab.html" },
  { id: "store", label: "Store", path: "pages/store.html" },
  { id: "dashboard", label: "Dashboard", path: "pages/dashboard.html" },
  { id: "contact", label: "Contact", path: "pages/contact.html" }
];

const FOOTER_LINKS = [
  { id: "docs", label: "Docs", path: "pages/docs.html" },
  { id: "dashboard", label: "Dashboard", path: "pages/dashboard.html" },
  { id: "contact", label: "Contact", path: "pages/contact.html" }
];

const PRIME_GRID = [2, 3, 5, 7, 11];

function resolveHref(basePath, targetPath) {
  if (/^https?:\/\//i.test(targetPath)) {
    return targetPath;
  }
  if (!basePath || basePath === "./") {
    return targetPath;
  }
  return `${basePath}${targetPath}`;
}

export function mountScaffold({ headerSelector, footerSelector, activePage, basePath }) {
  const navLinks = [];
  const header = document.querySelector(headerSelector);

  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to main content</a>
      <nav class="site-nav" aria-label="Primary navigation">
        <a class="logo" href="${resolveHref(basePath, "index.html")}" aria-label="Helix Organic Web home">
          Helix Organic Web
        </a>
        <ul class="nav-list" role="list">
          ${NAV_ITEMS.map((item) => {
            const href = resolveHref(basePath, item.path);
            const currentAttr = item.id === activePage ? ' aria-current="page"' : "";
            return `<li><a class="nav-link" data-nav="${item.id}" href="${href}"${currentAttr}>${item.label}</a></li>`;
          }).join("")}
        </ul>
      </nav>
    `;
    header.querySelectorAll(".nav-link").forEach((link) => navLinks.push(link));
  }

  const footerLinks = [];
  const footer = document.querySelector(footerSelector);

  if (footer) {
    footer.className = "site-footer";
    const year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="footer__content">
        <p class="footer__copy">
          © ${year} Helix Organic Web · Prime lattice
          ${PRIME_GRID.map((prime) => `<span data-prime="${prime}">${prime}</span>`).join(" · ")}
        </p>
        <nav class="footer__nav" aria-label="Secondary navigation">
          <ul class="footer__links" role="list">
            ${FOOTER_LINKS.map((item) => {
              const href = resolveHref(basePath, item.path);
              return `<li><a class="footer__link" href="${href}">${item.label}</a></li>`;
            }).join("")}
          </ul>
        </nav>
      </div>
    `;
    footer.querySelectorAll(".footer__link").forEach((link) => footerLinks.push(link));
  }

  return { navLinks, footerLinks };
}
