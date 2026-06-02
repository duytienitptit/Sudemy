# Design Tokens

> **Design System:** "Intellectual Clarity" — Generated via Stitch MCP.
> **Aesthetic:** Corporate/Modern Minimalism — clean, premium, focused.
> **Approach:** Mobile-first, dark/light mode via CSS variables.
> **Stitch Project:** `projects/8835940578421754171`

---

## Color Palette

### Primary Colors (from Stitch "Intellectual Clarity")

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#4f46e5` | Primary CTA buttons, active states, progress bars |
| `--primary-hover` | `#3525cd` | Hover state for primary elements |
| `--primary-light` | `#e2dfff` | Light primary backgrounds (badges, tags) |
| `--primary-dim` | `#c3c0ff` | Muted primary accents |
| `--on-primary` | `#ffffff` | Text on primary backgrounds |
| `--on-primary-container` | `#dad7ff` | Text on primary container |

### Secondary Colors

| Token | Hex | Usage |
|---|---|---|
| `--secondary` | `#006591` | Category badges, tech accents |
| `--secondary-container` | `#39b8fd` | Secondary container backgrounds |
| `--on-secondary` | `#ffffff` | Text on secondary |
| `--secondary-light` | `#c9e6ff` | Light secondary backgrounds |

### Tertiary Colors

| Token | Hex | Usage |
|---|---|---|
| `--tertiary` | `#684000` | Bestseller badges, ratings |
| `--tertiary-container` | `#885500` | Amber-toned containers |
| `--on-tertiary` | `#ffffff` | Text on tertiary |
| `--tertiary-light` | `#ffddb8` | Light amber backgrounds |
| `--tertiary-dim` | `#ffb95f` | Rating stars |

### Surface Colors (Light Mode)

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#f9f9ff` | Page background (canvas) |
| `--surface` | `#f9f9ff` | Surface level 0 |
| `--surface-container-lowest` | `#ffffff` | Cards, content areas (pure white) |
| `--surface-container-low` | `#f0f3ff` | Subtle surface variation |
| `--surface-container` | `#e7eeff` | Container backgrounds |
| `--surface-container-high` | `#dee8ff` | Elevated containers |
| `--surface-container-highest` | `#d8e3fb` | Highest elevation surface |
| `--surface-dim` | `#cfdaf2` | Dimmed surface |
| `--on-surface` | `#111c2d` | Primary text on surface |
| `--on-surface-variant` | `#464555` | Secondary text on surface |

### Outline Colors

| Token | Hex | Usage |
|---|---|---|
| `--outline` | `#777587` | Standard borders |
| `--outline-variant` | `#c7c4d8` | Subtle borders, dividers |

### Inverse Colors

| Token | Hex | Usage |
|---|---|---|
| `--inverse-surface` | `#263143` | Footer, dark sections |
| `--inverse-on-surface` | `#ecf1ff` | Text on dark backgrounds |
| `--inverse-primary` | `#c3c0ff` | Primary accent in dark context |

### Status Colors

| Token | Hex | Usage |
|---|---|---|
| `--error` | `#ba1a1a` | Errors, delete actions |
| `--error-container` | `#ffdad6` | Error background |
| `--on-error` | `#ffffff` | Text on error |
| `--success` | `#22c55e` | Published, completed |
| `--warning` | `#f59e0b` | Processing, pending |

### Override Colors (Tailwind / Utility)

| Token | Hex | Usage |
|---|---|---|
| `--override-primary` | `#4f46e5` | Indigo |
| `--override-secondary` | `#0ea5e9` | Sky Blue |
| `--override-tertiary` | `#f59e0b` | Amber |
| `--override-neutral` | `#1e293b` | Slate-800 (headings) |

### Dark Mode Overrides

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#121212` | Page background |
| `--surface` | `#1c1c1c` | Card backgrounds |
| `--border` | `#333333` | Borders |
| `--on-surface` | `#f5f5f5` | Primary text |
| `--on-surface-variant` | `#a6a6a6` | Secondary text |
| `--primary` | `#6366f1` | Vibrant in dark mode |

---

## Typography

