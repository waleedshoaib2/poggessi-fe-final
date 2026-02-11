import { PaletteOptions } from "@mui/material"

export const MAIN_GRADIENT = "linear-gradient(90deg, #5D6570 0%, #76A7F8 90%)";
const palette: PaletteOptions = {
  primary: {
    contrastText: "#FFFFFF",
    main: "#5B7595", // 600

  },
  secondary: {
    main: "#76A7F8",
    dark: "#383E49"

  },
  error: {
    "50": "#fff0f0",
    "100": "#ffdede",
    "200": "#ffc2c2",
    "300": "#ff9898",
    "400": "#ff5c5c",
    "500": "#ff2a2a",
    "600": "#ed0707",
    "700": "#d10404",
    "800": "#ac0808",
    "900": "#8e0e0e",
    contrastText: "#FFFFFF",
    light: "#ff5c5c", // 400
    main: "#ed0707", // 600
    dark: "#ac0808" // 800
  },
  success: {
    "50": "#eaffe6",
    "100": "#d1fec9",
    "200": "#a4fd99",
    "300": "#6df75f",
    "400": "#3eed2e",
    "500": "#1cd20f",
    "600": "#0fa907",
    "700": "#0f800b",
    "800": "#11650f",
    "900": "#125512",
    contrastText: "#FFFFFF",
    light: "#3eed2e", // 400
    main: "#1cd20f", // 500
    dark: "#0f800b" // 700
  },
  info: {
    "50": "#ecf7ff",
    "100": "#d3ebff",
    "200": "#b1dcff",
    "300": "#7ccaff",
    "400": "#3eaaff",
    "500": "#1282ff",
    "600": "#005eff",
    "700": "#0046ff",
    "800": "#0038cf",
    "900": "#073ab0",
    contrastText: "#FFFFFF",
    light: "#005eff", // 600
    main: "#073ab0", // 900
    dark: "#073ab0" // 900
  },
  grey: {
    "50": "#F0F1F3",
    "100": "#D0D3D9",
    "200": "#B9BDC7",
    "300": "#989FAD",
    "400": "#858D9D",
    "500": "#667085",
    "600": "#5D6679",
    "700": "#48505E",
    "800": "#383E49",
    "900": "#2B2F38"
  },
  common: {
    white: "#FFFFFF",
    black: "#000000"
  },
  ...{
    custom: {
      overlay: "rgba(255,255,255,0.2)"
    },
    gradients: {
      left: "#5D6570",
      right: "#76A7F8"
    }
  }
}

export default palette