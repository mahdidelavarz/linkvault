"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { SvgSpinnersRingResize } from "@/Icons/Icons";
import BottomTabBar from "@/components/layout/BottomNavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="layout-loading">
        <SvgSpinnersRingResize className="layout-loading-icon" width={32} />
        <p className="layout-loading-text">Loading...</p>

        <style jsx>{`
          .layout-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            height: calc(100dvh - 60px);
            background: var(--bg-base);
          }
          .layout-loading-icon {
            color: var(--accent);
            animation: spin 0.8s linear infinite;
          }
          .layout-loading-text {
            font-size: var(--text-sm);
            color: var(--text-tertiary);
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-layout-body">
        <Sidebar />
        <main className="main-content">{children}</main>
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
