---
name: Lestari
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
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#535f58'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7770'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#d9e6dd'
  tertiary-fixed-dim: '#bdcac1'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4943'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is built for the modern digital transformation of local governance. It prioritizes clarity, accessibility, and a sense of calm reliability. The brand personality is "The Helpful Guardian"—professional and authoritative yet deeply rooted in the community. 

The aesthetic follows a **Refined Minimalism** movement. It utilizes significant whitespace to reduce cognitive load for non-technical users, ensuring that government administrative tasks feel manageable rather than overwhelming. The style avoids trendy visual clutter like glassmorphism or neon accents, instead focusing on high-quality typography, organic rounded shapes, and soft, natural elevation to create a welcoming digital environment.

## Colors
The color palette is inspired by Indonesia's lush landscapes and the stability of institutional service.

- **Primary (Emerald Green):** Used for primary actions, success states, and brand identifiers. It symbolizes growth and vitality.
- **Secondary (Deep Charcoal):** Used for headings and primary text to ensure maximum contrast and legibility.
- **Tertiary (Mint Wash):** A very soft green used for background highlights, subtle alerts, and active state containers.
- **Neutral (Slate Grays):** A sophisticated range of grays for borders, secondary text, and surface backgrounds to maintain a clean, organized look.
- **Background:** Pure white (`#FFFFFF`) is the default canvas to ensure the interface feels airy and modern.

## Typography
This design system utilizes **Plus Jakarta Sans** for its friendly yet professional character. The high x-height and open apertures ensure excellent legibility on all screen sizes, which is critical for government accessibility standards.

- **Headlines:** Use Bold or Semi-Bold weights with tight letter-spacing to create a strong visual hierarchy.
- **Body Text:** Use Regular weight for long-form content to maximize readability.
- **Labels:** Use Medium or Semi-Bold for buttons and data tags to distinguish them from standard prose.
- **Scaling:** On mobile devices, large display headers should scale down significantly to maintain the grid's integrity and avoid awkward line breaks.

## Layout & Spacing
The layout follows a **Fluid-Fixed hybrid model**. While the interior elements stretch, the main content area is capped at a maximum width of 1280px to prevent long line lengths that hinder readability.

- **Grid:** A 12-column system is used for desktop, 8-column for tablet, and 4-column for mobile.
- **Rhythm:** An 8px base unit (linear scale) governs all padding and margins. This ensures a consistent vertical rhythm.
- **Breathing Room:** We prioritize large internal padding within cards and containers (typically 24px or 32px) to maintain the minimalist and clean aesthetic.
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

## Elevation & Depth
Depth is created through **Ambient Shadows** and tonal layering rather than heavy borders.

- **Flat Surface:** The base page background is always the lowest layer.
- **Level 1 (Cards/Inputs):** Used for primary content containers. These use a very soft, diffused shadow: `0 4px 20px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Dropdowns/Modals):** Used for temporary floating UI. These use a slightly more pronounced shadow to indicate focus: `0 12px 32px rgba(0, 0, 0, 0.1)`.
- **Contrast Outlines:** In addition to soft shadows, level 1 elements use a subtle 1px border in a light gray (`#F3F4F6`) to ensure definition against white backgrounds.

## Shapes
The shape language is defined by **Generous Radii**. This approach softens the traditional "stiff" look of government software, making it feel modern and approachable.

- **Base Radius:** 0.5rem (8px) for buttons and small input fields.
- **Large Radius (rounded-lg):** 1rem (16px) for cards, data tables, and modal containers.
- **Extra Large Radius (rounded-xl):** 1.5rem (24px) for featured hero sections or large "quick action" dashboard widgets.
- **Pills:** Full rounding is reserved strictly for status badges (e.g., "Published", "Pending").

## Components

### Buttons
- **Primary:** Solid Emerald Green with white text. High-contrast, 16px horizontal padding.
- **Secondary:** Transparent background with a 1px Slate border.
- **Tertiary:** No border, Primary Green text, used for "Cancel" or low-priority actions.

### Cards
Cards are the primary building block. They must feature `rounded-lg` corners and the Level 1 Ambient Shadow. Internal padding should never be less than 24px. Titles within cards use `headline-md`.

### Forms & Inputs
Inputs use a light gray background (`#F9FAFB`) with no border in their default state, only gaining a 2px Emerald Green border when focused. Labels are always placed above the input using `label-md`.

### Status Badges
Small, pill-shaped indicators. They use the Tertiary (Mint Wash) background with Primary (Emerald Green) text for positive states. This low-contrast tonal approach keeps the UI calm.

### Visual Statistics
Large numerical data points should use `display-lg` typography in the Secondary color, paired with a small iconic representation in the Primary color to aid quick scanning for village officials.

### Lists
Lists avoid heavy dividing lines. Instead, list items are separated by subtle `1px` light gray lines or simple whitespace with a hover state that changes the background color to the Tertiary Mint Wash.