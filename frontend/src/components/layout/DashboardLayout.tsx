import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{CSS}</style>
      <div className="dashboard-root">
        <Sidebar />
        <div className="dashboard-content">
          <Header />
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

const CSS = `
.dashboard-root {
  display:    flex;
  min-height: 100dvh;
  background: var(--bg-base);
}
.dashboard-content {
  flex:           1;
  display:        flex;
  flex-direction: column;
  min-width:      0;
  overflow:       hidden;
}
.dashboard-main {
  flex:       1;
  padding:    24px;
  overflow-y: auto;
}
`