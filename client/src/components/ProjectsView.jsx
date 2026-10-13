import { useMemo, useState } from 'react'
import Panel from './Panel'
import ProjectList from './ProjectList'
import { EmptyState, Notice, Skeleton } from './States'

function ProjectsView({
  projects,
  canManage,
  loading,
  error,
  onRetry,
  onDelete,
  showForm,
  onOpenForm,
  onCloseForm,
  onCreate,
  saving,
}) {
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(query))
  }, [projects, search])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()

    if (trimmed.length < 3) {
      setFormError('Project names need at least 3 characters.')
      return
    }

    setFormError('')
    const created = await onCreate(trimmed)
    if (created) setName('')
  }

  function closeForm() {
    setName('')
    setFormError('')
    onCloseForm()
  }

  return (
    <div className="mt-6 space-y-6">
      {showForm && (
        <Panel title="New project">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label htmlFor="project-name" className="sr-only">
                Project name
              </label>
              <input
                id="project-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                maxLength={100}
                aria-invalid={Boolean(formError)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm"
              />
              {formError && <p className="mt-1.5 text-sm text-late">{formError}</p>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Create project'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              Cancel
            </button>
          </form>
        </Panel>
      )}

      {error && <Notice onRetry={onRetry} retrying={loading}>{error}</Notice>}

      <Panel
        title={`${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
        action={
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            aria-label="Search projects"
            className="w-44 rounded-md border border-line bg-paper px-3 py-1.5 text-sm sm:w-56"
          />
        }
      >
        {loading ? (
          <Skeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title={projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            action={
              canManage && projects.length === 0 && !showForm ? (
                <button
                  type="button"
                  onClick={onOpenForm}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  Create a project
                </button>
              ) : null
            }
          >
            {projects.length === 0
              ? 'Projects you create or belong to will be listed here.'
              : 'Try a different name.'}
          </EmptyState>
        ) : (
          <ProjectList projects={visible} canManage={canManage} onDelete={onDelete} />
        )}
      </Panel>
    </div>
  )
}

export default ProjectsView
