import Avatar from './Avatar'
import { dueLabel } from '../utils/format'

const priorityDot = {
  High: 'bg-late',
  Medium: 'bg-doing',
  Low: 'bg-ink-faint',
}

function TaskTable({ tasks, showAssignee }) {
  const columns = showAssignee
    ? 'md:grid-cols-[minmax(0,1fr)_150px_90px_110px]'
    : 'md:grid-cols-[minmax(0,1fr)_90px_110px]'

  return (
    <div>
      <div
        className={`hidden gap-4 border-b border-line px-5 py-2 text-xs font-semibold text-ink-soft md:grid ${columns}`}
      >
        <span>Task</span>
        {showAssignee && <span>Assigned to</span>}
        <span>Priority</span>
        <span>Due</span>
      </div>

      <ul className="divide-y divide-line">
        {tasks.map((task) => {
          const due = dueLabel(task)

          return (
            <li
              key={task._id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 ${columns}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="truncate text-xs text-ink-soft">
                  {task.project?.name || 'Unknown project'}
                </p>
              </div>

              {showAssignee && (
                <div className="hidden items-center gap-2 md:flex">
                  <Avatar name={task.assignedTo?.name} size="sm" />
                  <span className="truncate text-sm">
                    {task.assignedTo?.name || 'Unassigned'}
                  </span>
                </div>
              )}

              <div className="hidden items-center gap-2 text-sm md:flex">
                <span className={`h-2 w-2 rounded-full ${priorityDot[task.priority] || 'bg-ink-faint'}`} />
                {task.priority}
              </div>

              <p
                className={`text-right text-sm md:text-left ${
                  due.late ? 'font-semibold text-late' : 'text-ink-soft'
                }`}
              >
                {due.text}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default TaskTable
