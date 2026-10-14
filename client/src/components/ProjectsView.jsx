
import { useMemo, useState } from 'react'
import ProjectCard from './ProjectCard'

function ProjectsView({ projects, onDelete, onNewProject }) {
  const [search, setSearch] = useState('')

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    return projects.filter((project) =>
      `${project.name} ${project.category}`
        .toLowerCase()
        .includes(query)
    )
  }, [projects, search])

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
            Workspace
          </p>
          <h2 className="mt-2 text-2xl font-bold">All projects</h2>
          <p className="mt-2 text-sm text-slate-500">
            Organize projects and track progress in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New project
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects..."
          aria-label="Search projects"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 sm:max-w-sm"
        />

        <span className="text-sm text-slate-500">
          {filteredProjects.length} projects
        </span>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="font-semibold">No projects found</h3>
          <p className="mt-2 text-sm text-slate-500">
            Try another search or create a project.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ProjectsView
