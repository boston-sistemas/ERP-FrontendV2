

"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 4500);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <Loader loading={loading} />
          <div className={`${loading ? "hidden" : "block"} relative`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

{/* 


"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3500);
  }, []);

  return (
    <html lang="en">
      
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark relative">
          <div
            className={`bg-white fixed inset-0 flex items-center justify-center transition-opacity duration-1000 ease-out ${
              loading ? "opacity-100" : "opacity-0"
            } ${loading ? "z-50" : "z-0"}`}
          >
            {loading && (
              <video
                src="/videos/boston/boston-azul.mp4"
                autoPlay
                muted
                loop
                className="video-background"
              />
            )}
          </div>
          <div className={`${loading ? "hidden" : "block"} relative`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

*/}
