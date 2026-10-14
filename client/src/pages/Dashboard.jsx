import { useEffect, useState } from 'react'

import api from '../api'

import DashboardLayout from '../layouts/DashboardLayout'

import Header from '../components/Header'

import StatCard from '../components/StatCard'

import ProjectCard from '../components/ProjectCard'

import TaskList from '../components/TaskList'

import ProjectsView from '../components/ProjectsView'

import MyTasksView from '../components/MyTasksView'

import TeamView from '../components/TeamView'

function normalizeProject(project, index = 0) {

  const members = Array.isArray(project.members)

    ? project.members.map((member) =>

        typeof member === 'string'

          ? member

          : member.name?.slice(0, 2).toUpperCase() ||

            member.email?.slice(0, 2).toUpperCase() ||

            'TM'

      )

    : []

  const taskCount = Array.isArray(project.tasks)

    ? project.tasks.length

    : Number(project.tasksCount ?? project.taskCount ?? 0)

  const completedCount = Array.isArray(project.tasks)

    ? project.tasks.filter((task) =>

        ['Completed', 'completed', 'Done'].includes(task.status)

      ).length

    : Number(project.completedTasks ?? project.done ?? 0)

  const calculatedProgress =

    taskCount > 0

      ? Math.round((completedCount / taskCount) * 100)

      : 0

  let due = 'Not set'

  if (project.dueDate) {

    const date = new Date(project.dueDate)

    if (!Number.isNaN(date.getTime())) {

      due = date.toLocaleDateString('en-IN', {

        day: 'numeric',

        month: 'short',

      })

    }

  }

  return {

    ...project,

    id: project._id || project.id || `project-${index}`,

    name: project.name || 'Untitled project',

    category: project.category || 'PROJECT',

    color: project.color || 'violet',

    progress: Math.min(

      100,

      Math.max(

        0,

        Number(project.progress ?? calculatedProgress)

      )

    ),

    tasks: taskCount,

    done: completedCount,

    due,

    members: members.length > 0 ? members : ['TM'],

  }

}

function formatActivityDate(dateValue) {

  if (!dateValue) return 'Recently'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return 'Recently'

  return date.toLocaleString('en-IN', {

    day: 'numeric',

    month: 'short',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit',

  })

}

