function Sidebar({ activeNav, setActiveNav }) {
  const navItems = [
    { label: 'Overview', icon: '◫' },
    { label: 'Projects', icon: '▧' },
    { label: 'My tasks', icon: '☷' },
    { label: 'Team', icon: '♧' },
  ]

  return (
    <aside className="flex h-screen w-full shrink-0 flex-col overflow-x-hidden overflow-y-auto border-b border-slate-200 bg-white p-5 md:w-64 md:border-b-0 md:border-r md:p-6">
      <a href="#top" className="flex shrink-0 items-center gap-3 text-slate-900 no-underline">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
          T
        </span>
        <span>
          <span className="block text-lg font-bold tracking-tight">TeamFlow</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Work, together.
          </span>
        </span>
      </a>

      <div className="mt-8 shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
          Workspace
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-700">Personal workspace</span>
          <span className="text-xs text-slate-400">⌄</span>
        </div>
      </div>

      <p className="mb-3 mt-8 shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Workspace
      </p>

      <nav className="flex shrink-0 gap-2 overflow-x-auto md:flex-col md:overflow-x-visible">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActiveNav(item.label)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition md:w-full ${
              activeNav === item.label
                ? 'bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="w-5 text-center text-lg">{item.icon}</span>
            {item.label}

            {item.label === 'My tasks' && (
              <span
                className={`ml-auto rounded-md px-2 py-0.5 text-xs ${
                  activeNav === item.label
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                3
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-8 shrink-0 rounded-2xl bg-[#f8f5ff] p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-indigo-600">✳</span>
          <span className="text-sm font-semibold text-slate-800">A little progress</span>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Great work happens one task at a time. Keep your team moving.
        </p>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full w-[68%] rounded-full bg-indigo-500" />
        </div>

        <p className="mt-2 text-[10px] text-slate-400">Your workspace, your pace.</p>
      </div>

      <div className="mt-auto flex shrink-0 items-center gap-3 border-t border-slate-100 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
          YG
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">Yogesh Ghanghav</p>
          <p className="text-xs text-slate-400">Workspace member</p>
        </div>
        <span className="text-slate-400">···</span>
      </div>
    </aside>
  )
}

export default Sidebar