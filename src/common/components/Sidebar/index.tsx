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

interface SidebarItem {
  nombre: string;
  path: string;
  icon?: React.ReactNode;
}

interface SidebarSection {
  section: string;
  icon: React.ReactNode;
  items: SidebarItem[];
}

const sidebarItems: SidebarSection[] = [
  {
    section: "Materias Primas",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 256 256">
        <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"/>
      </svg>
    ),
    items: [
      {
        nombre: "Fibras",
        path: "/operaciones-new/fibras",
        icon: (
          <svg className="fill-current" width="20" height="20" viewBox="0 -960 960 960">
            <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z"/>
          </svg>
        )
      },
      {
        nombre: "Hilados",
        path: "/operaciones-new/hilados",
        icon: (
          <svg className="fill-current" width="20" height="20" viewBox="0 0 256 256">
            <path d="M232,216H183.39A103.95,103.95,0,1,0,128,232l104,0a8,8,0,1,0,0-16ZM128,40a87.51,87.51,0,0,1,43.93,11.77,222.06,222.06,0,0,0-27.88,15.09,222.23,222.23,0,0,0-45-22A87.52,87.52,0,0,1,128,40ZM78.56,55.24a206,206,0,0,1,51.11,21.57A225.76,225.76,0,0,0,110.1,93.36,181.54,181.54,0,0,0,57.73,75.09,88.67,88.67,0,0,1,78.56,55.24ZM48.72,89.82a165.82,165.82,0,0,1,49.67,15.51A228,228,0,0,0,82.76,124.5,142.65,142.65,0,0,0,41.28,113,87.5,87.5,0,0,1,48.72,89.82ZM40,129a126.07,126.07,0,0,1,33.63,9,222.36,222.36,0,0,0-19.07,38.45A87.51,87.51,0,0,1,40,129Zm26.42,61.81A209.36,209.36,0,0,1,187,62.74a89,89,0,0,1,16.22,19.57A183.89,183.89,0,0,0,87,205.82,88.56,88.56,0,0,1,66.43,190.81ZM125.66,216A87.66,87.66,0,0,1,101.83,212,167.84,167.84,0,0,1,210.28,96.79a87.35,87.35,0,0,1,5.38,23.55A144.59,144.59,0,0,0,125.66,216Zm89.82-78.44a88.19,88.19,0,0,1-72.67,77.22A128.64,128.64,0,0,1,215.48,137.53Z"/>
          </svg>
        )
      },
      {
        nombre: "Tejidos",
        path: "/operaciones-new/tejidos",
        icon: (
          <svg className="fill-current" width="20" height="20" viewBox="0 -960 960 960">
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h133v-133H200v133Zm213 0h134v-133H413v133Zm214 0h133v-133H627v133ZM200-413h133v-134H200v134Zm213 0h134v-134H413v134Zm214 0h133v-134H627v134ZM200-627h133v-133H200v133Zm213 0h134v-133H413v133Zm214 0h133v-133H627v133Z"/>
          </svg>
        )
      }
    ]
  },
  {
    section: "Ingreso",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M11 2a1 1 0 012 0v7.5h3.5a1 1 0 01.7 1.7l-5.5 5.5a1 1 0 01-1.4 0l-5.5-5.5a1 1 0 01.7-1.7H9V2z"/>
      </svg>
    ),
    items: [
      {
        nombre: "Ingreso de hilado por O/C",
        path: "/operaciones-new/movimiento-ingreso-hilado",
      },
      {
        nombre: "Ingreso de tejido por O/S",
        path: "/operaciones-new/ingreso-tejido",
      }
    ]
  },
  {
    section: "Salida",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M11 22a1 1 0 012 0v-7.5h3.5a1 1 0 01.7-1.7l-5.5-5.5a1 1 0 01-1.4 0l-5.5 5.5a1 1 0 01.7 1.7H9V22z"/>
      </svg>
    ),
    items: [
      {
        nombre: "Salida de hilado a servicio de Tejeduría",
        path: "/operaciones-new/salida-hilado",
      }
    ]
  },
  {
    section: "Administración",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9.5 12.5v1.5h5v-1.5h-5zm0 3v1.5h5v-1.5h-5z"/>
      </svg>
    ),
    items: [
      {
        nombre: "Órdenes de servicio",
        path: "/operaciones-new/ordenes-servicio",
        icon: (
          <svg className="fill-current" width="20" height="20" viewBox="0 0 256 256">
            <path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z"/>
          </svg>
        )
      },
      {
        nombre: "Registro de Auditoría",
        path: "/operaciones-new/auditoria",
        icon: (
          <svg className="fill-current" width="20" height="20" viewBox="0 0 256 256">
            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-45.54-48.85a36.05,36.05,0,1,0-11.31,11.31l11.19,11.2a8,8,0,0,0,11.32-11.32ZM104,148a20,20,0,1,1,20,20A20,20,0,0,1,104,148Z"/>
          </svg>
        )
      }
    ]
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
              {sidebarItems.map((section) => (
                <li key={section.section} className={cn(
                  "px-2",
                  !isHovered && "flex justify-center"
                )}>
                  {isHovered ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5 px-3 py-2 text-white font-semibold">
                        <span className="flex-shrink-0">{section.icon}</span>
                        <motion.span
                          className="leading-tight whitespace-nowrap overflow-hidden"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.08 }}
                        >
                          {section.section}
                        </motion.span>
                      </div>
                      <div className="ml-4">
                        {section.items.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 min-h-[44px] font-medium",
                              pathname === item.path 
                                ? "bg-blue-900 text-white" 
                                : "text-white hover:bg-blue-700/50"
                            )}
                          >
                            {item.icon && (
                              <span className="flex-shrink-0">{item.icon}</span>
                            )}
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
                        ))}
                      </div>
                    </div>
                  ) : (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip 
                        open={openTooltip === section.section}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenTooltip(section.section);
                          } else if (openTooltip === section.section) {
                            setOpenTooltip(null);
                          }
                        }}
                      >
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex justify-center items-center rounded-lg w-10 h-10",
                              "text-white hover:bg-blue-700/50"
                            )}
                            onMouseEnter={() => setOpenTooltip(section.section)}
                            onMouseLeave={() => setOpenTooltip(null)}
                          >
                            <span className="flex-shrink-0">
                              {section.icon}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          className="bg-blue-900 text-white border-blue-700 font-medium" 
                          onMouseLeave={() => setOpenTooltip(null)}
                        >
                          {section.section}
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
