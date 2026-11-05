# Shared themes

`../styles/tailwind.css` imports `index.css` once at the application entry point.

- `colors.css`: brand, surfaces, text, status, and social colors.
- `typography.css`: font family, Tailwind size/weight scale, fluid headings, line heights, and tracking.
- `spacing.css`: Tailwind’s shared spacing unit plus page widths and fluid section gutters.
- `effects.css`: radii, shadows, animation definitions, and keyframes.
- `buttons.css`: shared Button and OutlinedButton presentation, in the components layer so utility overrides still work.
- `charts.css` and `chartTheme.ts`: categorical chart palette and a CSS-to-canvas adapter. Canvas receives resolved colors and pixel dimensions from the same CSS tokens. Values are read on mount; live theme switching is not currently supported.

Use existing utilities (`bg-brand`, `text-sm`, `font-bold`, `gap-4`) in JSX, or `var(--color-brand)` and other tokens in CSS. Add shared values here rather than repeating literals in components. Tailwind defaults continue to supply additional standard utility values. Static theme declarations keep values available to the canvas adapter even without a matching utility in JSX.

Component-specific image dimensions, responsive breakpoints, menu/arrow geometry, and vote percentage widths remain local because they describe individual layouts or runtime data. Tailwind’s default palettes remain in use for existing utility-based state variants. Global reset and accessibility rules remain in the stylesheet.
