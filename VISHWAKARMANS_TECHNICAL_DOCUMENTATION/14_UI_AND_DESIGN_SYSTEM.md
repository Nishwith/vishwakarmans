# UI and design system

Both apps use React, CSS-first Tailwind 4 via Vite, `src/index.css`, responsive utility classes, Lucide icons, toast feedback, navbar/footer and card/form patterns. Homeowner app uses Framer Motion for interactions and skeleton cards for loading. Designer portal uses dashboard navigation, forms, lead/project tables/cards and billing UI. The apps have independent copies rather than a shared component/token package.

Inspect each `index.css` for actual colors, fonts and CSS variables; utility classes encode spacing, radii, shadows and breakpoints. No standalone design token catalog was found. Accessibility review should check focus order, dialog semantics, form labels, image alt text and narrow-screen table behavior. This document describes patterns, not an accessibility certification or redesign.
