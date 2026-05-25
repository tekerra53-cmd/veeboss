import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { hasSupabaseConfig, supabase } from "./supabase";


const easingCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ADMIN_PASSCODE = "veeboss-admin";

// Where the backend API runs (same machine for dev, adjust for production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const ADMIN_SESSION_KEY = "veeboss-admin-session";

type Collection = {
  id: string;
  name: string;
  season: string;
  image: string;
  note: string;
  medium: string;
};

type ProcessStep = {
  id: string;
  step: string;
  title: string;
  detail: string;
};

type SiteContent = {
  heroSubtitle: string;
  heroDescription: string;
  services: {
    title: string;
    description: string;
  }[];
  aboutNarrative: string;
  contactIntro: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactLocation: string;
  socialInstagram: string;
  socialTikTok: string;
  socialPinterest: string;
  collections: Collection[];
  process: ProcessStep[];
};

const initialCollections: Collection[] = [
  {
    id: "steel-petals",
    name: "Steel Petals",
    season: "SS26",
    image:
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1600&q=80",
    note: "Crisp tailoring collides with fluid satin drapes in monochrome bloom.",
    medium: "Architectural suiting and silk",
  },
  {
    id: "nocturne-code",
    name: "Nocturne Code",
    season: "FW25",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    note: "Structured leather, reflective surfaces, and precision cuts for urban nights.",
    medium: "Leather, chrome textiles, and wool",
  },
  {
    id: "rebel-atelier",
    name: "Rebel Atelier",
    season: "Resort 25",
    image:
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1600&q=80",
    note: "Hand-finished street silhouettes elevated with couture-grade detailing.",
    medium: "Street tailoring and hand embellishment",
  },
  {
    id: "velvet-voltage",
    name: "Velvet Voltage",
    season: "FW24",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
    note: "Soft matte velvets and metallic accents shaped into fearless runway statements.",
    medium: "Velvet and metallic threadwork",
  },
  {
    id: "concrete-bloom",
    name: "Concrete Bloom",
    season: "Capsule 24",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=80",
    note: "Soft florals remixed through tactical pockets and split-volume silhouettes.",
    medium: "Technical cotton and jacquard",
  },
  {
    id: "chrome-ritual",
    name: "Chrome Ritual",
    season: "FW23",
    image:
      "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1800&q=80",
    note: "Monastic lines, polished trims, and a stark black-silver palette.",
    medium: "Wool crepe and mirror hardware",
  },
  {
    id: "afterglow-district",
    name: "Afterglow District",
    season: "SS23",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80",
    note: "Luminous tones and draped panels built for movement under city lights.",
    medium: "Satin blends and mesh layering",
  },
  {
    id: "monolith-youth",
    name: "Monolith Youth",
    season: "FW22",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1800&q=80",
    note: "Oversized outerwear balanced by razor-cut underpinnings.",
    medium: "Felted wool and bonded jersey",
  },
  {
    id: "echo-frame",
    name: "Echo Frame",
    season: "SS22",
    image:
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1800&q=80",
    note: "Minimal shapes interrupted by asymmetrical hems and contrast stitching.",
    medium: "Poplin and structured knit",
  },
  {
    id: "midnight-utility",
    name: "Midnight Utility",
    season: "FW21",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80",
    note: "Cargo architecture refined with couture finishing and night-ready polish.",
    medium: "Ripstop, wool, and coated denim",
  },
  {
    id: "static-romance",
    name: "Static Romance",
    season: "SS21",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
    note: "Romantic volume sharpened with monochrome blocking and clean necklines.",
    medium: "Organza and matte satin",
  },
  {
    id: "future-nomad",
    name: "Future Nomad",
    season: "FW20",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    note: "Travel-built layers engineered for movement, weather, and visual impact.",
    medium: "Technical nylon and brushed wool",
  },
  {
    id: "axis-line",
    name: "Axis Line",
    season: "SS20",
    image:
      "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1600&q=80",
    note: "Linear paneling and elongated silhouettes define this precision-forward release.",
    medium: "Crepe suiting and mesh",
  },
  {
    id: "new-ritual",
    name: "New Ritual",
    season: "FW19",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    note: "Dark tailoring with ceremonial details inspired by city nightlife.",
    medium: "Wool twill and leather trims",
  },
  {
    id: "edge-bloom",
    name: "Edge Bloom",
    season: "SS19",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
    note: "Soft color accents meet hard-edged structure in directional spring looks.",
    medium: "Silk blends and bonded cotton",
  },
  {
    id: "origin-pulse",
    name: "Origin Pulse",
    season: "FW18",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
    note: "The debut language: bold shoulders, narrow waists, and movement-led cuts.",
    medium: "Tailored wool and velvet",
  },
];

