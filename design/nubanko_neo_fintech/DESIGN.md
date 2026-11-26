---
name: NuBanko Neo-Fintech
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3b4949'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6b7a7a'
  outline-variant: '#bac9c9'
  surface-tint: '#00696b'
  primary: '#00696b'
  on-primary: '#ffffff'
  primary-container: '#01ced1'
  on-primary-container: '#005354'
  inverse-primary: '#2edbde'
  secondary: '#00696b'
  on-secondary: '#ffffff'
  secondary-container: '#7af2f5'
  on-secondary-container: '#006e70'
  tertiary: '#725c18'
  on-tertiary: '#ffffff'
  tertiary-container: '#d3b76a'
  on-tertiary-container: '#5b4702'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#5af8fb'
  primary-fixed-dim: '#2edbde'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f51'
  secondary-fixed: '#7df5f8'
  secondary-fixed-dim: '#5dd8db'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f51'
  tertiary-fixed: '#ffe08f'
  tertiary-fixed-dim: '#e1c476'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
  numeric-balance:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system defines an intuitive, mobile-first personal finance platform tailored for young adults (18–24 years old) navigating financial autonomy. The experience must evoke clarity, empowerment, confidence, and lightness—dispelling the anxiety and friction traditionally tied to money management.

The visual direction combines Modern Fintech Minimalism with soft, tactile digital surfaces. It borrows the clarity and precision of European neo-banks with the warm, vibrant approachability of modern consumer lifestyle apps. 

- **Aesthetic Core:** Pristine surfaces, spacious breathing room, and generous radii that evoke tactile touchstones rather than rigid spreadsheets.
- **Micro-Atmosphere:** Uncluttered layouts featuring crisp contrast, vibrant turquoise focal points, and subtle golden celebratory accents.
- **Voice & Tone:** Direct, optimistic, transparent, and effortlessly fluent in mobile-native interactions.

## Colors

The palette is engineered around high clarity, swift cognitive recognition, and accessible contrast ratios.

- **Primary (`#01CED1`):** Electric turquoise serving as the signature brand identifier, active indicator, and interactive focus anchor.
- **Primary Dark (`#00A3A6`):** Deepened teal applied to high-contrast interactions, active tap states, and prominent buttons requiring solid contrast against light surfaces.
- **Primary Tint (`#E6FAFA`):** Low-saturation turquoise surface fill, ideal for badge backdrops, subtle selection states, and icon containers.
- **Tertiary Accent (`#FFE08F`):** Gentle champagne gold reserved for gamified savings streaks, rewards, goals, and positive financial milestones.
- **Functional Semantics:**
  - Positive Cash Inflow: `#16A34A` (Clean Emerald)
  - Expense / Danger / Debt: `#E5484D` (Coral Vermillion)
- **Surfaces & Neutrals:**
  - Base canvas: `#F7F8FA`
  - Elevated surface cards: `#FFFFFF`
  - Primary text: `#1A1A1A`
  - Muted secondary text: `#6B7280`
  - Subtle structural dividers: `#EEF0F4`

## Typography

The pairing marries the geometric energy of **Manrope** for numbers, key metrics, and headlines with the systematic legibility of **Inter** for dense transactional records and operational body text.

- Use tabular numbers (`font-variant-numeric: tabular-nums`) across all financial figures to avoid visual stutter during dynamic balance updates and ledger scanning.
- Reserve tight letter spacing exclusively for high-scale headlines and currency quantities (`numeric-balance`) to produce a confident, modern editorial balance.
- Keep micro labels uppercase or high-weight medium to ensure immediate discernibility during rapid thumb scrolling.

## Layout & Spacing

A mobile-centric fluid layout based on an 8pt structural rhythm, tuned for one-handed operation.

- **Canvas & Grids:** A 4-column fluid layout on mobile devices (margins: `1.25rem` / 20px, gutters: `1rem` / 16px). For screens narrower than 360px, shrink canvas margins to `1rem`.
- **Thumb Zone Hierarchy:** Primary transaction triggers, action sheets, and key navigation nodes must anchor within the bottom 40% of the viewport.
- **Rhythm & Density:**
  - Micro-gaps between related data rows: `space-sm` (8px).
  - Internal card padding: `space-md` to `space-lg` (16px to 24px).
  - Section separation: `space-xl` (32px).

