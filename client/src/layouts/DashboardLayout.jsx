
import Sidebar from '../components/Sidebar'

function DashboardLayout({ activeNav, setActiveNav, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb] text-slate-800 md:h-screen md:min-h-0 md:flex-row md:overflow-hidden">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      <main className="min-w-0 flex-1 px-5 py-7 md:overflow-y-auto md:px-10 md:py-10 lg:px-12">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
