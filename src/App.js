import React from 'react';
import {
  ChakraProvider,
  Box,
  Grid, GridItem,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import { Intro } from './pages/Intro';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import { VectorPage } from "./pages/VectorPage";
import "./App.css"


function App() {
  return (
    <ChakraProvider theme={theme}>
   
          <Routes>
            <Route index element={<Intro />} />
            <Route path="architect/:architect_id/*" element={<VectorPage />} />
            {/* <Route path="vectors/:id" element={<VectorPage />} /> */}

          </Routes>

    </ChakraProvider>
  );
}

export default App;
