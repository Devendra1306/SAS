---
name: Cognitive Oversight
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201d'
  on-tertiary-container: '#0c9488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-data:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is engineered for high-stakes educational and corporate environments where precision and reliability are paramount. The brand personality is **trustworthy, intelligent, and hyper-efficient**, mirroring the capabilities of advanced AI integration. 

The aesthetic follows a **Corporate / Modern** approach with a "Technical Edge." It prioritizes clarity and high-density information display without overwhelming the user. Key characteristics include:
- **Systematic Order:** Rigorous adherence to an 8px grid to ensure data-heavy dashboards feel structured and intentional.
- **Subtle Modernism:** Utilizing thin, low-contrast borders and purposeful whitespace to differentiate sections, moving away from heavy shadows or decorative gradients.
- **Functional Aesthetics:** Visual elements are derived from their utility—status indicators, scanning animations, and data visualizations are the primary "decor."

## Colors

The palette is anchored in **Deep Navy (#0F172A)** and **Slate (#64748B)** to establish authority and institutional trust. The "AI Core" is represented by **Vibrant Blue (#3B82F6)**, used for primary actions and active states. **Teal (#0D9488)** acts as a secondary accent for analytics and positive trends.

**Status Logic:**
- **Emerald (#10B981):** High attendance, verified status, system healthy.
- **Amber (#F59E0B):** Low attendance warnings, pending verification, late entries.
- **Crimson (#EF4444):** Absent, critical low threshold, system error, or unauthorized access detected.

Backgrounds utilize a very light gray (#F8FAFC) to keep the interface feeling airy, while borders use a subtle Slate-200 (#E2E8F0) for clean containment.

## Typography

This design system utilizes a dual-font approach to balance technical precision with extreme readability.
- **Geist** is used for headlines, labels, and data points. Its technical, geometric construction reinforces the AI-driven nature of the product and provides excellent legibility for numerical data.
- **Inter** is used for all body copy and descriptive text. Its humanist qualities ensure long-form reading (like audit logs or reports) is comfortable for administrators.

For data-heavy tables, use `mono-data` for ID numbers, timestamps, and confidence scores to ensure vertical alignment of characters.

## Layout & Spacing

The system is built on a strict **8px linear scale**. All components and layout containers must have dimensions and padding that are multiples of 8.

**Grid Architecture:**
- **Desktop:** 12-column fluid grid with 24px margins and 16px gutters.
- **Tablet:** 8-column fluid grid with 16px margins and 16px gutters.
- **Mobile:** 4-column fluid grid with 16px margins and 12px gutters.

**Dashboard Philosophy:**
Use a fixed-sidebar navigation (240px width) with a fluid content area. High-density data tables should use a "Compact" vertical rhythm (8px cell padding) to maximize information density. Analytics cards should use "Relaxed" rhythm (24px padding) to provide visual breathing room for charts.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to convey depth. This maintains a clean, professional "SaaS" aesthetic.

- **Level 0 (Background):** #F8FAFC. The base canvas.
- **Level 1 (Cards/Containers):** White (#FFFFFF) with a 1px border (#E2E8F0). No shadow.
- **Level 2 (Dropdowns/Popovers):** White (#FFFFFF) with a 1px border and a subtle "Ambient Shadow" (0px 4px 12px rgba(15, 23, 42, 0.08)).
- **Active Overlay:** For camera feeds or AI scanning overlays, use a semi-transparent Deep Navy (#0F172A) at 40% opacity with a backdrop-blur (8px) to focus the user's attention.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This subtle rounding maintains a professional, institutional feel while avoiding the harshness of sharp 90-degree corners.

- **Buttons & Inputs:** 4px radius.
- **Cards & Larger Containers:** 8px (rounded-lg) radius.
- **Status Badges/Chips:** 100px (fully rounded) to differentiate them from interactive buttons.
- **Data Visualization Bars:** 2px radius for a technical, precise appearance.

## Components

**Buttons:** 
- Primary: Navy background, white text. 
- Secondary: White background, Slate-200 border, Navy text.
- Ghost: No background/border, Blue-600 text for low-priority actions.

**Data Tables:**
Headers should be Slate-50 background with Geist Medium labels. Row hovering should trigger a subtle Blue-50 tint. Use condensed "Status Badges" within cells for attendance (e.g., a small emerald dot for 'Present').

**AI Camera Feed Overlay:**
Camera views must feature a "Scanning" state using a teal-tinted bounding box around detected faces. Confidence levels (e.g., "98% Match") should appear in a small Geist-Mono label at the top-right of the bounding box.

**Input Fields:**
Default state uses a 1px Slate-200 border. Focus state moves to a 1px Blue-500 border with a subtle Blue-100 outer glow (2px).

**Progress Bars:**
Thin (4px height) bars. Use the status color logic: a student with 60% attendance shows an Amber bar, while 90%+ shows Emerald.