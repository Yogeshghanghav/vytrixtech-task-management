import { useState } from 'react'
import Panel from './Panel'
import { EmptyState, Notice } from './States'

const priorities = ['Low', 'Medium', 'High']

function todayInputValue() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

const fieldClass =
  'w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm placeholder:text-ink-faint focus:border-brand'

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {children}
    </label>
  )
}

function FieldError({ children }) {
  return children ? <p className="mt-1.5 text-sm text-late">{children}</p> : null
}

function NewTaskForm({
  projects,
  developers,
  loadingDevelopers,
  developersError,
  saving,
  error,
  onSubmit,
  onCancel,
  onGoToProjects,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: projects.length === 1 ? projects[0]._id : '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  })
  const [errors, setErrors] = useState({})

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  function validate() {
    const found = {}

    if (!form.title.trim()) found.title = 'Give the task a title.'
    if (!form.project) found.project = 'Choose a project.'
    if (!form.assignedTo) found.assignedTo = 'Choose who should do this.'
    if (!form.dueDate) found.dueDate = 'Pick a due date.'
    else if (form.dueDate < todayInputValue()) found.dueDate = 'The due date cannot be in the past.'

    setErrors(found)
    return Object.keys(found).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      project: form.project,
      assignedTo: form.assignedTo,
      priority: form.priority,
      dueDate: form.dueDate,
    })
  }

  if (projects.length === 0) {
    return (
      <Panel title="New task">
        <EmptyState
          title="Create a project first"
          action={
            <button
              type="button"
              onClick={onGoToProjects}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Go to projects
            </button>
          }
        >
          Tasks belong to a project, so you need at least one before assigning work.
        </EmptyState>
      </Panel>
    )
  }

  return (
    <Panel title="New task" note="The developer is notified as soon as you create it">
      <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <Label htmlFor="task-title">Title</Label>
          <input
            id="task-title"
            autoFocus
            value={form.title}
            onChange={update('title')}
            maxLength={150}
            placeholder="What needs to be done?"
            aria-invalid={Boolean(errors.title)}
            className={fieldClass}
          />
          <FieldError>{errors.title}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="task-description">Description (optional)</Label>
          <textarea
            id="task-description"
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Add any details the developer should know"
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div>
          <Label htmlFor="task-project">Project</Label>
          <select
            id="task-project"
            value={form.project}
            onChange={update('project')}
            aria-invalid={Boolean(errors.project)}
            className={fieldClass}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <FieldError>{errors.project}</FieldError>
        </div>

        <div>
          <Label htmlFor="task-assignee">Assign to</Label>
          <select
            id="task-assignee"
            value={form.assignedTo}
            onChange={update('assignedTo')}
            disabled={loadingDevelopers}
            aria-invalid={Boolean(errors.assignedTo)}
            className={`${fieldClass} disabled:opacity-60`}
          >
            <option value="">
              {loadingDevelopers ? 'Loading developers...' : 'Select a developer'}
            </option>
            {developers.map((developer) => (
              <option key={developer._id} value={developer._id}>
                {developer.name} ({developer.email})
              </option>
            ))}
          </select>
          <FieldError>{errors.assignedTo}</FieldError>
          {!loadingDevelopers && !developersError && developers.length === 0 && (
            <p className="mt-1.5 text-sm text-ink-soft">
              No developers yet. Ask someone to register an account first.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="task-priority">Priority</Label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={update('priority')}
            className={fieldClass}
          >
            {priorities.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="task-due">Due date</Label>
          <input
            id="task-due"
            type="date"
            min={todayInputValue()}
            value={form.dueDate}
            onChange={update('dueDate')}
            aria-invalid={Boolean(errors.dueDate)}
            className={fieldClass}
          />
          <FieldError>{errors.dueDate}</FieldError>
        </div>

        {(error || developersError) && (
          <div className="sm:col-span-2">
            <Notice>{error || developersError}</Notice>
          </div>
        )}

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas"
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  )
}

export default NewTaskForm
