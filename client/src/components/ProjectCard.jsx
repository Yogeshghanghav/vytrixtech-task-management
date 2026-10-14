
function ProjectCard({ project, onDelete }) {
  const iconTone = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  const progressTone = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    violet: 'bg-indigo-500',
  }

  const memberTones = [
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
  ]

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${
            iconTone[project.color] || iconTone.violet
          }`}
        >
          ◈
        </div>

        <button
          type="button"
          onClick={() => onDelete(project.id)}
          aria-label={`Delete ${project.name}`}
          className="rounded-lg px-2 py-1 text-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
        >
          ···
        </button>
      </div>

      <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-slate-400">
        {project.category}
      </p>

      <h3 className="mt-2 text-lg font-bold tracking-tight group-hover:text-indigo-700">
        {project.name}
      </h3>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-500">Project progress</span>
        <span className="text-sm font-bold">{project.progress}%</span>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={project.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${project.name} progress`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            progressTone[project.color] || progressTone.violet
          }`}
          style={{
            width: `${Math.min(100, Math.max(0, project.progress))}%`,
          }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex -space-x-2">
          {project.members.map((member, index) => (
            <span
              key={`${project.id}-${member}-${index}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold ${
                memberTones[index % memberTones.length]
              }`}
            >
              {member}
            </span>
          ))}
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold">
            {project.done}/{project.tasks} tasks
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Due {project.due}
          </p>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
