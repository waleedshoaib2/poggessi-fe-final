import { Palette, TypographyVariantsOptions } from "@mui/material";
import { inter } from "./fonts";

const typography: (palette: Palette) => TypographyVariantsOptions = () => ({
  allVariants: {
    fontFamily: inter.style.fontFamily
  }
});

export default typography;