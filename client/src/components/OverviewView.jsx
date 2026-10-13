import Panel from './Panel'
import StatusStrip from './StatusStrip'
import TaskTable from './TaskTable'
import ActivityFeed from './ActivityFeed'
import ProjectList from './ProjectList'
import { EmptyState, Notice, Skeleton } from './States'
import { isOverdue } from '../utils/format'

function summaryLine({ total, pending, overdue }) {
  if (total === 0) return 'No tasks yet. Assigned work will show up here.'
  if (pending === 0) return 'Every task is completed.'

  const open = `${pending} still open`
  if (overdue > 0) return `${overdue} ${overdue === 1 ? 'task is' : 'tasks are'} overdue, ${open}.`
  return `Nothing is overdue. ${open}.`
}

function OverviewView({
  user,
  canManage,
  stats,
  tasks,
  projects,
  activities,
  loading,
  errors,
  onRetry,
  onGoTo,
}) {
  // Overdue first, then by nearest due date.
  const needsAttention = tasks
    .filter((task) => task.status !== 'Completed')
    .sort((a, b) => {
      if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
    .slice(0, 6)

  const priorityCounts = ['High', 'Medium', 'Low'].map((level) => ({
    level,
    count: tasks.filter((t) => t.status !== 'Completed' && t.priority === level).length,
  }))

  return (
    <div className="mt-6 space-y-6">
      <p className="max-w-2xl text-[26px] font-semibold leading-snug tracking-tight">
        {loading.tasks ? 'Loading your workspace...' : summaryLine(stats)}
      </p>

      <StatusStrip stats={stats} projectCount={projects.length} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Panel
          title="Needs attention"
          note="Open tasks, most urgent first"
          action={
            <button
              type="button"
              onClick={() => onGoTo('My tasks')}
              className="text-sm font-semibold text-brand hover:text-brand-deep"
            >
              All tasks
            </button>
          }
        >
          {loading.tasks ? (
            <Skeleton />
          ) : errors.tasks ? (
            <div className="p-4">
              <Notice onRetry={onRetry.tasks}>{errors.tasks}</Notice>
            </div>
          ) : needsAttention.length === 0 ? (
            <EmptyState title="You're all caught up">
              There are no open tasks right now.
            </EmptyState>
          ) : (
            <TaskTable tasks={needsAttention} showAssignee={user?.role !== 'Developer'} />
          )}
        </Panel>

        {canManage ? (
          <Panel
            title="Recent activity"
            action={
              <button
                type="button"
                onClick={onRetry.activities}
                disabled={loading.activities}
                className="text-sm font-semibold text-brand hover:text-brand-deep disabled:opacity-50"
              >
                {loading.activities ? 'Refreshing' : 'Refresh'}
              </button>
            }
          >
            {loading.activities ? (
              <Skeleton rows={4} />
            ) : errors.activities ? (
              <div className="p-4">
                <Notice onRetry={onRetry.activities}>{errors.activities}</Notice>
              </div>
            ) : activities.length === 0 ? (
              <EmptyState title="No activity yet">
                Changes to projects and tasks will be listed here.
              </EmptyState>
            ) : (
              <ActivityFeed items={activities.slice(0, 8)} />
            )}
          </Panel>
        ) : (
          <Panel title="Open tasks by priority">
            <ul className="space-y-4 p-5">
              {priorityCounts.map(({ level, count }) => (
                <li key={level}>
                  <div className="flex justify-between text-sm">
                    <span>{level}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-sm bg-canvas">
                    <div
                      className={`h-full rounded-sm ${
                        level === 'High' ? 'bg-late' : level === 'Medium' ? 'bg-doing' : 'bg-ink-faint'
                      }`}
                      style={{ width: `${stats.pending ? (count / stats.pending) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      <Panel
        title="Projects"
        action={
          <button
            type="button"
            onClick={() => onGoTo('Projects')}
            className="text-sm font-semibold text-brand hover:text-brand-deep"
          >
            View all
          </button>
        }
      >
        {loading.projects ? (
          <Skeleton />
        ) : errors.projects ? (
          <div className="p-4">
            <Notice onRetry={onRetry.projects}>{errors.projects}</Notice>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState title="No projects yet">
            {canManage
              ? 'Create a project to start planning work.'
              : 'You will see projects here once you are added to one.'}
          </EmptyState>
        ) : (
          <ProjectList projects={projects.slice(0, 4)} canManage={false} />
        )}
      </Panel>
    </div>
  )
}

export default OverviewView
