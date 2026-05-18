import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          "surface-container-highest": "#2d3449",
          "inverse-primary": "#4d44e3",
          "on-tertiary-fixed": "#131b2e",
          "on-secondary": "#003640",
          "outline": "#918fa1",
          "on-surface": "#dae2fd",
          "on-primary-fixed": "#0f0069",
          "secondary": "#4cd7f6",
          "surface-container": "#171f33",
          "on-secondary-container": "#00424e",
          "surface-bright": "#31394d",
          "error-container": "#93000a",
          "background": "#0b1326",
          "tertiary": "#bec6e0",
          "inverse-surface": "#dae2fd",
          "secondary-fixed": "#acedff",
          "error": "#ffb4ab",
          "primary-container": "#4f46e5",
          "on-primary-container": "#dad7ff",
          "on-tertiary-fixed-variant": "#3f465c",
          "on-surface-variant": "#c7c4d8",
          "tertiary-fixed": "#dae2fd",
          "on-tertiary-container": "#d4dbf5",
          "on-primary": "#1d00a5",
          "surface-dim": "#0b1326",
          "primary": "#c3c0ff",
          "surface-container-lowest": "#060e20",
          "surface-variant": "#2d3449",
          "on-error-container": "#ffdad6",
          "secondary-fixed-dim": "#4cd7f6",
          "on-secondary-fixed": "#001f26",
          "outline-variant": "#464555",
          "on-tertiary": "#283044",
          "inverse-on-surface": "#283044",
          "on-background": "#dae2fd",
          "tertiary-container": "#586076",
          "on-secondary-fixed-variant": "#004e5c",
          "secondary-container": "#03b5d3",
          "surface-tint": "#c3c0ff",
          "surface-container-low": "#131b2e",
          "surface-container-high": "#222a3d",
          "primary-fixed-dim": "#c3c0ff",
          "on-error": "#690005",
          "primary-fixed": "#e2dfff",
          "on-primary-fixed-variant": "#3323cc",
          "surface": "#0b1326",
          "tertiary-fixed-dim": "#bec6e0"
      },
      borderRadius: {
          "DEFAULT": "0.125rem",
          "lg": "0.25rem",
          "xl": "0.5rem",
          "full": "0.75rem"
      },
      spacing: {
          "base": "4px",
          "gutter": "20px",
          "md": "16px",
          "lg": "24px",
          "xs": "4px",
          "container-max": "1280px",
          "sm": "8px",
          "xl": "40px"
      },
      fontFamily: {
          "headline-lg": ["Geist", "sans-serif"],
          "body-md": ["Inter", "sans-serif"],
          "label-md": ["Geist", "sans-serif"],
          "headline-lg-mobile": ["Geist", "sans-serif"],
          "display": ["Geist", "sans-serif"],
          "body-lg": ["Inter", "sans-serif"],
          "headline-md": ["Geist", "sans-serif"],
          "code": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
          "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600"}],
          "body-md": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
          "label-md": ["13px", {"lineHeight": "1", "letterSpacing": "0.01em", "fontWeight": "500"}],
          "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "fontWeight": "600"}],
          "display": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "600"}],
          "body-lg": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
          "headline-md": ["20px", {"lineHeight": "1.4", "fontWeight": "500"}],
          "code": ["13px", {"lineHeight": "1.5", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}