function Dashboard({ user, onLogout }) {

  const [projects, setProjects] = useState([])

  const [tasks, setTasks] = useState([])

  const [activities, setActivities] = useState([])

  const [projectsLoading, setProjectsLoading] = useState(true)

  const [tasksLoading, setTasksLoading] = useState(true)

  const [activitiesLoading, setActivitiesLoading] = useState(true)

  const [projectsError, setProjectsError] = useState('')

  const [tasksError, setTasksError] = useState('')

  const [activitiesError, setActivitiesError] = useState('')

  const [savingProject, setSavingProject] = useState(false)

  const [showForm, setShowForm] = useState(false)

  const [projectName, setProjectName] = useState('')

  const [activeNav, setActiveNav] = useState('Overview')

  async function fetchProjects() {

    try {

      setProjectsLoading(true)

      setProjectsError('')

      const response = await api.get('/projects')

      const data = response.data

      const projectList = Array.isArray(data)

        ? data

        : Array.isArray(data.projects)

          ? data.projects

          : Array.isArray(data.data)

            ? data.data

            : []

      setProjects(projectList.map(normalizeProject))

    } catch (error) {

      setProjectsError(

        error.response?.data?.message ||

          'Could not load projects. Please try again.'

      )

    } finally {

      setProjectsLoading(false)

    }

  }

  async function fetchTasks() {

    try {

      setTasksLoading(true)

      setTasksError('')

      const response = await api.get('/tasks')

      const taskList = response.data?.data

      setTasks(Array.isArray(taskList) ? taskList : [])

    } catch (error) {

      setTasksError(

        error.response?.data?.message ||

          'Could not load tasks. Please try again.'

      )

    } finally {

      setTasksLoading(false)

    }

  }

  async function fetchActivities() {

    try {

      setActivitiesLoading(true)

      setActivitiesError('')

      const response = await api.get('/activity-logs')

      const logList = response.data?.data

      setActivities(Array.isArray(logList) ? logList : [])

    } catch (error) {

      setActivitiesError(

        error.response?.data?.message ||

          'Could not load recent activity.'

      )

      setActivities([])

    } finally {

      setActivitiesLoading(false)

    }

  }

  useEffect(() => {

    fetchProjects()

    fetchTasks()

    // This endpoint is restricted to Admin and Project Manager.

    if (['Admin', 'Project Manager'].includes(user?.role)) {

      fetchActivities()

    } else {

      setActivitiesLoading(false)

    }

  }, [])

  function handleTaskUpdated(updatedTask) {
    const updatedId = updatedTask?._id || updatedTask?.id
    if (!updatedId) return

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        (task._id || task.id) === updatedId
          ? { ...task, ...updatedTask }
          : task
      )
    )
  }

  function handleTaskCreated(newTask) {
    const taskId = newTask?._id || newTask?.id
    if (!taskId) return

    const currentUserId = String(user?._id || user?.id || '')
    const assignedUserId = String(
      typeof newTask.assignedTo === 'object'
        ? newTask.assignedTo?._id || newTask.assignedTo?.id || ''
        : newTask.assignedTo || ''
    )

    const projectId = String(
      typeof newTask.project === 'object'
        ? newTask.project?._id || newTask.project?.id || ''
        : newTask.project || ''
    )

    const role = String(user?.role || '').toLowerCase()
    const isDeveloper = role === 'developer'
    const canDisplayTask = isDeveloper
      ? assignedUserId === currentUserId
      : projects.some((project) => String(project.id) === projectId)

    if (!canDisplayTask) return

    setTasks((currentTasks) => {
      const exists = currentTasks.some(
        (task) => String(task._id || task.id) === String(taskId)
      )

      if (exists) {
        return currentTasks.map((task) =>
          String(task._id || task.id) === String(taskId)
            ? { ...task, ...newTask }
            : task
        )
      }

      return [newTask, ...currentTasks]
    })
  }

  async function createProject(event) {

    event.preventDefault()

    const name = projectName.trim()

    if (!name || savingProject) return

    try {

      setSavingProject(true)

      setProjectsError('')

      const response = await api.post('/projects', { name })

      const data = response.data

      const savedProject = data.project || data.data || data

      if (!savedProject?._id && !savedProject?.id) {

        await fetchProjects()

      } else {

        const normalized = normalizeProject(savedProject)

        setProjects((current) => {

          const exists = current.some(

            (project) => project.id === normalized.id

          )

          return exists

            ? current.map((project) =>

                project.id === normalized.id

                  ? normalized

                  : project

              )

            : [normalized, ...current]

        })

      }

      setProjectName('')

      setShowForm(false)

      setActiveNav('Projects')

    } catch (error) {

      setProjectsError(

        error.response?.data?.message ||

          'Could not create project. Please try again.'

      )

    } finally {

      setSavingProject(false)

    }

  }

  async function deleteProject(projectId) {

    try {

      setProjectsError('')

      await api.delete(`/projects/${projectId}`)

      setProjects((current) =>

        current.filter((project) => project.id !== projectId)

      )

    } catch (error) {

      setProjectsError(

        error.response?.data?.message ||

          'Could not delete project. Please try again.'

      )

    }

  }

  function openNewProject() {

    setActiveNav('Projects')

    setShowForm(true)

  }

  const stats = [

    {

      label: 'Total projects',

      value: projects.length,

      icon: '▧',

      tone: 'bg-indigo-50 text-indigo-600',

      note: 'In your workspace',

    },

    {

      label: 'Total tasks',

      value: tasks.length,

      icon: '☷',

      tone: 'bg-sky-50 text-sky-600',

      note: 'Assigned tasks',

    },

    {

      label: 'Tasks completed',

      value: tasks.filter((task) => task.status === 'Completed').length,

      icon: '✓',

      tone: 'bg-emerald-50 text-emerald-600',

      note: 'Successfully completed',

    },

    {

      label: 'In progress',

      value: tasks.filter((task) => task.status === 'In Progress').length,

      icon: '↗',

      tone: 'bg-amber-50 text-amber-600',

      note: 'Active tasks',

    },

  ]

  const upcomingTasks = tasks

    .filter((task) => task.status !== 'Completed')

    .slice(0, 5)

    .map((task) => ({

      ...task,

      id: task._id,

      project: task.project?.name || 'Unknown project',

      time: task.dueDate

        ? new Date(task.dueDate).toLocaleDateString('en-IN', {

            day: 'numeric',

            month: 'short',

          })

        : 'No due date',

      status: task.status === 'Todo' ? 'To Do' : task.status,

    }))

  return (

    <DashboardLayout

      activeNav={activeNav}

      setActiveNav={setActiveNav}

    >

      <Header

        activeNav={activeNav}

        user={user}

        onNewProject={openNewProject}

        onLogout={onLogout}

      />

      {projectsError && (

        <div

          role="alert"

          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"

        >

          <span>{projectsError}</span>

          <button

            type="button"

            onClick={fetchProjects}

            disabled={projectsLoading}

            className="font-semibold underline disabled:opacity-50"

          >

            Retry projects

          </button>

        </div>

      )}

      {activeNav === 'Overview' && (

        <>

          <section className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#312e81] via-[#4338ca] to-[#6d5ce8] p-6 text-white shadow-xl shadow-indigo-100 sm:p-8">

            <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[36px] border-white/5" />

            <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-violet-300/10 blur-2xl" />

            <div className="relative max-w-xl">

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-100">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                Your workspace at a glance

              </span>

              <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">

                Turn good ideas into

                <br className="hidden sm:block" /> great work.

              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100">

                Keep projects organized, make priorities clear, and

                help your team do its best work.

              </p>

              <button

                type="button"

                onClick={openNewProject}

                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"

              >

                Explore projects <span className="ml-2">→</span>

              </button>

            </div>

            <div className="relative mt-7 flex items-center gap-3 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0">

              <div className="flex -space-x-2">

                {['YG', 'AS', 'RK', 'PM'].map((member, index) => (

                  <div

                    key={member}

                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-indigo-500 text-[10px] font-bold text-white ${

                      [

                        'bg-rose-400',

                        'bg-emerald-500',

                        'bg-amber-500',

                        'bg-sky-500',

                      ][index]

                    }`}

                  >

                    {member}

                  </div>

                ))}

              </div>

              <div>

                <p className="text-sm font-semibold">Better, together.</p>

                <p className="text-xs text-indigo-200">

                  Your team workspace

                </p>

              </div>

            </div>

          </section>

          <section className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">

            {stats.map((stat) => (

              <StatCard key={stat.label} stat={stat} />

            ))}

          </section>

          <section className="mt-10 scroll-mt-6">

            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">

                  The bigger picture

                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight">

                  Your projects

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  A little progress every day adds up.

                </p>

              </div>

              <button

                type="button"

                onClick={openNewProject}

                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"

              >

                + Add project

              </button>

            </div>

            {projectsLoading ? (

              <div className="rounded-xl bg-white p-5 text-sm text-slate-500">

                Loading projects...

              </div>

            ) : projects.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <p className="font-semibold">No projects yet</p>

                <p className="mt-2 text-sm text-slate-500">

                  Create your first project to get started.

                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">

                {projects.map((project) => (

                  <ProjectCard

                    key={project.id}

                    project={project}

                    onDelete={deleteProject}

                  />

                ))}

              </div>

            )}

          </section>

          <section className="mt-10">

            <div className="mb-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">

                Stay on track

              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">

                Upcoming tasks

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                What needs your attention next.

              </p>

            </div>

            {tasksLoading ? (

              <div className="rounded-xl bg-white p-5 text-sm text-slate-500">

                Loading tasks...

              </div>

            ) : tasksError ? (

              <div

                role="alert"

                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"

              >

                {tasksError}

                <button

                  type="button"

                  onClick={fetchTasks}

                  className="ml-3 font-semibold underline"

                >

                  Retry

                </button>

              </div>

            ) : upcomingTasks.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">

                No upcoming tasks. You are all caught up!

              </div>

            ) : (

              <TaskList tasks={upcomingTasks} />

            )}

          </section>

          <section className="mt-10">

            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">

                  Workspace updates

                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight">

                  Recent activity

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  The latest changes recorded in your workspace.

                </p>

              </div>

              {['Admin', 'Project Manager'].includes(user?.role) && (

                <button

                  type="button"

                  onClick={fetchActivities}

                  disabled={activitiesLoading}

                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"

                >

                  {activitiesLoading ? 'Refreshing...' : 'Refresh'}

                </button>

              )}

            </div>

            {!['Admin', 'Project Manager'].includes(user?.role) ? (

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">

                Recent activity is available to Admin and Project Manager accounts.

              </div>

            ) : activitiesLoading ? (

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">

                Loading recent activity...

              </div>

            ) : activitiesError ? (

              <div

                role="alert"

                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"

              >

                <p>{activitiesError}</p>

                <button

                  type="button"

                  onClick={fetchActivities}

                  className="mt-2 font-semibold underline"

                >

                  Retry

                </button>

              </div>

            ) : activities.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">

                No activity has been recorded yet.

              </div>

            ) : (

              <div className="space-y-3">

                {activities.map((activity) => (

                  <article

                    key={activity._id}

                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"

                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">

                      <span aria-hidden="true">↻</span>

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-slate-800">

                        {activity.user?.name || 'Team member'}

                      </p>

                      <p className="mt-1 break-words text-sm text-slate-600">

                        {activity.details ||

                          activity.action ||

                          'Workspace activity recorded'}

                      </p>

                      {activity.project?.name && (

                        <p className="mt-1 text-xs text-indigo-600">

                          Project: {activity.project.name}

                        </p>

                      )}

                      {activity.task?.title && (

                        <p className="mt-1 text-xs text-slate-500">

                          Task: {activity.task.title}

                        </p>

                      )}

                      <time className="mt-2 block text-xs text-slate-400">

                        {formatActivityDate(activity.createdAt)}

                      </time>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>

          <p className="mt-8 text-center text-[10px] text-slate-400">

            TeamFlow · Organize the work. Celebrate the progress.

          </p>

        </>

      )}

      {activeNav === 'Projects' && (

        <>

          {!projectsLoading && !projectsError && (

            <ProjectsView

              projects={projects}

              onDelete={deleteProject}

              onNewProject={openNewProject}

            />

          )}

          {showForm && (

            <form

              id="project-form"

              onSubmit={createProject}

              className="mt-6 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white p-5 sm:flex-row"

            >

              <input

                autoFocus

                value={projectName}

                onChange={(event) => setProjectName(event.target.value)}

                placeholder="Give your project a name..."

                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"

                required

              />

              <button

                type="submit"

                disabled={savingProject}

                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"

              >

                {savingProject ? 'Saving...' : 'Create project'}

              </button>

              <button

                type="button"

                onClick={() => {

                  setShowForm(false)

                  setProjectName('')

                }}

                className="rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100"

              >

                Cancel

              </button>

            </form>

          )}

        </>

      )}

      {activeNav === 'My tasks' && (

        <>

          {tasksLoading ? (

            <div className="mt-6 rounded-xl bg-white p-5 text-sm text-slate-500">

              Loading tasks...

            </div>

          ) : tasksError ? (

            <div

              role="alert"

              className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"

            >

              {tasksError}

              <button

                type="button"

                onClick={fetchTasks}

                className="ml-3 font-semibold underline"

              >

                Retry

              </button>

            </div>

          ) : (

            <MyTasksView
              tasks={tasks}
              onTaskUpdated={handleTaskUpdated}
              onTaskCreated={handleTaskCreated}
            />

          )}

        </>

      )}

      {activeNav === 'Team' && <TeamView />}

    </DashboardLayout>

  )

}

export default Dashboard