## Elevation & Depth

Visual hierarchy rejects hard drop shadows in favor of ambient multi-stop diffusions and soft tonal layering:

- **Level 0 (Canvas):** Pure `#F7F8FA`. Sets the background stage without stark starkness.
- **Level 1 (Cards & Modules):** Pure `#FFFFFF` resting on `#F7F8FA`. Augmented by a subtle, ambient drop shadow (`box-shadow: 0 4px 20px -2px rgba(17, 24, 39, 0.04), 0 2px 6px -1px rgba(17, 24, 39, 0.02)`).
- **Level 2 (Overlays & Bottom Sheets):** `#FFFFFF` surfaces layered with higher diffusion (`box-shadow: 0 16px 36px -4px rgba(17, 24, 39, 0.08), 0 6px 12px -2px rgba(17, 24, 39, 0.03)`).
- **Level 3 (Floating Action & Highlights):** Active elevated pills and main primary CTAs leverage a tinted ambient glow (`box-shadow: 0 8px 24px -4px rgba(1, 206, 209, 0.35)`).
- **Outlines:** Borders are featherlight (`1px solid #EEF0F4`) to prevent heavy wireframe visuals and preserve a frictionless, fluid finish.

## Shapes

The interface embraces a friendly, hyper-modern aesthetic with generous, organic rounding:

- **Cards & Primary Modules:** Standardized to `rounded-xl` (`1.5rem` / 24px) for prominent dashboards, insight banners, and balance overviews.
- **Secondary Containers & Grouped Lists:** `rounded-lg` (`1rem` / 16px) for individual transaction groups, inputs, and modals.
- **Interactive Controls (Buttons & Badges):** Full pill curvature (`9999px`) on floating chips, category badges, and quick-action icons to emphasize touch readiness.

## Components

### Buttons
- **Primary CTA:** Full-width or inline-pill. Background `#00A3A6` or `#01CED1` with `#1A1A1A` or pure white text depending on minimum accessible contrast; active down-state with a 0.98 scale transition.
- **Secondary Button:** Soft `#E6FAFA` background with `#00A3A6` text and crisp hover/tap response.
- **Ghost/Tertiary:** No background, `#1A1A1A` text with subtle `#6B7280` icon styling.

### Input Fields
- Enclosed containers with `rounded-lg` (16px), styled in `#FFFFFF` with a `1px solid #EEF0F4` perimeter.
- Focus state activates a subtle 2px boundary using `#01CED1` without harsh dark borders.
- Floating helper and category labels in `body-sm` (`#6B7280`).

### Chips & Badges
- **Transaction Badges:** Light-tinted backgrounds corresponding to category (e.g., `#E6FAFA` for transfers, `#FFFBEB` for rewards).
- Curvature: Fully pill-shaped (`9999px`), padding: `6px 12px`.
- Typography: `label-md` or `label-sm`.

### Cards & Financial Modules
- High-priority balance cards utilize seamless linear gradients transitioning from `#01CED1` to `#00A3A6` with high-contrast light typography.
- Standard information cards use `#FFFFFF` on `#F7F8FA` with `20px` to `24px` radius and generous internal padding (`space-lg`).

### Lists & Transaction Feeds
- Grouped items in cohesive elevated cards. 
- Individual rows feature a 40px rounded category icon avatar, a two-line label (Title in `title-md`, timestamp/category in `body-sm`), and right-aligned amount in tabular `title-md`.
- Inflow amounts use `#16A34A` with a prefix `+`, and outflow uses `#1A1A1A` with a prefix `−`.

### Additional Domain Components
- **Budget Progress Rings:** Thin, clean circular progress meters with `#01CED1` foreground and `#EEF0F4` tracks.
- **Gamified Savings Vaults:** Cards featuring tertiary `#FFE08F` accent ribbons and goal milestone indicators.