const initialContent: SiteContent = {
  heroSubtitle: "welcome to",
  heroDescription:
    "Luxury runway language translated through street instinct. Every silhouette is engineered to move with confidence, precision, and unapologetic identity.",
  services: [
    {
      title: "Bespoke & Custom",
      description: "One-of-a-kind pieces crafted to your exact measurements and vision.",
    },
    {
      title: "Asoebi & Ankara",
      description: "Traditional fabrics reimagined with contemporary tailoring and modern silhouettes.",
    },
    {
      title: "Casual Wears",
      description: "Effortless two-piece sets and everyday pieces with couture-level finishing.",
    },
    {
      title: "Ready to Wear",
      description: "Curated collections designed for immediate impact and everyday luxury.",
    },
  ],
  aboutNarrative:
    "Veeboss Stitches designs from the inside out, beginning with construction, movement, and emotional intent. In the atelier, hand-finished seams, engineered proportions, and experimental textiles converge to build garments that command both runway and street. Each collection is a study in duality: sharp but fluid, rebellious yet refined, rooted in craftsmanship and driven by future-facing vision.",
  contactIntro: "For bespoke commissions, editorial pulls, and creative collaborations.",
  contactEmail: "vbosssiere@gmail.com",
  contactWhatsapp: "+234 7013169283",
  contactLocation: "Basic estate lokogoma, Abuja, Nigeria",
  socialInstagram: "https://www.instagram.com/veeboss_stitches/",
  socialTikTok: "https://www.tiktok.com/@veebosssiere83",
  socialPinterest: "https://pinterest.com/veebossstitches",
  collections: initialCollections,
  process: [
    {
      id: "process-01",
      step: "01",
      title: "Research and Mood",
      detail: "References are translated into palettes, silhouette maps, and narrative direction.",
    },
    {
      id: "process-02",
      step: "02",
      title: "Pattern and Drape",
      detail: "Every cut is developed on-body for precision movement and controlled volume.",
    },
    {
      id: "process-03",
      step: "03",
      title: "Finish and Styling",
      detail: "Hand-finished detailing and styling calibration shape the final statement look.",
    },
  ],
};

const fadeUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: easingCurve },
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeContent(parsed: Partial<SiteContent> | null | undefined): SiteContent {
  const p = (parsed ?? {}) as SiteContent;
  const email = !p.contactEmail || p.contactEmail === "atelier@veebossstitches.com" ? initialContent.contactEmail : p.contactEmail;
  const whatsapp = !p.contactWhatsapp || p.contactWhatsapp === "+234 801 234 5678" ? initialContent.contactWhatsapp : p.contactWhatsapp;
  const instagram = !p.socialInstagram || p.socialInstagram === "https://instagram.com/veebossstitches" ? initialContent.socialInstagram : p.socialInstagram;
  const tiktok = !p.socialTikTok || p.socialTikTok === "https://tiktok.com/@veebossstitches" ? initialContent.socialTikTok : p.socialTikTok;

  return {
    ...initialContent,
    ...p,
    contactEmail: email,
    contactWhatsapp: whatsapp,
    contactLocation: p.contactLocation || initialContent.contactLocation,
    socialInstagram: instagram,
    socialTikTok: tiktok,
    socialPinterest: p.socialPinterest || initialContent.socialPinterest,
    collections: p.collections?.length ? p.collections : initialContent.collections,
    process: p.process?.length ? p.process : initialContent.process,
    services: p.services?.length ? p.services : initialContent.services,
  };
}

async function loadContent(): Promise<SiteContent> {
  try {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "veeboss-site")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return sanitizeContent((data as { content: SiteContent } | null)?.content ?? initialContent);
    }

    const res = await fetch(`${API_BASE_URL}/api/content`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to load content");
    const json = await res.json();
    // Handle both old format (direct content) and new format (with version)
    const data = json?.content ?? json;
    return sanitizeContent(data);
  } catch {
    return initialContent;
  }
}

