import { formatDate } from '../utils/format'

const statusTone = {
  Planning: 'bg-ink-faint',
  'In Progress': 'bg-brand',
  Completed: 'bg-done',
  'On Hold': 'bg-doing',
}

function ProjectList({ projects, canManage, onDelete }) {
  return (
    <ul className="divide-y divide-line">
      {projects.map((project) => {
        const percent = project.total === 0 ? 0 : Math.round((project.done / project.total) * 100)

        return (
          <li
            key={project._id}
            className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_90px_28px] md:items-center md:gap-6"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{project.name}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                <span className={`h-1.5 w-1.5 rounded-full ${statusTone[project.status] || 'bg-ink-faint'}`} />
                {project.status || 'Planning'}
              </p>
            </div>

            <div>
              <div
                className="h-1.5 overflow-hidden rounded-sm bg-canvas"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${project.name} progress`}
              >
                <div
                  className={percent === 100 ? 'h-full bg-done' : 'h-full bg-brand'}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">
                {project.total === 0
                  ? 'No tasks yet'
                  : `${project.done} of ${project.total} tasks done`}
              </p>
            </div>

            <p className="text-sm text-ink-soft">
              {project.dueDate ? formatDate(project.dueDate) : 'No due date'}
            </p>

            {canManage ? (
              <button
                type="button"
                onClick={() => onDelete(project)}
                aria-label={`Delete ${project.name}`}
                className="hidden h-7 w-7 items-center justify-center rounded text-ink-faint hover:bg-late-wash hover:text-late md:flex"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                </svg>
              </button>
            ) : (
              <span className="hidden md:block" />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ProjectList
