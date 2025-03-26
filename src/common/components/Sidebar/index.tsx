"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const operacionesItems = [
  {
    nombre: "Fibras",
    path: "/operaciones-new/fibras",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    nombre: "Hilados",
    path: "/operaciones-new/hilados",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm0 7a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm0 7a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z"/>
      </svg>
    )
  },
  {
    nombre: "Ingreso de Hilado por O/C",
    path: "/operaciones-new/movimiento-ingreso-hilado",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M11 2a1 1 0 012 0v7.5h3.5a1 1 0 01.7 1.7l-5.5 5.5a1 1 0 01-1.4 0l-5.5-5.5a1 1 0 01.7-1.7H9V2z"/>
      </svg>
    )
  },
  {
    nombre: "Salida de hilado a servicio de Tejeduría",
    path: "/operaciones-new/salida-hilado",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M11 14.5V7a1 1 0 112 0v7.5h3.5a1 1 0 01.7 1.7l-5.5 5.5a1 1 0 01-1.4 0l-5.5-5.5a1 1 0 01.7-1.7H9z"/>
      </svg>
    )
  },
  {
    nombre: "Tejidos",
    path: "/operaciones-new/tejidos",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4v4z"/>
      </svg>
    )
  },
  {
    nombre: "Ingreso de tejido por O/S",
    path: "/operaciones-new/ingreso-tejido",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2V7h-2v10z M7 13h10v-2H7v2z"/>
      </svg>
    )
  },
  {
    nombre: "Ordenes de servicio",
    path: "/operaciones-new/ordenes-servicio",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9.5 12.5v1.5h5v-1.5h-5zm0 3v1.5h5v-1.5h-5z"/>
      </svg>
    )
  },
  {
    nombre: "Registro de Auditoría",
    path: "/operaciones-new/auditoria",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </svg>
    )
  }
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  // Reset tooltips when sidebar expands/contracts
  useEffect(() => {
    setOpenTooltip(null);
  }, [isHovered]);

  return (
    <motion.aside
      ref={sidebar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setOpenTooltip(null);
      }}
      className={cn(
        "fixed left-0 top-0 z-9999 flex h-screen flex-col bg-blue-800 lg:static",
        "border-r border-blue-700 transition-all duration-100 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      initial={{ width: "5rem" }}
      animate={{ width: isHovered ? "18rem" : "5rem" }}
      transition={{ duration: 0.08, ease: [0.2, 0, 0, 1] }}
    >
      {/* SIDEBAR HEADER */}
      <div className={cn(
        "flex items-center justify-between px-4 py-5 border-b border-blue-700 transition-all duration-100",
        isHovered ? "pl-6" : "pl-0"
      )}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.08 }}
          className={cn(
            "flex transition-all duration-100",
            !isHovered && "w-full justify-center"
          )}
        >
          {isHovered ? (
            <Link href="/">
              <Image
                width={176}
                height={32}
                src={"/images/boston/logo-boston-color.png"}
                alt="Logo"
                priority
                className="transition-all duration-100 hover:opacity-90"
              />
            </Link>
          ) : (
            <Link href="/" className="flex justify-center items-center w-full">
              <Image
                width={32}
                height={32}
                src={"/images/boston/icono-boston.ico"}
                alt="Logo"
                priority
                className="transition-all duration-100 hover:scale-105"
              />
            </Link>
          )}
        </motion.div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden p-1 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg
            className="fill-blue-200"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-100 ease-in-out">
        <nav className={cn(
          "mt-5 py-4 transition-all duration-100 ease-in-out", 
          isHovered ? "px-4" : "px-0"
        )}>
          <div>
            <AnimatePresence mode="wait">
              {isHovered && (
                <motion.h3 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.08 }}
                  className="mb-4 ml-4 text-sm font-semibold text-white uppercase tracking-wider"
                >
                  Operaciones
                </motion.h3>
              )}
            </AnimatePresence>

            <ul className="mb-6 flex flex-col gap-1.5">
              {operacionesItems.map((item) => (
                <li key={item.path} className={cn(
                  "px-2",
                  !isHovered && "flex justify-center"
                )}>
                  {isHovered ? (
                    <Link
                      href={item.path}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 min-h-[44px] font-medium",
                        pathname === item.path 
                          ? "bg-blue-900 text-white" 
                          : "text-white hover:bg-blue-700/50"
                      )}
                    >
                      <span className={cn(
                        "flex-shrink-0",
                        pathname === item.path ? "text-white" : "text-white group-hover:text-white"
                      )}>
                        {item.icon}
                      </span>
                      <motion.span 
                        className="leading-tight whitespace-nowrap overflow-hidden"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.08 }}
                      >
                        {item.nombre}
                      </motion.span>
                    </Link>
                  ) : (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip 
                        open={openTooltip === item.path}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenTooltip(item.path);
                          } else if (openTooltip === item.path) {
                            setOpenTooltip(null);
                          }
                        }}
                      >
                        <TooltipTrigger asChild>
                          <Link
                            href={item.path}
                            className={cn(
                              "flex justify-center items-center rounded-lg w-10 h-10",
                              pathname === item.path 
                                ? "bg-blue-900/80 text-white" 
                                : "text-white hover:bg-blue-700/50"
                            )}
                            onMouseEnter={() => setOpenTooltip(item.path)}
                            onMouseLeave={() => setOpenTooltip(null)}
                          >
                            <span className="flex-shrink-0">
                              {item.icon}
                            </span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          className="bg-blue-900 text-white border-blue-700 font-medium" 
                          onMouseLeave={() => setOpenTooltip(null)}
                        >
                          {item.nombre}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
