import Panel from './Panel'

const segments = [
  { key: 'todo', label: 'To do', bar: 'bg-ink-faint' },
  { key: 'inProgress', label: 'In progress', bar: 'bg-doing' },
  { key: 'done', label: 'Completed', bar: 'bg-done' },
]

function StatusStrip({ stats, projectCount }) {
  const percent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100)

  const figures = [
    { label: 'Projects', value: projectCount },
    { label: 'Total tasks', value: stats.total },
    { label: 'Pending', value: stats.pending },
    { label: 'Overdue', value: stats.overdue, late: stats.overdue > 0 },
    { label: 'Completed', value: stats.done },
  ]

  return (
    <Panel>
      {/* same three-colour strip as the sign-in card */}
      <div className="flex h-1" aria-hidden="true">
        <span className="flex-1 bg-ink-faint" />
        <span className="flex-1 bg-doing" />
        <span className="flex-1 bg-done" />
      </div>

      <div className="grid gap-6 px-6 py-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10">
        <div>
          <p className="text-5xl font-bold leading-none tracking-tight tabular-nums">
            {percent}
            <span className="ml-0.5 text-2xl font-semibold text-ink-soft">%</span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">of tasks completed</p>
        </div>

        <div>
          <div
            className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-canvas"
            role="img"
            aria-label={`${stats.todo} to do, ${stats.inProgress} in progress, ${stats.done} completed`}
          >
            {segments.map(({ key, bar }) =>
              stats[key] > 0 ? (
                <div
                  key={key}
                  className={bar}
                  style={{ width: `${(stats[key] / stats.total) * 100}%` }}
                />
              ) : null
            )}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
            {segments.map(({ key, label, bar }) => (
              <li key={key} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${bar}`} />
                {label}
                <span className="font-semibold tabular-nums text-ink">{stats[key]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-line bg-canvas/60 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line">
        {figures.map(({ label, value, late }) => (
          <div key={label} className="px-6 py-4">
            <dt className="text-sm text-ink-soft">{label}</dt>
            <dd className={`mt-1 text-2xl font-semibold tabular-nums ${late ? 'text-late' : ''}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

export default StatusStrip