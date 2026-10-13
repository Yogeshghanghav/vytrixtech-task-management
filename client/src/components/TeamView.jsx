import { useMemo } from 'react'
import Avatar from './Avatar'
import Panel from './Panel'
import { EmptyState } from './States'
import { isOverdue } from '../utils/format'

function buildTeam(tasks) {
  const people = new Map()

  for (const task of tasks) {
    const person = task.assignedTo
    if (!person?._id) continue

    if (!people.has(person._id)) {
      people.set(person._id, {
        id: person._id,
        name: person.name,
        email: person.email,
        total: 0,
        done: 0,
        overdue: 0,
      })
    }

    const entry = people.get(person._id)
    entry.total += 1
    if (task.status === 'Completed') entry.done += 1
    if (isOverdue(task)) entry.overdue += 1
  }

  return [...people.values()].sort((a, b) => b.total - a.total)
}

function TeamView({ tasks }) {
  const team = useMemo(() => buildTeam(tasks), [tasks])

  return (
    <div className="mt-6">
      <Panel
        title="Workload"
        note="Based on the tasks assigned to each person"
      >
        {team.length === 0 ? (
          <EmptyState title="Nobody has been assigned work yet">
            People appear here as soon as tasks are assigned to them.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {team.map((person) => {
              const percent = Math.round((person.done / person.total) * 100)

              return (
                <li
                  key={person.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_90px] md:items-center md:gap-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={person.name} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.name}</p>
                      <p className="truncate text-xs text-ink-soft">{person.email}</p>
                    </div>
                  </div>

                  <div>
                    <div className="h-1.5 overflow-hidden rounded-sm bg-canvas">
                      <div className="h-full bg-brand" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-soft">
                      {person.done} of {person.total} tasks done
                    </p>
                  </div>

                  <p className={`text-sm ${person.overdue ? 'font-semibold text-late' : 'text-ink-soft'}`}>
                    {person.overdue ? `${person.overdue} overdue` : 'On track'}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </div>
  )
}

export default TeamView
