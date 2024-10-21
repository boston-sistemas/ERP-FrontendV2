"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/assets/css/satoshi.css";
import "@/assets/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/common/components/Loader";



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
