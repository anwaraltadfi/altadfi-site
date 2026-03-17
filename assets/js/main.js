// ALTADFI — main.js (Premium + Robust)

const btn = document.querySelector(".menu-btn");
const nav = document.querySelector(".site-nav");
const year = document.getElementById("year");

// Footer year
if (year) year.textContent = new Date().getFullYear();

// Mobile menu toggle
if (btn && nav) {
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  // Close menu when clicking a link (mobile)
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 820) return;
    const inside = nav.contains(e.target) || btn.contains(e.target);
    if (!inside) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  // Fix: if user resizes from mobile to desktop, ensure menu isn't stuck "open"
  window.addEventListener("resize", () => {
    if (window.innerWidth > 840) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

/* =========================================
   Premium UX upgrades
========================================= */

// 1) Active link automatically
(() => {
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-nav a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (!href || href.startsWith("#")) return;
    const file = href.split("#")[0];
    if (file === current) a.classList.add("active");
    else a.classList.remove("active");
  });
})();

// 2) Smooth scrolling for in-page anchors (only if target exists on this page)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return; // allow default if not found
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", id);
  });
});

// 3) Back to top button (auto show/hide)
(() => {
  const el = document.querySelector(".to-top");
  if (!el) return;

  const toggle = () => {
    if (window.scrollY > 600) el.classList.add("show");
    else el.classList.remove("show");
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  el.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// 4) WhatsApp prefilled message (supports multiple buttons + better template handling)
(() => {
  const els = document.querySelectorAll("[data-wa-template]");
  if (!els.length) return;

  els.forEach((el) => {
    const templateRaw = (el.getAttribute("data-wa-template") || "").trim();

    // Normalize line breaks (some editors inject \r\n)
    const template = templateRaw.replace(/\r\n/g, "\n");

    // Optional: allow per-button number override via data-wa-number="9053..."
    const number = (el.getAttribute("data-wa-number") || "905349139549").trim();

    const base = `https://wa.me/${number}`;
    const encoded = encodeURIComponent(template);

    // If already has href, keep it unless it's empty or '#'
    const currentHref = (el.getAttribute("href") || "").trim();
    if (!currentHref || currentHref === "#") {
      el.setAttribute("href", `${base}?text=${encoded}`);
    } else {
      // If user manually set href to base wa.me link, enrich it with text
      if (currentHref.includes("wa.me") && !currentHref.includes("text=")) {
        el.setAttribute("href", `${base}?text=${encoded}`);
      }
    }

    // UX: ensure it opens safely in a new tab when it's a link
    if (el.tagName.toLowerCase() === "a") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }
  });
})();

// =========================================
// Map (Leaflet) — Countries pins (EN + AR)
// =========================================
window.addEventListener("load", () => {
  if (typeof L === "undefined") return;

  const maps = [
    {
      id: "map",
      countries: [
        { name: "Turkey (Türkiye)", coords: [39.9334, 32.8597] },
        { name: "Germany", coords: [52.52, 13.405] },
        { name: "Algeria", coords: [36.7538, 3.0588] },
        { name: "Libya", coords: [32.8872, 13.1913] },
        { name: "China", coords: [39.9042, 116.4074] },
        { name: "Saudi Arabia", coords: [24.7136, 46.6753] },
        { name: "United Arab Emirates", coords: [24.4539, 54.3773] },
        { name: "USA", coords: [38.9072, -77.0369] },
        { name: "Syria", coords: [33.5138, 36.2765] },
      ],
    },
    {
      id: "map-ar",
      countries: [
        { name: "تركيا", coords: [39.9334, 32.8597] },
        { name: "ألمانيا", coords: [52.52, 13.405] },
        { name: "الجزائر", coords: [36.7538, 3.0588] },
        { name: "ليبيا", coords: [32.8872, 13.1913] },
        { name: "الصين", coords: [39.9042, 116.4074] },
        { name: "السعودية", coords: [24.7136, 46.6753] },
        { name: "الإمارات", coords: [24.4539, 54.3773] },
        { name: "الولايات المتحدة", coords: [38.9072, -77.0369] },
        { name: "سوريا", coords: [33.5138, 36.2765] },
      ],
    },
  ];

  maps.forEach((m) => {
    const mapEl = document.getElementById(m.id);
    if (!mapEl) return;

    const map = L.map(m.id, {
      scrollWheelZoom: false,
      zoomControl: true,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 6,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markers = m.countries.map((c) =>
      L.circleMarker(c.coords, {
        radius: 8,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindTooltip(c.name, { direction: "top", offset: [0, -8] })
    );

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.25));

    // Fix sizing after layout paint
    setTimeout(() => map.invalidateSize(), 150);

    // Better scroll UX: enable wheel only when pointer is over the map
    mapEl.addEventListener("mouseenter", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
    mapEl.addEventListener("focusin", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("focusout", () => map.scrollWheelZoom.disable());
  });
});