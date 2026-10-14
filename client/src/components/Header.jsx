
function Header({ activeNav, user, onNewProject, onLogout }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-400">
          Workspace <span className="mx-2">/</span> {activeNav}
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {activeNav === 'Overview'
            ? `Good to see you, ${user?.name || 'there'}.`
            : activeNav}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here’s what’s happening with your team today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onNewProject}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
        >
          ＋ New project
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
