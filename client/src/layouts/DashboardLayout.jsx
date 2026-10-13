import Sidebar, { MobileBar, MobileTabs } from '../components/Sidebar'

function DashboardLayout({ activeNav, setActiveNav, user, openCount, onLogout, children }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        user={user}
        openCount={openCount}
        onLogout={onLogout}
      />

      <div className="min-w-0 flex-1">
        <MobileBar onLogout={onLogout} />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-10 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>

      <MobileTabs activeNav={activeNav} setActiveNav={setActiveNav} />
    </div>
  )
}

export default DashboardLayout
