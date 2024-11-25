import React, { useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Routing from "./router";
import { Layout } from "./components";
import "./style/index.css";
import "./style/responsive.css";
import { BrowserRouter } from "react-router-dom";



function App() {
  const theme = createTheme({
    typography: {
      fontFamily: ["Roboto"].join(","),
    },
    palette: {
      mode: "light",
      primary: {
        main: "#0b0e12",
        light: "#b4b8ac",
        dark: "#296192",
        contrastText: "#fff",
      },
      text: {
        primary: "rgba(0, 0, 0, 0.87)",
        secondary: "rgba(0, 0, 0, 0.6)",
        disabled: "rgba(0, 0, 0, 0.38)",
      },
    },
  });
  
  return (  
      
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Layout>
            <Routing />
          </Layout>
        </BrowserRouter>
      </ThemeProvider>    
    
  );
}

export default App;
