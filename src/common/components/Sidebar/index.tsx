"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";

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
  }
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <aside
      ref={sidebar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 z-9999 flex h-screen flex-col overflow-y-hidden bg-blue-900 shadow-xl transition-all duration-500 ease-in-out dark:bg-boxdark lg:static ${
        isHovered ? 'w-72.5' : 'w-20'
      } ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div 
        className={`flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 transition-all duration-500 ease-in-out ${
          isHovered ? 'pl-8' : 'pl-2'
        }`}
      >
        <div className="transition-transform duration-500 ease-in-out transform">
          {isHovered ? (
            <Link href="/">
              <Image
                width={176}
                height={32}
                src={"/images/boston/logo-boston-color.png"}
                alt="Logo"
                priority
                className="transition-opacity duration-500 ease-in-out"
              />
            </Link>
          ) : (
            <Link href="/">
              <Image
                width={32}
                height={32}
                src={"/images/boston/icono-boston.ico"}
                alt="Logo"
                priority
                className="transition-all duration-500 ease-in-out hover:scale-110"
              />
            </Link>
          )}
        </div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden transition-transform duration-300 ease-in-out hover:scale-110"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-500 ease-in-out">
        <nav className={`mt-5 py-4 transition-all duration-500 ease-in-out ${isHovered ? 'px-4 lg:px-6' : 'px-2'}`}>
          <div>
            {isHovered && (
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 uppercase tracking-wider transition-all duration-500 ease-in-out">
                Operaciones
              </h3>
            )}

            <ul className="mb-6 flex flex-col gap-2">
              {operacionesItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ease-in-out
                    ${pathname === item.path 
                      ? "bg-blue-800 text-bodydark1" 
                      : "text-bodydark2 hover:bg-blue-800/50 hover:text-bodydark1"
                    }`}
                  >
                    <span className={`transition-transform duration-300 ease-in-out ${
                      !isHovered ? 'transform scale-90' : ''
                    }`}>
                      {item.icon}
                    </span>
                    <span className={`whitespace-nowrap transition-all duration-500 ease-in-out ${
                      isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                      {item.nombre}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
