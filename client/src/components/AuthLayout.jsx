import { Logo } from './Sidebar'

const columns = [
  {
    name: 'To do',
    dot: 'bg-ink-faint',
    tasks: [
      { title: 'Design the onboarding screen', project: 'Website redesign', priority: 'High', due: 'Tomorrow' },
      { title: 'Write API documentation', project: 'Backend', priority: 'Low', due: 'In 5 days' },
    ],
  },
  {
    name: 'In progress',
    dot: 'bg-doing',
    tasks: [
      { title: 'Fix payment webhook retries', project: 'Checkout', priority: 'High', due: '1 day late', late: true },
    ],
  },
  {
    name: 'Completed',
    dot: 'bg-done',
    tasks: [
      { title: 'Set up CI pipeline', project: 'Backend', priority: 'Medium', due: 'Done' },
      { title: 'Create database schema', project: 'Backend', priority: 'Medium', due: 'Done' },
    ],
  },
]

const priorityDot = { High: 'bg-late', Medium: 'bg-doing', Low: 'bg-ink-faint' }

const points = [
  'Assign work and see it appear instantly, no refresh needed',
  'Roles keep each person focused on what they own',
  'Comments and history stay attached to every task',
]

function BoardPreview() {
  return (
    <aside
      aria-hidden="true"
      className="hidden flex-col justify-center border-l border-line bg-canvas px-12 xl:px-16 lg:flex"
    >
      <div className="mx-auto w-full max-w-xl">
        <p className="max-w-md text-2xl font-semibold leading-snug tracking-tight">
          One board for everything your team is working on.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 rounded-lg border border-line bg-paper p-3">
          {columns.map((column) => (
            <div key={column.name} className="min-w-0 rounded-md bg-canvas p-2.5">
              <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold">
                <span className={`h-2 w-2 rounded-sm ${column.dot}`} />
                {column.name}
                <span className="ml-auto font-medium tabular-nums text-ink-soft">
                  {column.tasks.length}
                </span>
              </p>

              <ul className="space-y-2">
                {column.tasks.map((task) => (
                  <li key={task.title} className="rounded border border-line bg-paper p-2.5">
                    <p className="text-[13px] font-medium leading-snug">{task.title}</p>
                    <p className="mt-1 truncate text-[11px] text-ink-soft">{task.project}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`} />
                        {task.priority}
                      </span>
                      <span className={task.late ? 'font-semibold text-late' : 'text-ink-soft'}>
                        {task.due}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="mt-8 space-y-3 text-sm text-ink-soft">
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="mt-2 h-px w-4 shrink-0 bg-brand" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Logo />

        <div className="mx-auto my-auto w-full max-w-sm py-12">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 border-t border-line pt-5 text-sm text-ink-soft">{footer}</p>
        </div>
      </section>

      <BoardPreview />
    </main>
  )
}

export default AuthLayout