import { createTheme } from "@mui/material";
import palette from "./palette";
import components from "./components";
import typography from "./typography";

export const themeLight = createTheme({
  components,
  typography,
  palette: {
    ...palette,
    mode: "light",
    background: {
      default: "#FFFFFF",
      paper: "#F0F1F3"
    },
    text: {
      primary: "#5D6570",
      secondary: "#5B7595",
      disabled: "#81848A"
    },
    divider: "#F3EFFF"
  }

});