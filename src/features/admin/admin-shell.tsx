"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AdminSidebar, AdminMobileDrawer } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AuthGuard } from "./auth-guard";
import { isAdminLoginPath } from "@/lib/domains/host-routing";
import { DemoModeAdminNotice } from "@/components/layout/demo-mode-banner";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLogin = isAdminLoginPath(pathname);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div
        className="admin-page min-h-screen overflow-x-hidden"
        data-admin
      >
        {/* Drawer overlay — mobile & tablet only (< lg) */}
        <AdminMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/*
          Desktop layout (lg+): CSS Grid — Main (Header + Content) | Sidebar
          (RTL: sidebar on right). No fixed overlay; sidebar is a real grid
          column.
        */}
        <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Column 1: Header + Main — never under sidebar */}
          <div className="flex min-h-screen min-w-0 flex-col">
            <AdminHeader onMenuClick={() => setMobileOpen(true)} />
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8"
            >
              <div className="mx-auto w-full max-w-7xl">
                <DemoModeAdminNotice />
                {children}
              </div>
            </motion.main>
          </div>

          {/* Column 2: Sidebar — in-flow, sticky, 100vh (RTL: visually on
             the right thanks to RTL document direction + grid-column order) */}
          <AdminSidebar />
        </div>
      </div>
    </AuthGuard>
  );
}
