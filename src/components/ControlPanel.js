import { useState } from "react";
import { Box, ButtonGroup, IconButton, Button } from "@chakra-ui/react";
import { FiPlus, FiBook, FiGrid, FiUsers } from "react-icons/fi";
import { NewVector } from "./NewVector";
import { NodeLocal } from "./NodeLocal";
import { AddAccount } from "./AddAccount";
import { Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';


export function ControlPanel() {
  return (
    <Box h="calc(100vh - 42px)" className="scrollY sbar diagonal-lines">
      <ButtonGroup>

        <LinkButton to="new_node" icon={<FiPlus />}>
          New
        </LinkButton>

        <LinkButton to="add_node" icon={<FiGrid />}>
          Nodes
        </LinkButton>

        <LinkButton to="add_account" icon={<FiUsers />}>
          New Account
        </LinkButton>

      </ButtonGroup>

      <Box p="2">
        <Routes>
          <Route path="new_node/*" element={<NewVector />} />
          <Route path="add_node/*" element={<NodeLocal />} />
          <Route path="add_account/*" element={<AddAccount />} />
        </Routes>
      </Box>

      <Outlet />
    </Box>
  );
}


function LinkButton({ to, children, icon, ...props }) {
  const location = useLocation();

  // Check if the current route matches the "to" path
  const isSelected = location.pathname.includes(to);

  return (
    <Link to={to}>
      <Button
        variant={isSelected ? 'solid' : 'outline'} // Solid when selected, outline when not
        colorScheme={isSelected ? 'blue' : 'gray'} // Optional color change
        rightIcon={icon} // Optional icon
        {...props} // Spread other props for further customization
      >
        {children}
      </Button>
    </Link>
  );
}