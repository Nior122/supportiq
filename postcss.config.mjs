// PostCSS config: Tailwind + autoprefixer are the only plugins needed for the
// shadcn/ui + Tailwind v3 design system. Autoprefixer adds vendor prefixes at
// build time so our CSS works across browsers without us hand-writing them.
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