### Font Families
```css
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-label: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

> **Note:** Stitch design system uses Inter exclusively for all text. Vietnamese diacritics render gracefully with Inter. Consider `font-feature-settings: 'cv05', 'cv11'` for developer-focused areas.

### Stitch Typography Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-lg` | 48px | 700 | 56px | -0.02em | Hero heading (desktop) |
| `headline-lg` | 32px | 700 | 40px | -0.01em | Page titles |
| `headline-lg-mobile` | 28px | 700 | 36px | -0.01em | Page titles (mobile) |
| `headline-md` | 24px | 600 | 32px | — | Section headings |
| `headline-sm` | 20px | 600 | 28px | — | Card titles |
| `body-lg` | 18px | 400 | 28px | — | Large body text |
| `body-md` | 16px | 400 | 24px | — | Body text |
| `body-sm` | 14px | 400 | 20px | — | Captions, instructor name |
| `label-md` | 14px | 600 | 16px | — | Labels, nav items |
| `label-sm` | 12px | 500 | 16px | — | Badges, timestamps |

### Font Weights
| Token | Weight | Usage |
|---|---|---|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, nav items |
| `--font-semibold` | 600 | Card titles, buttons |
| `--font-bold` | 700 | Headings |

---

## Spacing (8px Base Unit — Stitch standard)

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Icon gaps, badge padding |
| `--space-3` | 12px | Card padding (compact) |
| `--space-4` | 16px | Standard gap, mobile margin |
| `--space-5` | 20px | Section gap |
| `--space-6` | 24px | Card padding, gutters |
| `--space-8` | 32px | Section padding, desktop margin |
| `--space-10` | 40px | Large section gap |
| `--space-12` | 48px | Page section spacing |
| `--space-16` | 64px | Hero padding |
| `--space-20` | 80px | Major section dividers |

---

## Border Radius (Stitch: Soft & Professional)

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 0.125rem (2px) | Smallest elements |
| `--radius-default` | 0.25rem (4px) | Buttons, checkboxes, tags |
| `--radius-md` | 0.375rem (6px) | Medium components |
| `--radius-lg` | 0.5rem (8px) | Course cards, video players |
| `--radius-xl` | 0.75rem (12px) | Hero sections, banners |
| `--radius-full` | 9999px | Avatars, pills |

## Shadows (Ambient — Indigo-tinted)

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-card` | `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)` | Cards (Level 1) |
| `--shadow-hover` | `0 10px 15px -3px rgb(0 0 0 / 0.08)` | Card hover (Level 2) |
| `--shadow-modal` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Modals, overlays (Level 3) |

> **Design Note:** Avoid heavy black shadows. Use shadows tinted with Indigo/Navy. Overlays pair with backdrop blur (4px).

## Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Sticky header |
| `--z-overlay` | 30 | Modal backdrop |
| `--z-modal` | 40 | Modal content |
| `--z-toast` | 50 | Toast notifications |

---

## Animation Tokens (Framer Motion)

```typescript
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] },
  slow: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
};

export const variants = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  slideUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  slideDown: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } },
  scaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  stagger: { animate: { transition: { staggerChildren: 0.05 } } },
};
```

---

## Breakpoints (Mobile-first)

| Token | Min Width | Usage |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops (container max) |
| `2xl` | 1536px | Large screens |

### Grid Layout

| Viewport | Columns | Gutters | Margins |
|---|---|---|---|
| Mobile | 4 | 16px | 16px |
| Tablet | 8 | 24px | 24px |
| Desktop | 12 | 24px | 32px |
| Max Width | — | — | 1280px |

### Grid Columns by Breakpoint
| Component | Mobile | sm | md | lg | xl |
|---|---|---|---|---|---|
| CourseGrid | 1 col | 2 col | 2 col | 3 col | 4 col |
| PromptGrid | 1 col | 2 col | 2 col | 3 col | 3 col |
| StatsCards | 1 col | 2 col | 2 col | 4 col | 4 col |

---

## Elevation Model (from Stitch)

| Level | Background | Border | Shadow | Usage |
|---|---|---|---|---|
| Level 0 (Canvas) | `#f8fafc` | — | — | Page background |
| Level 1 (Card) | `#ffffff` | 1px `#e2e8f0` | `--shadow-card` | Course cards, containers |
| Level 2 (Interactive) | `#ffffff` | removed | `--shadow-hover` | Hover state on cards |
| Level 3 (Overlay) | `#ffffff` | — | `--shadow-modal` + blur(4px) | Modals, dropdowns |
