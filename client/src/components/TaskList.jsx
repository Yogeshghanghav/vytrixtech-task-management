
function TaskList({ tasks }) {
  const priorityTones = {
    High: 'bg-rose-50 text-rose-600',
    Medium: 'bg-amber-50 text-amber-700',
    Low: 'bg-sky-50 text-sky-600',
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      {tasks.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">
          No upcoming tasks yet.
        </p>
      ) : (
        tasks.map((task, index) => (
          <div
            key={task.id || task.title}
            className={`flex flex-wrap items-center gap-3 p-4 sm:p-5 ${
              index !== tasks.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              ○
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="mt-1 truncate text-xs text-slate-400">
                {task.project}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                priorityTones[task.priority] || priorityTones.Low
              }`}
            >
              {task.priority}
            </span>

            <span className="w-20 text-right text-xs text-slate-400">
              {task.time}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

export default TaskList
