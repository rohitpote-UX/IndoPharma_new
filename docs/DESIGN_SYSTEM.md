# IndoPharm — Design System & Visual Language

**Version:** 1.0.0  
**Design Philosophy:** Clinical Precision Meets Modern Humanity  
**Core Emotional Targets:** Trust, Radical Transparency, Serenity, Authority, Value  

---

## 1. Design Principles

1. **Clinical Serenity over Clinical Coldness:** Healthcare interfaces often look either dated and bureaucratic or like generic e-commerce toy stores. IndoPharm strikes a deliberate balance: the precision and rigor of an accredited medical institution blended with the approachable elegance of modern fintech.
2. **Transparency as an Aesthetic:** Real numbers, verifiable batch serials, manufacturer locations, and exact landed cost breakdowns are visual centerpieces, not buried footnotes.
3. **Calm Clarity:** Patients seeking chronic medication are often under financial or health stress. We avoid aggressive flash sales, loud countdown timers, fake urgency popups, or deceptive patterns.
4. **Accessible Authority (WCAG 2.1 AA/AAA):** High contrast ratios, robust focus rings, legible typography, and intuitive touch targets.

---

## 2. Color Palette & Token Architecture

The color system is built on HSL variables mapped into Tailwind CSS tokens for complete theme consistency.

### 2.1 Primary Brand: Deep Clinical Teal & Slate
- **Brand Primary (`brand-600`):** `hsl(174, 85%, 26%)` — Deep, reassuring apothecary teal. Communicates medical authority, longevity, and freshness.
- **Brand Hover (`brand-700`):** `hsl(174, 90%, 20%)`
- **Brand Subtle (`brand-50`):** `hsl(174, 60%, 96%)` — Soft background wash for trust callouts.

### 2.2 Secondary & Neutral: Marine Slate
- **Slate Deep (`slate-900`):** `hsl(215, 28%, 11%)` — Primary typography and structural headers.
- **Slate Muted (`slate-600`):** `hsl(215, 16%, 42%)` — Secondary descriptive copy.
- **Slate Border (`slate-200`):** `hsl(214, 20%, 90%)` — Subtle structural separation.
- **Pure Surface (`surface-0`):** `hsl(0, 0%, 100%)`
- **Subtle Surface (`surface-50`):** `hsl(210, 30%, 98%)` — Background container tone.

### 2.3 Semantic Accents
- **Compliance Verified (`success`):** `hsl(152, 68%, 34%)` — Badges, verified batch checkpoints, approved prescriptions.
- **Regulatory Caution (`warning`):** `hsl(38, 92%, 50%)` — Pending pharmacist review, document re-upload required.
- **Alert / Rejection (`danger`):** `hsl(0, 72%, 51%)` — Validation failure, rejected prescription, blocked controlled substances.
- **Information (`info`):** `hsl(204, 88%, 45%)` — Customs and transit updates.

---

## 3. Typography & Hierarchy

### 3.1 Typeface Selection
- **Display & Interface:** Geist Sans / Inter — chosen for supreme legibility at small sizes, clear distinguishability between `1`, `l`, and `I` (critical for dosage and batch numbers), and modern geometric elegance.
- **Data & Batch Serials:** Geist Mono / JetBrains Mono — used for NDC codes, batch numbers, tracking hashes, and NPI identifiers.

### 3.2 Type Scale
| Token | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-display` | 44px (2.75rem) | 1.15 | Bold (700) | Hero value proposition |
| `text-h1` | 32px (2.0rem) | 1.25 | Bold (700) | Main section headings |
| `text-h2` | 24px (1.5rem) | 1.30 | Semi-bold (600) | Feature & card headings |
| `text-h3` | 18px (1.125rem) | 1.40 | Semi-bold (600) | Component titles, modal headers |
| `text-body` | 15px (0.9375rem)| 1.60 | Regular (400) | General patient copy |
| `text-small`| 13px (0.8125rem)| 1.50 | Regular (400) | Disclaimers, helper text, labels |
| `text-mono` | 13px (0.8125rem)| 1.40 | Medium (500) | Batch numbers, NDC, lot IDs |

---

## 4. Spacing, Elevation & Surfaces

- **Grid System:** 8pt spatial grid (8px, 16px, 24px, 32px, 48px, 64px).
- **Container Max-Widths:** Standard 1280px (`max-w-7xl`) for page shells, 840px (`max-w-3xl`) for checkout flows, reading pages, and forms.
- **Elevation System:**
  - `shadow-subtle`: Soft ambient drop shadow for card surfaces (`0 1px 3px rgba(15, 23, 42, 0.05)`).
  - `shadow-elevated`: Floating menus, prescription dropzones (`0 8px 24px -4px rgba(15, 23, 42, 0.08)`).
  - `shadow-modal`: Overlays and verification inspectors (`0 20px 48px -8px rgba(15, 23, 42, 0.16)`).

---

## 5. Component Patterns

### 5.1 Buttons & Interactive Controls
- **Primary Action:** Solid Deep Teal with smooth 150ms hover brightness transition and active scale down (`active:scale-[0.98]`).
- **Secondary Action:** Slate outline with subtle background tint on hover.
- **Danger Action:** Subdued red outline or solid red for order cancellations.
- **Focus Rings:** Unmissable 2px teal offset ring (`focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2`).

### 5.2 Trust Badges & Transparency Cards
- **Batch Provenance Card:** Displays manufacturer name, plant location (e.g., Ahmedabad, Gujarat), regulatory inspection status (factual US-FDA/WHO-GMP inspection year), and lot number with a link to the Certificate of Analysis.
- **Landed Cost Breakdown:** Expandable summary detailing FOB medication cost, international bonded air cargo, U.S. customs handling, dispensing pharmacist fee, and total patient price.
- **Strict Disclaimer Banners:** Clear, standardized disclaimer boxes differentiating between personal importation rights and commercial reselling prohibitions.

### 5.3 Forms & Prescription Dropzone
- Accessible file intake supporting Drag & Drop with immediate preview of page count and file size.
- Clear error states positioned adjacent to inputs with ARIA live regions (`aria-live="polite"`).

---

## 6. Motion & GSAP Micro-Interactions

- **Animation Philosophy:** Motion must provide functional reassurance. It confirms an action was received, guides visual attention to security guarantees, and explains multi-step progress.
- **Timing:** 200ms–350ms with `power2.out` easing. No sluggish, lingering transitions.
- **Accessible Motion:** Wrapped in `@media (prefers-reduced-motion: reduce)` handlers to disable decorative translations while maintaining instantaneous state changes.
