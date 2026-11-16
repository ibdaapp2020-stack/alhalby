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
      <div className="admin-page min-h-screen overflow-x-hidden" data-admin>
        <AdminMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/*
          First column is the sidebar, so it sits on the start edge:
          right in Arabic and Hebrew, left in English.
        */}
        <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
          <AdminSidebar />
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
        </div>
      </div>
    </AuthGuard>
  );
}
