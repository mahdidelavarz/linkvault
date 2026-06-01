"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomTabBar from "@/components/layout/BottomNavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Header />

      <div className="dashboard-layout-body">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>

        <BottomTabBar />
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          height: calc(100dvh - 60px);
          background: var(--bg-base);
        }

        .dashboard-layout-body {
          display: flex;
          flex: 1;
        }

        .main-content {
          flex: 1;
          min-width: 0;
          padding-right: 24px;
          padding-left: 24px;
          background: var(--bg-base);
        }

        @media (max-width: 639px) {
          .main-content {
            padding-right: 16px;
            padding-left: 16px;
          }
        }

        @media (max-width: 479px) {
          .main-content {
            padding-right: 12px;
            padding-left: 12px;
          }
        }
      `}</style>
    </div>
  );
}