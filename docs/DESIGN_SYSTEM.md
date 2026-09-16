# IndoPharm — Design System & Visual Specification

**Version:** 2.0.0  
**Design Direction:** Minimal Warm White + Primary Olive + Charcoal + Subtle Motion  
**Target Quality Bar:** World-Class, Minimal, Editorial, Trustworthy, Awwwards-Level Polish  

---

## 1. Visual Rationale & Ratios

The IndoPharm interface is engineered to evoke the confidence and calm authority of an accredited pharmaceutical institution combined with the seamless digital craftsmanship of modern technology brands (Apple, Stripe).

### Color Distribution Formula
- **70–80% Warm White & Pure White:** Establishes spaciousness, clinical serenity, and breathing room.
- **10–15% Primary Olive (`#596B3A`) & Soft Olive (`#EEF1E6`):** Highlights brand authority, verifiable badges, and primary interactive actions without visually overwhelming the user.
- **5–10% Charcoal (`#171914`):** High-contrast editorial typography, structural dividing rules, and footer grounding.
- **<2% Minimal Semantic Accents:** Reserved strictly for genuine validation states (Success Green, Warning Gold, Alert Crimson).

---

## 2. Color Palette & Token Architecture

```css
/* Core Editorial Tokens */
--color-warm-white: #FAFAF7;
--color-pure-white: #FFFFFF;
--color-primary-olive: #596B3A;
--color-primary-olive-dark: #43522B;
--color-primary-olive-light: #70844B;
--color-soft-olive: #EEF1E6;
--color-soft-olive-muted: #E2E7D7;
--color-charcoal: #171914;
--color-charcoal-muted: #52564C;
--color-charcoal-subtle: #8A9081;
--color-border-subtle: #E4E7DC;
--color-border-strong: #D1D6C5;
```

---

## 3. Typography & Fluid Scaling

All headline typography utilizes fluid mathematical curves via `clamp()` to transition smoothly between mobile viewports and ultra-wide displays without awkward abrupt line wrapping.

| Level | Desktop Size | Line Height | Letter Spacing | Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Hero H1** | `clamp(2.25rem, 5vw, 4.25rem)` (36px–68px) | 1.08 | -0.03em | Extrabold (800) |
| **Section Title H2** | `clamp(1.75rem, 3.5vw, 2.75rem)` (28px–44px) | 1.15 | -0.025em | Bold (700) |
| **Subsection H3** | 20px–24px | 1.25 | -0.015em | Semibold (600) |
| **Editorial Lead Body**| `clamp(1.0625rem, 1.4vw, 1.25rem)` | 1.55 | Normal | Regular (400) |
| **Standard Body Copy** | 16px desktop / 15px mobile | 1.60 | Normal | Regular (400) |
| **Metadata & Badges** | 12px–13px | 1.40 | +0.02em | Medium (500) |
| **Serials & Lot IDs** | 12px–13px (Monospace) | 1.40 | Normal | Medium (500) |

---

## 4. Disciplined Grid & Spacing System

- **Max Container Width:** `min(100% - responsive gutters, 1440px)`
- **Responsive Gutters:**
  - Desktop (1280px+): 48px–64px
  - Tablet (768px–1024px): 32px–40px
  - Mobile (320px–414px): 16px–20px
- **Vertical Section Rhythm (8pt Spatial Philosophy):**
  - Desktop: 120px–160px
  - Tablet: 80px–120px
  - Mobile: 64px–88px
- **Border Radii:**
  - Cards & containers: 8px–12px (crisp, architectural; never ballooned)
  - Interactive buttons: 8px–12px
  - Status pills & badges: 999px
- **Elevation:** Shadows are used with extreme restraint. Structure is established through `#E4E7DC` borders, background tonal shifts (`#FAFAF7` to `#FFFFFF` to `#EEF1E6`), and generous whitespace.

---

## 5. Animation & GSAP Micro-Interactions

- **Philosophy:** Motion is fast, subtle, and purposeful (300ms–800ms with `power2.out`).
- **Forbidden:** No bouncing, spinning, aggressive parallax, or scroll hijacking.
- **Accessibility:** Fully conditional on `prefers-reduced-motion: reduce`.
