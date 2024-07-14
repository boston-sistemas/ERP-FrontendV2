"use client";
import { ReactNode } from "react";

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activeCondition: boolean;
  open: boolean;
  handleClick: () => void;
}

const SidebarLinkGroup = ({
  children,
  activeCondition,
  open,
  handleClick,
}: SidebarLinkGroupProps) => {
  return <li>{children(handleClick, open)}</li>;
};

export default SidebarLinkGroup;