async function checkContentVersion(): Promise<{ version: number; updatedAt: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/content/version`, { method: "GET" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}


function getWhatsappHref(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const digits = value.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "https://wa.me/";
}

function getMailtoHref(email: string) {
  return `mailto:${email || initialContent.contactEmail}`;
}

function getInstagramHandle(url: string) {
  const value = url || initialContent.socialInstagram;
  const clean = value.replace(/\/$/, "");
  const username = clean.split("/").pop() || "veeboss_stitches";
  return username.startsWith("@") ? username : `@${username}`;
}

function getTikTokHandle(url: string) {
  const value = url || initialContent.socialTikTok;
  const clean = value.replace(/\/$/, "");
  const username = clean.split("/").pop() || "@veebosssiere83";
  return username.startsWith("@") ? username : `@${username}`;
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.58 0 .3 5.26.3 11.74c0 2.07.54 4.1 1.56 5.9L0 24l6.52-1.8a11.72 11.72 0 0 0 5.53 1.41h.01c6.47 0 11.75-5.27 11.75-11.75 0-3.14-1.22-6.08-3.29-8.38Zm-8.47 18.1h-.01a9.78 9.78 0 0 1-4.98-1.36l-.36-.22-3.86 1.06 1.03-3.76-.23-.39a9.77 9.77 0 0 1-1.5-5.17c0-5.42 4.4-9.83 9.84-9.83 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.95c0 5.43-4.41 9.84-9.77 9.84Zm5.4-7.36c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.66.16-.2.3-.77.97-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.46-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.47.13-.62.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.57-.49-.49-.66-.5h-.56c-.2 0-.53.08-.8.38-.27.3-1.03 1.01-1.03 2.46s1.06 2.85 1.2 3.05c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.7.62.71.22 1.36.2 1.87.12.57-.08 1.77-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M14 4v8.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 5c1.2 2 2.7 3 5 3" />
    </svg>
  );
}

function GlassNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();

  const sectionIds = ["home", "services", "collections", "about", "process", "contact"];

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname === "/collections") {
      setActiveNav("archive");
      return;
    }
    if (location.pathname === "/admin") {
      setActiveNav("admin");
      return;
    }

    if (location.pathname === "/" && location.hash) {
      setActiveNav(location.hash.replace("#", ""));
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    let ticking = false;
    const trackScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const triggerPoint = window.innerHeight * 0.35;
        let current = "home";

        for (const id of sectionIds) {
          const element = document.getElementById(id);
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
            current = id;
            break;
          }
        }

        setActiveNav(current);
        ticking = false;
      });
    };

    trackScroll();
    window.addEventListener("scroll", trackScroll, { passive: true });
    return () => window.removeEventListener("scroll", trackScroll);
  }, [location.pathname]);

  const jumpToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${id}`);
      setActiveNav(id);
    }
  };

  const navItems: Array<
    | { label: string; type: "section"; id: string }
    | { label: string; type: "route"; to: string; id: string }
  > = [
    { label: "Home", type: "section", id: "home" },
    { label: "Services", type: "section", id: "services" },
    { label: "About", type: "section", id: "about" },
    { label: "Process", type: "section", id: "process" },
    { label: "Contact", type: "section", id: "contact" },
    { label: "Archive", type: "route", to: "/collections", id: "archive" },
    { label: "login", type: "route", to: "/admin", id: "admin" },
  ];

  const navItemClass = (id: string) =>
    `transition ${
      activeNav === id
        ? "text-white border-b border-white/70"
        : "text-white/78 hover:text-white border-b border-transparent"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 md:px-8 md:pt-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-[0_0_42px_rgba(255,255,255,0.22)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/8 sm:px-5 md:rounded-full md:px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-300/15 via-white/5 to-cyan-300/15" />

          <div className="relative flex items-center justify-between gap-4">
            <Link
              to="/"
              className="font-display text-xs tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.24em]"
            >
              VEEBOSS STITCHES
            </Link>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white transition hover:border-white/60 md:hidden"
            >
              Menu
            </button>

            <nav className="hidden items-center gap-5 text-xs uppercase tracking-[0.2em] md:flex">
              {navItems.map((item) =>
                item.type === "section" ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToSection(item.id)}
                    className={navItemClass(item.id)}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link key={item.id} to={item.to} className={navItemClass(item.id)}>
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {menuOpen && (
            <nav className="relative mt-4 flex flex-col gap-3 border-t border-white/20 pt-4 text-xs uppercase tracking-[0.2em] md:hidden">
              {navItems.map((item) =>
                item.type === "section" ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToSection(item.id)}
                    className={`text-left ${navItemClass(item.id)}`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link key={item.id} to={item.to} className={navItemClass(item.id)}>
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

function HomePage({ content }: { content: SiteContent }) {
  useEffect(() => {
    const anchors = ["#home", "#services", "#collections", "#about", "#process", "#contact"];
    if (anchors.includes(window.location.hash)) {
      const target = document.querySelector(window.location.hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 30);
    }
  }, []);

  return (
    <main>
      <section id="home" className="relative min-h-screen overflow-hidden">
        <motion.img
          initial={{ scale: 1.12, opacity: 0.3 }}
          animate={{ scale: 1, opacity: 0.72 }}
          transition={{ duration: 2.4, ease: easingCurve }}
          src="/images/home-hero.jpg"
          alt="Fashion designer working on a mannequin in the studio"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-14 pt-36 md:px-10 md:pb-20 md:pt-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-4 text-xs uppercase tracking-[0.34em] text-zinc-200"
          >
            {content.heroSubtitle}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            className="font-display max-w-4xl text-4xl leading-[0.9] tracking-[0.06em] text-white sm:text-6xl md:text-8xl"
          >
            VEEBOSS
            <br />
            STITCHES
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.85 }}
            className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-200/95 md:text-base"
          >
            {content.heroDescription}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/collections"
              className="border border-white bg-white px-6 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
            >
              Open Collection Archive
            </Link>
            <a
              href="#contact"
              className="border border-white/60 px-6 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:border-white"
            >
              Book Consultation
            </a>
          </motion.div>
        </div>
      </section>

      <section id="services" className="bg-zinc-950 px-6 py-20 md:px-10 md:py-28">
        <motion.div {...fadeUp} className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">What We Create</p>
          <h2 className="font-display mt-4 text-4xl uppercase tracking-[0.05em] text-white md:text-6xl">
            Women&apos;s Apparel
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
            Every kind of ladies wear, engineered with precision and delivered with couture-grade
            finishing.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          {content.services.map((service, index) => (
            <motion.div
              key={service.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              className="group relative overflow-hidden bg-black p-8 transition hover:bg-zinc-950"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-cyan-500/5 opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <h3 className="font-display text-2xl uppercase tracking-[0.06em] text-white">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="collections" className="relative bg-zinc-950 px-6 py-20 md:px-10 md:py-28">
        <motion.div {...fadeUp} className="mx-auto mb-10 max-w-7xl md:mb-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-zinc-400">Selected Work</p>
              <h2 className="font-display mt-4 max-w-3xl text-4xl uppercase tracking-[0.05em] text-white md:text-6xl">
                Curated Collections
              </h2>
            </div>

            <Link
              to="/collections"
              className="hidden md:inline-flex items-center whitespace-nowrap rounded-full border border-white/30 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,255,255,0.06)] transition hover:bg-white/10"
            >
              View more collections
            </Link>
          </div>
        </motion.div>

        {/* Mobile sticky quick archive button (sticks until user scrolls past this section) */}
        <div className="sticky top-[86px] z-20 -mx-6 px-6 md:hidden">
          <div className="mx-auto max-w-7xl pb-3">
            <Link
              to="/collections"
              className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl border border-white/25 bg-black/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[0_10px_50px_rgba(0,0,0,0.6)] backdrop-blur supports-[backdrop-filter]:bg-black/55 transition hover:border-white/50"
            >
              view more collections
            </Link>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-px bg-zinc-800 md:grid-cols-2">
          {content.collections.slice(0, 4).map((collection, index) => (
            <motion.article
              key={collection.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              className="group relative min-h-[60vh] overflow-hidden bg-black"
            >
              <img
                src={collection.image}
                alt={`${collection.name} fashion look`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-300">{collection.season}</p>
                <h3 className="font-display mt-2 text-3xl uppercase tracking-[0.08em] text-white md:text-4xl">
                  {collection.name}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-200 opacity-100 transition duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  {collection.note}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="about" className="relative min-h-[78vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=2000&q=80"
          alt="Designer studio with fabrics and pattern work"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          {...fadeUp}
          className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-6 py-16 md:px-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-300">About the Designer</p>
            <h2 className="font-display mt-5 text-4xl uppercase tracking-[0.05em] text-white md:text-6xl">
              Craft as Discipline.
              <br />
              Vision as Identity.
            </h2>
            <p className="mt-8 text-base leading-relaxed text-zinc-200 md:text-lg">{content.aboutNarrative}</p>
          </div>
        </motion.div>
      </section>

      <section id="process" className="relative overflow-hidden px-6 py-20 md:px-10 md:py-28">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2200&q=80"
          alt="Studio table with fabrics and design sketches"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/74 to-black/90" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-300">Studio Process</p>
            <h2 className="font-display mt-4 text-4xl uppercase tracking-[0.05em] text-white md:text-6xl">
              Precision Pipeline,
              <br />
              Signature Finish
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-200 md:text-base">
              From reference board to final stitch, each stage is intentional. The result is a
              silhouette that feels bold on camera and effortless in motion.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              {...fadeUp}
              className="relative overflow-hidden border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(217,70,239,0.18),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.16),transparent_40%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-300">Atelier Standard</p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-200">
                  Every drop follows the same discipline: narrative-first concepting, engineered
                  pattern development, and finish-level quality control before release.
                </p>
                <div className="mt-8 space-y-4 text-xs uppercase tracking-[0.2em] text-zinc-300">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <span>Fit Sessions</span>
                    <span>Multiple Rounds</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <span>Construction</span>
                    <span>Hand-Finished</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span>Release QA</span>
                    <span>Runway Ready</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {content.process.map((item, index) => (
                <motion.article
                  key={item.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden border border-white/20 bg-black/45 p-5 transition md:p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 opacity-0 transition duration-500 group-hover:opacity-100" />
                  <div className="relative grid gap-4 md:grid-cols-[78px_1fr] md:items-start">
                    <div className="font-display text-3xl tracking-[0.08em] text-zinc-100">{item.step}</div>
                    <div>
                      <h3 className="font-display text-2xl uppercase tracking-[0.05em] text-white md:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-200 md:text-base">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative flex min-h-screen items-center overflow-hidden bg-black px-6 py-20 text-zinc-100 md:px-10"
      >
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=80"
          alt="Fashion atelier contact backdrop"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
        <motion.div {...fadeUp} className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 shadow-[0_0_70px_rgba(168,85,247,0.2)] backdrop-blur-2xl md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(217,70,239,0.18),transparent_36%),radial-gradient(circle_at_95%_20%,rgba(34,211,238,0.16),transparent_36%)]" />

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-300">Contact</p>
                <h2 className="font-display mt-4 text-4xl uppercase tracking-[0.05em] text-white md:text-6xl">
                  Let&apos;s Build the Next Statement
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-200 md:text-base">
                  {content.contactIntro}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={getMailtoHref(content.contactEmail)}
                    className="inline-flex items-center justify-center gap-2 border border-white bg-white px-6 py-3 text-center text-xs uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white"
                  >
                    <MailIcon />
                    Email Direct
                  </a>
                  <a
                    href={getWhatsappHref(content.contactWhatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-white/70 px-6 py-3 text-center text-xs uppercase tracking-[0.2em] text-white transition hover:border-white"
                  >
                    <WhatsAppIcon />
                    WhatsApp Chat
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3 border border-white/15 bg-black/35 p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Direct Contact</p>
                  <a
                    href={getMailtoHref(content.contactEmail)}
                    className="flex items-center gap-2 text-sm text-zinc-100 hover:text-white"
                  >
                    <MailIcon className="h-4 w-4" />
                    {content.contactEmail || initialContent.contactEmail}
                  </a>
                  <a
                    href={getWhatsappHref(content.contactWhatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-100 hover:text-white"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {content.contactWhatsapp || initialContent.contactWhatsapp}
                  </a>
                  <p className="text-sm text-zinc-200">{content.contactLocation || initialContent.contactLocation}</p>
                </div>

                <div className="space-y-3 border border-white/15 bg-black/35 p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Socials</p>
                  <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-zinc-300">
                    <a
                      href={content.socialInstagram || initialContent.socialInstagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:text-white"
                    >
                      <InstagramIcon />
                      {getInstagramHandle(content.socialInstagram)}
                    </a>
                    <a
                      href={content.socialTikTok || initialContent.socialTikTok}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:text-white"
                    >
                      <TikTokIcon />
                      {getTikTokHandle(content.socialTikTok)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function CollectionsPage({ content }: { content: SiteContent }) {
  return (
    <main className="bg-black text-zinc-100">
      <section className="relative min-h-[72vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2200&q=80"
          alt="Runway-inspired fashion editorial background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/85" />
        <motion.div
          {...fadeUp}
          className="relative mx-auto flex min-h-[72vh] max-w-7xl items-end px-6 pb-14 pt-40 md:px-10 md:pb-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-200">Collection Archive</p>
            <h1 className="font-display mt-4 text-4xl uppercase leading-[0.92] tracking-[0.05em] text-white sm:text-6xl md:text-7xl">
              Full Veeboss
              <br />
              Collection Index
            </h1>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          {content.collections.map((collection, index) => (
            <motion.article
              key={collection.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.03 }}
              className="group relative aspect-[3/4] overflow-hidden bg-black"
            >
              <img
                src={collection.image}
                alt={`${collection.name} lookbook look`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-300">{collection.season}</p>
                <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.06em] text-white md:text-3xl">
                  {collection.name}
                </h2>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-300">{collection.medium}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-200 opacity-100 transition duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  {collection.note}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminPage({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
}) {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ADMIN_SESSION_KEY) === "unlocked";
  });
  const [loginError, setLoginError] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [activePanel, setActivePanel] = useState<"overview" | "brand" | "process" | "collections">(
    "overview",
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState(content.collections[0]?.id ?? "");

  const selectedCollection = useMemo(
    () => content.collections.find((item) => item.id === selectedCollectionId),
    [content.collections, selectedCollectionId],
  );

  const filteredCollections = useMemo(() => {
    const query = collectionSearch.trim().toLowerCase();
    if (!query) return content.collections;
    return content.collections.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.season.toLowerCase().includes(query) ||
        item.medium.toLowerCase().includes(query),
    );
  }, [collectionSearch, content.collections]);

  useEffect(() => {
    if (!selectedCollection && content.collections[0]) {
      setSelectedCollectionId(content.collections[0].id);
    }
  }, [selectedCollection, content.collections]);

  const updateCollectionField = (field: keyof Collection, value: string) => {
    if (!selectedCollection) return;
    setContent((prev) => ({
      ...prev,
      collections: prev.collections.map((item) =>
        item.id === selectedCollection.id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const uploadCollectionImage = async (file: File | null) => {
    if (!file || !selectedCollection) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    updateCollectionField("image", dataUrl);
  };

  const moveCollection = (direction: "up" | "down") => {
    setContent((prev) => {
      const currentIndex = prev.collections.findIndex((item) => item.id === selectedCollectionId);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.collections.length) return prev;
      const reordered = [...prev.collections];
      const [item] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, item);
      return { ...prev, collections: reordered };
    });
  };

  const duplicateSelectedCollection = () => {
    if (!selectedCollection) return;
    const copy: Collection = {
      ...selectedCollection,
      id: createId(),
      name: `${selectedCollection.name} Copy`,
    };
    setContent((prev) => ({ ...prev, collections: [...prev.collections, copy] }));
    setSelectedCollectionId(copy.id);
  };

  const totalCollections = content.collections.length;
  const totalProcessSteps = content.process.length;
  const uniqueSeasons = new Set(content.collections.map((item) => item.season)).size;
  const firstCollectionImage = content.collections[0]?.image;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unlocked) {
      localStorage.setItem(ADMIN_SESSION_KEY, "unlocked");
      return;
    }
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }, [unlocked]);

  if (!unlocked) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-zinc-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(217,70,239,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.2),transparent_40%)]" />
        <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-white/20 bg-black/50 p-8 shadow-[0_0_50px_rgba(168,85,247,0.22)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Veeboss Control</p>
          <h1 className="font-display text-3xl uppercase tracking-[0.08em]">Admin Access</h1>
          <p className="text-sm text-zinc-300">Enter the passcode to manage collections and site content.</p>
          <input
            type="password"
            value={passcode}
            onChange={(event) => {
              setPasscode(event.target.value);
              setLoginError("");
            }}
            className="w-full rounded-xl border border-white/25 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
            placeholder="Passcode"
          />
          {loginError && <p className="text-xs uppercase tracking-[0.14em] text-red-300">{loginError}</p>}
          <button
            type="button"
            onClick={() => {
              if (passcode === ADMIN_PASSCODE) {
                setUnlocked(true);
                setPasscode("");
                return;
              }
              setLoginError("Invalid passcode");
            }}
            className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black"
          >
            Unlock Admin
          </button>
        </div>
        <SponsorSignature />
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-black px-4 pb-16 pt-32 text-zinc-100 sm:px-6 md:px-10">
      <img
        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=80"
        alt="Admin dashboard fashion mood background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/82" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(217,70,239,0.22),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl border border-white/15 bg-zinc-950/80 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Admin Dashboard</p>
              <h1 className="font-display mt-2 text-4xl uppercase tracking-[0.06em] md:text-6xl">
                Site Control
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-300">
                Live content panel for Veeboss Stitches. Changes are saved automatically in this
                browser.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUnlocked(false)}
              className="rounded-xl border border-white/35 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white"
            >
              Lock Admin
            </button>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Collections</p>
              <p className="mt-2 font-display text-3xl text-white">{totalCollections}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Seasons</p>
              <p className="mt-2 font-display text-3xl text-white">{uniqueSeasons}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Process Steps</p>
              <p className="mt-2 font-display text-3xl text-white">{totalProcessSteps}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-zinc-950/80 p-3 backdrop-blur-xl">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "overview", label: "Overview" },
              { key: "brand", label: "Brand Content" },
              { key: "process", label: "Process" },
              { key: "collections", label: "Collections" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePanel(item.key as typeof activePanel)}
                className={`rounded-xl px-4 py-3 text-xs uppercase tracking-[0.2em] transition ${
                  activePanel === item.key
                    ? "bg-white text-black"
                    : "border border-white/20 bg-transparent text-zinc-200 hover:border-white/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {activePanel === "overview" && (
          <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-white/15 bg-zinc-950/80 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Collection Preview</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/15">
                {firstCollectionImage && (
                  <img
                    src={firstCollectionImage}
                    alt="Collection preview"
                    className="h-72 w-full object-cover"
                  />
                )}
              </div>
              <p className="mt-4 text-sm text-zinc-300">
                Update the highlight by editing the first collection item in the Collections tab.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-zinc-950/80 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Quick Links</p>
              <div className="mt-5 space-y-3 text-sm">
                <Link to="/" className="block border border-white/20 px-4 py-3 hover:border-white/50">
                  Open Homepage
                </Link>
                <Link
                  to="/collections"
                  className="block border border-white/20 px-4 py-3 hover:border-white/50"
                >
                  Open Collections Page
                </Link>
                <button
                  type="button"
                  onClick={() => setActivePanel("collections")}
                  className="w-full border border-white/20 px-4 py-3 text-left hover:border-white/50"
                >
                  Edit Collections
                </button>
              </div>
            </div>
          </section>
        )}

        {activePanel === "brand" && (
          <section className="space-y-4 rounded-2xl border border-white/15 bg-zinc-950/80 p-6 backdrop-blur-xl">
            <h2 className="font-display text-2xl uppercase tracking-[0.06em]">Brand Content</h2>
            <input
              value={content.heroSubtitle}
              onChange={(event) => setContent((prev) => ({ ...prev, heroSubtitle: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="Hero subtitle"
            />
            <textarea
              rows={3}
              value={content.heroDescription}
              onChange={(event) => setContent((prev) => ({ ...prev, heroDescription: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="Hero description"
            />
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Services</p>
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      services: [
                        ...prev.services,
                        { title: "New Service", description: "Service description" },
                      ],
                    }))
                  }
                  className="rounded-lg border border-white/40 px-3 py-1 text-xs uppercase tracking-[0.18em]"
                >
                  Add Service
                </button>
              </div>
              {content.services.map((service, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          services: prev.services.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded-lg border border-red-400/60 px-3 py-1 text-xs uppercase tracking-[0.15em] text-red-200"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={service.title}
                    onChange={(event) =>
                      setContent((prev) => ({
                        ...prev,
                        services: prev.services.map((item, i) =>
                          i === index ? { ...item, title: event.target.value } : item,
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none"
                    placeholder="Service title"
                  />
                  <input
                    value={service.description}
                    onChange={(event) =>
                      setContent((prev) => ({
                        ...prev,
                        services: prev.services.map((item, i) =>
                          i === index ? { ...item, description: event.target.value } : item,
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none"
                    placeholder="Service description"
                  />
                </div>
              ))}
            </div>
            <textarea
              rows={5}
              value={content.aboutNarrative}
              onChange={(event) => setContent((prev) => ({ ...prev, aboutNarrative: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="About narrative"
            />
            <input
              value={content.contactEmail}
              onChange={(event) => setContent((prev) => ({ ...prev, contactEmail: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="Contact email"
            />
            <input
              value={content.contactWhatsapp}
              onChange={(event) => setContent((prev) => ({ ...prev, contactWhatsapp: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="WhatsApp number or URL"
            />
            <input
              value={content.contactLocation}
              onChange={(event) => setContent((prev) => ({ ...prev, contactLocation: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="Location"
            />
            <textarea
              rows={2}
              value={content.contactIntro}
              onChange={(event) => setContent((prev) => ({ ...prev, contactIntro: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
              placeholder="Contact intro"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={content.socialInstagram}
                onChange={(event) => setContent((prev) => ({ ...prev, socialInstagram: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
                placeholder="Instagram URL"
              />
              <input
                value={content.socialTikTok}
                onChange={(event) => setContent((prev) => ({ ...prev, socialTikTok: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none focus:border-white"
                placeholder="TikTok URL"
              />
            </div>
          </section>
        )}

        {activePanel === "process" && (
          <section className="space-y-4 rounded-2xl border border-white/15 bg-zinc-950/80 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl uppercase tracking-[0.06em]">Studio Process</h2>
              <button
                type="button"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    process: [
                      ...prev.process,
                      { id: createId(), step: `0${prev.process.length + 1}`, title: "New Step", detail: "" },
                    ],
                  }))
                }
                className="rounded-xl border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                Add Process Step
              </button>
            </div>

            {content.process.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-xl border border-white/15 bg-black/50 p-4 md:grid-cols-[80px_1fr_1fr_auto]"
              >
                <input
                  value={item.step}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      process: prev.process.map((row) =>
                        row.id === item.id ? { ...row, step: event.target.value } : row,
                      ),
                    }))
                  }
                  className="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none"
                />
                <input
                  value={item.title}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      process: prev.process.map((row) =>
                        row.id === item.id ? { ...row, title: event.target.value } : row,
                      ),
                    }))
                  }
                  className="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none"
                />
                <input
                  value={item.detail}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      process: prev.process.map((row) =>
                        row.id === item.id ? { ...row, detail: event.target.value } : row,
                      ),
                    }))
                  }
                  className="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      process: prev.process.filter((row) => row.id !== item.id),
                    }))
                  }
                  className="rounded-lg border border-red-400/60 px-4 py-2 text-xs uppercase tracking-[0.15em] text-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </section>
        )}

        {activePanel === "collections" && (
          <section className="space-y-5 rounded-2xl border border-white/15 bg-zinc-950/80 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="font-display text-2xl uppercase tracking-[0.06em]">Collections Manager</h2>
              <button
                type="button"
                onClick={() => {
                  const newCollection: Collection = {
                    id: createId(),
                    name: "New Collection",
                    season: "New Season",
                    image:
                      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
                    note: "Collection description",
                    medium: "Fabric and construction",
                  };
                  setContent((prev) => ({ ...prev, collections: [...prev.collections, newCollection] }));
                  setSelectedCollectionId(newCollection.id);
                }}
                className="rounded-xl border border-white bg-white px-5 py-3 text-xs uppercase tracking-[0.2em] text-black"
              >
                Add Collection
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
              <aside className="space-y-3 rounded-xl border border-white/15 bg-black/40 p-4">
                <input
                  value={collectionSearch}
                  onChange={(event) => setCollectionSearch(event.target.value)}
                  placeholder="Search by name, season, medium"
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none"
                />
                <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
                  {filteredCollections.map((item) => {
                    const active = item.id === selectedCollectionId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCollectionId(item.id)}
                        className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                          active
                            ? "border-white bg-white/10"
                            : "border-white/10 bg-black/50 hover:border-white/35"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{item.season}</p>
                        <p className="mt-1 text-sm font-medium text-zinc-100">{item.name}</p>
                        <p className="mt-1 text-xs text-zinc-400">{item.medium}</p>
                      </button>
                    );
                  })}
                  {filteredCollections.length === 0 && (
                    <p className="rounded-lg border border-white/10 bg-black/50 px-3 py-5 text-sm text-zinc-400">
                      No matching collections.
                    </p>
                  )}
                </div>
              </aside>

              {selectedCollection && (
                <div className="space-y-4 rounded-xl border border-white/15 bg-black/40 p-5">
                  <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                    <div className="overflow-hidden rounded-lg border border-white/15 bg-black/60">
                      <img
                        src={selectedCollection.image}
                        alt={`${selectedCollection.name} preview`}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Live Preview</p>
                      <h3 className="font-display text-2xl uppercase tracking-[0.06em] text-white">
                        {selectedCollection.name}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                        {selectedCollection.season}
                      </p>
                      <p className="text-sm text-zinc-300">{selectedCollection.note}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveCollection("up")}
                      className="rounded-lg border border-white/35 px-3 py-2 text-xs uppercase tracking-[0.16em]"
                    >
                      Move Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCollection("down")}
                      className="rounded-lg border border-white/35 px-3 py-2 text-xs uppercase tracking-[0.16em]"
                    >
                      Move Down
                    </button>
                    <button
                      type="button"
                      onClick={duplicateSelectedCollection}
                      className="rounded-lg border border-white/35 px-3 py-2 text-xs uppercase tracking-[0.16em]"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      disabled={content.collections.length <= 1}
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          collections: prev.collections.filter((item) => item.id !== selectedCollectionId),
                        }))
                      }
                      className="rounded-lg border border-red-400/60 px-3 py-2 text-xs uppercase tracking-[0.16em] text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Name</span>
                      <input
                        value={selectedCollection.name}
                        onChange={(event) => updateCollectionField("name", event.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none"
                        placeholder="Collection name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Season</span>
                      <input
                        value={selectedCollection.season}
                        onChange={(event) => updateCollectionField("season", event.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none"
                        placeholder="Season"
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Medium</span>
                      <input
                        value={selectedCollection.medium}
                        onChange={(event) => updateCollectionField("medium", event.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none"
                        placeholder="Medium"
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Description</span>
                      <textarea
                        rows={3}
                        value={selectedCollection.note}
                        onChange={(event) => updateCollectionField("note", event.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none"
                        placeholder="Collection note"
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Image URL</span>
                      <input
                        value={selectedCollection.image}
                        onChange={(event) => updateCollectionField("image", event.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none"
                        placeholder="Image URL"
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => uploadCollectionImage(event.target.files?.[0] ?? null)}
                        className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-xs"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      <SponsorSignature />
    </main>
  );
}

function SponsorSignature() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/95 px-6 py-8 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
              Partner Acknowledgment
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
             Supported by TechErra, our long-term ally in digital innovation. Together, we turn complex ideas into seamless digital realities.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 shadow-sm"
            style={{ WebkitBoxReflect: "below 4px linear-gradient(transparent, rgba(255,255,255,0.12))" }}
          >
            <style>{`
              .techerra-border-edge {
                position: absolute;
                pointer-events: none;
                z-index: 10;
                border-radius: 9999px;
              }
              .techerra-border-edge.top,
              .techerra-border-edge.bottom {
                left: 1px;
                right: 1px;
                height: 2px;
                background: linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.85) 35%, rgba(34,211,238,0.85) 65%, transparent 100%);
              }
              .techerra-border-edge.left,
              .techerra-border-edge.right {
                top: 1px;
                bottom: 1px;
                width: 2px;
                background: linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.85) 35%, rgba(34,211,238,0.85) 65%, transparent 100%);
              }
              .techerra-border-edge.top { top: 1px; animation: techerra-slide-x 2.4s linear infinite; }
              .techerra-border-edge.bottom { bottom: 1px; animation: techerra-slide-x 2.4s linear infinite reverse; }
              .techerra-border-edge.left { left: 1px; animation: techerra-slide-y 2.4s linear infinite; }
              .techerra-border-edge.right { right: 1px; animation: techerra-slide-y 2.4s linear infinite reverse; }
              @keyframes techerra-slide-x {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes techerra-slide-y {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
            `}</style>
            <span className="techerra-border-edge top" />
            <span className="techerra-border-edge right" />
            <span className="techerra-border-edge bottom" />
            <span className="techerra-border-edge left" />

            <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
              <span className="font-semibold">T</span>
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(34,211,238,0)",
                    "0 0 16px rgba(34,211,238,0.28)",
                    "0 0 0px rgba(34,211,238,0)",
                  ],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-white">TechErra</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

function FuturisticPreloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      className="fixed inset-0 z-[120] overflow-hidden bg-black"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.14),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.14),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 pb-10 pt-28 md:px-10">
        <div className="space-y-4">
          <div className="h-4 w-44 rounded-full bg-white/12" />
          <div className="h-16 max-w-2xl rounded-lg bg-white/10 md:h-24" />
          <div className="h-4 w-full max-w-xl rounded-full bg-white/10" />
          <div className="h-4 w-4/5 max-w-lg rounded-full bg-white/10" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-xl bg-white/10" />
          ))}
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white/8" />
          <div className="rounded-2xl bg-white/8" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-6">
          <div className="inline-flex items-center gap-3 border border-white/20 bg-black/45 px-4 py-2 backdrop-blur">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="h-5 w-5 rounded-full border border-white/25 border-t-cyan-300"
            />
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-300">Loading Portfolio</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AppShell() {
  const location = useLocation();
  const [content, setContent] = useState<SiteContent>(() => initialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVersion, setContentVersion] = useState(0);

  // Initial content load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadContent();
      if (!cancelled) {
        setContent(loaded);
        setContentVersion(1); // Mark as loaded
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll for content updates every 5 seconds
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    const startPolling = () => {
      pollInterval = setInterval(async () => {
        try {
          // Skip polling if using Supabase (it has real-time already)
          if (hasSupabaseConfig) return;
          
          const versionInfo = await checkContentVersion();
          if (versionInfo && versionInfo.version > contentVersion) {
            // Content has been updated on the server, refetch it
            const updated = await loadContent();
            setContent(updated);
            setContentVersion(versionInfo.version);
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 5000); // Poll every 5 seconds
    };

    startPolling();
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [contentVersion]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  // Persist content via Supabase when configured, otherwise use the local JSON backend.
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        if (hasSupabaseConfig) {
          const { error } = await supabase
            .from("site_content")
            .upsert({ id: "veeboss-site", content }, { onConflict: "id" });

          if (error) {
            console.warn("Supabase save failed:", error.message);
          }
          return;
        }

        await fetch(`${API_BASE_URL}/api/content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Use same passcode as admin; frontend still uses passcode to unlock UI.
            // In real production, use proper auth; for now keep it simple.
            "x-admin-passcode": ADMIN_PASSCODE,
          },
          body: JSON.stringify(content),
          signal: controller.signal,
        });
      } catch {
        // ignore network errors
      }
    })();

    return () => controller.abort();
  }, [content]);

  return (
    <div className="bg-black text-zinc-100">
      <Analytics />
      <AnimatePresence>{isLoading && <FuturisticPreloader />}</AnimatePresence>
      <GlassNav />
      <Routes>

        <Route path="/" element={<HomePage content={content} />} />
        <Route path="/collections" element={<CollectionsPage content={content} />} />
        <Route path="/admin" element={<AdminPage content={content} setContent={setContent} />} />
      </Routes>
      {location.pathname !== "/admin" && <SponsorSignature />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}