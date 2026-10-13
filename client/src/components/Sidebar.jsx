import Avatar from './Avatar'

const icons = {
  Overview: 'M4 5h16M4 12h10M4 19h6',
  Projects: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  'My tasks': 'm5 12 4 4 10-10',
  Team: 'M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9 8v-1a3 3 0 0 0-2-2.8M15 5.2a3 3 0 0 1 0 5.6',
}

const navItems = ['Overview', 'Projects', 'My tasks', 'Team']

function NavIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2" y="4" width="20" height="4" rx="1" fill="#0f766e" />
        <rect x="2" y="10" width="14" height="4" rx="1" fill="#2dd4bf" />
        <rect x="2" y="16" width="8" height="4" rx="1" fill="#99f6e4" />
      </svg>
      <span className="text-xl font-bold tracking-tight">TeamFlow</span>
    </span>
  )
}

function Sidebar({ activeNav, setActiveNav, user, openCount, onLogout }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper px-3 py-6 md:flex">
      <div className="px-3">
        <Logo />
      </div>

      <nav className="mt-9 flex flex-col gap-1" aria-label="Main">
        {navItems.map((item) => {
          const active = activeNav === item

          return (
            <button
              key={item}
              type="button"
              onClick={() => setActiveNav(item)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                active
                  ? 'bg-brand-wash font-semibold text-brand-deep'
                  : 'text-ink-soft hover:bg-canvas hover:text-ink'
              }`}
            >
              <NavIcon name={item} />
              {item}
              {item === 'My tasks' && openCount > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                    active ? 'bg-paper text-brand-deep' : 'bg-canvas text-ink-soft'
                  }`}
                >
                  {openCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-line p-3">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-ink-soft">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function MobileBar({ onLogout }) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
      <Logo />
      <button type="button" onClick={onLogout} className="text-sm font-medium text-ink-soft">
        Sign out
      </button>
    </div>
  )
}

export function MobileTabs({ activeNav, setActiveNav }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-paper md:hidden"
    >
      {navItems.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setActiveNav(item)}
          aria-current={activeNav === item ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            activeNav === item ? 'text-brand' : 'text-ink-soft'
          }`}
        >
          <NavIcon name={item} />
          {item}
        </button>
      ))}
    </nav>
  )
}

export default Sidebar