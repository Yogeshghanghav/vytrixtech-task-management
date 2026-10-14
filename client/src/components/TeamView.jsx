
const members = [
  {
    initials: 'YG',
    name: 'Yogesh Ghanghav',
    role: 'Project Manager',
    color: 'bg-indigo-100 text-indigo-700',
    tasks: 8,
    completed: 5,
  },
  {
    initials: 'AS',
    name: 'Aarav Sharma',
    role: 'Developer',
    color: 'bg-emerald-100 text-emerald-700',
    tasks: 6,
    completed: 4,
  },
  {
    initials: 'RK',
    name: 'Riya Kulkarni',
    role: 'Developer',
    color: 'bg-amber-100 text-amber-700',
    tasks: 5,
    completed: 3,
  },
  {
    initials: 'PM',
    name: 'Priya Mehta',
    role: 'Admin',
    color: 'bg-rose-100 text-rose-700',
    tasks: 7,
    completed: 6,
  },
]

function TeamView() {
  return (
    <section className="mt-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
          Collaboration
        </p>
        <h2 className="mt-2 text-2xl font-bold">Your team</h2>
        <p className="mt-2 text-sm text-slate-500">
          Get an overview of your team's roles and task progress.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Team members</p>
          <p className="mt-3 text-3xl font-bold">{members.length}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Assigned tasks</p>
          <p className="mt-3 text-3xl font-bold">
            {members.reduce((sum, member) => sum + member.tasks, 0)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completed tasks</p>
          <p className="mt-3 text-3xl font-bold">
            {members.reduce((sum, member) => sum + member.completed, 0)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completion rate</p>
          <p className="mt-3 text-3xl font-bold">
            {Math.round(
              (members.reduce((sum, member) => sum + member.completed, 0) /
                members.reduce((sum, member) => sum + member.tasks, 0)) *
                100
            )}%
          </p>
        </article>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold">Team members</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {members.map((member) => (
            <article
              key={member.initials}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold ${member.color}`}
                >
                  {member.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold">{member.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {member.role}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-slate-500">Task progress</span>
                <span className="font-semibold">
                  {member.completed}/{member.tasks}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${(member.completed / member.tasks) * 100}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamView
