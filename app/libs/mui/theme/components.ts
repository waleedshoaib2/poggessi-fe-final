import { Components } from "@mui/material";
import { Theme } from "@mui/system";

const components: Components<Omit<Theme, "components">> = {
  MuiInputLabel: {
    styleOverrides: {
      root: {
        // color: 'black', // default label color
        // '&.Mui-focused': {
        //   color: 'primary', // color when focused
        // },
        // '&.Mui-disabled': {
        //   color: '#999999', // color when disabled
        // },
      },
    },
  },
  // MuiOutlinedInput: {
  //   styleOverrides: {
  //     root: {
  //       // '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
  //       //   borderColor: '#ff5722', // outline color when focused
  //       // },
  //       '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
  //         borderColor: 'red', // outline color when disabled
  //       },
  //     },
  //     input: {
  //       color: 'white', // text color
  //     },
  //   },
  // },
};

export default components;
