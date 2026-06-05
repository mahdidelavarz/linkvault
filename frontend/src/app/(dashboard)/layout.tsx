"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomTabBar from "@/components/layout/BottomNavBar";
import InstallBanner from "@/components/pwa/InstallBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Header stays fixed at top — it's outside the scrollable body */}
      <Header />

      <div className="dashboard-layout-body">
        {/* Sidebar is a flex child with no overflow — it never grows taller than the body */}
        <Sidebar />

        {/* Only main-content scrolls */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* BottomTabBar is fixed-position on mobile — placing it outside body is fine */}
      <BottomTabBar />

      {/* PWA install prompt + SW update toast */}
      <InstallBanner />

      <style jsx>{`
        .dashboard-layout {
          display:        flex;
          flex-direction: column;
          height:         100dvh;   /* Full viewport — header + body together fill it */
          overflow:       hidden;   /* Nothing scrolls at this level */
          background:     var(--bg-base);
        }

        /* Header is a flex child here — it takes its natural height, then body fills the rest */

        .dashboard-layout-body {
          display:    flex;
          flex:       1;
          overflow:   hidden; /* Critical: contains the row so sidebar can't escape */
          min-height: 0;      /* Flex shrink fix */
        }

        .main-content {
          flex:       1;
          min-width:  0;
          overflow:   hidden;   /* PageLayout controls its own scroll */
          display:    flex;
          flex-direction: column;
          background: var(--bg-base);
        }

      `}</style>
    </div>
  );
}
